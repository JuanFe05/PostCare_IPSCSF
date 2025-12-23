// Tipos para los servicios
export type Servicio = {
  id_servicio: number;
  nombre_servicio: string;
};

// Tipo completo de atención (según el backend)
export type Atencion = {
  id_atencion: string;
  fecha_atencion: string;
  observacion?: string;
  
  // Paciente
  id_paciente: string;
  nombre_paciente: string;
  telefono_uno?: string;
  telefono_dos?: string;
  email?: string;
  
  // Empresa
  id_empresa: number;
  nombre_empresa: string;
  
  // Estado
  id_estado_atencion: number;
  nombre_estado_atencion: string;
  
  // Seguimiento
  id_seguimiento_atencion?: number;
  nombre_seguimiento_atencion?: string;
  
  // Servicios
  servicios: Servicio[];
  
  // Auditoría
  fecha_modificacion?: string;
  nombre_usuario_modificacion?: string;
};

// Tipo para crear nueva atención
export type NewAtencion = {
  id?: string;
  id_paciente: string;
  id_empresa: number;
  id_estado_atencion: number;
  id_seguimiento_atencion?: number;
  fecha_ingreso?: string;
  id_usuario?: number;
  observacion?: string;
  servicios?: number[];
};

// Tipo para actualizar atención
export type UpdateAtencion = {
  id_empresa?: number;
  id_estado_atencion?: number;
  id_seguimiento_atencion?: number;
  fecha_ingreso?: string;
  id_usuario?: number;
  observacion?: string;
  servicios?: number[];
  // Campos del paciente que se pueden actualizar
  // Identificación y contacto
  id_paciente?: string;
  id_tipo_documento?: number;
  telefono_uno?: string | null;
  telefono_dos?: string | null;
  email?: string;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
};

// Tipo para crear atención con paciente
export type NewAtencionConPaciente = {
  // Datos del paciente
  id_paciente: string;
  id_tipo_documento: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  telefono_uno?: string;
  telefono_dos?: string;
  email?: string;
  
  // Datos de la atención
  id_atencion: string;
  id_empresa: number;
  id_estado_atencion: number;
  id_seguimiento_atencion?: number;
  fecha_ingreso?: string;
  id_usuario?: number;
  observacion?: string;
  servicios?: number[];
};

// Tipos para dropdowns
export type TipoDocumento = {
  id: number;
  siglas: string;
  descripcion: string;
};

export type Empresa = {
  id: number;
  nombre: string;
};

export type EstadoAtencion = {
  id: number;
  nombre: string;
};

export type SeguimientoAtencion = {
  id: number;
  nombre: string;
};

export type ServicioOption = {
  id: number;
  nombre: string;
};
