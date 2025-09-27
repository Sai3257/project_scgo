import React, { useEffect, useState } from 'react';
import StudentCourses from './components/StudentCourses';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import { fetchProfile, logout, validateSession } from './api/endpoints';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'courses' | 'profile'>('courses');
  const [user, setUser] = useState<any>(null);

  // Validate session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        await validateSession();
        const { data } = await fetchProfile();
        const enhancedUser = {
          ...data,
          initials: (data?.name || 'SU').split(' ').map((n: string) => n[0]).join(''),
        };
        setUser(enhancedUser);
        setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = (userData: any) => {
    // Enhance user data with profile information
    const enhancedUser = {
      ...userData,
      initials: userData.name.split(' ').map((n: string) => n[0]).join(''),
      membershipLevel: 'Gold' as const,
      totalPoints: 2340,
      pointsThisMonth: 500,
      rewardsUnlocked: 8,
      coursesCompleted: 2,
      joinDate: '2024-01-01'
    };
    setUser(enhancedUser);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
    setUser(null);
    setIsLoggedIn(false);
    setCurrentView('courses');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentView === 'profile') {
    return (
      <ProfilePage 
        user={user} 
        onBack={() => setCurrentView('courses')} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <StudentCourses 
      onLogout={handleLogout} 
      onProfile={() => setCurrentView('profile')} 
    />
  );
}

export default App;