import { useEffect, useState } from 'react';
import logoIPS from '../../assets/IPS.png';

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
      className="h-14 lg:h-16 bg-gradient-to-r from-[#0f033f] to-[#1f0b68] flex items-center px-6 shadow-md text-white pr-8 fixed top-0 z-40"
      style={{ left: '15rem', width: 'calc(100% - 15rem)' }}
    >
      {/* Logo a la izquierda y saludo a la derecha, ambos alineados con el main */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoIPS} alt="IPS" className="h-7 w-7" />
          <span className="hidden md:inline-block text-sm font-medium">Sistema de Seguimiento IPSCSF</span>
        </div>

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