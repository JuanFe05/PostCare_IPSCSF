// src/features/atenciones/Atencion.api.ts
import client from "../../api/Users.api";
import type { 
  Atencion, 
  NewAtencion, 
  UpdateAtencion,
  Empresa,
  EstadoAtencion,
  SeguimientoAtencion,
  ServicioOption
} from "./types";

// ==================== ATENCIONES ====================

export const getAtenciones = async (skip = 0, limit = 100): Promise<Atencion[]> => {
  const resp = await client.get(`/atenciones?skip=${skip}&limit=${limit}`);
  return Array.isArray(resp.data) ? resp.data : [resp.data];
};

export const getAtencion = async (id: string): Promise<Atencion> => {
  const resp = await client.get(`/atenciones/${id}`);
  return resp.data;
};

export const getAtencionesByPaciente = async (pacienteId: string): Promise<Atencion[]> => {
  const resp = await client.get(`/atenciones/paciente/${pacienteId}`);
  return Array.isArray(resp.data) ? resp.data : [resp.data];
};

export const getAtencionesByEmpresa = async (empresaId: number): Promise<Atencion[]> => {
  const resp = await client.get(`/atenciones/empresa/${empresaId}`);
  return Array.isArray(resp.data) ? resp.data : [resp.data];
};

export const getAtencionesByEstado = async (estadoId: number): Promise<Atencion[]> => {
  const resp = await client.get(`/atenciones/estado/${estadoId}`);
  return Array.isArray(resp.data) ? resp.data : [resp.data];
};

export const searchAtenciones = async (params: {
  search?: string;
  empresa_id?: number;
  estado_id?: number;
  skip?: number;
  limit?: number;
}): Promise<Atencion[]> => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.empresa_id) queryParams.append('empresa_id', String(params.empresa_id));
  if (params.estado_id) queryParams.append('estado_id', String(params.estado_id));
  if (params.skip !== undefined) queryParams.append('skip', String(params.skip));
  if (params.limit !== undefined) queryParams.append('limit', String(params.limit));
  
  const resp = await client.get(`/atenciones/buscar?${queryParams.toString()}`);
  return Array.isArray(resp.data) ? resp.data : [resp.data];
};

export const createAtencion = async (payload: NewAtencion): Promise<Atencion> => {
  const resp = await client.post("/atenciones", payload);
  return resp.data;
};

export const updateAtencion = async (id: string, payload: UpdateAtencion): Promise<Atencion> => {
  const resp = await client.put(`/atenciones/${id}`, payload);
  return resp.data;
};

export const deleteAtencion = async (id: string): Promise<void> => {
  await client.delete(`/atenciones/${id}`);
};

// ==================== DATOS PARA DROPDOWNS ====================

export const getEmpresas = async (): Promise<Empresa[]> => {
  try {
    const resp = await client.get("/empresas");
    return Array.isArray(resp.data) ? resp.data.map((e: any) => ({
      id: e.id,
      nombre: e.nombre
    })) : [];
  } catch (err) {
    console.error("Error cargando empresas:", err);
    return [];
  }
};

export const getEstadosAtencion = async (): Promise<EstadoAtencion[]> => {
  try {
    const resp = await client.get("/estados-atenciones");
    return Array.isArray(resp.data) ? resp.data : [];
  } catch (err) {
    console.error("Error cargando estados de atención:", err);
    return [];
  }
};

export const getSeguimientosAtencion = async (): Promise<SeguimientoAtencion[]> => {
  try {
    const resp = await client.get("/seguimientos-atenciones");
    return Array.isArray(resp.data) ? resp.data : [];
  } catch (err) {
    console.error("Error cargando seguimientos de atención:", err);
    return [];
  }
};

export const getServicios = async (): Promise<ServicioOption[]> => {
  try {
    const resp = await client.get("/servicios");
    return Array.isArray(resp.data) ? resp.data : [];
  } catch (err) {
    console.error("Error cargando servicios:", err);
    return [];
  }
};
