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
