import { useState, useEffect, useMemo } from "react";
import type { Empresa } from "../types";
import EmpresaRow from "./EmpresaRow";
import EmpresaPagination from "./EmpresaPagination";
import { useTable, usePagination } from 'react-table';

interface EmpresaTableProps {
  empresas: Empresa[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  attemptEdit: (empresa: Empresa) => void;
  handleEliminar: (id: number, nombre: string) => Promise<void>;
}

export default function EmpresaTable({ 
  empresas, 
  loading, 
  searchTerm,
  auth,
  attemptEdit,
  handleEliminar 
}: EmpresaTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  // calcular lista filtrada + ordenada
  const displayed = useMemo(() => {
    // filter
    const filtered = empresas.filter((e: Empresa) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(e.id ?? '').toLowerCase().includes(q);
      const nombreMatch = String(e.nombre ?? '').toLowerCase().includes(q);
      const tipoMatch = String(e.tipo_empresa_nombre ?? '').toLowerCase().includes(q);
      return idMatch || nombreMatch || tipoMatch;
    });

    // sort
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
  }, [empresas, searchTerm, sortKey, sortDir]);

  // react-table columns (used for headers and pagination only)
  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' as const },
    { Header: 'Nombre', accessor: 'nombre' as const },
    { Header: 'Tipo', accessor: 'tipo_empresa_nombre' as const },
    { Header: 'Acciones', accessor: 'id' as const },
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

  // Establecer el tamaño de página en 10
  useEffect(() => {
    if (tableInstance.setPageSize) {
      tableInstance.setPageSize(10);
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
    <div className="text-center py-8">Cargando empresas...</div>
  ) : (
    <>
      <table {...getTableProps()} className="min-w-full text-sm divide-y table-auto">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            {columns.map((col: any) => (
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

        <tbody {...getTableBodyProps()} className="bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-6 text-center text-gray-500">No se encontraron empresas.</td>
            </tr>
          ) : (
            page.map((row: any, ridx: number) => {
              const e: Empresa = row.original;
              const globalIdx = pageIndex * 7 + ridx;
              return (
                <tr key={e.id} className={`${globalIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                  <EmpresaRow
                    empresa={e}
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

      <EmpresaPagination
        pageIndex={pageIndex}
        pageOptions={pageOptions}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        dataLength={data.length}
        gotoPage={gotoPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </>
  );
}
