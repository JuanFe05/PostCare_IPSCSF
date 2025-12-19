import type { Atencion } from '../types';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

type AtencionRowProps = {
  atencion: Atencion;
  idx: number;
  auth: any;
  attemptEdit: (atencion: Atencion) => void;
  handleEliminar: (id: string, nombrePaciente: string) => Promise<void>;
};

export default function AtencionRow({
  atencion,
  auth,
  attemptEdit,
  handleEliminar,
}: AtencionRowProps) {
  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
  const isAdmin = role === 'ADMINISTRADOR';
  const canEdit = isAdmin || role === 'ASESOR' || role === 'FACTURADOR';

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return fecha;
    }
  };

  // Formatear servicios como "Servicio 1, Servicio 2, ..."
  const formatServicios = (servicios: any[]) => {
    if (!servicios || servicios.length === 0) return 'Sin servicios';
    return servicios.map(s => s.nombre_servicio).join(', ');
  };
  return (
    <>
      <td className="px-2 py-1 text-xs text-center w-28">{atencion.id_atencion}</td>
      <td className="px-2 py-1 text-xs text-center w-28">{atencion.id_paciente}</td>
      <td className="px-2 py-1 text-xs text-center w-28">{formatFecha(atencion.fecha_atencion)}</td>
      <td className="px-2 py-1 text-xs text-center truncate w-56">{atencion.nombre_paciente}</td>
      <td className="px-2 py-1 text-xs text-center w-28">{atencion.telefono_uno || '-'}</td>
      <td className="px-2 py-1 text-xs text-center w-28">{atencion.telefono_dos || '-'}</td>
      <td className="px-2 py-1 text-xs text-center truncate w-56">{atencion.email || '-'}</td>
      <td className="px-2 py-1 text-xs text-center truncate w-56">{atencion.nombre_empresa}</td>
      {/** Estado: mostrar como badge con color según valor */}
      <td className="px-2 py-1 text-center">
        {(() => {
          const estadoText = String(atencion.nombre_estado_atencion ?? '').trim();
          const estadoClass = estadoText === 'Urgencias' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
          return (
            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${estadoClass}`}>{estadoText || '-'}</span>
          );
        })()}
      </td>

      {/** Seguimiento: badge con varios colores */}
      <td className="px-2 py-1 text-center">
        {(() => {
          const segText = String(atencion.nombre_seguimiento_atencion ?? '').trim();
          let segClass = 'bg-blue-100 text-blue-700';
          if (segText === 'No Contactado') segClass = 'bg-red-100 text-red-700';
          else if (segText === 'Finalizado') segClass = 'bg-green-100 text-green-700';
          return (
            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${segClass}`}>{segText || '-'}</span>
          );
        })()}
      </td>

      <td className="px-2 py-1 text-xs text-center truncate max-w-[220px]">{formatServicios(atencion.servicios)}</td>

      <td className="px-2 py-1 text-center w-28">
        <div className="flex gap-2 justify-center">
          {canEdit ? (
            <>
              <button 
                className="text-blue-600 hover:text-blue-800 cursor-pointer" 
                onClick={() => attemptEdit(atencion)} 
                title="Editar"
              >
                <FiEdit className="text-xl" />
              </button>
              {isAdmin && (
                <button 
                  className="text-red-600 hover:text-red-800 cursor-pointer" 
                  onClick={() => handleEliminar(atencion.id_atencion, atencion.nombre_paciente)} 
                  title="Eliminar"
                >
                  <FiTrash2 className="text-xl" />
                </button>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-500">Sin acciones</span>
          )}
        </div>
      </td>
    </>
  );
}
