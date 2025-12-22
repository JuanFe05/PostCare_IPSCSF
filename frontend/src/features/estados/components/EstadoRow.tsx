import { FiEdit, FiTrash2 } from 'react-icons/fi';
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
      <td className="p-3 text-center">{estado.id}</td>
      <td className="p-3 text-center">{estado.nombre}</td>
      <td className="p-3 text-center">{estado.descripcion || '-'}</td>
      <td className="p-3 text-center">
        {role === 'ADMINISTRADOR' ? (
          <div className="flex gap-2 justify-center">
            <button title="Editar" className="text-blue-600 hover:text-blue-800 cursor-pointer cursor-pointer" onClick={() => attemptEdit(estado)}>
              <FiEdit className="text-xl" />
            </button>
            <button title="Eliminar" className="text-red-600 hover:text-red-800 cursor-pointer cursor-pointer" onClick={doDelete}>
              <FiTrash2 className="text-xl" />
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Sin acciones</span>
        )}
      </td>
    </>
  );
}
