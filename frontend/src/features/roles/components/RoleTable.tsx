import { useEffect, useMemo } from "react";
import { useTable, usePagination } from 'react-table';
import { Table } from '../../../components/notus';
import RolePagination from './RolePagination';

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
}

interface RoleTableProps {
  roles: Role[];
  loading: boolean;
  auth: any;
  attemptEdit: (role: Role) => void;
}

export default function RoleTable({ roles, loading, auth, attemptEdit }: RoleTableProps) {
  const data = useMemo(() => roles, [roles]);

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
      <p className="mt-2 text-gray-600">Cargando roles...</p>
    </div>
  ) : roles.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <i className="fas fa-inbox text-4xl mb-2" />
      <p>No hay roles registrados.</p>
    </div>
  ) : (
    <div>
      <Table headers={['ID', 'Nombre', 'Descripción', 'Acciones']} color="light">
        {data.length === 0 ? (
          <tr>
            <td colSpan={4} className="p-6 text-center text-gray-500">No hay roles registrados.</td>
          </tr>
        ) : (
          page.map((row: any) => {
            const role: Role = row.original;
            const roleName = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            const canEdit = roleName === 'ADMINISTRADOR';
            return (
              <tr key={role.id} className="hover:bg-blue-50">
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-20">
                  {role.id}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-48">
                  {role.nombre}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-center">
                  <div className="max-w-2xl break-words mx-auto">{role.descripcion}</div>
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">
                  {canEdit ? (
                    <button
                      onClick={() => attemptEdit(role)}
                      className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
                      title="Editar rol"
                    >
                      <i className="fas fa-edit text-lg"></i>
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">Sin permisos</span>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </Table>
      <RolePagination
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
