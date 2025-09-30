import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://supercoach-api-dev.up.railway.app';

export const api = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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


