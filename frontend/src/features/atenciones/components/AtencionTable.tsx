import { useState, useEffect, useMemo } from "react";
import type { Atencion } from "../types";
import AtencionRow from "./AtencionRow";
import AtencionPagination from "./AtencionPagination";

interface AtencionTableProps {
  atenciones: Atencion[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  attemptEdit: (atencion: Atencion) => void;
  handleEliminar: (id: string, nombrePaciente: string) => Promise<void>;
}

export default function AtencionTable({ 
  atenciones, 
  loading, 
  searchTerm,
  auth,
  attemptEdit,
  handleEliminar 
}: AtencionTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 7;

  // Calcular lista filtrada + ordenada
  const displayed = useMemo(() => {
    // Filtrar
    const filtered = atenciones.filter((a: Atencion) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(a.id_atencion ?? '').toLowerCase().includes(q);
      const pacienteMatch = String(a.nombre_paciente ?? '').toLowerCase().includes(q);
      const empresaMatch = String(a.nombre_empresa ?? '').toLowerCase().includes(q);
      const estadoMatch = String(a.nombre_estado_atencion ?? '').toLowerCase().includes(q);
      return idMatch || pacienteMatch || empresaMatch || estadoMatch;
    });

    // Ordenar
    if (!sortKey || !sortDir) return filtered;
    const sorted = [...filtered].sort((a: any, b: any) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === 'asc' ? -1 : 1;
      if (vb == null) return sortDir === 'asc' ? 1 : -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return sorted;
  }, [atenciones, searchTerm, sortKey, sortDir]);

  // Paginación
  const pageCount = Math.ceil(displayed.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return displayed.slice(start, start + pageSize);
  }, [displayed, pageIndex, pageSize]);

  // Reset page cuando cambia el filtro
  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm]);

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

  const columns = [
    { Header: 'ID Atención', accessor: 'id_atencion' },
    { Header: 'ID Paciente', accessor: 'id_paciente' },
    { Header: 'F. Atención', accessor: 'fecha_atencion' },
    { Header: 'Paciente', accessor: 'nombre_paciente' },
    { Header: 'Tel 1', accessor: 'telefono_uno' },
    { Header: 'Tel 2', accessor: 'telefono_dos' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Empresa', accessor: 'nombre_empresa' },
    { Header: 'Estado', accessor: 'nombre_estado_atencion' },
    { Header: 'Seguimiento', accessor: 'nombre_seguimiento_atencion' },
    { Header: 'Servicios', accessor: 'servicios' },
  ];

  return loading ? (
    <div className="text-center py-8">Cargando atenciones...</div>
  ) : (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y table-auto">
        {/* Header */}
        <thead className="bg-blue-100 text-blue-900 select-none">
          <tr>
            {columns.map((col: any) => {
              return (
                <th 
                  key={col.accessor} 
                  className={`p-3 font-semibold text-center ${
                    col.accessor === 'servicios' || col.accessor === 'id_atencion' ? '' : 'cursor-pointer'
                  }`} 
                  onClick={() => col.accessor !== 'servicios' && col.accessor !== 'id_atencion' && toggleSort(col.accessor)}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{col.Header}</span>
                    {col.accessor !== 'servicios' && col.accessor !== 'id_atencion' && (
                      <span className="inline-flex flex-col ml-1 text-[10px] leading-none">
                        <span className={sortKey === col.accessor && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                        <span className={sortKey === col.accessor && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
            <th className="p-3 font-semibold w-32 text-center">Acciones</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white">
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={12} className="p-6 text-center text-gray-500">No se encontraron atenciones.</td>
            </tr>
          ) : (
            paginatedData.map((atencion: Atencion, ridx: number) => {
              const globalIdx = pageIndex * pageSize + ridx;
              return (
                <tr key={atencion.id_atencion} className={`${globalIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                  <AtencionRow
                    atencion={atencion}
                    idx={globalIdx}
                    auth={auth}
                    attemptEdit={attemptEdit}
                    handleEliminar={handleEliminar}
                  />
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>

      <AtencionPagination
        pageIndex={pageIndex}
        pageOptions={Array.from({ length: pageCount }, (_, i) => i)}
        canPreviousPage={pageIndex > 0}
        canNextPage={pageIndex < pageCount - 1}
        dataLength={displayed.length}
        pageSize={pageSize}
        gotoPage={setPageIndex}
        nextPage={() => setPageIndex(prev => Math.min(prev + 1, pageCount - 1))}
        previousPage={() => setPageIndex(prev => Math.max(prev - 1, 0))}
      />
    </div>
  );
}
