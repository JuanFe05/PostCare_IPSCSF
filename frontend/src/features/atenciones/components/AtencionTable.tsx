import { useState, useEffect, useMemo } from "react";
import type { Atencion } from "../types";
import AtencionRow from "./AtencionRow";
import AtencionPagination from "./AtencionPagination";
import { useTable, usePagination } from 'react-table';

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

  // Columnas de react-table
  const columns = useMemo(() => [
    { Header: 'ID Atención', accessor: 'id_atencion' as const },
    { Header: 'ID Paciente', accessor: 'id_paciente' as const },
    { Header: 'Fecha Atención', accessor: 'fecha_atencion' as const },
    { Header: 'Paciente', accessor: 'nombre_paciente' as const },
    { Header: 'Teléfono 1', accessor: 'telefono_uno' as const },
    { Header: 'Teléfono 2', accessor: 'telefono_dos' as const },
    { Header: 'Email', accessor: 'email' as const },
    { Header: 'Empresa', accessor: 'nombre_empresa' as const },
    { Header: 'Estado', accessor: 'nombre_estado_atencion' as const },
    { Header: 'Seguimiento', accessor: 'nombre_seguimiento_atencion' as const },
    { Header: 'Servicios', accessor: 'servicios' as const },
    { Header: 'Acciones', accessor: 'id_atencion' as const },
  ], []);

  const data = useMemo(() => displayed, [displayed]);

  const tableInstance: any = useTable({ columns, data, initialState: { pageIndex: 0 } as any }, usePagination);
  const {
    getTableProps,
    getTableBodyProps,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex },
    gotoPage,
    nextPage,
    previousPage,
  } = tableInstance;

  // Establecer el tamaño de página en 7
  useEffect(() => {
    if (tableInstance.setPageSize) {
      tableInstance.setPageSize(7);
    }
  }, [tableInstance]);

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
    <div className="text-center py-8">Cargando atenciones...</div>
  ) : (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full text-sm divide-y table-auto">
        {/* Header */}
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            {columns.map((col: any) => (
              <th 
                key={col.accessor} 
                className={`p-3 font-semibold text-center select-none ${
                  col.accessor === 'servicios' || col.accessor === 'id_atencion' ? '' : 'cursor-pointer'
                }`} 
                onClick={() => col.accessor !== 'servicios' && col.accessor !== 'id_atencion' && toggleSort(col.accessor)}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{col.Header}</span>
                  {col.accessor !== 'servicios' && col.accessor !== 'id_atencion' && (
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

        {/* Body */}
        <tbody {...getTableBodyProps()} className="bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={12} className="p-6 text-center text-gray-500">No se encontraron atenciones.</td>
            </tr>
          ) : (
            page.map((row: any, ridx: number) => {
              const atencion: Atencion = row.original;
              const globalIdx = pageIndex * 7 + ridx;
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
        pageOptions={pageOptions}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        dataLength={data.length}
        gotoPage={gotoPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </div>
  );
}
