import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../api/endpoints';
import { Trophy, Medal, Award, Crown, Home } from 'lucide-react';

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

type NavigationTab = 'home' | 'tasks' | 'points' | 'rankings';

interface LeaderboardProps {
  onBack: () => void;
  onNavigate?: (tab: NavigationTab) => void;
}

export default function Leaderboard({ onBack, onNavigate }: LeaderboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await fetchLeaderboard();
      console.log('Leaderboard API response:', data);
      
      // Transform API response to match our Student interface
      const transformedStudents: Student[] = Array.isArray(data) ? data.map((student: any, index: number) => ({
        id: student.id || index + 1,
        name: student.name || student.full_name || 'Student',
        initials: student.initials || (student.name || 'S').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
        rank: student.rank || index + 1,
        completed: student.completed_tasks || student.tasks_completed || 0,
        streak: student.streak || 0,
        points: student.points || student.total_points || 0,
        pointsThisMonth: student.points_this_month || 0,
        totalPoints: student.total_points || student.points || 0,
        rewardsUnlocked: student.rewards_unlocked || 0,
        rewardsValue: student.rewards_value || 0,
        avatar: student.avatar || `bg-${['blue', 'green', 'purple', 'pink', 'indigo', 'teal', 'orange', 'red', 'gray', 'slate'][index % 10]}-500`
      })) : [];
      
      setStudents(transformedStudents);
    } catch (e: any) {
      console.error('Error loading leaderboard:', e);
      setError(e?.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-white/10 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">Loading leaderboard...</div>
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
                <h1 className="text-xl font-bold text-white">Leaderboard</h1>
                <p className="text-sm text-gray-300">Top performers this month</p>
              </div>
           </div>
            <div className="flex items-center space-x-2">
            <button
                onClick={() => onNavigate?.('points')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              <Trophy className="w-4 h-4" />
                <span>Points</span>
            </button>
          </div>
                  </div>
                </div>
              </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="space-y-6">
            {/* Top 3 Podium */}
            {students.length >= 3 && (
              <div className="flex justify-center items-end space-x-4 mb-8">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-2">
                    <Medal className="w-8 h-8 text-black" />
                  </div>
                  <div className="text-white font-semibold">{students[1]?.name}</div>
                  <div className="text-gray-300 text-sm">{students[1]?.points} pts</div>
                     </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2">
                    <Crown className="w-10 h-10 text-black" />
                  </div>
                  <div className="text-white font-bold text-lg">{students[0]?.name}</div>
                  <div className="text-gray-300">{students[0]?.points} pts</div>
                     </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full flex items-center justify-center mb-2">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-white font-semibold">{students[2]?.name}</div>
                  <div className="text-gray-300 text-sm">{students[2]?.points} pts</div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Full Rankings</h2>
                <p className="text-gray-300 text-sm">Complete tasks to climb the leaderboard</p>
                     </div>

              <div className="divide-y divide-white/10">
                {students.map((student) => (
                  <div key={student.id} className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankColor(student.rank)}`}>
                          {getRankIcon(student.rank)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">{student.name}</h3>
                            {student.rank <= 3 && (
                              <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded-full">
                                TOP {student.rank}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{student.completed} tasks completed</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{student.points.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">points</div>
                        </div>
                      </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-400">Streak</div>
                        <div className="font-semibold text-white">{student.streak} days</div>
                        </div>
                      <div className="text-center">
                        <div className="text-gray-400">This Month</div>
                        <div className="font-semibold text-cyan-400">{student.pointsThisMonth} pts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Rewards</div>
                        <div className="font-semibold text-purple-400">{student.rewardsUnlocked}</div>
                        </div>
                      <div className="text-center">
                        <div className="text-gray-400">Value</div>
                        <div className="font-semibold text-green-400">${student.rewardsValue}</div>
                      </div>
                    </div>
                   </div>
                ))}
               </div>
            </div>
          </div>
        )}
       </div>
    </div>
  );
}
