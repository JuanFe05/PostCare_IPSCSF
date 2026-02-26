import type { Usuario } from "../types";

type Props = {
  usuario: Usuario;
  auth: any;
  attemptEdit: (usuario: Usuario) => Promise<void> | void;
  handleEliminar: (id: number, username: string) => Promise<void> | void;
};

export default function UserRow({ usuario, auth, attemptEdit, handleEliminar }: Props) {
  return (
    <>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">{usuario.id}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">{usuario.username}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">{usuario.email}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
        <span className={`px-2 py-1 rounded text-xs font-bold ${usuario.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {usuario.estado ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
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
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
        {(() => {
          const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
          if (role === 'ADMINISTRADOR') {
            return (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => attemptEdit(usuario)}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
                  title="Editar"
                >
                  <i className="fas fa-edit text-lg" />
                </button>
                <button
                  onClick={() => handleEliminar(usuario.id!, usuario.username)}
                  className="text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer"
                  title="Eliminar"
                >
                  <i className="fas fa-trash text-lg" />
                </button>
              </div>
            );
          }
          return <span className="text-gray-400 text-xs">Sin permisos</span>;
        })()}
      </td>
    </>
  );
}
