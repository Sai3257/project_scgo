import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Book, CheckCircle, FileText, LogOut } from 'lucide-react';
import { fetchMyCourses, fetchCourseDetails } from '../api/endpoints';

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
}

// Removed dummy data - now fetching from API

export default function StudentCourses({ }: StudentCoursesProps) {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  

  const loadCourses = async () => {
    setIsRefreshing(true);
    setError('');
    try {
      const response = await fetchMyCourses();
      console.log('=== FULL API RESPONSE DEBUG ===');
      console.log('Raw response object:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      
      const { data } = response;
      console.log('=== EXTRACTED DATA DEBUG ===');
      console.log('Data:', data);
      console.log('Data type:', typeof data);
      console.log('Data constructor:', data?.constructor?.name);
      console.log('Is array:', Array.isArray(data));
      console.log('Data length:', Array.isArray(data) ? data.length : 'N/A');
      
      if (data && typeof data === 'object') {
        console.log('Data keys:', Object.keys(data));
        console.log('Data values:', Object.values(data));
        
        // Check if data has nested structure
        if (data.courses) {
          console.log('Found data.courses:', data.courses);
          console.log('data.courses type:', typeof data.courses);
          console.log('data.courses is array:', Array.isArray(data.courses));
          if (Array.isArray(data.courses) && data.courses.length > 0) {
            console.log('First course in data.courses:', data.courses[0]);
            console.log('First course fields:', Object.keys(data.courses[0]));
          }
        }
        
        if (data.data) {
          console.log('Found data.data:', data.data);
          console.log('data.data type:', typeof data.data);
          console.log('data.data is array:', Array.isArray(data.data));
        }
        
        if (data.results) {
          console.log('Found data.results:', data.results);
          console.log('data.results type:', typeof data.results);
          console.log('data.results is array:', Array.isArray(data.results));
        }
      }
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('First course object:', data[0]);
        console.log('First course fields:', Object.keys(data[0]));
        console.log('First course course_id:', data[0].course_id);
        console.log('First course id:', data[0].id);
        console.log('First course title:', data[0].title);
        
        // Log all fields and their values for the first course
        Object.entries(data[0]).forEach(([key, value]) => {
          console.log(`First course ${key}:`, value);
        });
      }
      
      console.log('=== END EXTRACTED DATA DEBUG ===');
      
      // Handle different possible response structures
      let coursesData = data;
      console.log('=== RESPONSE STRUCTURE HANDLING ===');
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        console.log('Data is an object, looking for courses array...');
        
        // Try common nested structures
        if (data.courses && Array.isArray(data.courses)) {
          console.log('Found courses in data.courses');
          coursesData = data.courses;
        } else if (data.data && Array.isArray(data.data)) {
          console.log('Found courses in data.data');
          coursesData = data.data;
        } else if (data.results && Array.isArray(data.results)) {
          console.log('Found courses in data.results');
          coursesData = data.results;
        } else if (data.enrolled_courses && Array.isArray(data.enrolled_courses)) {
          console.log('Found courses in data.enrolled_courses');
          coursesData = data.enrolled_courses;
        } else {
          console.log('No nested array found, trying Object.values...');
          const values = Object.values(data);
          if (values.length > 0 && Array.isArray(values[0])) {
            console.log('Found array in first object value');
            coursesData = values[0];
          } else {
            console.log('No array found in object values:', values);
            coursesData = [];
          }
        }
      } else if (Array.isArray(data)) {
        console.log('Data is already an array');
        coursesData = data;
      } else {
        console.log('Data is neither object nor array:', typeof data);
        coursesData = [];
      }
      
      console.log('Final coursesData:', coursesData);
      console.log('coursesData type:', typeof coursesData);
      console.log('coursesData is array:', Array.isArray(coursesData));
      console.log('coursesData length:', Array.isArray(coursesData) ? coursesData.length : 'N/A');
      console.log('=== END RESPONSE STRUCTURE HANDLING ===');
      
        if (Array.isArray(coursesData) && coursesData.length) {
          // First, normalize the basic course data
          console.log('=== COURSE NORMALIZATION ===');
          console.log('Processing', coursesData.length, 'courses for normalization');
          
          const normalizedRaw = coursesData.map((c: any, index: number) => {
            console.log(`=== Processing Course ${index + 1} ===`);
            console.log('Raw course object:', c);
            console.log('Available fields:', Object.keys(c));
            
            // Log all possible ID fields
            console.log('ID field values:', {
              course_id: c.course_id,
              id: c.id,
              courseId: c.courseId,
              ID: c.ID,
              CourseId: c.CourseId
            });
            
            // Require a valid numeric course ID from the API response (accept course_id or id)
            const rawId = c.course_id ?? c.id ?? c.courseId ?? c.ID ?? c.CourseId;
            const numericId = Number(rawId);
            console.log('Selected raw course id from API:', rawId, '→ Numeric:', numericId);

            if (!numericId || isNaN(numericId) || numericId <= 0) {
              console.warn(`⚠️ Skipping course at index ${index} due to missing/invalid course_id`, c.course_id);
              return null;
            }
            
            console.log(`=== End Course ${index + 1} Processing ===`);
            
            const courseData = {
              id: numericId,
              title: String(c.title ?? c.name ?? c.course_name ?? `Course ${index + 1}`),
              version: Number(c.version ?? c.course_version ?? 1),
              modules: Number(c.modules ?? c.modules_count ?? c.module_count ?? 0),
              tasks: Number(c.tasks ?? c.tasks_count ?? c.task_count ?? 0),
              status: (c.status === 'Archived' ? 'Archived' : 'Active') as Course['status']
            };
            
            console.log(`📊 Course ${index + 1} normalized data:`, {
              id: courseData.id,
              title: courseData.title,
              modules: courseData.modules,
              tasks: courseData.tasks,
              'modules from API': c.modules,
              'modules_count from API': c.modules_count,
              'module_count from API': c.module_count,
              'tasks from API': c.tasks,
              'tasks_count from API': c.tasks_count,
              'task_count from API': c.task_count
            });
            
            return courseData;
          });
          
          const normalized: Course[] = (normalizedRaw.filter(Boolean) as Course[]);
          
          // Remove duplicates based on title and ID
          const uniqueCourses = normalized.filter((course, index, self) => 
            index === self.findIndex(c => c.id === course.id && c.title === course.title)
          );
          
          console.log('Unique courses after deduplication:', uniqueCourses);
          
          // Now fetch detailed information for each course in parallel
          console.log('=== COURSE DETAILS FETCHING ===');
          console.log('Fetching detailed course information for', uniqueCourses.length, 'courses...');
          
          const enrichedCourses = await Promise.all(
            uniqueCourses.map(async (course, index) => {
              try {
                console.log(`=== Fetching Details for Course ${index + 1} ===`);
                console.log(`Course ID: ${course.id}`);
                console.log(`Course Title: ${course.title}`);
                console.log(`Making API call to: /courses/${course.id}`);
                
                const detailsResponse = await fetchCourseDetails(course.id);
                const details = detailsResponse.data;
                
                console.log(`✅ Course ${course.id} details response:`, details);
                console.log(`Details type:`, typeof details);
                console.log(`Details keys:`, details ? Object.keys(details) : 'No details');
                
                // Extract module and task counts from details
                let modulesCount = 0;
                let tasksCount = 0;
                
                console.log('=== COUNT EXTRACTION ===');
                
                if (details) {
                  console.log('Details available, extracting counts...');
                  
                  // Try to get counts from modules array
                  if (details.modules && Array.isArray(details.modules)) {
                    console.log('Found modules array with', details.modules.length, 'modules');
                    modulesCount = details.modules.length;
                    
                    tasksCount = details.modules.reduce((total: number, module: any, moduleIndex: number) => {
                      const moduleTasks = module.tasks ? module.tasks.length : 0;
                      console.log(`Module ${moduleIndex + 1} has ${moduleTasks} tasks`);
                      return total + moduleTasks;
                    }, 0);
                    
                    console.log('✅ Counted from modules array - modules:', modulesCount, 'tasks:', tasksCount);
                  } else {
                    console.log('No modules array found, trying direct count fields...');
                  }
                  
                  // Fallback to direct count fields
                  if (modulesCount === 0) {
                    const directModules = details.modules_count || details.module_count || details.total_modules || 0;
                    console.log('Direct modules count fields:', {
                      modules_count: details.modules_count,
                      module_count: details.module_count,
                      total_modules: details.total_modules
                    });
                    modulesCount = directModules;
                    console.log('Using direct modules count:', modulesCount);
                  }
                  
                  if (tasksCount === 0) {
                    const directTasks = details.tasks_count || details.task_count || details.total_tasks || 0;
                    console.log('Direct tasks count fields:', {
                      tasks_count: details.tasks_count,
                      task_count: details.task_count,
                      total_tasks: details.total_tasks
                    });
                    tasksCount = directTasks;
                    console.log('Using direct tasks count:', tasksCount);
                  }

                  // Additional fallback: if API provides a top-level tasks array
                  if (tasksCount === 0 && Array.isArray(details.tasks)) {
                    tasksCount = details.tasks.length;
                    console.log('✅ Counted from top-level tasks array:', tasksCount);
                  }
                } else {
                  console.log('❌ No details available for course', course.id);
                }
                
                console.log(`✅ Course ${course.id} - Final counts: modules=${modulesCount}, tasks=${tasksCount}`);
                
                const enrichedCourse = {
                  ...course,
                  modules: modulesCount,
                  tasks: tasksCount
                };
                
                console.log(`✅ Enriched course ${course.id}:`, enrichedCourse);
                console.log(`=== End Course ${course.id} Details Fetching ===`);
                return enrichedCourse;
              } catch (error: any) {
                console.error(`❌ Failed to fetch details for course ${course.id}:`, error);
                console.error(`❌ Error status:`, error?.response?.status);
                console.error(`❌ Error message:`, error?.response?.data);
                console.log(`⚠️ Backend API /courses/${course.id} is returning error`);
                console.log(`🔄 Using basic course data for course ${course.id}`);
                
                // If the course details API fails, we'll use the basic course data
                const fallbackCourse = {
                  ...course,
                  modules: course.modules || 0,
                  tasks: course.tasks || 0
                };
                console.log(`📊 Fallback course data modules: ${fallbackCourse.modules}, tasks: ${fallbackCourse.tasks}`);
                return fallbackCourse;
              }
            })
          );
          
          console.log('=== FINAL STATE UPDATE ===');
          console.log('Enriched courses with details:', enrichedCourses);
          console.log('Enriched courses count:', enrichedCourses.length);
          console.log('Enriched courses type:', typeof enrichedCourses);
          console.log('Is enriched courses array:', Array.isArray(enrichedCourses));
          
          if (enrichedCourses.length > 0) {
            console.log('✅ Setting courses state with', enrichedCourses.length, 'enriched courses');
            enrichedCourses.forEach((course, index) => {
              console.log(`Course ${index + 1}: ID=${course.id}, Title="${course.title}", Modules=${course.modules}, Tasks=${course.tasks}`);
            });
          } else {
            console.log('⚠️ No enriched courses to set in state');
          }
          
          setCourses(enrichedCourses);
          console.log('=== END FINAL STATE UPDATE ===');
      } else {
        console.log('No courses data received:', coursesData);
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

  const handleCourseClick = (courseId: number, courseTitle: string) => {
    console.log('Course clicked with ID:', courseId, 'Title:', courseTitle, 'Type:', typeof courseId);
    if (isNaN(courseId) || courseId <= 0) {
      console.error('Invalid course ID:', courseId);
      return;
    }
    
    // Store the current course ID in localStorage for navigation from other pages
    localStorage.setItem('currentCourseId', courseId.toString());
    console.log('Stored current course ID in localStorage:', courseId);
    
    // Pass course title as state to the course details page
    navigate(`/course/${courseId}`, { state: { courseTitle } });
  };

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
              <span className="ml-3 text-white">Loading courses and fetching details...</span>
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
                    {courses.map((course, index) => (
              <CourseCard 
                        key={`course-${course.id}-${index}`}
                course={course} 
                        onClick={() => handleCourseClick(course.id, course.title)}
              />
            ))}
          </div>
          )}
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