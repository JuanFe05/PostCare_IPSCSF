import { useEffect, useState } from 'react';

const Header = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");

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

  return (
    <header
      className="h-14 lg:h-16 bg-gradient-to-r from-[#0f033f] to-[#1f0b68]
      flex items-center justify-end px-6 shadow-md text-white
      pl-60 pr-8 fixed top-0 left-0 right-0 z-40"
    >
      {/* Saludo institucional alineado a la derecha (sin ícono) */}
      <div className="leading-tight text-right">
        <p className="text-xs lg:text-sm opacity-80">
          {role ? `Bienvenido ${role}` : "Bienvenido"}
        </p>
        <h1 className="text-sm lg:text-base font-semibold">
          {username ? `${username}, panel de gestión IPSCSF` : 'Panel de gestión IPSCSF'}
        </h1>
      </div>
    </header>
  );
};

export default Header;