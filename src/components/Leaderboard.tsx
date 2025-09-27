import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../api/endpoints';
import { Trophy, Medal, Award, Crown, Home, BookOpen, TrendingUp, Star, Gift, DollarSign } from 'lucide-react';

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
  onHome?: () => void;
  activeTab?: NavigationTab;
  onNavigate?: (tab: NavigationTab) => void;
}

const thisMonthStudents: Student[] = [
  {
    id: 1,
    name: 'Alex Chen',
    initials: 'AC',
    rank: 1,
    completed: 156,
    streak: 12,
    points: 2340,
    pointsThisMonth: 500,
    totalPoints: 2340,
    rewardsUnlocked: 8,
    rewardsValue: 120,
    avatar: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    initials: 'SJ',
    rank: 2,
    completed: 142,
    streak: 8,
    points: 2130,
    pointsThisMonth: 450,
    totalPoints: 2130,
    rewardsUnlocked: 6,
    rewardsValue: 90,
    avatar: 'bg-purple-500'
  },
  {
    id: 3,
    name: 'Marcus Brown',
    initials: 'MB',
    rank: 3,
    completed: 128,
    streak: 15,
    points: 2100,
    pointsThisMonth: 420,
    totalPoints: 2100,
    rewardsUnlocked: 5,
    rewardsValue: 75,
    avatar: 'bg-orange-500'
  },
  {
    id: 4,
    name: 'Emily Davis',
    initials: 'ED',
    rank: 4,
    completed: 115,
    streak: 6,
    points: 1980,
    pointsThisMonth: 380,
    totalPoints: 1980,
    rewardsUnlocked: 4,
    rewardsValue: 60,
    avatar: 'bg-green-500'
  },
  {
    id: 5,
    name: 'David Wilson',
    initials: 'DW',
    rank: 5,
    completed: 98,
    streak: 4,
    points: 1850,
    pointsThisMonth: 350,
    totalPoints: 1850,
    rewardsUnlocked: 3,
    rewardsValue: 45,
    avatar: 'bg-red-500'
  },
  {
    id: 6,
    name: 'Lisa Anderson',
    initials: 'LA',
    rank: 6,
    completed: 92,
    streak: 7,
    points: 1720,
    pointsThisMonth: 320,
    totalPoints: 1720,
    rewardsUnlocked: 3,
    rewardsValue: 40,
    avatar: 'bg-pink-500'
  },
  {
    id: 7,
    name: 'Michael Taylor',
    initials: 'MT',
    rank: 7,
    completed: 88,
    streak: 5,
    points: 1650,
    pointsThisMonth: 300,
    totalPoints: 1650,
    rewardsUnlocked: 2,
    rewardsValue: 35,
    avatar: 'bg-indigo-500'
  },
  {
    id: 8,
    name: 'Jessica White',
    initials: 'JW',
    rank: 8,
    completed: 85,
    streak: 9,
    points: 1580,
    pointsThisMonth: 280,
    totalPoints: 1580,
    rewardsUnlocked: 2,
    rewardsValue: 30,
    avatar: 'bg-teal-500'
  },
  {
    id: 9,
    name: 'Robert Garcia',
    initials: 'RG',
    rank: 9,
    completed: 82,
    streak: 3,
    points: 1520,
    pointsThisMonth: 260,
    totalPoints: 1520,
    rewardsUnlocked: 2,
    rewardsValue: 25,
    avatar: 'bg-cyan-500'
  },
  {
    id: 10,
    name: 'Amanda Martinez',
    initials: 'AM',
    rank: 10,
    completed: 78,
    streak: 6,
    points: 1480,
    pointsThisMonth: 240,
    totalPoints: 1480,
    rewardsUnlocked: 1,
    rewardsValue: 20,
    avatar: 'bg-emerald-500'
  },
  // Additional students for Top 50
  {
    id: 11,
    name: 'Kevin Lee',
    initials: 'KL',
    rank: 11,
    completed: 75,
    streak: 4,
    points: 1420,
    pointsThisMonth: 220,
    totalPoints: 1420,
    rewardsUnlocked: 1,
    rewardsValue: 18,
    avatar: 'bg-violet-500'
  },
  {
    id: 12,
    name: 'Rachel Kim',
    initials: 'RK',
    rank: 12,
    completed: 72,
    streak: 8,
    points: 1380,
    pointsThisMonth: 200,
    totalPoints: 1380,
    rewardsUnlocked: 1,
    rewardsValue: 15,
    avatar: 'bg-rose-500'
  },
  {
    id: 13,
    name: 'Daniel Park',
    initials: 'DP',
    rank: 13,
    completed: 70,
    streak: 2,
    points: 1350,
    pointsThisMonth: 180,
    totalPoints: 1350,
    rewardsUnlocked: 1,
    rewardsValue: 12,
    avatar: 'bg-amber-500'
  },
  {
    id: 14,
    name: 'Samantha Clark',
    initials: 'SC',
    rank: 14,
    completed: 68,
    streak: 5,
    points: 1320,
    pointsThisMonth: 160,
    totalPoints: 1320,
    rewardsUnlocked: 1,
    rewardsValue: 10,
    avatar: 'bg-lime-500'
  },
  {
    id: 15,
    name: 'Christopher Hall',
    initials: 'CH',
    rank: 15,
    completed: 65,
    streak: 3,
    points: 1280,
    pointsThisMonth: 140,
    totalPoints: 1280,
    rewardsUnlocked: 1,
    rewardsValue: 8,
    avatar: 'bg-sky-500'
  },
  // Continue with more students up to 50...
  {
    id: 16,
    name: 'Michelle Adams',
    initials: 'MA',
    rank: 16,
    completed: 62,
    streak: 4,
    points: 1250,
    pointsThisMonth: 120,
    totalPoints: 1250,
    rewardsUnlocked: 1,
    rewardsValue: 6,
    avatar: 'bg-fuchsia-500'
  },
  {
    id: 17,
    name: 'James Rodriguez',
    initials: 'JR',
    rank: 17,
    completed: 60,
    streak: 6,
    points: 1220,
    pointsThisMonth: 100,
    totalPoints: 1220,
    rewardsUnlocked: 1,
    rewardsValue: 5,
    avatar: 'bg-slate-500'
  },
  {
    id: 18,
    name: 'Ashley Thompson',
    initials: 'AT',
    rank: 18,
    completed: 58,
    streak: 2,
    points: 1180,
    pointsThisMonth: 90,
    totalPoints: 1180,
    rewardsUnlocked: 1,
    rewardsValue: 4,
    avatar: 'bg-stone-500'
  },
  {
    id: 19,
    name: 'Matthew Scott',
    initials: 'MS',
    rank: 19,
    completed: 55,
    streak: 3,
    points: 1150,
    pointsThisMonth: 80,
    totalPoints: 1150,
    rewardsUnlocked: 1,
    rewardsValue: 3,
    avatar: 'bg-zinc-500'
  },
  {
    id: 20,
    name: 'Jennifer Young',
    initials: 'JY',
    rank: 20,
    completed: 52,
    streak: 5,
    points: 1120,
    pointsThisMonth: 70,
    totalPoints: 1120,
    rewardsUnlocked: 1,
    rewardsValue: 2,
    avatar: 'bg-neutral-500'
  },
  // Additional students for Top 50 (21-50)
  {
    id: 21,
    name: 'Ryan Murphy',
    initials: 'RM',
    rank: 21,
    completed: 50,
    streak: 3,
    points: 1100,
    pointsThisMonth: 65,
    totalPoints: 1100,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-blue-600'
  },
  {
    id: 22,
    name: 'Nicole Turner',
    initials: 'NT',
    rank: 22,
    completed: 48,
    streak: 4,
    points: 1080,
    pointsThisMonth: 60,
    totalPoints: 1080,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-purple-600'
  },
  {
    id: 23,
    name: 'Brandon Reed',
    initials: 'BR',
    rank: 23,
    completed: 46,
    streak: 2,
    points: 1060,
    pointsThisMonth: 55,
    totalPoints: 1060,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-orange-600'
  },
  {
    id: 24,
    name: 'Stephanie Cook',
    initials: 'SC',
    rank: 24,
    completed: 44,
    streak: 5,
    points: 1040,
    pointsThisMonth: 50,
    totalPoints: 1040,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-green-600'
  },
  {
    id: 25,
    name: 'Tyler Bell',
    initials: 'TB',
    rank: 25,
    completed: 42,
    streak: 3,
    points: 1020,
    pointsThisMonth: 45,
    totalPoints: 1020,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-red-600'
  },
  {
    id: 26,
    name: 'Megan Cooper',
    initials: 'MC',
    rank: 26,
    completed: 40,
    streak: 2,
    points: 1000,
    pointsThisMonth: 40,
    totalPoints: 1000,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-pink-600'
  },
  {
    id: 27,
    name: 'Jordan Bailey',
    initials: 'JB',
    rank: 27,
    completed: 38,
    streak: 4,
    points: 980,
    pointsThisMonth: 35,
    totalPoints: 980,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-indigo-600'
  },
  {
    id: 28,
    name: 'Lauren Price',
    initials: 'LP',
    rank: 28,
    completed: 36,
    streak: 1,
    points: 960,
    pointsThisMonth: 30,
    totalPoints: 960,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-teal-600'
  },
  {
    id: 29,
    name: 'Cameron Ward',
    initials: 'CW',
    rank: 29,
    completed: 34,
    streak: 3,
    points: 940,
    pointsThisMonth: 25,
    totalPoints: 940,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-cyan-600'
  },
  {
    id: 30,
    name: 'Brittany Torres',
    initials: 'BT',
    rank: 30,
    completed: 32,
    streak: 2,
    points: 920,
    pointsThisMonth: 20,
    totalPoints: 920,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-emerald-600'
  },
  {
    id: 31,
    name: 'Derek Peterson',
    initials: 'DP',
    rank: 31,
    completed: 30,
    streak: 1,
    points: 900,
    pointsThisMonth: 18,
    totalPoints: 900,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-violet-600'
  },
  {
    id: 32,
    name: 'Kayla Gray',
    initials: 'KG',
    rank: 32,
    completed: 28,
    streak: 2,
    points: 880,
    pointsThisMonth: 16,
    totalPoints: 880,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-rose-600'
  },
  {
    id: 33,
    name: 'Ethan Ramirez',
    initials: 'ER',
    rank: 33,
    completed: 26,
    streak: 1,
    points: 860,
    pointsThisMonth: 14,
    totalPoints: 860,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-amber-600'
  },
  {
    id: 34,
    name: 'Hannah James',
    initials: 'HJ',
    rank: 34,
    completed: 24,
    streak: 3,
    points: 840,
    pointsThisMonth: 12,
    totalPoints: 840,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-lime-600'
  },
  {
    id: 35,
    name: 'Nathan Watson',
    initials: 'NW',
    rank: 35,
    completed: 22,
    streak: 1,
    points: 820,
    pointsThisMonth: 10,
    totalPoints: 820,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-sky-600'
  },
  {
    id: 36,
    name: 'Olivia Brooks',
    initials: 'OB',
    rank: 36,
    completed: 20,
    streak: 2,
    points: 800,
    pointsThisMonth: 8,
    totalPoints: 800,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-fuchsia-600'
  },
  {
    id: 37,
    name: 'Logan Kelly',
    initials: 'LK',
    rank: 37,
    completed: 18,
    streak: 1,
    points: 780,
    pointsThisMonth: 6,
    totalPoints: 780,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-slate-600'
  },
  {
    id: 38,
    name: 'Grace Sanders',
    initials: 'GS',
    rank: 38,
    completed: 16,
    streak: 1,
    points: 760,
    pointsThisMonth: 4,
    totalPoints: 760,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-stone-600'
  },
  {
    id: 39,
    name: 'Zachary Price',
    initials: 'ZP',
    rank: 39,
    completed: 14,
    streak: 1,
    points: 740,
    pointsThisMonth: 2,
    totalPoints: 740,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-zinc-600'
  },
  {
    id: 40,
    name: 'Chloe Bennett',
    initials: 'CB',
    rank: 40,
    completed: 12,
    streak: 1,
    points: 720,
    pointsThisMonth: 1,
    totalPoints: 720,
    rewardsUnlocked: 1,
    rewardsValue: 1,
    avatar: 'bg-neutral-600'
  },
  {
    id: 41,
    name: 'Austin Wood',
    initials: 'AW',
    rank: 41,
    completed: 10,
    streak: 1,
    points: 700,
    pointsThisMonth: 0,
    totalPoints: 700,
    rewardsUnlocked: 0,
    rewardsValue: 0,
    avatar: 'bg-blue-700'
  },
  {
    id: 42,
    name: 'Sofia Barnes',
    initials: 'SB',
    rank: 42,
    completed: 8,
    streak: 1,
    points: 680,
    pointsThisMonth: 0,
    totalPoints: 680,
    rewardsUnlocked: 0,
    rewardsValue: 0,
    avatar: 'bg-purple-700'
  },
  {
    id: 43,
    name: 'Connor Ross',
    initials: 'CR',
    rank: 43,
    completed: 6,
    streak: 1,
    points: 660,
    pointsThisMonth: 0,
    totalPoints: 660,
    rewardsUnlocked: 0,
    rewardsValue: 0,
    avatar: 'bg-orange-700'
  },
  {
    id: 44,
    name: 'Isabella Henderson',
    initials: 'IH',
    rank: 44,
    completed: 4,
    streak: 1,
    points: 640,
    pointsThisMonth: 0,
    totalPoints: 640,
    rewardsUnlocked: 0,
    rewardsValue: 0,
    avatar: 'bg-green-700'
  },
  {
    id: 45,
    name: 'Lucas Coleman',
    initials: 'LC',
    rank: 45,
    completed: 2,
    streak: 1,
    points: 620,
    pointsThisMonth: 0,
    totalPoints: 620,
    rewardsUnlocked: 0,
    rewardsValue: 0,
    avatar: 'bg-red-700'
  },
  {
    id: 46,
    name: 'Ava Jenkins',
    initials: 'AJ',
    rank: 46,
    completed: 1,
    streak: 1,
    points: 600,
    pointsThisMonth: 0,
    totalPoints: 600,
    rewardsUnlocked: 0,
    rewardsValue: 0,
    avatar: 'bg-pink-700'
  },
  {
    id: 47,
    name: 'Mason Perry',
    initials: 'MP',
    rank: 47,
    completed: 0,
    streak: 0,
    points: 580,
    pointsThisMonth: 0,
    totalPoints: 580,
    rewardsUnlocked: 0,
    rewardsValue: 0,
    avatar: 'bg-indigo-700'
  },
  {
    id: 48,
    name: 'Emma Powell',
    initials: 'EP',
    rank: 48,
    completed: 0,
    streak: 0,
    points: 560,
    pointsThisMonth: 0,
    totalPoints: 560,
    rewardsUnlocked: 0,
    rewardsValue: 0,
    avatar: 'bg-teal-700'
  },
  {
    id: 49,
    name: 'Noah Long',
    initials: 'NL',
    rank: 49,
    completed: 0,
    streak: 0,
    points: 540,
    pointsThisMonth: 0,
    totalPoints: 540,
    rewardsUnlocked: 0,
    rewardsValue: 0,
    avatar: 'bg-cyan-700'
  },
  {
    id: 50,
    name: 'Sophia Patterson',
    initials: 'SP',
    rank: 50,
    completed: 0,
    streak: 0,
    points: 520,
    pointsThisMonth: 0,
    totalPoints: 520,
    rewardsUnlocked: 0,
    rewardsValue: 0,
    avatar: 'bg-emerald-700'
  }
];

