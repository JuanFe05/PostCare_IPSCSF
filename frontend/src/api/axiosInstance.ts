import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:48555';

// Crear instancia centralizada de axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: agregar token automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: manejar errores 401 (token expirado)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido -> limpiar y redirigir al login
      console.warn('Token expirado o inválido. Cerrando sesión...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Redirigir al login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
