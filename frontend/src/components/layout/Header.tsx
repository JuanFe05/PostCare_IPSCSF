import { useEffect, useState } from 'react';

const Header = () => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        // Prefer `username`, fallback to `name` or `role_name`
        setUsername(u?.username || u?.name || null);
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
        <p className="text-xs lg:text-sm opacity-80">Bienvenido</p>
        <h1 className="text-sm lg:text-base font-semibold">
          {username ? `${username} – Panel Administrativo IPS` : 'Panel Administrativo IPS'}
        </h1>
      </div>
    </header>
  );
};

export default Header;