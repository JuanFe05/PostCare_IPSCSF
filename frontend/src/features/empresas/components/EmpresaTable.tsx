import { useState, useEffect, useMemo } from "react";
import type { Empresa } from "../types";
import EmpresaRow from "./EmpresaRow";
import EmpresaPagination from "./EmpresaPagination";
import { useTable, usePagination } from 'react-table';
import { Table } from '../../../components/notus';

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
  const [sortKey] = useState<string | null>(null);
  const [sortDir] = useState<'asc' | 'desc' | null>(null);

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
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex, pageSize },
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

  return loading ? (
    <div className="text-center py-8">Cargando empresas...</div>
  ) : (
    <div>
      <Table headers={['ID', 'Nombre', 'Tipo', 'Acciones']} color="light">
        {data.length === 0 ? (
          <tr>
            <td colSpan={4} className="p-6 text-center text-gray-500">No se encontraron empresas.</td>
          </tr>
        ) : (
          page.map((row: any, ridx: number) => {
            const e: Empresa = row.original;
            const usedPageSize = pageSize || 7;
            const globalIdx = pageIndex * usedPageSize + ridx;
            return (
              <tr key={e.id} className="hover:bg-blue-50">
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
      </Table>

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
    </div>
  );
}
