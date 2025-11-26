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
      className="h-14 lg:h-16 flex items-center px-6 shadow-md text-white pr-8 fixed top-0 z-40"
      style={{ left: '15rem', width: 'calc(100% - 15rem)', background: '#15163fff' }}
    >
      {/* Logo a la izquierda y saludo a la derecha, ambos alineados con el main */}
      <div className="w-full flex items-center justify-end">
        <div className="leading-tight flex flex-col items-end pr-6">
          <p className="text-xs lg:text-sm opacity-80 text-right">
            {role ? `Bienvenido ${role}` : "Bienvenido"}
          </p>
          <h1 className="text-sm lg:text-base font-semibold text-right">
            {username ? `${username}, panel de gestión IPSCSF` : 'Panel de gestión IPSCSF'}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;