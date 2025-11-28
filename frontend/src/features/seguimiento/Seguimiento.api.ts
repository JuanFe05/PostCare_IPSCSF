import client from '../../api/Users.api';

export async function getTiposSeguimiento() {
  const resp = await client.get('/seguimientos_atenciones');
  const data = Array.isArray(resp.data) ? resp.data : [resp.data];
  return data.map((s: any) => ({ id: s.id, nombre: s.nombre, descripcion: s.descripcion }));
}

export async function createTipoSeguimiento(payload: { nombre: string; descripcion?: string }) {
  const resp = await client.post('/seguimientos_atenciones', payload);
  return resp.data;
}

export async function updateTipoSeguimiento(id: number | string, payload: { nombre: string; descripcion?: string }) {
  const resp = await client.put(`/seguimientos_atenciones/${id}`, payload);
  return resp.data;
}

export async function deleteTipoSeguimiento(id: number | string) {
  const resp = await client.delete(`/seguimientos_atenciones/${id}`);
  return resp.data;
}
