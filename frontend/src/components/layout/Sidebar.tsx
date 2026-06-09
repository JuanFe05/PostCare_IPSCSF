import React from 'react';
import { motion } from 'framer-motion';
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
      confirmButtonColor: '#1a338e',
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
          { label: "Análisis", icon: "fas fa-chart-line", path: "/dashboard" },
          { label: "Atenciones", icon: "fas fa-clipboard-list", path: "/dashboard/atenciones" },
          { label: "Pacientes", icon: "fas fa-user-injured", path: "/dashboard/pacientes" },
        ]
      : [
          { label: "Análisis", icon: "fas fa-chart-line", path: "/dashboard" },
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
    <motion.aside
      className="fixed top-0 left-0 bottom-0 z-30 flex flex-col overflow-hidden"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        background: 'linear-gradient(180deg, #0d1f6b 0%, #1a338e 40%, #122480 100%)',
        boxShadow: '4px 0 24px 0 rgba(13,31,107,0.22)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Patrón decorativo de fondo */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(46,95,212,0.18) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(14,165,233,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo / Brand */}
      <Link
        to="/dashboard"
        className="flex items-center justify-center flex-shrink-0 relative"
        style={{ minHeight: '72px', padding: collapsed ? '16px 0' : '16px 20px' }}
        title="IPS Clínica Salud Florida"
      >
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          }}
        >
          <img src={logoIPS} alt="Logo" className="h-7 w-7 object-contain" />
        </div>
        <motion.div
          className="overflow-hidden"
          animate={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 160, marginLeft: collapsed ? 0 : 12 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ whiteSpace: 'nowrap' }}
        >
          <p style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
            IPS Clínica
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(147,174,245,0.9)', fontSize: '0.72rem', margin: 0 }}>
            Salud Florida
          </p>
        </motion.div>
      </Link>

      {/* Divider */}
      <div className="mx-4 flex-shrink-0" style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

      {/* Section label */}
      <motion.div
        className="px-4 pt-4 pb-1 flex-shrink-0 overflow-hidden"
        animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : 'auto' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <span style={{ fontFamily: "'Sora', sans-serif", color: 'rgba(147,174,245,0.7)', fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Menú Principal
        </span>
      </motion.div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden relative" style={{ padding: '6px 8px', gap: '2px' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className="flex items-center rounded-xl relative overflow-hidden group"
              style={{
                background: active
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.1) 100%)'
                  : 'transparent',
                border: active ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
                minHeight: '42px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : '11px',
                padding: collapsed ? '10px 0' : '10px 12px',
                transition: 'background 160ms, border-color 160ms, padding 280ms cubic-bezier(0.4,0,0.2,1)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              {/* Pill activo */}
              {active && !collapsed && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                  style={{ width: '3px', height: '22px', background: '#7dd3fc' }}
                />
              )}
              <i
                className={`${item.icon} flex-shrink-0`}
                style={{
                  fontSize: '0.85rem',
                  color: active ? '#ffffff' : 'rgba(147,174,245,0.8)',
                  width: '18px',
                  textAlign: 'center',
                  transition: 'color 160ms',
                }}
              />
              <motion.span
                className="overflow-hidden whitespace-nowrap"
                animate={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 160 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#ffffff' : 'rgba(203,213,250,0.85)',
                }}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom divider */}
      <div className="mx-4 flex-shrink-0" style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

      {/* User / Logout */}
      <div
        className="flex items-center flex-shrink-0 cursor-pointer relative"
        style={{
          minHeight: '60px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : '12px',
          padding: collapsed ? '12px 0' : '12px 16px',
          transition: 'padding 280ms cubic-bezier(0.4,0,0.2,1)',
        }}
        onClick={handleLogout}
        title="Cerrar sesión"
        onMouseEnter={() => setLogoutHover(true)}
        onMouseLeave={() => setLogoutHover(false)}
      >
        <div
          className="flex-shrink-0 rounded-full flex items-center justify-center"
          style={{
            width: '34px',
            height: '34px',
            background: logoutHover ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
            transition: 'background 200ms ease',
          }}
        >
          <i
            className="fas fa-sign-out-alt"
            style={{
              fontSize: '0.85rem',
              color: logoutHover ? '#fca5a5' : '#f87171',
              transition: 'color 200ms ease',
            }}
          />
        </div>
        <motion.div
          className="overflow-hidden"
          animate={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 160 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ whiteSpace: 'nowrap' }}
        >
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, color: logoutHover ? '#ffffff' : '#e2e8f0', margin: 0, transition: 'color 200ms', lineHeight: 1.3 }}>
            {auth?.user?.username ?? 'Usuario'}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: logoutHover ? '#fca5a5' : '#f87171', margin: 0, transition: 'color 200ms' }}>
            Cerrar sesión
          </p>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;