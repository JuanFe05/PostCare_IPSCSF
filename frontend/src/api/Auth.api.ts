import type { LoginRequest, RegisterRequest, AuthResponse } from "../types/Auth.types";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:48555";

async function requestJSON(endpoint: string, body: unknown) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });


    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || res.statusText);
    return data;
}

export const login = (payload: LoginRequest): Promise<AuthResponse> => requestJSON('/auth/login', payload);
export const register = (payload: RegisterRequest) => requestJSON('/auth/register', payload);
