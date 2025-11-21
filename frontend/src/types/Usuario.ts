export interface Usuario {
  id: number;
  username: string;
  email: string;
  password?: string;
  estado: boolean; // true = ACTIVO, false = INACTIVO
  role_id: number;       // viene del token
  rol?: string;        // nombre corto del rol (viene del token)
  role_name?: string;  // viene del endpoint /users
}