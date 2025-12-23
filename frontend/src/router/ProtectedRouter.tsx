import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[]; // 👈 opcional: lista de roles permitidos
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const rawUser = localStorage.getItem("user");
  const usuario = rawUser ? JSON.parse(rawUser) : null;
  const token = localStorage.getItem("access_token");

  // Validación simple: solo verificar existencia de token y usuario
  // La lógica de expiración por inactividad se maneja en useAuth
  if (!token || !usuario) {
    try { localStorage.removeItem('access_token'); localStorage.removeItem('user'); } catch(e) {}
    return <Navigate to="/login" replace />;
  }

  // Normalizar rol
  const rol = (usuario.role_name || usuario.rol || "").trim().toUpperCase();
 
  // Validar contra roles permitidos
  if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si pasa la validación, renderiza el componente hijo
  return <>{children}</>;
};

export default ProtectedRoute;