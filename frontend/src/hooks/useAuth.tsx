import { useState, createContext, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/Auth.types';


type AuthState = { token?: string | null; user?: User | null };
type AuthContextValue = { auth: AuthState; setAuth: (s: AuthState) => void; logout: () => void };


const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// CONFIGURACIÓN: tiempo de inactividad en milisegundos (5 horas)
const INACTIVITY_TIMEOUT = 5 * 60 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>(() => {
        const token = typeof globalThis.window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const user = typeof globalThis.window !== 'undefined' ? localStorage.getItem('user') : null;
        return { token: token || null, user: user ? JSON.parse(user) : null };
    });

    const inactivityTimeoutRef = useRef<number | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const logout = () => {
        try {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        } catch (e) {
            // ignore
        }
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

        // Eventos que indican actividad del usuario
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
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

        // Agregar listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Inicializar el timer
        resetInactivityTimer();

        // Cleanup
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (debounceTimer) {
                window.clearTimeout(debounceTimer);
            }
            if (inactivityTimeoutRef.current) {
                window.clearTimeout(inactivityTimeoutRef.current);
            }
        };
    }, [auth?.token]);

    return <AuthContext.Provider value={{ auth, setAuth, logout }}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
};