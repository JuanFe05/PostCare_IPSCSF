import { useState, useMemo } from "react";
import type { Usuario } from "../types";
import UserRow from "./UserRow";

interface UserTableProps {
  usuarios: Usuario[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  attemptEdit: (usuario: Usuario) => void;
  handleEliminar: (id: number, username: string) => Promise<void>;
}

export default function UserTable({ 
  usuarios, 
  loading, 
  searchTerm,
  auth,
  attemptEdit,
  handleEliminar 
}: UserTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  // Calcular lista filtrada + ordenada
  const displayed = useMemo(() => {
    // Filtrar
    const filtered = usuarios.filter((u) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(u.id ?? '').toLowerCase().includes(q);
      const usernameMatch = String(u.username ?? '').toLowerCase().includes(q);
      const emailMatch = String(u.email ?? '').toLowerCase().includes(q);
      return idMatch || usernameMatch || emailMatch;
    });

    // Ordenar
    if (!sortKey || !sortDir) return filtered;
    const sorted = [...filtered].sort((a: any, b: any) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === 'asc' ? -1 : 1;
      if (vb == null) return sortDir === 'asc' ? 1 : -1;
      // Manejo especial para boolean (estado)
      if (typeof va === 'boolean' || typeof vb === 'boolean') {
        const na = va ? 1 : 0;
        const nb = vb ? 1 : 0;
        return sortDir === 'asc' ? na - nb : nb - na;
      }
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return sorted;
  }, [usuarios, searchTerm, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') setSortDir('desc');
    else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    } else setSortDir('asc');
  };

  return loading ? (
    <div className="text-center py-8">Cargando usuarios...</div>
  ) : usuarios.length === 0 ? (
    <p>No hay usuarios registrados.</p>
  ) : (
    <>
      <table className="min-w-full text-sm divide-y table-auto">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th onClick={() => toggleSort('id')} className="p-3 font-semibold w-16 text-center cursor-pointer select-none">
              <div className="flex items-center justify-center gap-1">
                <span>ID</span>
                <span className="inline-flex flex-col ml-2 text-xs leading-none">
                  <span className={sortKey === 'id' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                  <span className={sortKey === 'id' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                </span>
              </div>
            </th>
            <th onClick={() => toggleSort('username')} className="p-3 font-semibold w-1/5 text-center cursor-pointer select-none">
              <div className="flex items-center justify-center gap-1">
                <span>Usuario</span>
                <span className="inline-flex flex-col ml-2 text-xs leading-none">
                  <span className={sortKey === 'username' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                  <span className={sortKey === 'username' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                </span>
              </div>
            </th>
            <th onClick={() => toggleSort('email')} className="p-3 font-semibold w-2/5 text-center cursor-pointer select-none">
              <div className="flex items-center justify-center gap-1">
                <span>Correo</span>
                <span className="inline-flex flex-col ml-2 text-xs leading-none">
                  <span className={sortKey === 'email' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                  <span className={sortKey === 'email' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                </span>
              </div>
            </th>
            <th onClick={() => toggleSort('estado')} className="p-3 font-semibold w-32 text-center cursor-pointer select-none">
              <div className="flex items-center justify-center gap-1">
                <span>Estado</span>
                <span className="inline-flex flex-col ml-2 text-xs leading-none">
                  <span className={sortKey === 'estado' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                  <span className={sortKey === 'estado' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                </span>
              </div>
            </th>
            <th onClick={() => toggleSort('role_name')} className="p-3 font-semibold w-32 text-center cursor-pointer select-none">
              <div className="flex items-center justify-center gap-1">
                <span>Rol</span>
                <span className="inline-flex flex-col ml-2 text-xs leading-none">
                  <span className={sortKey === 'role_name' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                  <span className={sortKey === 'role_name' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                </span>
              </div>
            </th>
            <th className="p-3 font-semibold w-32 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {displayed.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-500">
                No se encontraron usuarios que coincidan con "{searchTerm}".
              </td>
            </tr>
          ) : (
            displayed.map((u, idx) => (
              <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                <UserRow
                  usuario={u}
                  idx={idx}
                  auth={auth}
                  attemptEdit={attemptEdit}
                  handleEliminar={handleEliminar}
                />
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
