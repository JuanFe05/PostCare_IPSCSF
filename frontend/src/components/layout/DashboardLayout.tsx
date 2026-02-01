import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-64 max-w-full overflow-hidden">
        <Header />
        <main className="flex-1 p-6 mt-20 overflow-y-auto">
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