import axios from 'axios';
import { storage } from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:48555';

// Cache para deduplicación de requests GET
const pendingRequests = new Map<string, Promise<any>>();

// Crear instancia centralizada de axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: agregar token automáticamente y deduplicar GET
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Deduplicar GET requests
    if (config.method === 'get') {
      const key = `${config.method}:${config.url}`;
      
      if (pendingRequests.has(key)) {
        // Ya hay un request pendiente, retornar error especial
        const error: any = new Error('Deduplicated request');
        error.__deduped = true;
        error.promise = pendingRequests.get(key);
        return Promise.reject(error);
      }
    }
    
    return config;
  },
  (error) => {
    // Si es un request deduplicado, retornar la promesa original
    if (error.__deduped) {
      return error.promise;
    }
    return Promise.reject(error);
  }
);

// Response interceptor: manejar errores 401 (token expirado) y limpiar cache
axiosInstance.interceptors.response.use(
  (response) => {
    // Limpiar del cache si fue GET
    if (response.config.method === 'get') {
      const key = `${response.config.method}:${response.config.url}`;
      pendingRequests.delete(key);
    }
    return response;
  },
  (error) => {
    // Limpiar del cache en caso de error
    if (error.config?.method === 'get') {
      const key = `${error.config.method}:${error.config.url}`;
      pendingRequests.delete(key);
    }
    
    if (error.response?.status === 401) {
      // Token expirado o inválido -> limpiar y redirigir al login
      console.warn('Token expirado o inválido. Cerrando sesión...');
      storage.clearAuth();
      
      // Redirigir al login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Wrapper para agregar requests al cache
const originalRequest = axiosInstance.request.bind(axiosInstance);
(axiosInstance.request as any) = function(config: any) {
  if (config.method === 'get') {
    const key = `${config.method}:${config.url}`;
    
    if (!pendingRequests.has(key)) {
      const promise = originalRequest(config);
      pendingRequests.set(key, promise);
      
      promise.finally(() => {
        pendingRequests.delete(key);
      });
      
      return promise;
    }
  }
  
  return originalRequest(config);
};

export default axiosInstance;