const previousMonthStudents: Student[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    initials: 'SJ',
    rank: 1,
    completed: 145,
    streak: 18,
    points: 2450,
    pointsThisMonth: 520,
    totalPoints: 2450,
    rewardsUnlocked: 9,
    rewardsValue: 135,
    avatar: 'bg-purple-500'
  },
  {
    id: 2,
    name: 'Alex Chen',
    initials: 'AC',
    rank: 2,
    completed: 138,
    streak: 14,
    points: 2380,
    pointsThisMonth: 480,
    totalPoints: 2380,
    rewardsUnlocked: 7,
    rewardsValue: 105,
    avatar: 'bg-blue-500'
  },
  {
    id: 3,
    name: 'Marcus Brown',
    initials: 'MB',
    rank: 3,
    completed: 125,
    streak: 12,
    points: 2100,
    pointsThisMonth: 400,
    totalPoints: 2100,
    rewardsUnlocked: 6,
    rewardsValue: 90,
    avatar: 'bg-orange-500'
  },
  {
    id: 4,
    name: 'Emily Davis',
    initials: 'ED',
    rank: 4,
    completed: 112,
    streak: 8,
    points: 1950,
    pointsThisMonth: 360,
    totalPoints: 1950,
    rewardsUnlocked: 5,
    rewardsValue: 75,
    avatar: 'bg-green-500'
  },
  {
    id: 5,
    name: 'David Wilson',
    initials: 'DW',
    rank: 5,
    completed: 95,
    streak: 6,
    points: 1820,
    pointsThisMonth: 320,
    totalPoints: 1820,
    rewardsUnlocked: 4,
    rewardsValue: 60,
    avatar: 'bg-red-500'
  },
  {
    id: 6,
    name: 'Lisa Anderson',
    initials: 'LA',
    rank: 6,
    completed: 90,
    streak: 7,
    points: 1760,
    pointsThisMonth: 300,
    totalPoints: 1760,
    rewardsUnlocked: 3,
    rewardsValue: 45,
    avatar: 'bg-pink-500'
  },
  {
    id: 7,
    name: 'Michael Taylor',
    initials: 'MT',
    rank: 7,
    completed: 86,
    streak: 5,
    points: 1680,
    pointsThisMonth: 290,
    totalPoints: 1680,
    rewardsUnlocked: 3,
    rewardsValue: 40,
    avatar: 'bg-indigo-500'
  },
  {
    id: 8,
    name: 'Jessica White',
    initials: 'JW',
    rank: 8,
    completed: 83,
    streak: 9,
    points: 1600,
    pointsThisMonth: 270,
    totalPoints: 1600,
    rewardsUnlocked: 2,
    rewardsValue: 35,
    avatar: 'bg-teal-500'
  },
  {
    id: 9,
    name: 'Robert Garcia',
    initials: 'RG',
    rank: 9,
    completed: 80,
    streak: 3,
    points: 1540,
    pointsThisMonth: 250,
    totalPoints: 1540,
    rewardsUnlocked: 2,
    rewardsValue: 30,
    avatar: 'bg-cyan-500'
  },
  {
    id: 10,
    name: 'Amanda Martinez',
    initials: 'AM',
    rank: 10,
    completed: 76,
    streak: 6,
    points: 1490,
    pointsThisMonth: 230,
    totalPoints: 1490,
    rewardsUnlocked: 1,
    rewardsValue: 25,
    avatar: 'bg-emerald-500'
  }
];

