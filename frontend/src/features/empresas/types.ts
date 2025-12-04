export type TipoEmpresa = {
  id: number;
  nombre: string;
};

export type Empresa = {
  id?: number;
  id_tipo_empresa: number;
  nombre: string;
  tipo_empresa_nombre?: string;
};

export type NewEmpresa = {
  id_tipo_empresa: number;
  nombre: string;
};
