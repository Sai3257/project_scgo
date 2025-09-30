import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCourseDetails, markTaskAsCompleted, fetchProfile } from '../api/endpoints';
import { CheckCircle, Clock, AlertTriangle, Target, BookOpen, Trophy, Home, Star } from 'lucide-react';
import Leaderboard from './Leaderboard';
import PointsPage from './PointsPage';

type FilterType = 'all' | 'completed' | 'pending' | 'stuck';
type NavigationTab = 'home' | 'tasks' | 'points' | 'rankings';

interface Task {
  id: number;
  title: string;
  description: string;
  contentLinks?: string[];
  videoLinks?: string[];
  dueDate?: string;
  completionDate?: string;
  status: 'completed' | 'pending' | 'stuck';
  points: number;
  moduleId: number;
}

interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  tasks: Task[];
}

interface Course {
  id: number;
  title: string;
  version: number;
  modules: Module[];
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  stuckTasks: number;
  totalPoints: number;
  earnedPoints: number;
}

export default function CourseDetails({ courseId, courseTitle, onBack }: { courseId: number; courseTitle?: string; onBack: () => void }) {
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<NavigationTab>('tasks');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);

  const loadCourseDetails = async () => {
    // Validate courseId before making API call
    if (!courseId || isNaN(courseId) || courseId <= 0) {
      setError('Invalid course ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      console.log('Loading course details for ID:', courseId);
      
      
      let response;
      let data;
      
      // Load current student profile for id
      try {
        const profileRes = await fetchProfile();
        const sid = profileRes?.data?.id ?? profileRes?.data?.student_id ?? null;
        if (typeof sid === 'number') {
          setStudentId(sid);
        } else {
          console.warn('Student id not found in profile response');
        }
      } catch (profileErr) {
        console.warn('Failed to load profile for student id', profileErr);
      }

      // Try to fetch by course ID first
      try {
        console.log('Making API call to:', `/courses/${courseId}`);
        response = await fetchCourseDetails(courseId);
        console.log('Full API response:', response);
        data = response.data;
        console.log('Course details API data:', data);
      } catch (idError: any) {
        console.log('Failed to fetch by ID, trying by title...', idError);
        
       
      }
      
      // Normalize tasks that may come at the top level (data.tasks) and/or inside modules
      const normalizeTask = (task: any, fallbackModuleId: number): Task => ({
        id: task.id ?? task.task_id ?? fallbackModuleId,
        title: task.title || task.name || 'Task',
        description: task.description || '',
        contentLinks: Array.isArray(task.content_links) ? task.content_links : [],
        videoLinks: Array.isArray(task.video_links) ? task.video_links : [],
        dueDate: task.due_date || task.due || undefined,
        completionDate: task.completion_date || task.completed_at || undefined,
        status: (task.status === 'completed' || task.is_completed) ? 'completed' :
               (task.status === 'stuck') ? 'stuck' : 'pending',
        points: task.reward_points || task.points || 0,
        // Be liberal in what we accept for module identifier
        moduleId: (
          task.module_id ??
          task.moduleId ??
          task.mod_id ??
          task.module ??
          task.moduleID ??
          task.version_module_id ??
          fallbackModuleId
        )
      });

      // Build base modules (without tasks first)
      let baseModules: Module[] = Array.isArray(data.modules) && data.modules.length > 0
        ? data.modules.map((mod: any, modIndex: number) => ({
            id: mod.id || modIndex + 1,
            title: mod.title || mod.name || `Module ${modIndex + 1}`,
            description: mod.description || '',
            order: mod.order || modIndex + 1,
            tasks: Array.isArray(mod.tasks) ? mod.tasks.map((t: any, tIndex: number) => normalizeTask(t, mod.id || modIndex + 1)) : []
          }))
        : [];

      // If top-level tasks exist, attach them to modules by module_id, or create a synthetic module
      if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        const tasks: Task[] = data.tasks.map((t: any) => normalizeTask(t, 0));

        const hasModuleIds = tasks.some(t => !!t.moduleId);
        if (hasModuleIds && baseModules.length > 0) {
          const moduleMap = new Map<number, Module>();
          baseModules.forEach(m => moduleMap.set(m.id, { ...m, tasks: [...m.tasks] }));
          tasks.forEach(t => {
            const targetId = t.moduleId || baseModules[0]?.id || 1;
            const mod = moduleMap.get(targetId);
            if (mod) {
              mod.tasks.push(t);
            } else {
              // If module not found, push into first module
              const first = moduleMap.get(baseModules[0]?.id || 1);
              if (first) first.tasks.push(t);
            }
          });
          baseModules = Array.from(moduleMap.values());
        } else {
          // Create a synthetic module to hold all tasks
          baseModules = baseModules.length > 0 ? baseModules : [];
          baseModules = [
            ...baseModules,
            {
              id: (baseModules[baseModules.length - 1]?.id || 0) + 1,
              title: 'Course Tasks',
              description: 'All tasks for this course',
              order: (baseModules[baseModules.length - 1]?.order || 0) + 1,
              tasks
            }
          ];
        }
      }

      // If there are still no modules, create a minimal fallback
      if (!Array.isArray(baseModules) || baseModules.length === 0) {
        baseModules = [
          {
            id: 1,
            title: 'Course Content',
            description: 'Explore the course materials and complete the tasks',
            order: 1,
            tasks: []
          }
        ];
      }

      // Compute counts from modules; if zero, fallback to any numeric totals available
      const tasksFromModules = baseModules.flatMap(m => m.tasks);
      let totalTasks = tasksFromModules.length;
      let completedTasks = tasksFromModules.filter(t => t.status === 'completed').length;
      let pendingTasks = tasksFromModules.filter(t => t.status === 'pending').length;
      let stuckTasks = tasksFromModules.filter(t => t.status === 'stuck').length;

      if (totalTasks === 0) {
        totalTasks = data.task_count || data.total_tasks || 0;
      }

      const transformedCourse: Course = {
        id: data.id || courseId,
        title: data.title || data.name || courseTitle || `Course ${courseId}`,
        version: data.version || 1,
        modules: baseModules,
        totalTasks: totalTasks || 0,
        completedTasks: data.completed_tasks || completedTasks || 0,
        pendingTasks: data.pending_tasks || pendingTasks || 0,
        stuckTasks: data.stuck_tasks || stuckTasks || 0,
        totalPoints: data.total_points || 10,
        earnedPoints: data.earned_points || 0
      };
      
      // Calculate actual task counts from modules if not provided
      if (transformedCourse.totalTasks === 0) {
        const allTasks = transformedCourse.modules.flatMap(module => module.tasks);
        transformedCourse.totalTasks = allTasks.length;
        transformedCourse.completedTasks = allTasks.filter(task => task.status === 'completed').length;
        transformedCourse.pendingTasks = allTasks.filter(task => task.status === 'pending').length;
        transformedCourse.stuckTasks = allTasks.filter(task => task.status === 'stuck').length;
      }
      
      console.log('Transformed course details:', transformedCourse);
      setCourse(transformedCourse);
      
    } catch (e: any) {
      console.error('Error loading course details:', e);
      console.error('Error response:', e?.response);
      console.error('Error status:', e?.response?.status);
      console.error('Error data:', e?.response?.data);
      
      // Check if it's a 404 or similar error (course not found)
      if (e?.response?.status === 404 || e?.response?.status === 422) {
        setError(`Course details not available for Course ID ${courseId}. The course may not exist or you may not have access to it.`);
      } else if (e?.response?.status === 500) {
        setError(`Server error occurred while loading course details. Please try again later.`);
      } else if (e?.code === 'NETWORK_ERROR' || e?.message?.includes('Network Error')) {
        setError(`Network error occurred. Please check your internet connection and try again.`);
      } else {
        const errorMessage = e?.response?.data?.message || 
                            e?.response?.data?.detail || 
                            e?.response?.data?.error ||
                            e?.message || 
                            'Failed to load course details';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const handleTaskComplete = async (task: Task) => {
    try {
      if (!studentId) {
        console.error('Cannot mark task completed without studentId');
        return;
      }
      await markTaskAsCompleted(task.id, studentId, task.title);
      // Reload course details to get updated task status
      loadCourseDetails();
    } catch (e: any) {
      console.error('Error marking task as completed:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">Loading course details...</div>
        </div>
      </div>
    );
  }

        if (error) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78] flex items-center justify-center">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="text-red-400 mb-4 text-lg">{error}</div>
                <div className="space-y-3">
                  <button
                    onClick={loadCourseDetails}
                    className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    Try Again
                  </button>
                  <div className="text-gray-400 text-sm">
                    or
                  </div>
                  <button
                    onClick={onBack}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Go Back to Courses
                  </button>
                </div>
              </div>
            </div>
          );
        }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">Course not found</div>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Rest of the component logic
  const allTasks = course.modules.flatMap(module => module.tasks);
  const filteredTasks = allTasks.filter(task => {
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'stuck') return task.status === 'stuck';
    return true;
  });

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'stuck':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'stuck':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleNavigation = (tab: NavigationTab) => {
    switch (tab) {
      case 'home':
        navigate('/mycourses');
        break;
      case 'tasks':
        // Show tasks dashboard
        setActiveTab('tasks');
        break;
      case 'points':
        setActiveTab('points');
        break;
      case 'rankings':
        setActiveTab('rankings');
        break;
    }
  };

  if (showLeaderboard) {
    return <Leaderboard onBack={() => setShowLeaderboard(false)} />;
  }

  if (showPoints) {
    return <PointsPage onHome={() => setShowPoints(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78]">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
               <div>
                 <h1 className="text-xl font-bold text-white">{course.title}</h1>
                 <p className="text-sm text-gray-300">Version {course.version}</p>
               </div>
            </div>
            <div />
          </div>
        </div>
      </div>

      {/* Navigation Tabs removed as requested */}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {activeTab === 'tasks' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-300">Total Tasks</p>
                    <p className="text-lg font-bold text-white">{course.totalTasks}</p>
                  </div>
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-300">Completed</p>
                    <p className="text-lg font-bold text-green-400">{course.completedTasks}</p>
                  </div>
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-300">Pending</p>
                    <p className="text-lg font-bold text-yellow-400">{course.pendingTasks}</p>
                  </div>
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-300">Upcoming</p>
                    <p className="text-lg font-bold text-orange-400">{course.stuckTasks}</p>
                  </div>
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Course Progress</h3>
                <span className="text-sm text-gray-300">{course.totalTasks} total tasks</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${course.totalTasks ? Math.round((course.completedTasks / course.totalTasks) * 100) : 0}%` }}
                />
              </div>
              <div className="text-sm text-gray-300 mt-2">{course.completedTasks} completed</div>
            </div>

            {/* Modules */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">Course Modules</h2>
                <div className="text-xs sm:text-sm text-gray-300">Earn points by completing tasks</div>
              </div>
              {course.modules.map((module) => (
                <div key={module.id} className="bg-white/5 rounded-lg border border-white/10">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-white leading-tight">{module.title}</h3>
                      <p className="text-xs text-gray-300 mt-1 line-clamp-2">{module.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-300">{module.tasks.length} tasks</p>
                      <div className="mt-1 w-24 sm:w-32 h-1.5 bg-white/10 rounded-full">
                        <div
                          className="h-1.5 bg-green-500 rounded-full"
                          style={{ width: `${module.tasks.length ? Math.round((module.tasks.filter(t => t.status === 'completed').length / module.tasks.length) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {module.tasks.map((task) => (
                      <div key={task.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white text-xs mr-2 leading-tight">{task.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-300 space-x-3 mb-2">
                          <span>{task.points} points</span>
                          {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                        {task.status === 'pending' && (
                          <button
                            onClick={() => handleTaskComplete(task)}
                            className="w-full px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md hover:from-blue-600 hover:to-cyan-600 text-xs font-medium"
                          >
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks page disabled; keeping icons only */}
        {false && activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Tasks', count: allTasks.length },
                { id: 'completed', label: 'Completed', count: course.completedTasks },
                { id: 'pending', label: 'Pending', count: course.pendingTasks },
                { id: 'stuck', label: 'Stuck', count: course.stuckTasks }
              ].map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id as FilterType)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-4 whitespace-pre-line">{task.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{task.points} points</span>
                        </span>
                        {task.completionDate && (
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed {new Date(task.completionDate).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {getTaskStatusIcon(task.status)}
                    </div>
                  </div>

                  {/* Video Links */}
                  {task.videoLinks && task.videoLinks.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Video Resources:</h4>
                      <div className="space-y-2">
                        {task.videoLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm text-white">Video {index + 1}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleTaskComplete(task)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'points' && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Points System</h2>
            <p className="text-gray-300 mb-6">Earn points by completing tasks and engaging with the course.</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-md mx-auto">
              <div className="text-4xl font-bold text-purple-400 mb-2">{course.earnedPoints}</div>
              <div className="text-gray-300">Points Earned</div>
              <div className="text-sm text-gray-400 mt-2">out of {course.totalPoints} total points</div>
            </div>
          </div>
        )}

        {activeTab === 'rankings' && (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Leaderboard</h2>
            <p className="text-gray-300 mb-6">See how you rank against other students.</p>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
            >
              View Full Leaderboard
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => handleNavigation('home')}
              className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
                activeTab === 'home'
                  ? 'text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Home</span>
            </button>
            
            <button
              onClick={() => handleNavigation('tasks')}
              className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
                activeTab === 'tasks'
                  ? 'text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-medium">Tasks</span>
            </button>
            
            <button
              onClick={() => handleNavigation('points')}
              className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
                activeTab === 'points'
                  ? 'text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="text-xs font-medium">Points</span>
            </button>
            
            <button
              onClick={() => handleNavigation('rankings')}
              className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
                activeTab === 'rankings'
                  ? 'text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Star className="w-5 h-5" />
              <span className="text-xs font-medium">Rankings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

