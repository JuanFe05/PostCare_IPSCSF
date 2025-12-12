export interface EstadoAtencion {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export type EstadoCreate = {
  nombre: string;
  descripcion?: string;
}

export type EstadoUpdate = Partial<EstadoCreate>;
