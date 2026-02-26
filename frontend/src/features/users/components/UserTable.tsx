import { useEffect, useMemo } from "react";
import { useTable, usePagination } from 'react-table';
import type { Usuario } from "../types";
import UserRow from "./UserRow";
import { Table } from '../../../components/notus';
import UserPagination from './UserPagination';

interface UserTableProps {
  usuarios: Usuario[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  attemptEdit: (usuario: Usuario) => void;
  handleEliminar: (id: number, username: string) => Promise<void>;
}

export default function UserTable({ 
  usuarios, 
  loading, 
  searchTerm,
  auth,
  attemptEdit,
  handleEliminar 
}: UserTableProps) {
  const data = useMemo(() => {
    return usuarios.filter((u) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(u.id ?? '').toLowerCase().includes(q);
      const usernameMatch = String(u.username ?? '').toLowerCase().includes(q);
      const emailMatch = String(u.email ?? '').toLowerCase().includes(q);
      return idMatch || usernameMatch || emailMatch;
    });
  }, [usuarios, searchTerm]);

  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Username', accessor: 'username' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Estado', accessor: 'estado' },
    { Header: 'Rol', accessor: 'role_name' },
    { Header: 'Acciones', accessor: 'password_hash' },
  ] as any[], []);

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
      <p className="mt-2 text-gray-600">Cargando usuarios...</p>
    </div>
  ) : usuarios.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <i className="fas fa-inbox text-4xl mb-2" />
      <p>No hay usuarios registrados.</p>
    </div>
  ) : (
    <div>
      <Table headers={['ID', 'Username', 'Email', 'Estado', 'Rol', 'Acciones']} color="light">
        {data.length === 0 ? (
          <tr>
            <td colSpan={6} className="p-6 text-center text-gray-500">
              {searchTerm ? `No se encontraron usuarios que coincidan con "${searchTerm}".` : 'No hay usuarios registrados.'}
            </td>
          </tr>
        ) : (
          page.map((row: any) => {
            const u: Usuario = row.original;
            return (
              <tr key={u.id} className="hover:bg-blue-50">
                <UserRow
                  usuario={u}
                  auth={auth}
                  attemptEdit={attemptEdit}
                  handleEliminar={handleEliminar}
                />
              </tr>
            );
          })
        )}
      </Table>
      <UserPagination
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
