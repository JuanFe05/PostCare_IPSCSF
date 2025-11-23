import axios from 'axios';
import type { Usuario, NewUsuario } from '../types/Usuario';


const API_URL = 'http://localhost:48555';

type UsuarioBackend = {
  id: number;
  username: string;
  email: string;
  estado: boolean;
  role_id: number;
  rol?: string;
  role_name?: string;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getUsuarios = async (): Promise<Usuario[]> => {
  const response = await axios.get(`${API_URL}/users`, getAuthHeaders());
  const data = Array.isArray(response.data) ? response.data : [response.data];
  return data.map((u: UsuarioBackend) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    estado: u.estado,
    role_id: u.role_id,
    role_name: u.role_name ?? u.rol ?? undefined,
  }));
};

export const getRoles = async (): Promise<{ id: number; nombre: string }[]> => {
  // roles endpoint requires admin auth
  const response = await axios.get(`${API_URL}/roles`, getAuthHeaders());
  return Array.isArray(response.data) ? response.data : [response.data];
};

// createUsuario acepta password o password_hash y mapea a lo que espera el backend
export const createUsuario = async (usuario: NewUsuario): Promise<Usuario> => {
  const payload = {
    username: usuario.username,
    email: usuario.email,
    password: usuario.password ?? usuario.password_hash ?? '',
    estado: usuario.estado ?? true,
    role_id: usuario.role_id,
  };
  const response = await axios.post(`${API_URL}/users`, payload, getAuthHeaders());
  return response.data;
};

export const updateUsuario = async (usuario: Usuario): Promise<Usuario> => {
  const identifier = usuario.id ?? usuario.username;
  const response = await axios.put(`${API_URL}/users/${identifier}`, usuario, getAuthHeaders());
  return response.data;
};

export const deleteUsuario = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/users/${id}`, getAuthHeaders());
};
