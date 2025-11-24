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

  // Helper: check token expiry (JWT 'exp' claim)
  const isTokenExpired = (t?: string | null) => {
    if (!t) return true;
    try {
      const parts = t.split('.');
      if (parts.length < 2) return true;
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const obj = JSON.parse(json);
      const exp = obj.exp;
      if (!exp) return true;
      return Date.now() > exp * 1000;
    } catch (e) {
      return true;
    }
  };

  // Si no hay token o usuario, o el token expiró, redirige
  if (!token || !usuario || isTokenExpired(token)) {
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