import client from "../../api/Users.api";

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface NewRol {
  nombre: string;
  descripcion: string;
}

export const getRoles = async (): Promise<Rol[]> => {
  const response = await client.get('/roles');
  const data = Array.isArray(response.data) ? response.data : [response.data];
  return data.map((r: any) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
  }));
};

export const createRol = async (rol: NewRol): Promise<Rol> => {
  const payload = {
    nombre: rol.nombre,
    descripcion: rol.descripcion ?? "",
  };
  const response = await client.post('/roles', payload);
  return response.data;
};

export const updateRol = async (rol: Rol): Promise<Rol> => {
  if (!rol.id) throw new Error("El rol debe tener ID para actualizar");

  const payload = {
    nombre: rol.nombre,
    descripcion: rol.descripcion,
  };

  const response = await client.put(`/roles/${rol.id}`, payload);
  return response.data;
};

export const deleteRol = async (id: number): Promise<void> => {
  await client.delete(`/roles/${id}`);
};

// Locking helpers (optional backend support)
export const acquireRoleLock = async (id: number): Promise<{ ok: boolean; lockedBy?: any; unsupported?: boolean }> => {
  try {
    const res = await client.post(`/roles/${id}/lock`);
    return { ok: true, lockedBy: res.data?.lockedBy };
  } catch (err: any) {
    if (err?.response?.status === 409) {
      return { ok: false, lockedBy: err.response.data?.lockedBy };
    }
    if (err?.response?.status === 404) return { ok: true, unsupported: true };
    return { ok: true, unsupported: true };
  }
};

export const releaseRoleLock = async (id: number): Promise<void> => {
  try {
    await client.delete(`/roles/${id}/lock`);
  } catch (err) {
    console.warn('releaseRoleLock failed', err);
  }
};

export const checkRoleLock = async (id: number): Promise<{ locked: boolean; lockedBy?: any }> => {
  try {
    const res = await client.get(`/roles/${id}/lock`);
    return { locked: !!res.data?.locked, lockedBy: res.data?.lockedBy };
  } catch (err) {
    return { locked: false };
  }
};
