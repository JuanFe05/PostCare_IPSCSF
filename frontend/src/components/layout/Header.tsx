import { RiLogoutBoxRLine, RiUser3Line } from "react-icons/ri";

const Header = () => {
  const handleLogout = () => {
    localStorage.removeItem("user");
    location.href = "/login";
  };

  return (
    <header
      className="h-14 lg:h-16 bg-gradient-to-r from-[#0f033f] to-[#1f0b68]
      flex items-center justify-between px-6 shadow-md text-white
      pl-60 fixed top-0 left-0 right-0 z-40"
    >
      {/* Saludo institucional */}
      <div className="flex items-center space-x-4">
        <RiUser3Line className="text-white text-2xl lg:text-3xl" />
        <div className="leading-tight">
          <p className="text-xs lg:text-sm opacity-80">Bienvenido</p>
          <h1 className="text-sm lg:text-base font-semibold">
            Estiven – Panel Administrativo IPS
          </h1>
        </div>
      </div>

      {/* Botón cerrar sesión */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white text-sm rounded-lg
        hover:bg-red-600 transition"
      >
        <RiLogoutBoxRLine className="text-lg" />
        <span>Salir</span>
      </button>
    </header>
  );
};

export default Header;