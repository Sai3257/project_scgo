import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCourseDetails, markTaskAsCompleted } from '../api/endpoints';
import { CheckCircle, Clock, AlertTriangle, Target, BookOpen, Trophy, Home, Star, ChevronDown, Play, X, ExternalLink } from 'lucide-react';
import Leaderboard from './Leaderboard';
import PointsPage from './PointsPage';

type FilterType = 'all' | 'completed' | 'pending' | 'upcoming';
type NavigationTab = 'home' | 'tasks' | 'points' | 'rankings';

interface Task {
  id: number;
  title: string;
  description?: string;
  content?: string;
  task_desc?: string;
  task_type?: string;
  contentLinks?: string[];
  video_links?: string[];
  videoLinks?: string[];
  dueDate?: string;
  completionDate?: string;
  status: 'completed' | 'pending' | 'upcoming';
  points: number;
  reward_points?: number;
  timetocomplete?: number;
  effort?: string;
  penalty_points?: number;
  moduleId?: number;
  module_id?: number;
  course_id?: number;
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
  upcomingTasks: number;
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [recentlyCompletedTitles, setRecentlyCompletedTitles] = useState<Set<string>>(new Set());
  
  // Load completed tasks from localStorage on mount
  useEffect(() => {
    const storedCompleted = localStorage.getItem('completedTasks');
    if (storedCompleted) {
      try {
        const completedArray = JSON.parse(storedCompleted) as string[];
        const completedSet = new Set<string>(completedArray);
        setRecentlyCompletedTitles(completedSet);
        console.log('Loaded completed tasks from localStorage:', Array.from(completedSet));
      } catch (e) {
        console.error('Error loading completed tasks from localStorage:', e);
      }
    }
  }, []);
  const [completingSet, setCompletingSet] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [pointsRefreshTrigger, setPointsRefreshTrigger] = useState(0);
  const syncTimeout = useRef<number | null>(null);

