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

  
  // Si no hay token o usuario, redirige
  if (!token || !usuario) {
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