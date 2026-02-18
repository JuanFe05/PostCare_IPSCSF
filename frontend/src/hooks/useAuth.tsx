import { useState, createContext, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/Auth.types';
import { storage } from '../utils/storage';


type AuthState = { token?: string | null; user?: User | null };
type AuthContextValue = { auth: AuthState; setAuth: (s: AuthState) => void; logout: () => void };


const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// CONFIGURACIÓN: tiempo de inactividad en milisegundos (5 horas)
const INACTIVITY_TIMEOUT = 5 * 60 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>(() => {
        const authData = storage.getAuth();
        return { 
          token: authData?.token || null, 
          user: authData?.user || null 
        };
    });

    const inactivityTimeoutRef = useRef<number | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const logout = () => {
        storage.clearAuth();
        setAuth({ token: null, user: null });
        // redirect to login
        if (typeof window !== 'undefined') {
            window.location.replace('/login');
        }
    };

    // Resetear el temporizador de inactividad
    const resetInactivityTimer = () => {
        lastActivityRef.current = Date.now();
        
        // Limpiar timeout anterior
        if (inactivityTimeoutRef.current) {
            window.clearTimeout(inactivityTimeoutRef.current);
        }

        // Solo configurar nuevo timeout si hay un token válido
        if (!auth?.token) return;

        // Establecer nuevo timeout
        inactivityTimeoutRef.current = window.setTimeout(() => {
            console.log('Sesión cerrada por inactividad');
            logout();
        }, INACTIVITY_TIMEOUT) as unknown as number;
    };

    // Configurar listeners de actividad del usuario
    useEffect(() => {
        if (!auth?.token) return;

        // Eventos que indican actividad del usuario con opciones passive
        const events = [
            { name: 'scroll', passive: true },
            { name: 'touchstart', passive: true },
            { name: 'touchmove', passive: true },
            { name: 'mousedown', passive: false },
            { name: 'keypress', passive: false },
            { name: 'click', passive: false }
        ];
        
        // Debounce para evitar resetear el timer con cada pequeño movimiento
        let debounceTimer: number | null = null;
        const handleActivity = () => {
            if (debounceTimer) {
                window.clearTimeout(debounceTimer);
            }
            debounceTimer = window.setTimeout(() => {
                resetInactivityTimer();
            }, 1000) as unknown as number; // Actualizar cada segundo como máximo
        };

        // Agregar listeners con opciones passive donde corresponda
        events.forEach(({ name, passive }) => {
            window.addEventListener(name, handleActivity, { passive });
        });

        // Inicializar el timer
        resetInactivityTimer();

        // Cleanup
        return () => {
            events.forEach(({ name }) => {
                window.removeEventListener(name, handleActivity);
            });
            if (debounceTimer) {
                window.clearTimeout(debounceTimer);
            }
            if (inactivityTimeoutRef.current) {
                window.clearTimeout(inactivityTimeoutRef.current);
            }
        };
    }, [auth?.token]);

    // Sincronizar con storage cuando cambia el auth
    useEffect(() => {
        if (auth?.token && auth?.user) {
            storage.setAuth(auth.token, auth.user);
        }
    }, [auth?.token, auth?.user]);

    return <AuthContext.Provider value={{ auth, setAuth, logout }}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
};