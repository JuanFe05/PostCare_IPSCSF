import {
  RiHome3Line,
  RiFileCopyLine,
  RiWalletLine,
  RiPieChartLine,
  RiLogoutBoxRLine,
} from "react-icons/ri";
import logoIPS from "../../assets/IPS.png";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ✅ incluye useNavigate

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

  const navItems = [
    { label: "Registrar", icon: <RiHome3Line />, path: "/dashboard" },
    { label: "Usuarios", icon: <RiFileCopyLine />, path: "/dashboard/usuarios" },
    { label: "Pacientes", icon: <RiWalletLine />, path: "/dashboard/pacientes" },
    { label: "Reportes", icon: <RiPieChartLine />, path: "/dashboard/reportes" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login"); 
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
        className="absolute bottom-6 left-0 w-full flex items-center gap-4 px-5 py-3 text-white"
      >
        <RiLogoutBoxRLine className="text-2xl" />
        <span className="text-sm font-medium">Salir</span>
      </button>
    </div>
  );
};

export default Sidebar;