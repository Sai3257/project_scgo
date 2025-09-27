import { useEffect, useState } from 'react';
import { RefreshCw, Book, CheckCircle, FileText, LogOut, User } from 'lucide-react';
import CourseDetails from './CourseDetails';
import { fetchMyCourses } from '../api/endpoints';

interface Course {
  id: number;
  title: string;
  version: number;
  modules: number;
  tasks: number;
  status: 'Active' | 'Archived';
}

interface StudentCoursesProps {
  onLogout?: () => void;
  onProfile?: () => void;
}

const fallbackCourses: Course[] = [
  {
    id: 1,
    title: 'One Crore Unicorn Coach Programme',
    version: 1,
    modules: 7,
    tasks: 43,
    status: 'Active'
  },
  {
    id: 56,
    title: 'demo course',
    version: 3,
    modules: 6,
    tasks: 10,
    status: 'Active'
  },
  {
    id: 53,
    title: '21 Day AI Challenge',
    version: 1,
    modules: 3,
    tasks: 22,
    status: 'Active'
  }
];

export default function StudentCourses({ onLogout, onProfile }: StudentCoursesProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>(fallbackCourses);

  const loadCourses = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await fetchMyCourses();
      // Expecting an array of courses with id, title, modules/tasks counts
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
      }
    } catch (e) {
      // Keep fallback data on error
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  if (selectedCourse) {
    return <CourseDetails courseId={selectedCourse.id} onHome={() => setSelectedCourse(null)} />;
  }

  const handleRefresh = () => {
    loadCourses();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78]">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                My Courses
              </h1>
              <p className="mt-1 text-[#A0AEC0]">
                Manage your learning journey
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
              {onProfile && (
                <button
                  onClick={onProfile}
                  className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Course Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onClick={() => setSelectedCourse(course)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  return (
    <div 
      className="bg-[#1A2453] rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group hover:ring-2 hover:ring-[#3A5BC7] hover:ring-opacity-50 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Card Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors duration-200 leading-tight">
              {course.title}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs sm:text-sm text-[#A0AEC0]">Version {course.version}</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${
                course.status === 'Active' 
                  ? 'bg-[#32CD32] text-black' 
                  : 'bg-[#A0AEC0] text-black'
              }`}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {course.status}
              </span>
            </div>
          </div>
        </div>

        {/* Course Stats */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4 text-[#A0AEC0] flex-shrink-0" />
              <span className="text-[#A0AEC0] text-xs sm:text-sm">Modules</span>
            </div>
            <span className="text-white font-medium text-sm sm:text-base">{course.modules}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#A0AEC0] flex-shrink-0" />
              <span className="text-[#A0AEC0] text-xs sm:text-sm">Tasks</span>
            </div>
            <span className="text-white font-medium text-sm sm:text-base">{course.tasks}</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#0F1535] border-t border-white/5">
        <button 
          className="w-full py-2 px-3 sm:px-4 bg-gradient-to-r from-[#3A5BC7] to-[#007BFF] hover:from-[#2E4AA3] hover:to-[#0056b3] text-white rounded-lg font-medium transition-all duration-200 transform group-hover:scale-[1.02] text-sm sm:text-base"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
}