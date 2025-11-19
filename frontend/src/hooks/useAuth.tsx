import { useState, createContext, useContext } from 'react';
import type { User } from '../types/Auth.types';


type AuthState = { token?: string | null; user?: User | null };
type AuthContextValue = { auth: AuthState; setAuth: (s: AuthState) => void };


const AuthContext = createContext<AuthContextValue | undefined>(undefined);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>(() => {
        const token = typeof globalThis.window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const user = typeof globalThis.window !== 'undefined' ? localStorage.getItem('user') : null;
        return { token: token || null, user: user ? JSON.parse(user) : null };
    });


    return <AuthContext.Provider value={ { auth, setAuth } }> { children } </AuthContext.Provider>;
};


export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
};