  const loadCourseDetails = async (showLoader: boolean = true) => {
    // Validate courseId before making API call
    if (!courseId || isNaN(courseId) || courseId <= 0) {
      setError('Invalid course ID');
      setIsLoading(false);
      return;
    }

    if (showLoader) setIsLoading(true);
    setError('');
    try {
      console.log('Loading course details for ID:', courseId);
      
      // Store the current course ID in localStorage for navigation from other pages
      localStorage.setItem('currentCourseId', courseId.toString());
      console.log('Stored current course ID in localStorage:', courseId);
      
      let response;
      let data;
      
      // Get student ID from localStorage (should be set at login)
      const sidLSRaw = localStorage.getItem('student_id');
      const sidLS = sidLSRaw != null ? Number(sidLSRaw) : NaN;
      if (!Number.isNaN(sidLS) && sidLS > 0) {
        setStudentId(sidLS);
        console.log('Using student ID from localStorage:', sidLS);
      } else {
        console.warn('Student ID not found in localStorage. Please login again.');
        setError('Student ID not found. Please login again.');
        return;
      }

      // Try to fetch by course ID first
      try {
        console.log('Making API call to:', `/courses/${courseId}`);
        response = await fetchCourseDetails(courseId);
        console.log('Full API response:', response);
        data = response.data;
        console.log('Course details API data:', data);
        
        // Debug: Check if any tasks are marked as completed in the API response
        if (data && data.modules) {
          data.modules.forEach((module: any, moduleIndex: number) => {
            if (module.tasks) {
              module.tasks.forEach((task: any, taskIndex: number) => {
                if (task.status === 'completed' || task.is_completed) {
                  console.log(`Found completed task in API response: Module ${moduleIndex}, Task ${taskIndex}:`, {
                    title: task.title,
                    status: task.status,
                    is_completed: task.is_completed
                  });
                }
              });
            }
          });
        }
      } catch (idError: any) {
        console.log('Failed to fetch by ID, trying by title...', idError);
        
       
      }
      
      // Normalize tasks that may come at the top level (data.tasks) and/or inside modules
      const normalizeTask = (task: any, fallbackModuleId: number): Task => {
        const computedTitle = task.title || task.name || 'Task';
        const rawStatus = (task.status === 'completed' || task.is_completed) ? 'completed'
                        : (task.status === 'stuck') ? 'upcoming' : 'pending';
        // Override to completed if we just completed it locally and backend hasn't reflected yet
        const normalizedTitle = String(computedTitle).trim().toLowerCase();
        const overrideCompleted = recentlyCompletedTitles.has(normalizedTitle);
        
        // Debug logging
        if (overrideCompleted) {
          console.log('Overriding task status to completed:', normalizedTitle);
        }
        return {
          id: task.id ?? task.task_id ?? fallbackModuleId,
          title: computedTitle,
          description: task.description || '',
          task_desc: task.task_desc || '',
          task_type: task.task_type || '',
          contentLinks: Array.isArray(task.content_links) ? task.content_links : [],
          videoLinks: Array.isArray(task.video_links) ? task.video_links : [],
          dueDate: task.due_date || task.due || undefined,
          completionDate: task.completion_date || task.completed_at || undefined,
          status: overrideCompleted ? 'completed' : rawStatus,
          points: task.reward_points || task.points || 0,
          effort: task.effort,
          penalty_points: task.penalty_points,
          moduleId: (
            task.module_id ??
            task.moduleId ??
            task.mod_id ??
            task.module ??
            task.moduleID ??
            task.version_module_id ??
            fallbackModuleId
          )
        };
      };

      // Build base modules (without tasks first)
      let baseModules: Module[] = Array.isArray(data.modules) && data.modules.length > 0
        ? data.modules.map((mod: any, modIndex: number) => ({
            id: mod.id || modIndex + 1,
            title: mod.title || mod.name || `Module ${modIndex + 1}`,
            description: mod.description || '',
            order: mod.order || modIndex + 1,
            tasks: Array.isArray(mod.tasks) ? mod.tasks.map((t: any) => normalizeTask(t, mod.id || modIndex + 1)) : []
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
      let upcomingTasks = tasksFromModules.filter(t => t.status === 'upcoming').length;

      if (totalTasks === 0) {
        totalTasks = data.task_count || data.total_tasks || 0;
      }

      // Always derive counts from modules to avoid relying on backend summary fields
      const transformedCourse: Course = {
        id: data.id || courseId,
        title: data.title || data.name || courseTitle || `Course ${courseId}`,
        version: data.version || 1,
        modules: baseModules,
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        pendingTasks: pendingTasks || 0,
        upcomingTasks: upcomingTasks || 0,
        totalPoints: data.total_points || 10,
        earnedPoints: data.earned_points || 0
      };
      
      // Recalculate from modules for accuracy
      const allTasksDerived = transformedCourse.modules.flatMap(module => module.tasks);
      transformedCourse.totalTasks = allTasksDerived.length;
      transformedCourse.completedTasks = allTasksDerived.filter(task => task.status === 'completed').length;
      transformedCourse.pendingTasks = allTasksDerived.filter(task => task.status === 'pending').length;
      transformedCourse.upcomingTasks = allTasksDerived.filter(task => task.status === 'upcoming').length;
      
      console.log('Transformed course details:', transformedCourse);
      setCourse(transformedCourse);
      setTasks(allTasksDerived);
      
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
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      // Don't clear completed tasks when course changes - keep them persistent
      // setRecentlyCompletedTitles(new Set());
      loadCourseDetails();
    }
  }, [courseId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeout.current) {
        clearTimeout(syncTimeout.current);
      }
    };
  }, []);

