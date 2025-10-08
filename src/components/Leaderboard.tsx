import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchLeaderboard } from '../api/endpoints';
import { Trophy, Home, Star, BookOpen, TrendingUp, Gift, DollarSign, Crown, Medal, Award } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  initials: string;
  rank: number;
  completed: number;
  streak: number;
  points: number;
  pointsThisMonth: number;
  totalPoints: number;
  rewardsUnlocked: number;
  rewardsValue: number;
  avatar: string;
}

type NavigationTab = 'home' | 'tasks' | 'points' | 'rankings' | 'rewards';

interface LeaderboardProps {
  onNavigate?: (tab: NavigationTab) => void;
  courseId?: number;
  activeTab?: NavigationTab;
}

export default function Leaderboard({ onNavigate, courseId, activeTab = 'rankings' }: LeaderboardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPeriod, setCurrentPeriod] = useState<'thisMonth' | 'previousMonth'>('thisMonth');
  
  // Get courseId from props or from URL state
  const currentCourseId = courseId || location.state?.courseId || 57; // Default to 57 if not provided

  // Helper functions for date formatting
  const formatDateToYYYYMM = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getCurrentMonthDate = (): string => {
    return formatDateToYYYYMM(new Date());
  };

  const getPreviousMonthDate = (): string => {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return formatDateToYYYYMM(previousMonth);
  };

  const getMonthDateForPeriod = (period: 'thisMonth' | 'previousMonth'): string | null => {
    switch (period) {
      case 'thisMonth':
        return getCurrentMonthDate();
      case 'previousMonth':
        return getPreviousMonthDate();
      default:
        return null;
    }
  };

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!currentCourseId) {
        throw new Error('Course ID is required for leaderboard');
      }
      
      const monthDate = getMonthDateForPeriod(currentPeriod);
      console.log('Fetching leaderboard for course ID:', currentCourseId, 'with month_date:', monthDate);
      const { data } = await fetchLeaderboard(currentCourseId, monthDate);
      console.log('Leaderboard API response:', data);
      
      // Handle the new API response format with leaderboard array
      const leaderboardData = data?.leaderboard || data || [];
      const totalStudents = data?.total_students || leaderboardData.length;
      
      // Transform API response to match our Student interface
      const transformedStudents: Student[] = Array.isArray(leaderboardData) ? leaderboardData.map((student: any) => ({
        id: student.student_id || student.id || 0,
        name: student.student_name || student.name || 'Student',
        initials: (student.student_name || student.name || 'S').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
        rank: student.rank || 0,
        completed: student.tasks_completed || 0,
        streak: 0, // Not provided in API response
        points: student.monthly_points || 0, // This month points
        pointsThisMonth: student.monthly_points || 0, // This month points
        totalPoints: student.reward_points || 0, // Total points
        rewardsUnlocked: student.value_unlocked > 0 ? 1 : 0, // Show 1 if value_unlocked > 0, else 0
        rewardsValue: student.value_unlocked || 0, // Rewards value
        avatar: `bg-${['blue', 'green', 'purple', 'pink', 'indigo', 'teal', 'orange', 'red', 'gray', 'slate'][student.rank % 10]}-500`
      })) : [];
      
      // Sort by monthly points (descending) and get top 10
      const sortedStudents = transformedStudents.sort((a, b) => b.pointsThisMonth - a.pointsThisMonth);
      const top10Students = sortedStudents.slice(0, 10);
      
      // Get current user from localStorage
      const currentUserData = localStorage.getItem('user_data');
      let currentUserStudent: Student | null = null;
      
      if (currentUserData) {
        try {
          const userData = JSON.parse(currentUserData);
          const userEmail = userData.email || '';
          const userName = userEmail.split('@')[0] || 'User';
          
          // Find current user in the full list
          currentUserStudent = transformedStudents.find(student => 
            student.name.toLowerCase().includes(userName.toLowerCase()) ||
            student.name.toLowerCase().includes(userEmail.toLowerCase())
          ) || null;
          
          // If current user is not in top 10, show them separately
          if (currentUserStudent && !top10Students.find(student => student.id === currentUserStudent!.id)) {
            // Keep current user data but don't add to top 10
          } else if (currentUserStudent && top10Students.find(student => student.id === currentUserStudent!.id)) {
            // Current user is in top 10, don't show separately
            currentUserStudent = null;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      console.log('Top 10 students:', top10Students);
      console.log('Current user:', currentUserStudent);
      console.log('Total students:', totalStudents);
      setStudents(top10Students);
      setCurrentUser(currentUserStudent);
    } catch (e: any) {
      console.error('Error loading leaderboard:', e);
      setError(e?.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentCourseId) {
      loadLeaderboard();
    }
  }, [currentCourseId, currentPeriod]);

  // Minimal, chart-like layout — no icons/medals/avatars

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button 
            onClick={loadLeaderboard}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78]">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Leaderboard</h1>
              <p className="text-xs sm:text-sm text-gray-300">Top performers this month</p>
            </div>
                  </div>
                </div>
              </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 pb-16 sm:pb-20">
        {students.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Rankings Yet</h2>
            <p className="text-gray-300 mb-6">Complete some tasks to appear on the leaderboard!</p>
            <button
              onClick={() => onNavigate?.('tasks')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium"
            >
              Start Learning
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Tabbed Navigation */}
            <div className="flex flex-row justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
              <button
                onClick={() => setCurrentPeriod('thisMonth')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                  currentPeriod === 'thisMonth'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 transform scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20'
                }`}
              >
                This Month Leaderboard
              </button>
              <button
                onClick={() => setCurrentPeriod('previousMonth')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                  currentPeriod === 'previousMonth'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 transform scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20'
                }`}
              >
                Previous Month Leaderboard
              </button>
            </div>

            {/* Modern Leaderboard */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
              <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  {currentPeriod === 'thisMonth' ? 'This Month Rankings' : 'Previous Month Rankings'}
                </h2>
                <p className="text-gray-300 text-xs sm:text-sm mt-1">Complete tasks to climb the leaderboard</p>
            </div>

            {/* Mobile Headers */}
            <div className="md:hidden grid grid-cols-5 px-2 sm:px-4 py-2 bg-white/5 border-b border-white/10">
              <div className="text-left text-[10px] sm:text-xs text-gray-400 font-medium">Rankings</div>
              <div className="text-center text-[10px] sm:text-xs text-gray-400 font-medium">
                {currentPeriod === 'thisMonth' ? 'Month Points' : 'Prev Points'}
              </div>
              <div className="text-center text-[10px] sm:text-xs text-gray-400 font-medium"> CurrentTotal</div>
              <div className="text-center text-[10px] sm:text-xs text-gray-400 font-medium">RewardsCount</div>
              <div className="text-center text-[10px] sm:text-xs text-gray-400 font-medium">RewardsValue</div>
            </div>

            {/* Desktop Headers */}
            <div className="hidden md:grid md:grid-cols-5 px-4 sm:px-6 py-3 sm:py-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Rankings</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-white">
                    {currentPeriod === 'thisMonth' ? 'This Month Points' : 'Previous Month Points'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-white">Current Total</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-white">Rewards Unlocked</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-white">Rewards Value</span>
                </div>
              </div>

              {/* Leaderboard Cards */}
              <div className="space-y-1 sm:space-y-3 p-2 sm:p-4">
                {students.map((student, index) => {
                  const rank = index + 1;

                  const getRankIcon = () => {
                    switch (rank) {
                      case 1:
                        return <Crown className="w-5 h-5 text-yellow-400" />;
                      case 2:
                        return <Medal className="w-5 h-5 text-gray-300" />;
                      case 3:
                        return <Award className="w-5 h-5 text-amber-600" />;
                      default:
                        return <span className="text-xs font-bold text-gray-400">#{rank}</span>;
                    }
                  };


                  return (
                    <div
                      key={student.id}
                      className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 p-2 sm:p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-white/20"
                    >
                       {/* Mobile Layout */}
                       <div className="md:hidden grid grid-cols-5 items-center gap-1 sm:gap-2">
                         <div className="flex items-center gap-1">
                           {getRankIcon()}
                           <h3 className="font-semibold text-white text-[10px] sm:text-xs break-words leading-tight">{student.name}</h3>
                         </div>
                         <div className="text-center">
                           <span className="font-semibold text-white text-[10px] sm:text-xs">{student.pointsThisMonth}</span>
                         </div>
                         <div className="text-center">
                           <span className="font-semibold text-white text-[10px] sm:text-xs">{student.totalPoints.toLocaleString()}</span>
                         </div>
                         <div className="text-center">
                           <span className="font-semibold text-white text-[10px] sm:text-xs">{student.rewardsUnlocked}</span>
                         </div>
                         <div className="text-center">
                           <span className="font-semibold text-white text-[10px] sm:text-xs">${student.rewardsValue}</span>
                         </div>
                       </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:grid md:grid-cols-5 items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {getRankIcon()}
                          <h3 className="font-semibold text-white text-sm sm:text-base">{student.name}</h3>
                        </div>
                        <div className="text-center">
                          <span className="font-semibold text-white text-sm sm:text-base">{student.pointsThisMonth}</span>
                        </div>
                        <div className="text-center">
                          <span className="font-semibold text-white text-sm sm:text-base">{student.totalPoints.toLocaleString()}</span>
                        </div>
                        <div className="text-center">
                          <span className="font-semibold text-white text-sm sm:text-base">{student.rewardsUnlocked}</span>
                        </div>
                        <div className="text-center">
                          <span className="font-semibold text-white text-sm sm:text-base">${student.rewardsValue}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current User Row (if not in top 10) */}
              {currentUser && (
                <div className="mt-4">
                  <div className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 p-2 sm:p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-white/20">
                    {/* Mobile Layout */}
                    <div className="md:hidden grid grid-cols-5 items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full">
                          <span className="text-white text-[8px] sm:text-[10px] font-bold">#{currentUser.rank}</span>
                        </div>
                        <h3 className="font-semibold text-white text-[10px] sm:text-xs break-words leading-tight">{currentUser.name}</h3>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-white text-[10px] sm:text-xs">{currentUser.pointsThisMonth}</span>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-white text-[10px] sm:text-xs">{currentUser.totalPoints.toLocaleString()}</span>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-white text-[10px] sm:text-xs">{currentUser.rewardsUnlocked}</span>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-white text-[10px] sm:text-xs">${currentUser.rewardsValue}</span>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-5 items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full">
                          <span className="text-white text-xs sm:text-sm font-bold">#{currentUser.rank}</span>
                        </div>
                        <h3 className="font-semibold text-white text-sm sm:text-base">{currentUser.name}</h3>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-white text-sm sm:text-base">{currentUser.pointsThisMonth}</span>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-white text-sm sm:text-base">{currentUser.totalPoints.toLocaleString()}</span>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-white text-sm sm:text-base">{currentUser.rewardsUnlocked}</span>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-white text-sm sm:text-base">${currentUser.rewardsValue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
       </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
            {/* Home */}
            <button
              onClick={() => onNavigate?.('home')}
              className={`flex flex-col items-center space-y-0.5 sm:space-y-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'home'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Home className={`transition-all duration-300 ease-in-out ${
                activeTab === 'home' ? 'w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-4 h-4 sm:w-5 sm:h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'home' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Home</span>
            </button>

            {/* Tasks */}
            <button
              onClick={() => navigate(`/course/${currentCourseId}`)}
              className={`flex flex-col items-center space-y-0.5 sm:space-y-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'tasks'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <BookOpen className={`transition-all duration-300 ease-in-out ${
                activeTab === 'tasks' ? 'w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-4 h-4 sm:w-5 sm:h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'tasks' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Tasks</span>
            </button>

            {/* Points */}
            <button
              onClick={() => onNavigate?.('points')}
              className={`flex flex-col items-center space-y-0.5 sm:space-y-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'points'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Trophy className={`transition-all duration-300 ease-in-out ${
                activeTab === 'points' ? 'w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-4 h-4 sm:w-5 sm:h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'points' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Points</span>
            </button>

            {/* Rankings - Currently Active */}
            <button
              onClick={() => onNavigate?.('rankings')}
              className={`flex flex-col items-center space-y-0.5 sm:space-y-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'rankings'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Star className={`transition-all duration-300 ease-in-out ${
                activeTab === 'rankings' ? 'w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-4 h-4 sm:w-5 sm:h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'rankings' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Rankings</span>
            </button>

            {/* Rewards */}
            <button
              onClick={() => onNavigate?.('rewards')}
              className={`flex flex-col items-center space-y-0.5 sm:space-y-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'rewards'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Gift className={`transition-all duration-300 ease-in-out ${
                activeTab === 'rewards' ? 'w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-4 h-4 sm:w-5 sm:h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'rewards' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Rewards</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

