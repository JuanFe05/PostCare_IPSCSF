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
      <td className="p-3 text-center">{atencion.id_atencion}</td>
      <td className="p-3 text-center">{atencion.id_paciente}</td>
      <td className="p-3 text-center">{formatFecha(atencion.fecha_atencion)}</td>
      <td className="p-3 text-center">{atencion.nombre_paciente}</td>
      <td className="p-3 text-center">{atencion.telefono_uno || '-'}</td>
      <td className="p-3 text-center">{atencion.telefono_dos || '-'}</td>
      <td className="p-3 text-center">{atencion.email || '-'}</td>
      <td className="p-3 text-center">{atencion.nombre_empresa}</td>
      <td className="p-3 text-center">{atencion.nombre_estado_atencion}</td>
      <td className="p-3 text-center">{atencion.nombre_seguimiento_atencion || '-'}</td>
      <td className="p-3 text-center">{formatServicios(atencion.servicios)}</td>
      
      <td className="p-3 text-center w-32">
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
            <span className="text-sm text-gray-500">Sin acciones</span>
          )}
        </div>
      </td>
    </>
  );
}
