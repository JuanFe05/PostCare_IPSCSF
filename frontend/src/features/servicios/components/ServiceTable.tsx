import { useEffect, useMemo } from "react";
import { useTable, usePagination } from 'react-table';
import type { Service } from "../types";
import ServiceRow from "./ServiceRow";
import Table from "../../../components/notus/Table";
import ServicePagination from './ServicePagination';

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
  const data = useMemo(() => {
    return services.filter((s) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(s.id ?? "").toLowerCase().includes(q);
      const nombreMatch = String(s.nombre ?? "").toLowerCase().includes(q);
      const descMatch = String(s.descripcion ?? "").toLowerCase().includes(q);
      return idMatch || nombreMatch || descMatch;
    });
  }, [services, searchTerm]);

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
      <p className="mt-2 text-gray-600">Cargando servicios...</p>
    </div>
  ) : services.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <i className="fas fa-inbox text-4xl mb-2" />
      <p>No hay servicios registrados.</p>
    </div>
  ) : (
    <div>
      <Table headers={['ID', 'Nombre', 'Descripción', 'Acciones']} color="light">
        {data.length === 0 ? (
          <tr>
            <td colSpan={4} className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-center whitespace-nowrap p-4">
              No se encontraron servicios que coincidan con "{searchTerm}".
            </td>
          </tr>
        ) : (
          page.map((row: any) => {
            const s: Service = row.original;
            return (
              <tr key={s.id} className="hover:bg-blue-50">
                <ServiceRow
                  service={s}
                  auth={auth}
                  attemptEdit={attemptEdit}
                  handleEliminar={handleEliminar}
                />
              </tr>
            );
          })
        )}
      </Table>
      <ServicePagination
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
