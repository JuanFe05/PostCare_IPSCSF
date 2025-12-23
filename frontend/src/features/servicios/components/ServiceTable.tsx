import { useState, useMemo } from "react";
import type { Service } from "../types";
import ServiceRow from "./ServiceRow";

interface ServiceTableProps {
  services: Service[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  attemptEdit: (service: Service) => void;
  handleEliminar: (id: number, nombre: string) => Promise<void>;
}

export default function ServiceTable({ 
  services, 
  loading, 
  searchTerm,
  auth,
  attemptEdit,
  handleEliminar 
}: ServiceTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  const columns = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Nombre', accessor: 'nombre' },
    { Header: 'Descripción', accessor: 'descripcion' },
    { Header: 'Acciones', accessor: 'acciones' },
  ];

  // displayed (filter + sort)
  const displayed = useMemo(() => {
    const filtered = services.filter((s) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(s.id ?? "").toLowerCase().includes(q);
      const nombreMatch = String(s.nombre ?? "").toLowerCase().includes(q);
      const descMatch = String(s.descripcion ?? "").toLowerCase().includes(q);
      return idMatch || nombreMatch || descMatch;
    });

    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a: any, b: any) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === "asc" ? -1 : 1;
      if (vb == null) return sortDir === "asc" ? 1 : -1;
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [services, searchTerm, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    if (sortDir === "asc") setSortDir("desc");
    else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else setSortDir("asc");
  };

  return loading ? (
    <div className="text-center py-8">Cargando servicios...</div>
  ) : services.length === 0 ? (
    <p>No hay servicios registrados.</p>
  ) : (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y table-auto">
          <thead className="bg-blue-100 text-blue-900">
          <tr>
            {columns.map((col) => (
              <th 
                key={col.accessor} 
                className={`p-3 font-semibold text-center select-none ${col.Header !== 'Acciones' ? 'cursor-pointer' : ''}`} 
                onClick={() => col.Header !== 'Acciones' && toggleSort(col.accessor)}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{col.Header}</span>
                  {col.Header !== 'Acciones' && (
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === col.accessor && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                      <span className={sortKey === col.accessor && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {displayed.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-6 text-center text-gray-500">
                No se encontraron servicios que coincidan con "{searchTerm}".
              </td>
            </tr>
          ) : (
            displayed.map((s, idx) => (
              <tr key={s.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                <ServiceRow 
                  service={s} 
                  auth={auth} 
                  attemptEdit={attemptEdit} 
                  handleEliminar={handleEliminar} 
                />
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
