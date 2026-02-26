import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Swal from 'sweetalert2';

const Header = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        setUsername(u?.username || u?.name || null);
        setRole(u?.role_name || u?.rol || "");
      }
    } catch (e) {
      setUsername(null);
    }
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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

  return (
    <nav className="fixed top-0 left-0 md:left-64 right-0 z-40 bg-white shadow-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand/Title */}
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Panel de Gestión IPSCSF
            </h1>
            <p className="text-xs text-gray-500">{username} - {role}</p>
          </div>

          {/* User Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              style={{ backgroundColor: '#1a338e' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#152156')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a338e')}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <i className="fas fa-user text-sm" style={{ color: '#1a338e' }}></i>
              </div>
              <span className="font-medium hidden md:block">{username || 'Usuario'}</span>
              <i className={`fas fa-chevron-down text-xs transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                {/* Welcome Header */}
                <div className="px-4 py-3" style={{ background: 'linear-gradient(to bottom right, #1a338e, #152156)' }}>
                  <p className="text-white text-xs font-semibold uppercase tracking-wide">Bienvenido</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <i className="fas fa-sign-out-alt text-red-600 w-5"></i>
                    <span className="text-sm font-medium text-red-600">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;