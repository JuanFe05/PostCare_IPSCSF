import axios from 'axios';
import type { Usuario } from '../types/Usuario';

// Ajusta la URL base según tu backend
const API_URL = 'http://localhost:48555';

// Tipo que representa la respuesta del backend
type UsuarioBackend = {
  id: number;
  username: string;
  email: string;
  estado: boolean;
  role_id: number;
  rol: string;
};

// Helper para obtener el token desde localStorage (la app guarda `access_token`)
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  };
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
  // El backend devuelve `role_name` para el nombre legible del rol
  rol: (u as any).role_name || (u as any).rol || undefined,
}));
};

export const createUsuario = async (usuario: Usuario): Promise<Usuario> => {
  const response = await axios.post(`${API_URL}/users`, usuario, getAuthHeaders());
  return response.data;
};

export const updateUsuario = async (usuario: Usuario): Promise<Usuario> => {
  const response = await axios.put(
    `${API_URL}/users/${usuario.username}`,
    usuario,
    getAuthHeaders()
  );
  return response.data;
};

export const deleteUsuario = async (username: string): Promise<void> => {
  await axios.delete(`${API_URL}/users/${username}`, getAuthHeaders());
};