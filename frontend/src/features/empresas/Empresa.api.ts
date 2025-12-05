// src/features/empresas/Empresa.api.ts
import client from "../../api/Users.api";
import type { Empresa, NewEmpresa, TipoEmpresa } from "./types";

export const getEmpresas = async (): Promise<Empresa[]> => {
  const resp = await client.get("/empresas");
  const data = Array.isArray(resp.data) ? resp.data : [resp.data];
  return data.map((e: any) => ({
    id: e.id,
    id_tipo_empresa: e.id_tipo_empresa,
    nombre: e.nombre,
    tipo_empresa_nombre: e.tipo_empresa_nombre,
  }));
};

export const getEmpresa = async (id: number): Promise<Empresa> => {
  const resp = await client.get(`/empresas/${id}`);
  return {
    id: resp.data.id,
    id_tipo_empresa: resp.data.id_tipo_empresa,
    nombre: resp.data.nombre,
    tipo_empresa_nombre: resp.data.tipo_empresa_nombre,
  };
};

export const createEmpresa = async (payload: NewEmpresa): Promise<Empresa> => {
  const resp = await client.post("/empresas", payload);
  return resp.data;
};

export const updateEmpresa = async (empresa: Empresa): Promise<Empresa> => {
  if (!empresa.id) throw new Error("La empresa debe tener un identificador para actualizarse.");
  const resp = await client.put(`/empresas/${empresa.id}`, {
    id_tipo_empresa: empresa.id_tipo_empresa,
    nombre: empresa.nombre,
  });
  return resp.data;
};

export const deleteEmpresa = async (id: number): Promise<void> => {
  await client.delete(`/empresas/${id}`);
};

// Obtener tipos de empresa para el dropdown
export const getTiposEmpresas = async (): Promise<TipoEmpresa[]> => {
  try {
    // Asumiendo que existe un endpoint para tipos de empresas
    // Si no existe, podemos retornar un array estático
    const resp = await client.get("/tipos-empresas");
    return resp.data;
  } catch (err) {
    // Fallback: retornar tipos conocidos
    return [
      { id: 0, nombre: "IPS" },
      { id: 1, nombre: "EPS" },
      { id: 2, nombre: "ARL" },
      { id: 3, nombre: "CAJA DE COMPENSACION" },
    ];
  }
};
