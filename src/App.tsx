import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import StudentCourses from './components/StudentCourses';
import LoginPage from './components/LoginPage';
import Leaderboard from './components/Leaderboard';
import PointsPage from './components/PointsPage';
import RewardsPage from './components/RewardsPage';
import CourseDetails from './components/CourseDetails';
// Removed unused icon imports

type NavigationTab = 'home' | 'tasks' | 'points' | 'rankings' | 'rewards';

// Main App Layout Component
function AppLayout() {
  const navigate = useNavigate();

  // Navigation handling

  const handleNavigation = (tab: NavigationTab) => {
    switch (tab) {
      case 'home':
        navigate('/mycourses');
        break;
      case 'tasks':
        // Get the current course ID from localStorage or default to course 57
        const currentCourseId = localStorage.getItem('currentCourseId') || '57';
        navigate(`/course/${currentCourseId}`);
        break;
      case 'points':
        navigate('/points');
        break;
      case 'rankings':
        navigate('/leaderboard');
        break;
      case 'rewards':
        navigate('/rewards');
        break;
    }
  };

  // Navigation handling

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Main Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<StudentCourses />} />
          <Route path="/mycourses" element={<StudentCourses />} />
          <Route path="/modules" element={<StudentCourses />} />
          <Route path="/tasks" element={<StudentCourses />} />
          <Route path="/points" element={<PointsPage onHome={() => navigate('/mycourses')} onNavigate={(tab) => handleNavigation(tab as NavigationTab)} />} />
          <Route path="/leaderboard" element={<Leaderboard onNavigate={(tab) => handleNavigation(tab as NavigationTab)} activeTab="rankings" />} />
          <Route path="/rewards" element={<RewardsPage onNavigate={(tab) => handleNavigation(tab as NavigationTab)} activeTab="rewards" />} />
          <Route path="/course/:courseId" element={<CourseDetailsWrapper />} />
        </Routes>
      </div>
    </div>
  );
}

// Wrapper component for CourseDetails to handle navigation
function CourseDetailsWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  
 
  const courseIdString = location.pathname.split('/course/')[1];
  const courseId = courseIdString ? parseInt(courseIdString, 10) : 1;
  
  // Get course title from navigation state
  const courseTitle = location.state?.courseTitle;
  
  // If courseId is NaN or invalid, redirect to courses page
  if (isNaN(courseId) || courseId <= 0) {
    console.error('Invalid course ID:', courseIdString);
    navigate('/mycourses');
    return null;
  }

  return (
    <CourseDetails 
      courseId={courseId} 
      courseTitle={courseTitle}
      onBack={() => navigate('/mycourses')} 
    />
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const handleLogin = () => {
    setIsLoggedIn(true);
  };


  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;