import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { Outlet } from 'react-router-dom';

function DashboardContent() {
  const { collapsed } = useSidebar();
  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div
        className="flex flex-col flex-1 max-w-full overflow-hidden"
        style={{
          marginLeft: collapsed ? '72px' : '240px',
          transition: 'margin-left 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Header />
        <main className="flex-1 p-6 mt-16 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="text-center">
            <span className="text-sm text-gray-600">
              © {new Date().getFullYear()} IPS Clínica Salud Florida. Todos los derechos reservados.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}
