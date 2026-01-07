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
  // ==================== Verificación de Roles ====================
  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
  const isAdmin = role === 'ADMINISTRADOR';
  const canViewTipoEmpresa = isAdmin || role === 'ASESOR' || role === 'FACTURADOR';
  const canEdit = isAdmin || role === 'ASESOR' || role === 'FACTURADOR';

  // ==================== Funciones de Formato ====================
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

  // Formatear fecha de modificación
  const formatFechaModificacion = (fecha: string | undefined) => {
    if (!fecha) return '-';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  return (
    <>
      <td className="p-3 text-center w-30 whitespace-nowrap">
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

      {/** Estado (columna 2) */}
      <td className="p-3 text-center w-40 whitespace-nowrap">
        {(() => {
          const estadoText = String(atencion.nombre_estado_atencion ?? '').trim();
          const estadoClass = estadoText === 'Urgencias' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
          return (
            <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${estadoClass}`}>{estadoText || '-'}</span>
          );
        })()}
      </td>

      {/** Seguimiento (columna 3) */}
      <td className="p-3 text-center w-40 whitespace-nowrap">
        {(() => {
          const segText = String(atencion.nombre_seguimiento_atencion ?? '').trim();
          let segClass = 'bg-blue-100 text-blue-700';
          if (segText === 'No Contactado') segClass = 'bg-red-100 text-red-700';
          else if (segText === 'Finalizado') segClass = 'bg-green-100 text-green-700';
          return (
            <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${segClass}`}>{segText || '-'}</span>
          );
        })()}
      </td>

      <td className="p-3 text-center w-32 whitespace-nowrap">{atencion.id_atencion}</td>
      <td className="p-3 text-center w-32 whitespace-nowrap">{formatFecha(atencion.fecha_atencion)}</td>
      <td className="p-3 text-center w-32 whitespace-nowrap">{atencion.id_paciente}</td>

      <td className="p-3 text-center w-96">
        <div className="truncate">{atencion.nombre_paciente}</div>
      </td>

      <td className="p-3 text-center w-96">
        <div className="truncate">{atencion.nombre_empresa}</div>
      </td>

      {canViewTipoEmpresa && (
        <td className="p-3 text-center w-64">
          <div className="truncate">{atencion.tipo_empresa_nombre || '-'}</div>
        </td>
      )}

      <td className="p-3 text-center w-32 whitespace-nowrap">{atencion.telefono_uno || '-'}</td>
      <td className="p-3 text-center w-32 whitespace-nowrap">{atencion.telefono_dos || '-'}</td>
      <td className="p-3 text-center w-68">
        <div className="truncate">{atencion.email || '-'}</div>
      </td>

      <td className="p-3 text-center w-96">
        <div className="truncate">{formatServicios(atencion.servicios)}</div>
      </td>

      {/** Observación */}
      <td className="p-3 text-center" style={{ width: '320px', maxWidth: '320px', minWidth: '320px' }}>
        <div className="truncate" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }} title={atencion.observacion || '-'}>
          {atencion.observacion || '-'}
        </div>
      </td>

      {/** Columnas de auditoría solo para ADMINISTRADOR */}
      {isAdmin && (
        <>
          <td className="p-3 text-center w-64">
            <div className="truncate">{atencion.nombre_usuario_modificacion || '-'}</div>
          </td>
          <td className="p-3 text-center w-40 whitespace-nowrap">
            {formatFechaModificacion(atencion.fecha_modificacion)}
          </td>
        </>
      )}
    </>
  );
}
