import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://supercoach-api-dev.up.railway.app';

export const api = axios.create({
  baseURL,
  // Use cookies only if backend explicitly supports CORS with credentials
  
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


