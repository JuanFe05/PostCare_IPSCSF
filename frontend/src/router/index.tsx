import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/login/Login';
import Register from '../pages/Register/Register';
import DashboardLayout from '../components/layout/DashboardLayout';
import OverviewPanel from '../pages/dashboard/OverviewPanel';
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
            <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }

        >
          <Route index element={<OverviewPanel />} />
        </Route>
        {/* Página para asesores o rutas no autorizadas */}
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </BrowserRouter>
  );
}