import type { Usuario } from "../types";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Props = {
  u: Usuario;
  idx: number;
  auth: any;
  attemptEdit: (u: Usuario) => Promise<void> | void;
  handleEliminar: (id: number, username: string) => Promise<void> | void;
};

export default function UserRow({ u, idx, auth, attemptEdit, handleEliminar }: Props) {
  return (
    <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
      <td className="p-3 text-center">{u.id}</td>
      <td className="p-3 text-center">{u.username}</td>
      <td className="p-3 text-center">{u.email}</td>
      <td className="p-3 text-center">
        <span className={`px-2 py-1 rounded text-xs font-bold ${u.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {u.estado ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="p-3 text-center">
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          u.role_name === 'ADMINISTRADOR'
            ? 'bg-blue-100 text-blue-700'
            : u.role_name === 'FACTURADOR'
            ? 'bg-yellow-100 text-yellow-700'
            : u.role_name === 'ASESOR'
            ? 'bg-orange-100 text-orange-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>{u.role_name || ''}</span>
      </td>
      <td className="p-3 text-center">
        <div className="flex gap-2 justify-center">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => attemptEdit(u)} title="Editar">
                    <FiEdit className="text-xl" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => handleEliminar(u.id!, u.username)} title="Eliminar">
                    <FiTrash2 className="text-xl" />
                  </button>
                </>
              );
            }
            return <span className="text-sm text-gray-500">Sin acciones</span>;
          })()}
        </div>
      </td>
    </tr>
  );
}
