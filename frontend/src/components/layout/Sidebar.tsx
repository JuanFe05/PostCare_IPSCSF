import React from 'react';
import logoIPS from "../../assets/IPS.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from './SidebarContext';
import { useAuth } from '../../hooks/useAuth';
import Swal from 'sweetalert2';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const { collapsed } = useSidebar();
  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
  const [logoutHover, setLogoutHover] = React.useState(false);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Confirmar cierre de sesión',
      text: '¿Estás seguro que deseas cerrar la sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Cerrar sesión',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      if (setAuth) setAuth({ token: null, user: null });
      navigate('/login');
    }
  };

  const navItems =
    role === 'ASESOR' || role === 'FACTURADOR'
      ? [
          { label: "Análisis", icon: "fas fa-tachometer-alt", path: "/dashboard" },
          { label: "Atenciones", icon: "fas fa-clipboard-list", path: "/dashboard/atenciones" },
          { label: "Pacientes", icon: "fas fa-user-injured", path: "/dashboard/pacientes" },
        ]
      : [
          { label: "Análisis", icon: "fas fa-tachometer-alt", path: "/dashboard" },
          { label: "Atenciones", icon: "fas fa-clipboard-list", path: "/dashboard/atenciones" },
          { label: "Pacientes", icon: "fas fa-user-injured", path: "/dashboard/pacientes" },
          { label: "Empresas", icon: "fas fa-building", path: "/dashboard/empresas" },
          { label: "Servicios", icon: "fas fa-medkit", path: "/dashboard/tipos-servicios" },
          { label: "Estados", icon: "fas fa-tasks", path: "/dashboard/estados-atenciones" },
          { label: "Seguimientos", icon: "fas fa-search", path: "/dashboard/tipos-seguimiento" },
          { label: "Usuarios", icon: "fas fa-users-cog", path: "/dashboard/usuarios" },
          { label: "Roles", icon: "fas fa-user-shield", path: "/dashboard/roles" },
        ];

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 z-30 flex flex-col overflow-hidden shadow-2xl"
      style={{
        width: collapsed ? '72px' : '240px',
        transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'linear-gradient(165deg, #1a338e 0%, #152156 60%, #0e1640 100%)',
      }}
    >
      {/* Logo / Brand */}
      <Link
        to="/dashboard"
        className="flex items-center justify-center py-5 flex-shrink-0"
        style={{ minHeight: '80px' }}
        title="IPS Clínica Salud Florida"
      >
        <div
          className="flex-shrink-0 bg-white rounded-xl flex items-center justify-center shadow-lg"
          style={{ width: '40px', height: '40px' }}
        >
          <img src={logoIPS} alt="Logo" className="h-7 w-7 object-contain" />
        </div>
        <div
          className="overflow-hidden"
          style={{
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? '0px' : '160px',
            marginLeft: collapsed ? '0px' : '12px',
            transition: 'opacity 200ms ease, max-width 280ms cubic-bezier(0.4,0,0.2,1), margin-left 280ms cubic-bezier(0.4,0,0.2,1)',
            whiteSpace: 'nowrap',
          }}
        >
          <p className="text-white font-bold text-sm leading-tight">IPS Clínica</p>
          <p className="text-blue-200 text-xs">Salud Florida</p>
        </div>
      </Link>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10 flex-shrink-0" />

      {/* Section label */}
      <div
        className="px-4 pt-4 pb-2 flex-shrink-0 overflow-hidden"
        style={{
          opacity: collapsed ? 0 : 1,
          transition: 'opacity 180ms ease',
          height: collapsed ? '0px' : 'auto',
        }}
      >
        <span className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">
          Menú Principal
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden py-2" style={{ padding: '8px 4px' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className="flex items-center rounded-xl transition-all duration-150 relative overflow-hidden"
              style={{
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : 'none',
                minHeight: '44px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : '12px',
                padding: collapsed ? '10px 0' : '10px 12px',
                transition: 'background 150ms, box-shadow 150ms, padding 280ms cubic-bezier(0.4,0,0.2,1), gap 280ms cubic-bezier(0.4,0,0.2,1)',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = active ? 'rgba(255,255,255,0.15)' : 'transparent';
              }}
            >
              {/* Active indicator bar */}
              {active && !collapsed && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                  style={{ height: '24px', background: '#60a5fa' }}
                />
              )}
              <i
                className={`${item.icon} flex-shrink-0 text-sm`}
                style={{
                  color: active ? '#ffffff' : '#93c5fd',
                  width: '18px',
                  textAlign: 'center',
                  transition: 'color 150ms ease',
                }}
              />
              <span
                className="text-sm font-medium overflow-hidden whitespace-nowrap"
                style={{
                  color: active ? '#ffffff' : '#bfdbfe',
                  opacity: collapsed ? 0 : 1,
                  maxWidth: collapsed ? '0px' : '160px',
                  transition: 'opacity 200ms ease, max-width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom divider */}
      <div className="mx-4 border-t border-white/10 flex-shrink-0" />

      {/* User info footer + logout */}
      <div
        className="flex items-center flex-shrink-0 cursor-pointer"
        style={{
          minHeight: '64px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : '12px',
          padding: collapsed ? '12px 0' : '12px 16px',
          transition: 'padding 280ms cubic-bezier(0.4,0,0.2,1), gap 280ms cubic-bezier(0.4,0,0.2,1)',
        }}
        onClick={handleLogout}
        title="Cerrar sesión"
        onMouseEnter={() => setLogoutHover(true)}
        onMouseLeave={() => setLogoutHover(false)}
      >
        <div
          className="flex-shrink-0 rounded-full flex items-center justify-center"
          style={{
            width: '36px',
            height: '36px',
            background: logoutHover ? 'rgba(239,68,68,0.22)' : 'rgba(255,255,255,0.1)',
            transition: 'background 200ms ease',
          }}
        >
          <i
            className="fas fa-sign-out-alt text-sm"
            style={{
              color: logoutHover ? '#fca5a5' : '#f87171',
              transition: 'color 200ms ease',
            }}
          />
        </div>
        <div
          className="overflow-hidden"
          style={{
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? '0px' : '160px',
            transition: 'opacity 200ms ease, max-width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
            whiteSpace: 'nowrap',
          }}
        >
          <p
            className="text-xs font-semibold leading-tight"
            style={{ color: logoutHover ? '#ffffff' : '#e2e8f0', transition: 'color 200ms' }}
          >
            {auth?.user?.username ?? 'Usuario'}
          </p>
          <p
            className="text-[10px] font-medium"
            style={{ color: logoutHover ? '#fca5a5' : '#fda4af', transition: 'color 200ms' }}
          >
            Cerrar sesión
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
