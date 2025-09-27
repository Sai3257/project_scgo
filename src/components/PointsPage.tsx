import { useState, useEffect } from 'react';
import { Star, Home, BookOpen, Trophy, Gift, DollarSign, TrendingUp } from 'lucide-react';

type NavigationTab = 'home' | 'tasks' | 'points' | 'rankings';

interface PointsPageProps {
  activeTab?: NavigationTab;
  onNavigate?: (tab: NavigationTab) => void;
  onHome?: () => void;
}

export default function PointsPage({ activeTab = 'points', onNavigate, onHome }: PointsPageProps) {
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // For now, we'll use a simple points display since we don't have a specific points history endpoint
  // In a real app, you'd fetch this from an API
  useEffect(() => {
    // Simulate loading user's points data
    const loadPointsData = () => {
      setIsLoading(true);
      try {
        // Get points from localStorage or user context
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setTotalPoints(user.totalPoints || 0);
        }
        
        // Mock points history - in real app, fetch from API
        setPointsHistory([
          {
            id: 1,
            type: 'Points',
            amount: 100,
            description: 'Welcome Bonus',
            date: new Date().toISOString().split('T')[0],
            isPositive: true
          }
        ]);
      } catch (e) {
        setError('Failed to load points data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPointsData();
  }, []);

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78]">
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
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Points History List */}
          <div className="space-y-3">
            {pointsHistory.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.description}</h3>
                      <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">+{item.amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A2453] border-t border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 sm:gap-8">
          <button
            onClick={() => onNavigate ? onNavigate('home') : (onHome && onHome())}
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              activeTab === 'home' ? 'text-white' : 'text-[#A0AEC0] hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('tasks') : {}}
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              activeTab === 'tasks' ? 'text-white' : 'text-[#A0AEC0] hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Tasks</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('points') : {}}
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              activeTab === 'points' ? 'text-white' : 'text-[#A0AEC0] hover:text-white'
            }`}
          >
            <Star className="w-5 h-5" />
            <span className="text-xs">Points</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('rankings') : {}}
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              activeTab === 'rankings' ? 'text-white' : 'text-[#A0AEC0] hover:text-white'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Rankings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
