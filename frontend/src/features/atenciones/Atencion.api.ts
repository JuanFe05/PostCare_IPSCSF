// src/features/atenciones/Atencion.api.ts
import client from "../../api/Users.api";
import type { 
  Atencion, 
  NewAtencion, 
  UpdateAtencion,
  NewAtencionConPaciente,
  TipoDocumento,
  Empresa,
  EstadoAtencion,
  SeguimientoAtencion,
  ServicioOption
} from "./types";

// ==================== ATENCIONES ====================

export const getAtenciones = async (skip = 0, limit = 100, fecha?: string): Promise<Atencion[]> => {
  const params = new URLSearchParams();
  params.append('skip', String(skip));
  params.append('limit', String(limit));
  if (fecha) params.append('fecha', fecha);
  const query = params.toString();
  const resp = await client.get(`/atenciones?${query}`);
  return Array.isArray(resp.data) ? resp.data : [resp.data];
};

export const getAtencionesByRango = async (fechaInicio: string, fechaFin: string): Promise<Atencion[]> => {
  const params = new URLSearchParams();
  params.append('skip', '0');
  params.append('limit', '100000');
  params.append('fecha_inicio', fechaInicio);
  params.append('fecha_fin', fechaFin);
  const query = params.toString();
  const resp = await client.get(`/atenciones?${query}`);
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

export const createAtencionConPaciente = async (payload: NewAtencionConPaciente): Promise<Atencion> => {
  const resp = await client.post("/atenciones/con-paciente", payload);
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
    const resp = await client.get("/estados_atenciones");
    return Array.isArray(resp.data) ? resp.data : [];
  } catch (err) {
    console.error("Error cargando estados de atención:", err);
    return [];
  }
};

export const getSeguimientosAtencion = async (): Promise<SeguimientoAtencion[]> => {
  try {
    const resp = await client.get("/seguimientos_atenciones");
    return Array.isArray(resp.data) ? resp.data : [];
  } catch (err) {
    console.error("Error cargando seguimientos de atención:", err);
    return [];
  }
};

export const getTiposDocumento = async (): Promise<TipoDocumento[]> => {
  try {
    const resp = await client.get("/tipos-documentos");
    return Array.isArray(resp.data) ? resp.data : [];
  } catch (err) {
    console.error("Error cargando tipos de documento:", err);
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

// ==================== LOCKING ====================

export const acquireAtencionLock = async (id: string): Promise<{ ok: boolean; lockedBy?: any; unsupported?: boolean }> => {
  try {
    const res = await client.post(`/atenciones/${id}/lock`);
    return { ok: true, lockedBy: res.data?.lockedBy };
  } catch (err: any) {
    if (err?.response?.status === 409) {
      return { ok: false, lockedBy: err.response.data?.lockedBy };
    }
    if (err?.response?.status === 404) return { ok: true, unsupported: true };
    return { ok: true, unsupported: true };
  }
};

export const releaseAtencionLock = async (id: string): Promise<void> => {
  try {
    await client.delete(`/atenciones/${id}/lock`);
  } catch (err) {
    console.warn('releaseAtencionLock failed', err);
  }
};

export const checkAtencionLock = async (id: string): Promise<{ locked: boolean; lockedBy?: any }> => {
  try {
    const res = await client.get(`/atenciones/${id}/lock`);
    return { locked: !!res.data?.locked, lockedBy: res.data?.lockedBy };
  } catch (err) {
    return { locked: false };
  }
};
