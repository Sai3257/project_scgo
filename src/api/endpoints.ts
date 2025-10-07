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
export async function fetchLeaderboard(courseId: number, monthDate?: string | null) {
  const params: any = {
    course_id: Number(courseId)
  };
  
  if (monthDate) {
    params.month_date = monthDate;
  }
  
  return api.get('/api/leaderboard', {
    params
  });
}

// Tasks
// Backend expects student_id and task_title as QUERY params (not JSON body)
export async function markTaskAsCompleted(studentId: number, taskTitle: string, points?: number) {
  console.log('API call: markTaskAsCompleted', {
    student_id: Number(studentId),
    task_title: String(taskTitle),
    points: points
  });
  
  const response = await api.put('/api/mark_as_completed', undefined, {
    params: {
      student_id: Number(studentId),
      task_title: String(taskTitle),
      points: points || 0
    }
  });
  
  console.log('markTaskAsCompleted response:', response);
  return response;
}

// Points
export async function fetchPointsHistory(studentId: number) {
  return api.get('/api/points', {
    params: {
      student_id: Number(studentId)
    }
  });
}

export async function addPointsHistoryEntry(studentId: number, taskTitle: string, points: number) {
  console.log('API call: addPointsHistoryEntry', {
    student_id: Number(studentId),
    task_title: String(taskTitle),
    points: Number(points)
  });
  
  const response = await api.post('/api/points', {
    student_id: Number(studentId),
    task_name: String(taskTitle),
    points: Number(points),
    transaction_type: "Earned",
    earned_at: new Date().toISOString()
  });
  
  console.log('addPointsHistoryEntry response:', response);
  return response;
}

// Courses
export async function fetchMyCourses() {
  return api.get('/my-courses');
}

export async function fetchCourseDetails(courseId: number) {
  console.log('Fetching course details for ID:', courseId);
  return api.get(`/courses/${courseId}`);
}

// Rewards
export async function fetchRewards(courseId: number) {
  console.log('Fetching rewards for course ID:', courseId);
  return api.get(`/courses/${courseId}/rewards`);
}

