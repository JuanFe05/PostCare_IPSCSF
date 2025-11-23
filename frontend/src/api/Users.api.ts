import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:48555';

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token && config) {
    config.headers = config.headers ?? {};
    // @ts-ignore - axios header typing
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

