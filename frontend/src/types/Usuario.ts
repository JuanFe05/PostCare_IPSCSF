// ...existing code...
export type Usuario = {
  id?: number;
  username: string;
  email: string;
  estado?: boolean;
  role_id?: number;
  role_name?: string;
  password_hash?: string;
  password?: string; // uso temporal en frontend (formularios)
};

export type NewUsuario = {
  username: string;
  email: string;
  password?: string; // contraseña en texto plano desde UI
  password_hash?: string; // opcional si ya hay hash
  estado?: boolean;
  role_id?: number; // <- opcional para evitar errores de asignación; validar en call-sites
};
