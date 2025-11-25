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
