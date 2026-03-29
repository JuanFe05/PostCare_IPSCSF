import { useEffect, useState } from 'react';
import { useSidebar } from './SidebarContext';

const Header = () => {
  const { collapsed, toggle } = useSidebar();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        setUsername(u?.username || u?.name || null);
        setRole(u?.role_name || u?.rol || '');
      }
    } catch {
      setUsername(null);
    }
  }, []);

  return (
    <nav
      className="fixed top-0 right-0 z-40 bg-white shadow-md"
      style={{
        left: collapsed ? '72px' : '240px',
        transition: 'left 280ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Toggle button */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
            style={{ background: '#f1f5f9' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <svg
              width="18" height="18" viewBox="0 0 18 18" fill="none"
              style={{
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
                flexShrink: 0,
              }}
            >
              <rect x="2" y="4" width="14" height="1.5" rx="0.75" fill="#1a338e" />
              <rect x="2" y="8.25" width="9" height="1.5" rx="0.75" fill="#1a338e" />
              <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" fill="#1a338e" />
            </svg>
          </button>

          {/* Title + user (right side) */}
          <div className="text-right">
            <h1 className="text-base font-bold text-gray-800 leading-tight">Panel de Gestión IPSCSF</h1>
            <p className="text-xs text-gray-400">{username} · {role}</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
