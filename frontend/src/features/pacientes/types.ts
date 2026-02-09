export interface Paciente {
  id: string;
  id_tipo_documento: number;
  tipo_documento_codigo?: string;
  tipo_documento_descripcion?: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  telefono_uno?: string;
  telefono_dos?: string;
  email?: string;
  nombre_completo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PacienteCreateDto {
  id: string;
  id_tipo_documento: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  telefono_uno?: string;
  telefono_dos?: string;
  email?: string;
}

export interface PacienteUpdateDto {
  id_tipo_documento?: number;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  telefono_uno?: string;
  telefono_dos?: string;
  email?: string;
}
