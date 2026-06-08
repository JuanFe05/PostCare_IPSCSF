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
      className="fixed top-0 right-0 z-40"
      style={{
        left: collapsed ? '72px' : '240px',
        transition: 'left 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 12px 0 rgba(13,31,107,0.07)',
      }}
    >
      <div className="px-5 py-3">
        <div className="flex items-center justify-between">
          {/* Toggle */}
          <button
            onClick={toggle}
            className="flex items-center justify-center rounded-xl focus:outline-none cursor-pointer"
            style={{
              width: '36px',
              height: '36px',
              background: '#f0f4f9',
              border: '1px solid #e2e8f0',
              transition: 'background 150ms, box-shadow 150ms',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#e2e8f0';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(26,51,142,0.12)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#f0f4f9';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <rect x="1" y="3" width="14" height="1.5" rx="0.75" fill="#1a338e" />
              <rect x="1" y="7.25" width="9" height="1.5" rx="0.75" fill="#1a338e" />
              <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" fill="#1a338e" />
            </svg>
          </button>

          {/* Right: título + usuario */}
          <div className="flex items-center gap-4">
            {/* Separador visual */}
            <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }} />
            {/* Info usuario */}
            <div className="text-right">
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                {username ?? 'Usuario'}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {role}
              </p>
            </div>
            {/* Avatar */}
            <div
              className="flex items-center justify-center rounded-full text-white font-bold"
              style={{
                width: '34px',
                height: '34px',
                background: 'linear-gradient(135deg, #1a338e, #2e5fd4)',
                fontSize: '0.8rem',
                fontFamily: "'Sora', sans-serif",
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(26,51,142,0.3)',
              }}
            >
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;