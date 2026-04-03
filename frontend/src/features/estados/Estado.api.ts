import client from '../../api/Users.api';
import type { EstadoAtencion, EstadoCreate, EstadoUpdate } from './types';

export const getEstados = async (): Promise<EstadoAtencion[]> => {
  const resp = await client.get('/estados-atenciones');
  return Array.isArray(resp.data) ? resp.data : [];
};

export const getEstado = async (id: number): Promise<EstadoAtencion> => {
  const resp = await client.get(`/estados-atenciones/${id}`);
  return resp.data;
};

export const createEstado = async (payload: EstadoCreate): Promise<EstadoAtencion> => {
  const resp = await client.post('/estados-atenciones', payload);
  return resp.data;
};

export const updateEstado = async (id: number, payload: EstadoUpdate): Promise<EstadoAtencion> => {
  const resp = await client.put(`/estados-atenciones/${id}`, payload);
  return resp.data;
};

export const deleteEstado = async (id: number): Promise<void> => {
  await client.delete(`/estados-atenciones/${id}`);
};