  const handleTaskComplete = async (task: Task) => {
    if (!studentId) {
      console.error('Cannot mark task completed without studentId');
      return;
    }

    const key = `${task.id}|${String(task.title || '').trim().toLowerCase()}`;
    if (completingSet.has(key)) return; // prevent double-click
    setCompletingSet(prev => new Set(prev).add(key));

    // Optimistic UI update: mark ONLY the specific task as completed
    setCourse(prev => {
      if (!prev) return prev;
      const next: Course = {
        ...prev,
        modules: prev.modules.map(m => ({
          ...m,
          tasks: m.tasks.map(t => {
            // Only match by exact ID to prevent multiple tasks from being marked
            return t.id === task.id
              ? { ...t, status: 'completed', completionDate: new Date().toISOString() }
              : t;
          })
        }))
      };
      // Recompute counts
      const all = next.modules.flatMap(m => m.tasks);
      next.completedTasks = all.filter(t => t.status === 'completed').length;
      next.pendingTasks = all.filter(t => t.status === 'pending').length;
      next.upcomingTasks = all.filter(t => t.status === 'upcoming').length;
      next.totalTasks = all.length;
      // also update flat tasks state
      setTasks(all);
      return next;
    });

    try {
      const taskPoints = task.points || task.reward_points || 0;
      console.log('Marking task as completed:', {
        studentId,
        taskTitle: task.title,
        taskPoints: taskPoints
      });
      const response = await markTaskAsCompleted(studentId, task.title, taskPoints);
      console.log('Task completion response:', response);
      
      // Check if the API response indicates success
      if (response?.data?.success === true) {
        console.log('✅ Task completion successful:', response.data.message);
        
        // Add to recently completed to prevent reversion
        const normalizedTaskTitle = String(task.title || '').trim().toLowerCase();
        console.log('Adding to recently completed:', normalizedTaskTitle);
        setRecentlyCompletedTitles(prev => {
          const copy = new Set(prev);
          copy.add(normalizedTaskTitle);
          console.log('Recently completed titles now:', Array.from(copy));
          
          // Persist to localStorage
          localStorage.setItem('completedTasks', JSON.stringify(Array.from(copy)));
          console.log('Saved completed tasks to localStorage');
          
          return copy;
        });
        
        // Trigger points refresh after successful completion (with small delay)
        setTimeout(() => {
          setPointsRefreshTrigger(prev => prev + 1);
          // Also trigger refresh for main points page
          localStorage.setItem('pointsRefreshTrigger', Date.now().toString());
        }, 1000);
        
        // Show success message (optional)
        console.log('🎉 Task completed successfully!', response.data.message);
      } else {
        console.warn('⚠️ Task completion API did not return success:', response?.data);
        // Revert the optimistic update
        loadCourseDetails(false);
      }
    } catch (e: any) {
      console.error('❌ Error marking task as completed:', e);
      // Revert by reloading authoritative data
      loadCourseDetails(false);
    } finally {
      setCompletingSet(prev => {
        const copy = new Set(prev);
        copy.delete(key);
        return copy;
      });
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
                    onClick={() => loadCourseDetails(true)}
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
  const filteredTasks = tasks.filter(task => (filter === 'all' ? true : task.status === filter));

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'upcoming':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'upcoming':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Overall progress percentage for slim progress bar
  const overallProgress = course.totalTasks
    ? Math.round((course.completedTasks / course.totalTasks) * 100)
    : 0;

  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleNavigation = (tab: NavigationTab) => {
    switch (tab) {
      case 'home':
        setActiveTab('home');
        navigate('/mycourses');
        break;
      case 'tasks':
        // Stay on current page and show tasks tab
        setActiveTab('tasks');
        break;
      case 'points':
        setActiveTab('points');
        navigate('/points');
        break;
      case 'rankings':
        setActiveTab('rankings');
        navigate('/leaderboard');
        break;
    }
  };

  if (showLeaderboard) {
    return <Leaderboard onNavigate={(tab) => {
      if (tab === 'home') {
        setShowLeaderboard(false);
      } else {
        handleNavigation(tab);
      }
    }} />;
  }

  if (showPoints) {
    return <PointsPage onHome={() => setShowPoints(false)} refreshTrigger={pointsRefreshTrigger} />;
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
          <div className="space-y-6">
            {/* Slim Course Progress at the very top */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Course Progress</h3>
                <span className="text-xs text-gray-300">{overallProgress}% • {course.completedTasks}/{course.totalTasks}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            {/* Status Cards in a single responsive row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              



              

              

              {/* Pending */}
              <button
                onClick={() => setFilter('pending')}
                className={`text-left bg-white/5 rounded-lg p-3 sm:p-4 py-4 sm:py-6 border transition-colors ${
                  filter === 'pending' ? 'border-cyan-400' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-300">Pending</p>
                    <p className="text-lg sm:text-2xl font-black text-yellow-400">{course.pendingTasks}</p>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-yellow-500/20 rounded-lg">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  </div>
                </div>
              </button>

              {/* Upcoming */}
              <button
                onClick={() => setFilter('upcoming')}
                className={`text-left bg-white/5 rounded-lg p-3 sm:p-4 py-4 sm:py-6 border transition-colors ${
                  filter === 'upcoming' ? 'border-cyan-400' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-300">Upcoming</p>
                    <p className="text-lg sm:text-2xl font-black text-orange-400">{course.upcomingTasks}</p>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-orange-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                  </div>
                </div>
              </button>

              {/* Completed */}
              <button
                onClick={() => setFilter('completed')}
                className={`text-left bg-white/5 rounded-lg p-3 sm:p-4 py-4 sm:py-6 border transition-colors ${
                  filter === 'completed' ? 'border-cyan-400' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-300">Completed</p>
                    <p className="text-lg sm:text-2xl font-black text-green-400">{course.completedTasks}</p>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  </div>
                </div>
              </button>
              {/* Total Tasks */}

              <button
                onClick={() => setFilter('all')}
                className={`text-left bg-white/5 rounded-lg p-3 sm:p-4 py-4 sm:py-6 border transition-colors ${
                  filter === 'all' ? 'border-cyan-400' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-300">Total Tasks</p>
                    <p className="text-lg sm:text-2xl font-black text-white">{course.totalTasks}</p>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-blue-500/20 rounded-lg">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                </div>
              </button>
            </div>

            {/* Modules */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">Course Modules</h2>
                <div className="text-xs sm:text-sm text-gray-300">Click on modules to view tasks</div>
              </div>
              {course.modules.map((module) => {
                const isExpanded = expandedModules.has(module.id);
                const completedTasks = module.tasks.filter(t => t.status === 'completed').length;
                const totalTasks = module.tasks.length;
                const progressPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
                
                return (
                  <div key={module.id} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                    {/* Module Header - Clickable */}
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => toggleModuleExpansion(module.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-semibold text-white leading-tight">{module.title}</h3>
                          <span className="text-xs text-gray-400">({totalTasks} tasks)</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 line-clamp-2">{module.description}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-300">{completedTasks}/{totalTasks} completed</p>
                          <div className="mt-1 w-24 sm:w-32 h-1.5 bg-white/10 rounded-full">
                            <div
                              className="h-1.5 bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
            </div>
                  </div>
                        <div className="flex items-center">
                          <ChevronDown 
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`} 
                          />
                </div>
                      </div>
                    </div>
                    
                    {/* Tasks List - Collapsible */}
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-white/5">
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-white">Tasks in this module</h4>
                            <span className="text-xs text-gray-400">{completedTasks} of {totalTasks} completed</span>
                          </div>
                          {module.tasks
                            .filter(t => filteredTasks.some(ft => ft.id === t.id))
                            .map((task, index) => (
                    <div
                      key={task.id}
                              className="bg-white/5 rounded-xl p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                              onClick={() => handleTaskClick(task)}
                            >
                              {/* Mobile: Two-row layout, Desktop: Single row with flex */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                {/* Row 1: Task number + Task title + icon */}
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-xs text-gray-400 font-mono flex-shrink-0">#{index + 1}</span>
                                  <h5 className="font-medium text-white text-sm leading-tight flex-1 min-w-0">{task.title}</h5>
                                  {(task.video_links && task.video_links.length > 0) || (task.videoLinks && task.videoLinks.length > 0) ? (
                                    <Play className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                                  ) : null}
                                </div>
                                
                                {/* Row 2: Points text + Mark as Completed button */}
                                <div className="flex items-center justify-center sm:justify-end gap-3">
                                  <span className="flex items-center gap-1 text-sm text-gray-200 font-medium flex-shrink-0">
                                    <Target className="w-4 h-4 text-cyan-300" />
                                    {task.points || task.reward_points} points
                                  </span>
                                  {task.status === 'pending' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskComplete(task);
                                      }}
                                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 text-sm font-medium transition-colors flex-shrink-0 shadow-lg"
                                    >
                                      Mark as Completed
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
    </div>
  );
              })}
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
                { id: 'completed', label: 'Completed', count: course?.completedTasks ?? 0 },
                { id: 'pending', label: 'Pending', count: course?.pendingTasks ?? 0 },
                { id: 'upcoming', label: 'Upcoming', count: course?.upcomingTasks ?? 0 }
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
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-6 sm:gap-8">
            <button
              onClick={() => handleNavigation('home')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'home'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Home className={`transition-all duration-300 ease-in-out ${
                activeTab === 'home' ? 'w-6 h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-5 h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'home' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Home</span>
            </button>
            
            <button
              onClick={() => handleNavigation('tasks')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'tasks'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <BookOpen className={`transition-all duration-300 ease-in-out ${
                activeTab === 'tasks' ? 'w-6 h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-5 h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'tasks' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Tasks</span>
            </button>
            
            <button
              onClick={() => handleNavigation('points')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'points'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Trophy className={`transition-all duration-300 ease-in-out ${
                activeTab === 'points' ? 'w-6 h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-5 h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'points' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Points</span>
            </button>
            
            <button
              onClick={() => handleNavigation('rankings')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'rankings'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Star className={`transition-all duration-300 ease-in-out ${
                activeTab === 'rankings' ? 'w-6 h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-5 h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'rankings' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Rankings</span>
            </button>
            </div>
          </div>
          </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 sm:p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold mb-2 leading-snug">{selectedTask.title}</h2>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
                    <span className="flex items-center gap-1 font-semibold text-green-200">
                      <Target className="w-4 h-4" />
                      {selectedTask.points || selectedTask.reward_points} points
                    </span>
                    {selectedTask.timetocomplete && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedTask.timetocomplete} minutes
                      </span>
                    )}
                    {selectedTask.task_type && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-white/15 border border-white/20">
                        {String(selectedTask.task_type)}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${
                      selectedTask.status === 'completed' 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : selectedTask.status === 'upcoming'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {selectedTask.status}
                    </span>
            </div>
            </div>
                <button
                  onClick={closeTaskModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
          </div>

            {/* Modal Content */}
            <div className="px-4 py-4 sm:p-6 max-h-[60vh] overflow-y-auto">
              {/* Content */}
              {selectedTask.content && (
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Content</h3>
                  <div className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                    {selectedTask.content}
                  </div>
                </div>
              )}

      {/* Video Links */}
              {((selectedTask.video_links && selectedTask.video_links.length > 0) || (selectedTask.videoLinks && selectedTask.videoLinks.length > 0)) && (
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Play className="w-5 h-5 text-blue-600" />
                    Video Resources
                  </h3>
                  <div className="space-y-3">
                    {(selectedTask.video_links || selectedTask.videoLinks || []).map((link: string, index: number) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                        className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                              <Play className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 text-sm sm:text-base">
                Video {index + 1}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-500">Click to watch</p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </div>
              </a>
            ))}
          </div>
        </div>
      )}

              {/* Task Description */}
              {(selectedTask.task_desc || selectedTask.description) && (
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Task Description</h3>
                  <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">
                    {selectedTask.task_desc || selectedTask.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
              <div className="text-xs sm:text-sm text-gray-500">
                Task ID: {selectedTask.id}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeTaskModal}
                  className="px-3 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                {selectedTask.status === 'pending' && (
        <button
            onClick={() => {
                      handleTaskComplete(selectedTask);
                      closeTaskModal();
            }}
                    className="px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors font-medium"
          >
          Mark as Completed
        </button>
        )}
      </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

