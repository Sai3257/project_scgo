import { useEffect, useState } from 'react';
import { fetchRewards } from '../api/endpoints';
import { Gift, Lock, Home, BookOpen, Star, Trophy } from 'lucide-react';

type NavigationTab = 'home' | 'tasks' | 'points' | 'rankings' | 'rewards';

interface RewardsPageProps {
  onNavigate?: (tab: NavigationTab) => void;
  courseId?: number;
  activeTab?: NavigationTab;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  reward_type: string;
  trigger_condition: {
    task_id: number;
    task_title: string;
  };
  reward_content: {
    url: string;
    type: string;
    title: string;
  };
  is_active: boolean;
  is_unlocked: boolean;
  earned_at?: string;
}

export default function RewardsPage({ onNavigate, courseId = 57, activeTab = 'rewards' }: RewardsPageProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadRewards = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Fetching rewards for course ID:', courseId);
      const { data } = await fetchRewards(courseId);
      console.log('Rewards API response:', data);
      
      if (Array.isArray(data)) {
        setRewards(data);
      } else {
        console.error('Invalid rewards data format:', data);
        throw new Error('Invalid rewards data format');
      }
    } catch (e: any) {
      console.error('Error loading rewards:', e);
      setError(e?.response?.data?.message || 'Failed to load rewards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">Loading rewards...</div>
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
            onClick={loadRewards}
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
              <h1 className="text-lg sm:text-xl font-bold text-white">List of Rewards</h1>
              <p className="text-xs sm:text-sm text-gray-300">Complete tasks to unlock rewards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 pb-16 sm:pb-20">
        {rewards.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Rewards Available</h2>
            <p className="text-gray-300 mb-6">Complete tasks to unlock rewards!</p>
            <button
              onClick={() => onNavigate?.('tasks')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium"
            >
              Start Learning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-white/20 relative ${
                  !reward.is_unlocked ? 'opacity-60' : ''
                }`}
              >
                {/* Locked Overlay */}
                {!reward.is_unlocked && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300 font-medium">Locked</p>
                    </div>
                  </div>
                )}

                {/* Reward Icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                    <Gift className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{reward.reward_content.title}</h3>
                    <p className="text-xs text-gray-400">Reward #{reward.id}</p>
                  </div>
                </div>

                {/* Reward Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Criteria:</p>
                    <p className="text-sm text-white">Complete "{reward.trigger_condition.task_title}" task</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Description:</p>
                    <p className="text-sm text-gray-400">{reward.description}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Reward Value:</p>
                    <p className="text-lg font-bold text-green-400">$49</p>
                  </div>


                  {reward.earned_at && (
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-1">Earned:</p>
                      <p className="text-xs text-gray-400">
                        {new Date(reward.earned_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {reward.is_unlocked && reward.reward_content.url && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <a
                      href={reward.reward_content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium text-sm"
                    >
                      <Gift className="w-4 h-4" />
                      Watch Reward
                    </a>
                  </div>
                )}
              </div>
            ))}
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
              onClick={() => onNavigate?.('tasks')}
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
              <Star className={`transition-all duration-300 ease-in-out ${
                activeTab === 'points' ? 'w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-4 h-4 sm:w-5 sm:h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'points' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Points</span>
            </button>

            {/* Rankings */}
            <button
              onClick={() => onNavigate?.('rankings')}
              className={`flex flex-col items-center space-y-0.5 sm:space-y-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 ease-in-out ${
                activeTab === 'rankings'
                  ? 'text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/30 transform scale-105'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Trophy className={`transition-all duration-300 ease-in-out ${
                activeTab === 'rankings' ? 'w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg drop-shadow-cyan-500/50' : 'w-4 h-4 sm:w-5 sm:h-5'
              }`} />
              <span className={`text-xs font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'rankings' ? 'font-bold drop-shadow-md drop-shadow-cyan-500/40' : 'font-normal'
              }`}>Rankings</span>
            </button>

            {/* Rewards - Currently Active */}
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
