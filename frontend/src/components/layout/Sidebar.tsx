import logoIPS from "../../assets/IPS.png";
import { Link, useLocation } from "react-router-dom";
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const { auth } = useAuth();
  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
  const [collapseShow, setCollapseShow] = useState("hidden");

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
    <>
      {/* Sidebar para móviles y desktop */}
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-gradient-to-br from-blue-600 to-sky-700 flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Toggler para móviles */}
          <button
            className="cursor-pointer text-white opacity-80 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-gradient-to-br from-blue-600 to-sky-700 m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Brand */}
          <Link
            className="md:block text-center md:pb-2 text-white mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0 w-full"
            to="/dashboard"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white rounded-2xl p-2 shadow-md">
                <img src={logoIPS} alt="Logo" className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h1 className="text-white font-bold text-sm leading-tight">
                  IPS Clínica
                </h1>
                <p className="text-blue-100 text-xs">Salud Florida</p>
              </div>
            </div>
          </Link>

          {/* User para móviles */}
          <ul className="md:hidden items-center flex flex-wrap list-none">
            <li className="inline-block relative">
              <span className="text-sm text-white block">
                <i className="fas fa-user mr-2"></i>
                {auth?.user?.username}
              </span>
            </li>
          </ul>

          {/* Collapse */}
          <div
            className={`md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded ${collapseShow}`}
          >
            {/* Botón cerrar en móviles */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blue-400">
              <div className="flex flex-wrap">
                <div className="w-6/12">
                  <Link
                    className="md:block text-left md:pb-2 text-white mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
                    to="/dashboard"
                  >
                    PostCare
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-white opacity-80 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Heading */}
            <h6 className="md:min-w-full text-blue-100 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              Menú Principal
            </h6>

            {/* Navigation */}
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <li key={item.path} className="items-center">
                    <Link
                      className={`text-xs uppercase py-3 font-bold block transition-all ${
                        active
                          ? "text-white bg-blue-700 rounded-lg px-4"
                          : "text-blue-100 hover:text-white px-4"
                      }`}
                      to={item.path}
                    >
                      <i className={`${item.icon} mr-2 text-sm`}></i>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;