import type { Atencion } from '../types';

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
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
        <div className="flex gap-3 justify-center items-center">
          {canEdit ? (
            <>
              <button 
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer" 
                onClick={() => attemptEdit(atencion)} 
                title="Editar"
              >
                <i className="fas fa-edit text-lg" />
              </button>
              {isAdmin && (
                <button 
                  className="text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer" 
                  onClick={() => handleEliminar(atencion.id_atencion, atencion.nombre_paciente)} 
                  title="Eliminar"
                >
                  <i className="fas fa-trash text-lg" />
                </button>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400">Sin acciones</span>
          )}
        </div>
      </td>

      {/** Estado (columna 2) */}
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-40">
        {(() => {
          const estadoText = String(atencion.nombre_estado_atencion ?? '').trim();
          const estadoClass = estadoText === 'Urgencias' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
          return (
            <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${estadoClass}`}>{estadoText || '-'}</span>
          );
        })()}
      </td>

      {/** Seguimiento (columna 3) */}
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-40">
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

      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{atencion.id_atencion}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{formatFecha(atencion.fecha_atencion)}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{atencion.id_paciente}</td>

      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-center">
        <div className="max-w-xs break-words mx-auto">{atencion.nombre_paciente}</div>
      </td>

      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-center">
        <div className="max-w-xs break-words mx-auto">{atencion.nombre_empresa}</div>
      </td>

      {canViewTipoEmpresa && (
        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-center">
          <div className="max-w-xs break-words mx-auto">{atencion.tipo_empresa_nombre || '-'}</div>
        </td>
      )}

      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{atencion.telefono_uno || '-'}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">{atencion.telefono_dos || '-'}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-center">
        <div className="max-w-xs break-words mx-auto">{atencion.email || '-'}</div>
      </td>

      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-center">
        <div className="max-w-md break-words mx-auto">{formatServicios(atencion.servicios)}</div>
      </td>

      {/** Observación */}
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-center">
        <div className="max-w-md break-words mx-auto">{atencion.observacion || '-'}</div>
      </td>

      {/** Columnas de auditoría solo para ADMINISTRADOR */}
      {isAdmin && (
        <>
          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-center">
            <div className="max-w-xs break-words mx-auto">{atencion.nombre_usuario_modificacion || '-'}</div>
          </td>
          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-40">
            {formatFechaModificacion(atencion.fecha_modificacion)}
          </td>
        </>
      )}
    </>
  );
}
