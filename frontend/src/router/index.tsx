import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login/Login';
import Register from '../pages/Register/Register';
import DashboardLayout from '../components/layout/DashboardLayout';
import OverviewPanel from '../pages/dashboard/OverviewPanel';
import AtencionesPanel from '../components/panels/AtencionesPanel';
import PacientesPanel from '../components/panels/PacientesPanel';
import EmpresasPanel from '../components/panels/EmpresasPanel';
import ServiciosPanel from '../components/panels/ServiciosPanel';
import UsuariosPanel from '../components/panels/UsuariosPanel';
import RolesPanel from '../components/panels/RolesPanel';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProtectedRoute from '../router/ProtectedRouter';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        {/* Redirigir raíz directamente al login para ejecutar la app y mostrar formulario */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Rutas protegidas del dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "ASESOR"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPanel />} />
          <Route path="atenciones" element={<AtencionesPanel />} />
          <Route path="pacientes" element={<PacientesPanel />} />
          {/* Solo ADMINISTRADOR puede ver las siguientes rutas */}
          <Route path="empresas" element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <EmpresasPanel />
            </ProtectedRoute>
          } />
          <Route path="servicios" element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <ServiciosPanel />
            </ProtectedRoute>
          } />
          <Route path="usuarios" element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <UsuariosPanel />
            </ProtectedRoute>
          } />
          <Route path="roles" element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <RolesPanel />
            </ProtectedRoute>
          } />
        </Route>
        {/* Página para asesores o rutas no autorizadas */}
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </BrowserRouter>
  );
}