import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://supercoach-api-dev.up.railway.app';

export const api = axios.create({
  baseURL,
  // Use cookies only if backend explicitly supports CORS with credentials
  withCredentials: false,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default api;


