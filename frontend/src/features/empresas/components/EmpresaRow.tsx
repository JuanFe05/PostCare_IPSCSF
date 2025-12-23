import type { Empresa } from "../types";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Props = {
  empresa: Empresa;
  idx: number;
  auth: any;
  attemptEdit: (empresa: Empresa) => Promise<void> | void;
  handleEliminar: (id: number, nombre: string) => Promise<void> | void;
};

export default function EmpresaRow({ empresa, auth, attemptEdit, handleEliminar }: Props) {
  // Este componente solo representa las celdas de la tabla; el elemento padre `EmpresaTable` representa el contenedor <tr>.
  return (
    <>
      <td className="p-3 text-center">{empresa.id}</td>
      <td className="p-3 text-center">{empresa.nombre}</td>
      <td className="p-3 text-center">{empresa.tipo_empresa_nombre || 'N/A'}</td>
      <td className="p-3 text-center">
        <div className="flex gap-2 justify-center">
          {(() => {
            const role = String(auth?.user?.role_name ?? "").trim().toUpperCase();
            if (role === "ADMINISTRADOR") {
              return (
                <>
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => attemptEdit(empresa)} title="Editar">
                    <FiEdit className="text-xl" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => handleEliminar(empresa.id!, empresa.nombre)} title="Eliminar">
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
}
