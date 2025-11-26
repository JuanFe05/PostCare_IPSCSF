export async function getTiposSeguimiento() {
  const res = await fetch('/api/tipos-seguimiento');
  if (!res.ok) throw new Error('Error fetching tipos seguimiento');
  return res.json();
}

export async function createTipoSeguimiento(payload: { nombre: string; descripcion?: string }) {
  const res = await fetch('/api/tipos-seguimiento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Error creating tipo seguimiento');
  return res.json();
}

export async function updateTipoSeguimiento(id: number | string, payload: { nombre: string; descripcion?: string }) {
  const res = await fetch(`/api/tipos-seguimiento/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Error updating tipo seguimiento');
  return res.json();
}

export async function deleteTipoSeguimiento(id: number | string) {
  const res = await fetch(`/api/tipos-seguimiento/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error deleting tipo seguimiento');
  return res.json();
}
