import client from '../../api/Users.api';
import type { Paciente, PacienteCreateDto, PacienteUpdateDto } from './types';

export const getPacientes = async (search?: string): Promise<Paciente[]> => {
  const params: any = { skip: 0, limit: 500 };
  if (search) {
    params.search = search;
  }
  const response = await client.get<Paciente[]>('/pacientes', { params });
  return response.data;
};

export const getPacienteById = async (id: string): Promise<Paciente> => {
  const response = await client.get<Paciente>(`/pacientes/${id}`);
  return response.data;
};

export const createPaciente = async (data: PacienteCreateDto): Promise<Paciente> => {
  const response = await client.post<Paciente>('/pacientes', data);
  return response.data;
};

export const updatePaciente = async (id: string, data: PacienteUpdateDto): Promise<Paciente> => {
  const response = await client.put<Paciente>(`/pacientes/${id}`, data);
  return response.data;
};

export const deletePaciente = async (id: string): Promise<void> => {
  await client.delete(`/pacientes/${id}`);
};

// ==================== LOCKING ====================

export const acquirePacienteLock = async (id: string): Promise<{ ok: boolean; lockedBy?: any; unsupported?: boolean }> => {
  try {
    const res = await client.post(`/pacientes/${id}/lock`);
    return { ok: true, lockedBy: res.data?.lockedBy };
  } catch (err: any) {
    if (err?.response?.status === 409) {
      return { ok: false, lockedBy: err.response.data?.lockedBy };
    }
    if (err?.response?.status === 404) return { ok: true, unsupported: true };
    return { ok: true, unsupported: true };
  }
};

export const releasePacienteLock = async (id: string): Promise<void> => {
  try {
    await client.delete(`/pacientes/${id}/lock`);
  } catch (err) {
    console.warn('releasePacienteLock failed', err);
  }
};

export const checkPacienteLock = async (id: string): Promise<{ locked: boolean; lockedBy?: any }> => {
  try {
    const res = await client.get(`/pacientes/${id}/lock`);
    return { locked: !!res.data?.locked, lockedBy: res.data?.lockedBy };
  } catch (err) {
    return { locked: false };
  }
};
