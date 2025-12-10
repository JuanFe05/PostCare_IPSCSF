import { useMemo, useState } from "react";
import SeguimientoRow from "./SeguimientoRow";

export interface TipoSeguimiento {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface SeguimientoTableProps {
  tipos: TipoSeguimiento[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  setEditTipo: (tipo: TipoSeguimiento) => void;
  setShowEdit: (show: boolean) => void;
  handleDelete: (id: number, nombre: string) => Promise<void>;
}

export default function SeguimientoTable({ 
  tipos, 
  loading, 
  searchTerm,
  auth,
  setEditTipo,
  setShowEdit,
  handleDelete 
}: SeguimientoTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  const displayedTipos = useMemo(() => {
    const q = String(searchTerm ?? '').trim().toLowerCase();
    const filtered = tipos.filter((t: TipoSeguimiento) => {
      if (!q) return true;
      const id = String(t.id ?? '').toLowerCase();
      const nombre = String(t.nombre ?? '').toLowerCase();
      const desc = String(t.descripcion ?? '').toLowerCase();
      return id.includes(q) || nombre.includes(q) || desc.includes(q);
    });

    if (!sortKey || !sortDir) return filtered;

    return [...filtered].sort((a: any, b: any) => {
      const va = a[sortKey as keyof TipoSeguimiento];
      const vb = b[sortKey as keyof TipoSeguimiento];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === 'asc' ? -1 : 1;
      if (vb == null) return sortDir === 'asc' ? 1 : -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
      }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [tipos, searchTerm, sortKey, sortDir]);

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
    <div className="text-center py-8">Cargando tipos...</div>
  ) : tipos.length === 0 ? (
    <p>No hay tipos registrados.</p>
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

            <th onClick={() => toggleSort('nombre')} className="p-3 font-semibold text-center cursor-pointer select-none">
              <div className="flex items-center justify-center gap-1">
                <span>Nombre</span>
                <span className="inline-flex flex-col ml-2 text-xs leading-none">
                  <span className={sortKey === 'nombre' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                  <span className={sortKey === 'nombre' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                </span>
              </div>
            </th>

            <th onClick={() => toggleSort('descripcion')} className="p-3 font-semibold text-center cursor-pointer select-none">
              <div className="flex items-center justify-center gap-1">
                <span>Descripción</span>
                <span className="inline-flex flex-col ml-2 text-xs leading-none">
                  <span className={sortKey === 'descripcion' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                  <span className={sortKey === 'descripcion' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                </span>
              </div>
            </th>
            <th className="p-3 font-semibold w-32 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {displayedTipos.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-6 text-center text-gray-500">
                No se encontraron tipos que coincidan con "{searchTerm}".
              </td>
            </tr>
          ) : (
            displayedTipos.map((t: TipoSeguimiento, idx: number) => (
              <tr key={t.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                <SeguimientoRow 
                  tipo={t} 
                  auth={auth} 
                  setEditTipo={setEditTipo} 
                  setShowEdit={setShowEdit} 
                  handleDelete={handleDelete} 
                />
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