export default function Leaderboard({ onBack, onHome, activeTab = 'rankings', onNavigate }: LeaderboardProps) {
  const [monthTab, setMonthTab] = useState<'thisMonth' | 'previousMonth'>('thisMonth');
  
  const [currentStudents, setCurrentStudents] = useState<Student[]>(thisMonthStudents);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchLeaderboard();
        if (Array.isArray(data) && data.length) {
          const normalized: Student[] = data.map((s: any, idx: number) => ({
            id: Number(s.id ?? idx + 1),
            name: String(s.name ?? 'Student'),
            initials: String(s.initials ?? (String(s.name ?? 'S').split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase() || 'ST')),
            rank: Number(s.rank ?? idx + 1),
            completed: Number(s.completed ?? 0),
            streak: Number(s.streak ?? 0),
            points: Number(s.points ?? 0),
            pointsThisMonth: Number(s.pointsThisMonth ?? 0),
            totalPoints: Number(s.totalPoints ?? 0),
            rewardsUnlocked: Number(s.rewardsUnlocked ?? 0),
            rewardsValue: Number(s.rewardsValue ?? 0),
            avatar: 'bg-blue-500'
          }));
          setCurrentStudents(normalized);
        }
      } catch (e) {
        // keep fallback
      }
    };
    load();
  }, [monthTab]);
  const top10Students = currentStudents.slice(0, 10);
  
  // Mock logged-in user (in a real app, this would come from props or context)
  const loggedInUser = currentStudents.find(student => student.id === 15) || currentStudents[14]; // User at rank 15
  
  // Check if logged-in user is already in top 10
  const isUserInTop10 = loggedInUser && top10Students.some(student => student.id === loggedInUser.id);
  
  // Determine which students to display
  const displayedStudents = isUserInTop10 ? top10Students : [...top10Students, loggedInUser].filter(Boolean);
  

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78]">
      {/* Header */}
      <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 sm:pb-24">
        <div className="max-w-4xl mx-auto">
           <div className="mb-4 sm:mb-6">
             <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">
               Leaderboard
             </h1>
             <p className="mt-1 text-xs sm:text-sm text-[#A0AEC0]">
               Top performing students
             </p>
           </div>

          {/* Tab Navigation */}
          <div className="flex bg-[#1A2453] rounded-lg p-1 mb-6">
            <button
              onClick={() => setMonthTab('thisMonth')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                monthTab === 'thisMonth'
                  ? 'bg-[#3A5BC7] text-white shadow-lg'
                  : 'text-[#A0AEC0] hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              This Month
            </button>
            <button
              onClick={() => setMonthTab('previousMonth')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                monthTab === 'previousMonth'
                  ? 'bg-[#3A5BC7] text-white shadow-lg'
                  : 'text-[#A0AEC0] hover:text-white'
              }`}
            >
              <Medal className="w-4 h-4" />
              Previous Month
            </button>
          </div>


          {/* Leaderboard Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                {/* Left: Title and subtitle */}
                <div className="min-w-[200px]">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {monthTab === 'thisMonth' ? 'This Month' : 'Previous Month'} Rankings
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Top performers across all students
                  </p>
                </div>

                {/* Right: Updated text */}
                <div className="flex items-center gap-3 ml-auto">
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    Updated 2 minutes ago
                  </div>
                </div>
              </div>

              {/* All Students List */}
               <div className="space-y-2 max-h-96 overflow-y-auto">
                 {displayedStudents.map((student) => {
                   const isLoggedInUser = loggedInUser && student.id === loggedInUser.id;
                   const isTop10 = student.rank <= 10;
                   const isTop3 = student.rank <= 3;
                   
                   return (
                   <div
                     key={student.id}
                     className={`flex items-center p-3 sm:p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                       isTop3 
                         ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                         : isLoggedInUser && !isTop10
                         ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100'
                         : 'bg-white border-gray-200'
                     }`}
                   >
                     {/* Rank Icon */}
                     <div className="flex-shrink-0 mr-3 sm:mr-4">
                       {getRankIcon(student.rank)}
                     </div>

                     {/* Avatar */}
                     <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${student.avatar} flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 mr-3 sm:mr-4`}>
                       {student.initials}
                     </div>

                     {/* Student Info */}
                     <div className="flex-1 min-w-0">
                       <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                         {student.name}
                       </h3>
                       <p className="text-xs text-gray-500">
                         {student.completed} courses completed
                       </p>
                     </div>

                    {/* Stats Display */}
                    <div className="ml-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 md:gap-x-6 md:gap-y-3 lg:gap-x-4 lg:gap-y-0 md:p-1">
                      {/* Points this month */}
                      <div className="inline-flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-3 lg:h-3 text-blue-500" />
                        <div className="leading-tight">
                          <div className="text-xs md:text-sm lg:text-xs font-bold text-gray-900">{student.pointsThisMonth}</div>
                          <div className="text-[10px] md:text-xs lg:text-[10px] text-gray-500">This month</div>
                        </div>
                      </div>

                      {/* Total points */}
                      <div className="inline-flex items-center gap-2">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 lg:w-3 lg:h-3 text-yellow-500" />
                        <div className="leading-tight">
                          <div className="text-xs md:text-sm lg:text-xs font-bold text-gray-900">{student.totalPoints.toLocaleString()}</div>
                          <div className="text-[10px] md:text-xs lg:text-[10px] text-gray-500">Total</div>
                        </div>
                      </div>

                      {/* Rewards unlocked */}
                      <div className="inline-flex items-center gap-2">
                        <Gift className="w-3 h-3 sm:w-4 sm:h-4 lg:w-3 lg:h-3 text-purple-500" />
                        <div className="leading-tight">
                          <div className="text-xs md:text-sm lg:text-xs font-bold text-gray-900">{student.rewardsUnlocked}</div>
                          <div className="text-[10px] md:text-xs lg:text-[10px] text-gray-500">Rewards</div>
                        </div>
                      </div>

                      {/* Rewards value */}
                      <div className="inline-flex items-center gap-2">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 lg:w-3 lg:h-3 text-green-500" />
                        <div className="leading-tight">
                          <div className="text-xs md:text-sm lg:text-xs font-bold text-gray-900">${student.rewardsValue}</div>
                          <div className="text-[10px] md:text-xs lg:text-[10px] text-gray-500">Value</div>
                        </div>
                      </div>
                    </div>
                   </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </div>
      </div>

       {/* Footer */}
       <div className="fixed bottom-0 left-0 right-0 bg-[#1A2453] border-t border-white/10 px-4 py-3">
         <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 sm:gap-8">
           <button
             onClick={() => onNavigate ? onNavigate('home') : (onHome ? onHome() : onBack())}
             className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
               activeTab === 'home' ? 'text-white' : 'text-[#A0AEC0] hover:text-white'
             }`}
           >
             <Home className="w-5 h-5" />
             <span className="text-xs">Home</span>
           </button>
           <button
             onClick={() => onNavigate ? onNavigate('tasks') : onBack()}
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
