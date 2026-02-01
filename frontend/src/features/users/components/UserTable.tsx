import { useMemo } from "react";
import type { Usuario } from "../types";
import UserRow from "./UserRow";
import { Table } from '../../../components/notus';

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
  const displayed = useMemo(() => {
    return usuarios.filter((u) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(u.id ?? '').toLowerCase().includes(q);
      const usernameMatch = String(u.username ?? '').toLowerCase().includes(q);
      const emailMatch = String(u.email ?? '').toLowerCase().includes(q);
      return idMatch || usernameMatch || emailMatch;
    });
  }, [usuarios, searchTerm]);

  return loading ? (
    <div className="text-center py-8">Cargando usuarios...</div>
  ) : (
    <Table headers={['ID', 'Username', 'Email', 'Estado', 'Rol', 'Acciones']} color="light">
      {displayed.length === 0 ? (
        <tr>
          <td colSpan={6} className="p-6 text-center text-gray-500">
            {searchTerm ? `No se encontraron usuarios que coincidan con "${searchTerm}".` : 'No hay usuarios registrados.'}
          </td>
        </tr>
      ) : (
        displayed.map((u) => (
          <tr key={u.id} className="hover:bg-blue-50">
            <UserRow
              usuario={u}
              auth={auth}
              attemptEdit={attemptEdit}
              handleEliminar={handleEliminar}
            />
          </tr>
        ))
      )}
    </Table>
  );
}
