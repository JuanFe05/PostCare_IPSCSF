import { memo } from 'react';
import type { Service } from "../types";
import { FiEdit, FiTrash2 } from 'react-icons/fi';

type Props = {
  service: Service;
  auth: any;
  attemptEdit: (service: Service) => Promise<void> | void;
  handleEliminar: (id: number, nombre: string) => Promise<void> | void;
};

const ServiceRow = memo(function ServiceRow({ service, auth, attemptEdit, handleEliminar }: Props) {
  return (
    <>
      <td className="p-3 text-center">{service.id}</td>
      <td className="p-3 text-center">{service.nombre}</td>
      <td className="p-3 text-center">{service.descripcion && String(service.descripcion).trim().length > 0 ? service.descripcion : `Servicio relacionado con ${String(service.nombre ?? '').toLowerCase()}`}</td>
      <td className="p-3 text-center">
        <div className="flex gap-2 justify-center">
          {(() => {
            const role = String(auth?.user?.role_name ?? "").trim().toUpperCase();
            if (role === "ADMINISTRADOR") {
              return (
                <>
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => attemptEdit(service)} title="Editar">
                    <FiEdit className="text-xl" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => handleEliminar(service.id!, service.nombre)} title="Eliminar">
                    <FiTrash2 className="text-xl" />
                  </button>
                </>
              );
            }
            return <span className="text-sm text-gray-500">Sin acciones</span>;
          })()}
        </div>
      </td>
    </>
  );
});

export default ServiceRow;
