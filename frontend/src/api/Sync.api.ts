import client from './Users.api';

export interface SyncRangoFechasRequest {
  fecha_inicio: string;
  fecha_fin: string;
}

export interface SyncClinicaResponse {
  success: boolean;
  fecha_sincronizacion: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  registros_procesados: number;
  pacientes: {
    creados: number;
    actualizados: number;
    omitidos: number;
    total: number;
  };
  atenciones: {
    creadas: number;
    actualizadas: number;
    omitidas: number;
    total: number;
  };
  errores: string[];
}

export const syncPacientesRangoFechas = async (
  data: SyncRangoFechasRequest
): Promise<SyncClinicaResponse> => {
  const response = await client.post('/sync/clinica-florida/rango-fechas', data);
  return response.data;
};
