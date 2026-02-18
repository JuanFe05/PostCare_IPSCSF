import type { Paciente } from '../types';

type Props = {
  paciente: Paciente;
  idx: number;
  auth: any;
  attemptEdit: (paciente: Paciente) => Promise<void> | void;
  handleEliminar: (id: string, nombre: string) => Promise<void> | void;
};

export default function PacienteRow({ paciente, auth, attemptEdit, handleEliminar }: Props) {
  const nombreCompleto = `${paciente.primer_nombre} ${paciente.segundo_nombre || ''} ${paciente.primer_apellido} ${paciente.segundo_apellido || ''}`.trim();
  
  return (
    <>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-24">{paciente.tipo_documento_codigo || 'N/A'}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{paciente.id}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{paciente.primer_nombre}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{paciente.segundo_nombre || '-'}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{paciente.primer_apellido}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{paciente.segundo_apellido || '-'}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{paciente.telefono_uno || '-'}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{paciente.telefono_dos || '-'}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-center">
        <div className="max-w-xs break-words mx-auto">
          {paciente.email || '-'}
        </div>
      </td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">
        {(() => {
          const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
          const isAdmin = role === 'ADMINISTRADOR';
          const canEdit = isAdmin || role === 'ASESOR';

          if (!canEdit) {
            return <span className="text-gray-400 text-xs">Sin permisos</span>;
          }

          return (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => attemptEdit(paciente)}
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
                title="Editar"
              >
                <i className="fas fa-edit text-lg" />
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleEliminar(paciente.id, nombreCompleto)}
                  className="text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer"
                  title="Eliminar"
                >
                  <i className="fas fa-trash text-lg" />
                </button>
              )}
            </div>
          );
        })()}
      </td>
    </>
  );
}
