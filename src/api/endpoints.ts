import api from './client';

// Auth
export async function loginWithEmail(email: string) {
  return api.post('/auth/studentlogin', { 
    email: email
    
    
});
}

export async function validateSession() {
  return api.post('/auth/validate-session');
}

export async function fetchProfile() {
  return api.get('/auth/profile');
}

export async function logout() {
  return api.post('/auth/logout');
}

// Leaderboard
export async function fetchLeaderboard() {
  return api.get('/api/leaderboard');
}

// Tasks
export async function markTaskAsCompleted(taskId: number) {
  return api.post('/api/mark_as_completed', { task_id: taskId });
}

// Courses
export async function fetchMyCourses() {
  return api.get('/my-courses');
}

export async function fetchCourseDetails(courseId: number) {
  return api.get(`/courses/${courseId}`);
}


