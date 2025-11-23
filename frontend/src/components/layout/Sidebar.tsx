import { RiFileCopyLine, RiLogoutBoxRLine, RiUserSettingsLine } from 'react-icons/ri';
import { CiMedicalClipboard } from 'react-icons/ci';
import { IoPersonOutline } from 'react-icons/io5';
import { MdMedicalServices } from 'react-icons/md';
import { BsBuildingAdd } from 'react-icons/bs';
import logoIPS from "../../assets/IPS.png";
import { Link, useLocation, useNavigate } from "react-router-dom"; // incluye useNavigate
import { useAuth } from '../../hooks/useAuth';
import Swal from 'sweetalert2';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate(); 

  const colors = {
    primary: "#1938bc",
    secondary: "#5a8bea",
    backgroundDark: "#120037",
    backgroundMid: "#29007D",
    textBase: "#ffffff",
    error: "#e63946",
  };

  const { auth } = useAuth();
  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
  const navItems =
    role === 'ASESOR' || role === 'FACTURADOR'
      ? [
          { label: "Atenciones", icon: <CiMedicalClipboard />, path: "/dashboard/atenciones" },
          { label: "Pacientes", icon: <IoPersonOutline />, path: "/dashboard/pacientes" },
        ]
      : [
          { label: "Atenciones", icon: <CiMedicalClipboard />, path: "/dashboard/atenciones" },
          { label: "Pacientes", icon: <IoPersonOutline />, path: "/dashboard/pacientes" },
          { label: "Empresas", icon: <BsBuildingAdd />, path: "/dashboard/empresas" },
          { label: "Servicios", icon: <MdMedicalServices />, path: "/dashboard/servicios" },
          { label: "Usuarios", icon: <RiUserSettingsLine />, path: "/dashboard/usuarios" },
          { label: "Roles", icon: <RiFileCopyLine />, path: "/dashboard/roles" },
        ];

  const { setAuth } = useAuth();

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
      // Limpiar almacenamiento y contexto de autenticación
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      if (setAuth) setAuth({ token: null, user: null });

      // Redirigir al login
      navigate('/login');
    }
  };

  return (
    <div
      className="fixed top-0 left-0 h-full w-60 z-50 shadow-2xl"
      style={{
        background: `linear-gradient(180deg, ${colors.backgroundDark}, ${colors.backgroundMid})`,
      }}
    >
      {/* LOGO */}
      <div className="flex items-center gap-3 px-4 py-6">
        <img src={logoIPS} alt="Logo" className="h-10 w-10" />
        <h1 className="text-white font-semibold text-sm leading-tight">
          Sistema de Seguimiento<br />Clínico IPSCSF
        </h1>
      </div>

      {/* NAV */}
      <nav className="mt-6 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-3 rounded-xl mx-3 transition-all duration-300 ${
                active ? "bg-opacity-90" : "bg-transparent"
              }`}
              style={{
                backgroundColor: active ? colors.primary : "transparent",
                color: "white",
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT BOTTOM */}
      <button
        onClick={handleLogout}
        className="absolute bottom-6 left-0 w-full flex items-center gap-4 px-5 py-3 text-white cursor-pointer hover:bg-opacity-80"
        aria-label="Cerrar sesión"
      >
        <RiLogoutBoxRLine className="text-2xl" />
        <span className="text-sm font-medium">Cerrar Sesión</span>
      </button>

      {/* confirmation handled by SweetAlert2 */}
    </div>
  );
};

export default Sidebar;