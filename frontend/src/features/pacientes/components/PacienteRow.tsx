import type { Paciente } from '../types';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

type Props = {
  paciente: Paciente;
  auth: any;
  attemptEdit: (paciente: Paciente) => Promise<void> | void;
  handleEliminar: (id: string, nombre: string) => Promise<void> | void;
};

export default function PacienteRow({ paciente, auth, attemptEdit, handleEliminar }: Props) {
  return (
    <>
      <td className="p-3 text-center">{paciente.tipo_documento_codigo || 'N/A'}</td>
      <td className="p-3 text-center">{paciente.id}</td>
      <td className="p-3 text-center">{paciente.primer_nombre}</td>
      <td className="p-3 text-center">{paciente.segundo_nombre || '-'}</td>
      <td className="p-3 text-center">{paciente.primer_apellido}</td>
      <td className="p-3 text-center">{paciente.segundo_apellido || '-'}</td>
      <td className="p-3 text-center">{paciente.telefono_uno || '-'}</td>
      <td className="p-3 text-center">{paciente.telefono_dos || '-'}</td>
      <td className="p-3 text-center">{paciente.email || '-'}</td>
      <td className="p-3 text-center">
        <div className="flex gap-2 justify-center">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  <button
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => attemptEdit(paciente)}
                    title="Editar"
                  >
                    <FiEdit className="text-xl" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                    onClick={() => handleEliminar(paciente.id, paciente.nombre_completo || paciente.id)}
                    title="Eliminar"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                </>
              );
            }
            return <span className="text-gray-400">Sin permisos</span>;
          })()}
        </div>
      </td>
    </>
  );
}
