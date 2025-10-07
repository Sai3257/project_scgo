import { useState, useEffect } from 'react';
import { Star, Home, BookOpen, Trophy, BarChart3, DollarSign, Calendar, Gift } from 'lucide-react';
import { fetchPointsHistory, fetchProfile } from '../api/endpoints';


type NavigationTab = 'home' | 'tasks' | 'points' | 'rankings' | 'rewards';

interface PointsPageProps {
  activeTab?: NavigationTab;
  onNavigate?: (tab: NavigationTab) => void;
  onHome?: () => void;
  refreshTrigger?: number; // Add refresh trigger
}

interface PointsTransaction {
  transaction_type: string;
  points: number;
  task_name: string | null;
  completion_date: string | null;
  earned_at: string | null;
}

export default function PointsPage({ activeTab = 'points', onNavigate, onHome, refreshTrigger }: PointsPageProps) {
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadPointsData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // First get the student_id from profile
      const profileResponse = await fetchProfile();
      const profile = profileResponse.data;
      const studentId = profile?.student_profile?.student_id;
      
      if (!studentId) {
        throw new Error('Student ID not found in profile');
      }

      // Fetch points history using student_id
      console.log('Fetching points history for student_id:', studentId);
      const pointsResponse = await fetchPointsHistory(studentId);
      const pointsData = pointsResponse.data;
      
      console.log('Points API response:', pointsResponse);
      console.log('Points data:', pointsData);
      
      if (Array.isArray(pointsData)) {
        // Process API points data to ensure proper formatting
        const processedPointsData = pointsData.map((transaction: any) => ({
          ...transaction,
          transaction_type: transaction.transaction_type || "Earned",
          points: transaction.points || 0,
          task_name: transaction.task_name || null,
          completion_date: transaction.completion_date || transaction.created_at || null,
          earned_at: transaction.earned_at || null
        }));
        
        // Use the processed API data directly (API already includes Initial Bonus)
        const allTransactions = processedPointsData;
        setPointsHistory(allTransactions);
        
        // Calculate total points from all transactions
        const total = allTransactions.reduce((sum, transaction) => sum + (transaction.points || 0), 0);
        console.log('Calculated total points from API data:', total);
        console.log('API points transactions:', pointsData.length);
        console.log('Points history:', allTransactions);
        setTotalPoints(total);
      } else {
        console.error('Invalid points data format:', pointsData);
        throw new Error('Invalid points data format');
      }
      
    } catch (err: any) {
      console.error('Error loading points data:', err);
      setError(err.message || 'Failed to load points data');
      
      // Fallback to localStorage if available
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setTotalPoints(user.totalPoints || 0);
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPointsData();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      loadPointsData();
    }
  }, [refreshTrigger]);

  // Listen for localStorage trigger from CourseDetails
  useEffect(() => {
    const handleStorageChange = () => {
      const trigger = localStorage.getItem('pointsRefreshTrigger');
      if (trigger) {
        loadPointsData();
        localStorage.removeItem('pointsRefreshTrigger');
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on mount
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">Loading points...</div>
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
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78] overflow-y-auto scroll-smooth pb-28">
      {/* Header */}
      <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">
              Points History
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A0AEC0]">
              Track your points earned over time
            </p>
          </div>

          {/* Total Points Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 sm:p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base text-blue-100 mb-1">Total Points Earned</h2>
                <p className="text-2xl sm:text-3xl font-bold text-white">{totalPoints.toLocaleString()}</p>
                <p className="text-xs text-blue-200 mt-1">
                  {pointsHistory.length} transaction{pointsHistory.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Points History List */}
          <div className="space-y-3">
            {pointsHistory.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Points History</h3>
                <p className="text-gray-500">Complete tasks to start earning points!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pointsHistory.map((transaction, index) => {
                  const isInitialBonus = transaction.transaction_type === "Initial Bonus";
                  
                  // Format the date - use earned_at if available, otherwise completion_date
                  const dateToFormat = transaction.earned_at || transaction.completion_date;
                  const formattedDate = dateToFormat ? new Date(dateToFormat).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : null;
                  
                  // Display name: task_name if available, otherwise transaction_type
                  const displayName = transaction.task_name || transaction.transaction_type;
                  
                  return (
                    <div key={index} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <div className="p-2 rounded-lg bg-slate-700">
                            {isInitialBonus ? (
                              <BarChart3 className="w-5 h-5 text-green-400" />
                            ) : (
                              <DollarSign className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="text-white font-medium">
                              {displayName}
                            </h3>
                            {formattedDate && (
                              <div className="flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-400">
                                  {formattedDate}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Points */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">
                            +{transaction.points}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-6 sm:gap-8">
            {/* Home */}
            <button
              onClick={() => onNavigate ? onNavigate('home') : (onHome && onHome())}
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

            {/* Tasks */}
            <button
              onClick={() => onNavigate ? onNavigate('tasks') : {}}
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

            {/* Points */}
            <button
              onClick={() => onNavigate ? onNavigate('points') : {}}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'points'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Star className={`transition-all duration-300 ease-in-out ${
                activeTab === 'points' ? 'w-6 h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-5 h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'points' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Points</span>
            </button>

            {/* Rankings */}
            <button
              onClick={() => onNavigate ? onNavigate('rankings') : {}}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'rankings'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Trophy className={`transition-all duration-300 ease-in-out ${
                activeTab === 'rankings' ? 'w-6 h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-5 h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'rankings' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Rankings</span>
            </button>

            {/* Rewards */}
            <button
              onClick={() => onNavigate ? onNavigate('rewards') : {}}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'rewards'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Gift className={`transition-all duration-300 ease-in-out ${
                activeTab === 'rewards' ? 'w-6 h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-5 h-5'
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
