import type { Usuario } from "../types";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Props = {
  usuario: Usuario;
  idx: number;
  auth: any;
  attemptEdit: (usuario: Usuario) => Promise<void> | void;
  handleEliminar: (id: number, username: string) => Promise<void> | void;
};

export default function UserRow({ usuario, auth, attemptEdit, handleEliminar }: Props) {
  return (
    <>
      <td className="p-3 text-center">{usuario.id}</td>
      <td className="p-3 text-center">{usuario.username}</td>
      <td className="p-3 text-center">{usuario.email}</td>
      <td className="p-3 text-center">
        <span className={`px-2 py-1 rounded text-xs font-bold ${usuario.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {usuario.estado ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="p-3 text-center">
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          usuario.role_name === 'ADMINISTRADOR'
            ? 'bg-blue-100 text-blue-700'
            : usuario.role_name === 'FACTURADOR'
            ? 'bg-yellow-100 text-yellow-700'
            : usuario.role_name === 'ASESOR'
            ? 'bg-orange-100 text-orange-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>{usuario.role_name || ''}</span>
      </td>
      <td className="p-3 text-center">
        <div className="flex gap-2 justify-center">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => attemptEdit(usuario)} title="Editar">
                    <FiEdit className="text-xl" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => handleEliminar(usuario.id!, usuario.username)} title="Eliminar">
                    <FiTrash2 className="text-xl" />
                  </button>
                </>
              );
            }
            return <span className="text-sm text-gray-500">Sin acciones</span>;
          })()}
        </div>
      </td>
    </>
  );
}
