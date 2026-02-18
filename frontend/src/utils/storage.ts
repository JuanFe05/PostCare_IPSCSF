/**
 * Storage utility con versionado y validación
 */

import type { User } from '../types/Auth.types';

const STORAGE_VERSION = '1.0';
const STORAGE_KEY_PREFIX = 'postcare_';

export interface AuthData {
  version: string;
  token: string;
  user: User;
  timestamp: number;
}

export const storage = {
  /**
   * Obtener datos de autenticación
   */
  getAuth: (): AuthData | null => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}auth`);
      if (!data) return null;
      
      const parsed: AuthData = JSON.parse(data);
      
      // Validar versión
      if (parsed.version !== STORAGE_VERSION) {
        storage.clearAuth();
        return null;
      }
      
      // Validar estructura básica
      if (!parsed.token || !parsed.user) {
        storage.clearAuth();
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Error leyendo auth desde storage:', error);
      storage.clearAuth();
      return null;
    }
  },
  
  /**
   * Guardar datos de autenticación
   */
  setAuth: (token: string, user: User): void => {
    try {
      const data: AuthData = {
        version: STORAGE_VERSION,
        token,
        user,
        timestamp: Date.now()
      };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}auth`, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando auth en storage:', error);
    }
  },
  
  /**
   * Limpiar datos de autenticación
   */
  clearAuth: (): void => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth`);
      // Limpiar también las keys legacy por compatibilidad
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error limpiando storage:', error);
    }
  },
  
  /**
   * Obtener solo el token
   */
  getToken: (): string | null => {
    const auth = storage.getAuth();
    return auth?.token || null;
  },
  
  /**
   * Obtener solo el usuario
   */
  getUser: (): User | null => {
    const auth = storage.getAuth();
    return auth?.user || null;
  }
};
