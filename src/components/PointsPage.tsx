import { useState } from 'react';
import { Star, Home, BookOpen, Trophy, Gift, DollarSign, TrendingUp } from 'lucide-react';

type NavigationTab = 'home' | 'tasks' | 'points' | 'rankings';

interface PointsPageProps {
  activeTab?: NavigationTab;
  onNavigate?: (tab: NavigationTab) => void;
  onHome?: () => void;
}

export default function PointsPage({ activeTab = 'points', onNavigate, onHome }: PointsPageProps) {
  // Sample points history data
  const pointsHistory = [
    {
      id: 1,
      type: 'Points',
      amount: 1000,
      description: 'Course Completion Bonus',
      date: '2024-01-15',
      isPositive: true
    },
    {
      id: 2,
      type: 'Points',
      amount: 75,
      description: 'Task Completion',
      date: '2024-01-14',
      isPositive: true
    },
    {
      id: 3,
      type: 'Points',
      amount: 100,
      description: 'Initial Bonus',
      date: '2024-01-01',
      isPositive: true
    }
  ];

  const totalPoints = pointsHistory.reduce((sum, item) => sum + item.amount, 0);

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

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
