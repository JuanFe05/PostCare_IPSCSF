export interface LoginRequest {
username: string;
password: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  password: string;
    rolId?: number;
}

export interface User {
  id: number;
  name: string;
  username: string;
  estado: 'activo' | 'inactivo';
}

export interface AuthResponse {
access_token: string;
token_type?: string;
user?: User;
}