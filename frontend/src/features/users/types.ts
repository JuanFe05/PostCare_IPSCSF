export type Usuario = {
  id?: number;
  username: string;
  email: string;
  estado?: boolean;
  role_id?: number;
  role_name?: string;
  password_hash?: string;
  password?: string;
};

export type NewUsuario = {
  username: string;
  email: string;
  password?: string;
  password_hash?: string;
  estado?: boolean;
  role_id?: number;
};
