import { useState, useEffect } from 'react';
import StudentCourses from './components/StudentCourses';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import { logout } from './api/endpoints';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'courses' | 'profile'>('courses');
  const [user, setUser] = useState<any>(null);

  // Handle magic link authentication on mount
  useEffect(() => {
    const handleMagicLinkAuth = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      
      const accessToken = params.get('access_token');
      const tokenType = params.get('token_type');
      const expiresAt = params.get('expires_at');
      
      if (accessToken && tokenType === 'bearer') {
        // Extract user info from JWT token (basic decode)
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const userData = {
            id: payload.sub,
            email: payload.email,
            name: payload.user_metadata?.email || payload.email,
            initials: (payload.email || 'U').split('@')[0].substring(0, 2).toUpperCase(),
            accessToken,
            expiresAt: parseInt(expiresAt || '0')
          };
          
          // Store token in localStorage for API calls
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('user_data', JSON.stringify(userData));
          
          setUser(userData);
          setIsLoggedIn(true);
          
          // Clear the hash from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error parsing access token:', error);
        }
      }
    };
    
    handleMagicLinkAuth();
    
    // Check for existing token on app load
    const existingToken = localStorage.getItem('access_token');
    const existingUser = localStorage.getItem('user_data');
    
    if (existingToken && existingUser) {
      try {
        const userData = JSON.parse(existingUser);
        // Check if token is still valid (basic check)
        if (userData.expiresAt && userData.expiresAt > Date.now() / 1000) {
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          // Token expired, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }
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
    
    // Clear stored tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
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