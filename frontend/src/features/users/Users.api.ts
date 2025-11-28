import client from "../../api/Users.api";
import type { Usuario, NewUsuario } from './types';

export const getUsuarios = async (): Promise<Usuario[]> => {
  const response = await client.get('/users');
  const data = Array.isArray(response.data) ? response.data : [response.data];
  return data.map((u: any) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    estado: u.estado,
    role_id: u.role_id,
    role_name: u.role_name ?? u.rol ?? undefined,
  }));
};

export const getRoles = async (): Promise<{ id: number; nombre: string }[]> => {
  const response = await client.get('/roles');
  return Array.isArray(response.data) ? response.data : [response.data];
};

export const createUsuario = async (usuario: NewUsuario): Promise<Usuario> => {
  const payload = {
    username: usuario.username,
    email: usuario.email,
    password: usuario.password ?? usuario.password_hash ?? '',
    estado: usuario.estado ?? true,
    role_id: usuario.role_id,
  };
  const response = await client.post('/users', payload);
  return response.data;
};

export const updateUsuario = async (usuario: Usuario): Promise<Usuario> => {
  const identifier = usuario.id ?? usuario.username;
  const response = await client.put(`/users/${identifier}`, usuario);
  return response.data;
};

export const deleteUsuario = async (id: number): Promise<void> => {
  await client.delete(`/users/${id}`);
};

// Locking helpers (optional backend support)
export const acquireUserLock = async (id: number): Promise<{ ok: boolean; lockedBy?: any; unsupported?: boolean }> => {
  try {
    const res = await client.post(`/users/${id}/lock`);
    return { ok: true, lockedBy: res.data?.lockedBy };
  } catch (err: any) {
    if (err?.response?.status === 409) {
      return { ok: false, lockedBy: err.response.data?.lockedBy };
    }
    // Si el backend no expone los puntos finales de bloqueo, considérelo como no compatible.
    if (err?.response?.status === 404) return { ok: true, unsupported: true };
    // otros errores -> propagarse como no compatibles para evitar bloqueos
    return { ok: true, unsupported: true };
  }
};

export const releaseUserLock = async (id: number): Promise<void> => {
  try {
    await client.delete(`/users/${id}/lock`);
  } catch (err) {
    // ignorar errores — mejor esfuerzo
    console.warn('releaseUserLock failed', err);
  }
};

export const checkUserLock = async (id: number): Promise<{ locked: boolean; lockedBy?: any }> => {
  try {
    const res = await client.get(`/users/${id}/lock`);
    return { locked: !!res.data?.locked, lockedBy: res.data?.lockedBy };
  } catch (err) {
    return { locked: false };
  }
};
