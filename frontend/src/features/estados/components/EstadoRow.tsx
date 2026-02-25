import type { EstadoAtencion } from '../types';
import Swal from 'sweetalert2';

interface EstadoRowProps {
  estado: EstadoAtencion;
  auth: any;
  attemptEdit: (e: EstadoAtencion) => void;
  handleEliminar: (id: number, nombre: string) => Promise<void>;
}

export default function EstadoRow({ estado, auth, attemptEdit, handleEliminar }: EstadoRowProps) {
  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();

  const doDelete = async () => {
    const res = await Swal.fire({
      title: `¿Eliminar estado "${estado.nombre}"?`,
      text: 'No se podrá deshacer esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (res.isConfirmed) {
      await handleEliminar(estado.id, estado.nombre);
    }
  };

  return (
    <>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">{estado.id}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">{estado.nombre}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">{estado.descripcion || '-'}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
        {role === 'ADMINISTRADOR' ? (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => attemptEdit(estado)}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
              title="Editar"
            >
              <i className="fas fa-edit text-lg" />
            </button>
            <button
              onClick={doDelete}
              className="text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer"
              title="Eliminar"
            >
              <i className="fas fa-trash text-lg" />
            </button>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">Sin permisos</span>
        )}
      </td>
    </>
  );
}
