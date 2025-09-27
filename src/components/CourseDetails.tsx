import { useEffect, useState } from 'react';
import { fetchCourseDetails, markTaskAsCompleted } from '../api/endpoints';
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

export default function CourseDetails({ courseId, onBack }: { courseId: number; onBack: () => void }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showPoints, setShowPoints] = useState(false);

  const loadCourseDetails = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await fetchCourseDetails(courseId);
      console.log('Course details API response:', data);
      
      // Transform API response to match our Course interface
      const transformedCourse: Course = {
        id: data.id || courseId,
        title: data.title || data.name || 'Course',
        version: data.version || 1,
        modules: data.modules || data.course_modules || [],
        totalTasks: data.total_tasks || 0,
        completedTasks: data.completed_tasks || 0,
        pendingTasks: data.pending_tasks || 0,
        stuckTasks: data.stuck_tasks || 0,
        totalPoints: data.total_points || 0,
        earnedPoints: data.earned_points || 0
      };
      
      setCourse(transformedCourse);
    } catch (e: any) {
      console.error('Error loading course details:', e);
      setError(e?.response?.data?.message || 'Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const handleTaskComplete = async (taskId: number) => {
    try {
      await markTaskAsCompleted(taskId);
      // Reload course details to get updated task status
      loadCourseDetails();
    } catch (e: any) {
      console.error('Error marking task as completed:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">Loading course details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button 
            onClick={loadCourseDetails}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
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

  if (showLeaderboard) {
    return <Leaderboard onBack={() => setShowLeaderboard(false)} />;
  }

  if (showPoints) {
    return <PointsPage onHome={() => setShowPoints(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Home className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{course.title}</h1>
                <p className="text-sm text-gray-300">Version {course.version}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPoints(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                <Trophy className="w-4 h-4" />
                <span>Points</span>
              </button>
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Star className="w-4 h-4" />
                <span>Rankings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'home', label: 'Overview', icon: Home },
              { id: 'tasks', label: 'Tasks', icon: BookOpen },
              { id: 'points', label: 'Points', icon: Trophy },
              { id: 'rankings', label: 'Rankings', icon: Star }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as NavigationTab)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Tasks</p>
                    <p className="text-2xl font-bold text-white">{course.totalTasks}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{course.completedTasks}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{course.pendingTasks}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Points Earned</p>
                    <p className="text-2xl font-bold text-purple-400">{course.earnedPoints}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Course Modules</h2>
              {course.modules.map((module) => (
                <div key={module.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                      <p className="text-gray-300">{module.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">{module.tasks.length} tasks</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {module.tasks.map((task) => (
                      <div key={task.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white text-sm">{task.title}</h4>
                          <div className="flex items-center space-x-2">
                            {getTaskStatusIcon(task.status)}
                            <span className="text-xs text-gray-400">{task.points} pts</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
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
                      onClick={() => handleTaskComplete(task.id)}
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
    </div>
  );
}
