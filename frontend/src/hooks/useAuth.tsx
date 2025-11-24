import { useState, createContext, useContext, useEffect, useRef } from 'react';
import type { User } from '../types/Auth.types';


type AuthState = { token?: string | null; user?: User | null };
type AuthContextValue = { auth: AuthState; setAuth: (s: AuthState) => void; logout: () => void };


const AuthContext = createContext<AuthContextValue | undefined>(undefined);


function decodeJwt(token: string | null | undefined): { exp?: number } | null {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1];
        // decode base64url
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(json);
    } catch (e) {
        console.error('decodeJwt error', e);
        return null;
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>(() => {
        const token = typeof globalThis.window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const user = typeof globalThis.window !== 'undefined' ? localStorage.getItem('user') : null;
        return { token: token || null, user: user ? JSON.parse(user) : null };
    });

    const timeoutRef = useRef<number | null>(null);

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

    // Watch token and schedule auto-logout when it expires
    useEffect(() => {
        // clear previous timeout
        if (timeoutRef.current) {
            try { window.clearTimeout(timeoutRef.current); } catch (e) { /* ignore */ }
            timeoutRef.current = null;
        }

        const token = auth?.token;
        if (!token) return;

        const payload = decodeJwt(token as string);
        const exp = payload?.exp; // exp is in seconds since epoch
        if (!exp) return;

        const expireAt = exp * 1000;
        const now = Date.now();
        const ms = expireAt - now;
        if (ms <= 0) {
            // already expired
            logout();
            return;
        }

        // set timeout to logout exactly when token expires (+ small buffer)
        const id = window.setTimeout(() => {
            logout();
        }, ms + 500);
        timeoutRef.current = id as unknown as number;

        return () => {
            if (timeoutRef.current) {
                try { window.clearTimeout(timeoutRef.current); } catch (e) { /* ignore */ }
                timeoutRef.current = null;
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