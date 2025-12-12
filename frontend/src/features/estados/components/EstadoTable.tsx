import { useState, useMemo } from 'react';
import type { EstadoAtencion } from '../types';
import EstadoRow from './EstadoRow';
import EstadoPagination from './EstadoPagination';
import { useTable, usePagination } from 'react-table';

interface EstadoTableProps {
  estados: EstadoAtencion[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  attemptEdit: (estado: EstadoAtencion) => void;
  handleEliminar: (id: number, nombre: string) => Promise<void>;
}

export default function EstadoTable({ estados, loading, searchTerm, auth, attemptEdit, handleEliminar }: EstadoTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>('asc');

  const displayed = useMemo(() => {
    const q = String(searchTerm ?? '').trim().toLowerCase();
    const filtered = estados.filter((e) => {
      if (!q) return true;
      return String(e.id).includes(q) || (e.nombre || '').toLowerCase().includes(q) || (e.descripcion || '').toLowerCase().includes(q);
    });
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a: any, b: any) => {
      const va = a[sortKey as keyof EstadoAtencion];
      const vb = b[sortKey as keyof EstadoAtencion];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === 'asc' ? -1 : 1;
      if (vb == null) return sortDir === 'asc' ? 1 : -1;
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [estados, searchTerm, sortKey, sortDir]);

  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' as const },
    { Header: 'Nombre', accessor: 'nombre' as const },
    { Header: 'Descripción', accessor: 'descripcion' as const },
  ], []);

  const data = useMemo(() => displayed, [displayed]);
  const tableInstance: any = useTable({ columns, data, initialState: { pageIndex: 0 } as any }, usePagination);
  const { getTableProps, getTableBodyProps, page, prepareRow, canPreviousPage, canNextPage, pageOptions, gotoPage, nextPage, previousPage, state: { pageIndex } } = tableInstance;

  const toggleSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return; }
    if (sortDir === 'asc') setSortDir('desc');
    else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); } else setSortDir('asc');
  };

  if (loading) return <div className="text-center py-8">Cargando estados...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full text-sm divide-y table-auto">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              {columns.map((col: any) => (
                <th key={col.accessor} className={`p-3 font-semibold text-center select-none ${col.Header !== 'Acciones' ? 'cursor-pointer' : ''}`} onClick={() => toggleSort(col.accessor)}>
                  <div className="flex items-center justify-center gap-1">
                    <span>{col.Header}</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === col.accessor && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                      <span className={sortKey === col.accessor && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                    </span>
                  </div>
                </th>
              ))}
              <th className="p-3 font-semibold w-32 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody {...getTableBodyProps()} className="bg-white">
            {page.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">{searchTerm ? `No se encontraron estados que coincidan con "${searchTerm}".` : 'No hay estados registrados.'}</td></tr>
            ) : (
              page.map((row: any, ridx: number) => {
                prepareRow(row);
                const { key: rowKey, ...rowProps } = row.getRowProps();
                const estado: EstadoAtencion = row.original;
                return (
                  <tr key={rowKey} {...rowProps} className={`${ridx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                    <EstadoRow estado={estado} auth={auth} attemptEdit={attemptEdit} handleEliminar={handleEliminar} />
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <EstadoPagination pageIndex={pageIndex} pageOptions={pageOptions} canPreviousPage={canPreviousPage} canNextPage={canNextPage} dataLength={data.length} gotoPage={gotoPage} nextPage={nextPage} previousPage={previousPage} />
    </div>
  );
}
