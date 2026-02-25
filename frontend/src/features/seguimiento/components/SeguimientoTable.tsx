import { useEffect, useMemo } from "react";
import { useTable, usePagination } from 'react-table';
import SeguimientoRow from "./SeguimientoRow";
import { Table } from '../../../components/notus';
import SeguimientoPagination from './SeguimientoPagination';

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
  const data = useMemo(() => {
    const q = String(searchTerm ?? '').trim().toLowerCase();
    return tipos.filter((t: TipoSeguimiento) => {
      if (!q) return true;
      const id = String(t.id ?? '').toLowerCase();
      const nombre = String(t.nombre ?? '').toLowerCase();
      const desc = String(t.descripcion ?? '').toLowerCase();
      return id.includes(q) || nombre.includes(q) || desc.includes(q);
    });
  }, [tipos, searchTerm]);

  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' as const },
    { Header: 'Nombre', accessor: 'nombre' as const },
    { Header: 'Descripción', accessor: 'descripcion' as const },
    { Header: 'Acciones', accessor: 'id' as const },
  ], []);

  const tableInstance: any = useTable(
    { columns, data, initialState: { pageIndex: 0 } as any },
    usePagination
  );
  const {
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex },
    gotoPage,
    nextPage,
    previousPage,
  } = tableInstance;

  useEffect(() => {
    if (tableInstance.setPageSize) tableInstance.setPageSize(7);
  }, [tableInstance]);

  return loading ? (
    <div className="text-center py-8">
      <i className="fas fa-spinner fa-spin text-3xl text-blue-500" />
      <p className="mt-2 text-gray-600">Cargando tipos de seguimiento...</p>
    </div>
  ) : tipos.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <i className="fas fa-inbox text-4xl mb-2" />
      <p>No hay tipos de seguimiento registrados.</p>
    </div>
  ) : (
    <div>
      <Table headers={['ID', 'Nombre', 'Descripción', 'Acciones']} color="light">
        {data.length === 0 ? (
          <tr>
            <td colSpan={4} className="p-6 text-center text-gray-500">
              {searchTerm ? `No se encontraron tipos que coincidan con "${searchTerm}".` : 'No hay tipos registrados.'}
            </td>
          </tr>
        ) : (
          page.map((row: any) => {
            const t: TipoSeguimiento = row.original;
            return (
              <tr key={t.id} className="hover:bg-blue-50">
                <SeguimientoRow
                  tipo={t}
                  auth={auth}
                  setEditTipo={setEditTipo}
                  setShowEdit={setShowEdit}
                  handleDelete={handleDelete}
                />
              </tr>
            );
          })
        )}
      </Table>
      <SeguimientoPagination
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
