import { useMemo, useEffect } from 'react';
import type { EstadoAtencion } from '../types';
import EstadoRow from './EstadoRow';
import EstadoPagination from './EstadoPagination';
import { useTable, usePagination } from 'react-table';
import { Table } from '../../../components/notus';

interface EstadoTableProps {
  estados: EstadoAtencion[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  attemptEdit: (estado: EstadoAtencion) => void;
  handleEliminar: (id: number, nombre: string) => Promise<void>;
}

export default function EstadoTable({ estados, loading, searchTerm, auth, attemptEdit, handleEliminar }: EstadoTableProps) {
  const displayed = useMemo(() => {
    const q = String(searchTerm ?? '').trim().toLowerCase();
    return estados.filter((e) => {
      if (!q) return true;
      return String(e.id).includes(q) || (e.nombre || '').toLowerCase().includes(q) || (e.descripcion || '').toLowerCase().includes(q);
    });
  }, [estados, searchTerm]);

  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' as const },
    { Header: 'Nombre', accessor: 'nombre' as const },
    { Header: 'Descripción', accessor: 'descripcion' as const },
  ], []);

  const data = useMemo(() => displayed, [displayed]);
  const tableInstance: any = useTable({ columns, data, initialState: { pageIndex: 0 } as any }, usePagination);
  const { page, canPreviousPage, canNextPage, pageOptions, gotoPage, nextPage, previousPage, state: { pageIndex } } = tableInstance;

  useEffect(() => {
    if (tableInstance.setPageSize) {
      tableInstance.setPageSize(10);
    }
  }, [tableInstance]);

  return loading ? (
    <div className="text-center py-8">
      <i className="fas fa-spinner fa-spin text-3xl text-blue-500" />
      <p className="mt-2 text-gray-600">Cargando estados...</p>
    </div>
  ) : estados.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <i className="fas fa-inbox text-4xl mb-2" />
      <p>No hay estados registrados.</p>
    </div>
  ) : (
    <div>
      <Table headers={['ID', 'Nombre', 'Descripción', 'Acciones']} color="light">
        {data.length === 0 ? (
          <tr>
            <td colSpan={4} className="p-6 text-center text-gray-500">No se encontraron estados.</td>
          </tr>
        ) : (
          page.map((row: any) => {
            const e: EstadoAtencion = row.original;
            return (
              <tr key={e.id} className="hover:bg-blue-50">
                <EstadoRow
                  estado={e}
                  auth={auth}
                  attemptEdit={attemptEdit}
                  handleEliminar={handleEliminar}
                />
              </tr>
            );
          })
        )}
      </Table>

      <EstadoPagination
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
