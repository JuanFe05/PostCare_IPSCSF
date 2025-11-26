import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login/Login';
import DashboardLayout from '../components/layout/DashboardLayout';
import OverviewPanel from '../pages/dashboard/OverviewPanel';
import AtencionesPage from '../features/atenciones/pages/AtencionesPage';
import PacientesPage from '../features/pacientes/pages/PacientesPage';
import EmpresasPage from '../features/empresas/pages/EmpresasPage';
import ServiciosPage from '../features/servicios/pages/ServiciosPage';
import TiposSeguimientoPage from '../features/seguimiento/pages/TiposSeguimientoPage';
import UsersPage from '../features/users/pages/UsersPage';
import RolesPage from '../features/roles/pages/RolesPage';
import NotFoundPage from '../pages/not-found/NotFoundPage';
import UnauthorizedPage from '../pages/unauthorized/UnauthorizedPage';
import ProtectedRoute from '../router/ProtectedRouter';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        {/* Redirigir raíz directamente al login para ejecutar la app y mostrar formulario */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        {/* Rutas protegidas del dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "ASESOR", "FACTURADOR"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPanel />} />
          <Route path="atenciones" element={<AtencionesPage />} />
          <Route path="pacientes" element={<PacientesPage />} />
          {/* Solo ADMINISTRADOR puede ver las siguientes rutas */}
          <Route path="empresas" element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <EmpresasPage />
            </ProtectedRoute>
          } />
          <Route path="tipos-servicios" element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <ServiciosPage />
            </ProtectedRoute>
          } />
          <Route path="tipos-seguimiento" element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <TiposSeguimientoPage />
            </ProtectedRoute>
          } />
          <Route path="usuarios" element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="roles" element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <RolesPage />
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