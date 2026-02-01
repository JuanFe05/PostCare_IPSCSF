import { memo } from 'react';
import type { Service } from "../types";

type Props = {
  service: Service;
  auth: any;
  attemptEdit: (service: Service) => Promise<void> | void;
  handleEliminar: (id: number, nombre: string) => Promise<void> | void;
};

const ServiceRow = memo(function ServiceRow({ service, auth, attemptEdit, handleEliminar }: Props) {
  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
  const isAdmin = role === 'ADMINISTRADOR';

  return (
    <>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
        {service.id}
      </td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
        <span className="font-semibold">{service.nombre}</span>
      </td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
        {service.descripcion || '-'}
      </td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
        {isAdmin ? (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => attemptEdit(service)}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
              title="Editar"
            >
              <i className="fas fa-edit text-lg" />
            </button>
            <button
              onClick={() => handleEliminar(service.id!, service.nombre)}
              className="text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer"
              title="Eliminar"
            >
              <i className="fas fa-trash text-lg" />
            </button>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">Sin permisos</span>
        )}
      </td>
    </>
  );
});

export default ServiceRow;
