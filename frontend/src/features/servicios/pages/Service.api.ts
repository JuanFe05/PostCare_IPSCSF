// src/features/services/Service.api.ts
import client from "../../../api/Users.api"; // usa el cliente que ya usas en el proyecto
import type { Service, NewService } from "./types";


export const getServices = async (): Promise<Service[]> => {
  const resp = await client.get("/servicios");
  const data = Array.isArray(resp.data) ? resp.data : [resp.data];
  return data.map((s: any) => ({
    id: s.id,
    nombre: s.nombre,
  }));
};

export const getService = async (id: number): Promise<Service> => {
  const resp = await client.get(`/servicios/${id}`);
  return {
    id: resp.data.id,
    nombre: resp.data.nombre,
  };
};

export const createService = async (payload: NewService): Promise<Service> => {
  const resp = await client.post("/servicios", payload);
  return resp.data;
};

export const updateService = async (service: Service): Promise<Service> => {
  if (!service.id) throw new Error("Service must have id to update");
  const resp = await client.put(`/servicios/${service.id}`, { nombre: service.nombre });
  return resp.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await client.delete(`/servicios/${id}`);
};


export const acquireServiceLock = async (id: number): Promise<any> => {
  try {
    const resp = await client.post(`/servicios/${id}/lock/acquire`);
    return resp.data;
  } catch (err: any) {
    // devolver objeto que indique fallo pero permitir editar en fallback
    return { ok: false, error: err, unsupported: true };
  }
};

export const releaseServiceLock = async (id: number): Promise<any> => {
  try {
    const resp = await client.post(`/servicios/${id}/lock/release`);
    return resp.data;
  } catch (err: any) {
    return { ok: false, error: err, unsupported: true };
  }
};

export const checkServiceLock = async (id: number): Promise<any> => {
  try {
    const resp = await client.get(`/servicios/${id}/lock`);
    return resp.data;
  } catch (err: any) {
    // fallback: indicate not locked
    return { locked: false };
  }
};
