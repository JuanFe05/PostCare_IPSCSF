import type { Empresa } from "../types";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Props = {
  e: Empresa;
  idx: number;
  auth: any;
  attemptEdit: (e: Empresa) => Promise<void> | void;
  handleEliminar: (id: number, nombre: string) => Promise<void> | void;
};

export default function EmpresaRow({ e, auth, attemptEdit, handleEliminar }: Props) {
  // This component renders only the table cells; the parent `EmpresaTable` renders the <tr> wrapper.
  return (
    <>
      <td className="p-3 text-center">{e.id}</td>
      <td className="p-3 text-center">{e.nombre}</td>
      <td className="p-3 text-center">{e.tipo_empresa_nombre || 'N/A'}</td>
      <td className="p-3 text-center">
        <div className="flex gap-2 justify-center">
          {(() => {
            const role = String(auth?.user?.role_name ?? "").trim().toUpperCase();
            if (role === "ADMINISTRADOR") {
              return (
                <>
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => attemptEdit(e)} title="Editar">
                    <FiEdit className="text-xl" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => handleEliminar(e.id!, e.nombre)} title="Eliminar">
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
