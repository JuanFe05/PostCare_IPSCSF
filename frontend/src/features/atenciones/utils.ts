import type { Atencion } from './types';

/**
 * Expande las atenciones para que cada servicio genere una fila separada en el export
 * @param atenciones - Array de atenciones a expandir
 * @returns Array de objetos planos listos para exportar a Excel
 */
export const prepareAtencionesPorServicio = (atenciones: Atencion[]) => {
  const expandedData: any[] = [];
  
  atenciones.forEach((atencion) => {
    if (atencion.servicios && atencion.servicios.length > 0) {
      // Por cada servicio, crear una fila
      atencion.servicios.forEach((servicio) => {
        expandedData.push({
          ID_Atencion: atencion.id_atencion,
          Fecha_Atencion: atencion.fecha_atencion,
          Estado: atencion.nombre_estado_atencion,
          Seguimiento: atencion.nombre_seguimiento_atencion || '',
          ID_Paciente: atencion.id_paciente,
          Nombre_Paciente: atencion.nombre_paciente,
          Telefono_1: atencion.telefono_uno || '',
          Telefono_2: atencion.telefono_dos || '',
          Email: atencion.email || '',
          Empresa: atencion.nombre_empresa,
          Servicio: servicio.nombre_servicio,
          Observacion: atencion.observacion || '',
          Usuario_Modificacion: atencion.nombre_usuario_modificacion || '',
          Fecha_Modificacion: atencion.fecha_modificacion || ''
        });
      });
    } else {
      // Si no tiene servicios, crear una fila sin servicio
      expandedData.push({
        ID_Atencion: atencion.id_atencion,
        Fecha_Atencion: atencion.fecha_atencion,
        Estado: atencion.nombre_estado_atencion,
        Seguimiento: atencion.nombre_seguimiento_atencion || '',
        ID_Paciente: atencion.id_paciente,
        Nombre_Paciente: atencion.nombre_paciente,
        Telefono_1: atencion.telefono_uno || '',
        Telefono_2: atencion.telefono_dos || '',
        Email: atencion.email || '',
        Empresa: atencion.nombre_empresa,
        Servicio: '',
        Observacion: atencion.observacion || '',
        Usuario_Modificacion: atencion.nombre_usuario_modificacion || '',
        Fecha_Modificacion: atencion.fecha_modificacion || ''
      });
    }
  });
  
  return expandedData;
};
