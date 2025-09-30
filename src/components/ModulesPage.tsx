import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Book, CheckCircle, FileText, Clock, Target, LogOut } from 'lucide-react';
import { fetchMyCourses } from '../api/endpoints';

interface Course {
  id: number;
  title: string;
  version: number;
  modules: number;
  tasks: number;
  status: 'Active' | 'Archived';
}

export default function ModulesPage() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadCourses = async () => {
    setIsRefreshing(true);
    setError('');
    try {
      const { data } = await fetchMyCourses();
      console.log('Courses API response:', data);
      
      if (Array.isArray(data) && data.length) {
        const normalized: Course[] = data.map((c: any) => ({
          id: Number(c.id ?? c.course_id ?? c.courseId),
          title: String(c.title ?? c.name ?? 'Course'),
          version: Number(c.version ?? 1),
          modules: Number(c.modules ?? c.modules_count ?? 0),
          tasks: Number(c.tasks ?? c.tasks_count ?? 0),
          status: (c.status === 'Archived' ? 'Archived' : 'Active') as Course['status']
        }));
        setCourses(normalized);
      } else {
        setCourses([]);
      }
    } catch (e: any) {
      console.error('Error loading courses:', e);
      setError(e?.response?.data?.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCourseClick = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  const handleRefresh = () => {
    loadCourses();
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Course Modules & Tasks
              </h1>
              <p className="mt-1 text-gray-300">
                Explore modules and complete tasks to progress
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => {
                  // Clear stored tokens
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('user_data');
                  // Reload page to go back to login
                  window.location.reload();
                }}
                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-white">Loading courses...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">{error}</div>
              <button 
                onClick={loadCourses}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                Try Again
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No courses found</div>
              <button 
                onClick={loadCourses}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <ModuleCard 
                  key={course.id} 
                  course={course} 
                  onClick={() => handleCourseClick(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ course, onClick }: { course: Course; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-105"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-gray-300 mt-1">Version {course.version}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.status === 'Active' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {course.status}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-300">
            <Book className="w-4 h-4" />
            <span className="text-sm">{course.modules} modules</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <Target className="w-4 h-4" />
            <span className="text-sm">{course.tasks} tasks</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">View Details</span>
          </div>
          <div className="text-cyan-400 group-hover:translate-x-1 transition-transform">
            →
          </div>
        </div>
      </div>
    </div>
  );
}
