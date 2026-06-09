import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

function DashboardContent() {
  const { collapsed } = useSidebar();
  return (
    <div className="flex min-h-screen overflow-hidden" style={{ background: 'var(--surface-bg, #f0f4f9)' }}>
      <Sidebar />
      <motion.div
        className="flex flex-col flex-1 max-w-full overflow-hidden"
        animate={{ marginLeft: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto" style={{ padding: '1.5rem', marginTop: '60px' }}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={{ background: 'white', borderTop: '1px solid var(--surface-border)', padding: '0.875rem 1.5rem' }}>
          <p style={{ textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            © {new Date().getFullYear()} IPS Clínica Salud Florida · Todos los derechos reservados
          </p>
        </footer>
      </motion.div>
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
