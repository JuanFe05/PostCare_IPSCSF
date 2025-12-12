import client from '../../api/Users.api';
import type { EstadoAtencion, EstadoCreate, EstadoUpdate } from './types';

export const getEstados = async (): Promise<EstadoAtencion[]> => {
  const resp = await client.get('/estados_atenciones');
  return Array.isArray(resp.data) ? resp.data : [];
};

export const getEstado = async (id: number): Promise<EstadoAtencion> => {
  const resp = await client.get(`/estados_atenciones/${id}`);
  return resp.data;
};

export const createEstado = async (payload: EstadoCreate): Promise<EstadoAtencion> => {
  const resp = await client.post('/estados_atenciones', payload);
  return resp.data;
};

export const updateEstado = async (id: number, payload: EstadoUpdate): Promise<EstadoAtencion> => {
  const resp = await client.put(`/estados_atenciones/${id}`, payload);
  return resp.data;
};

export const deleteEstado = async (id: number): Promise<void> => {
  await client.delete(`/estados_atenciones/${id}`);
};
