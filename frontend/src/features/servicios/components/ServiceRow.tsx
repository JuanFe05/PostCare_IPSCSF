import type { Service } from "../types";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Props = {
  s: Service;
  idx: number;
  auth: any;
  attemptEdit: (s: Service) => Promise<void> | void;
  handleEliminar: (id: number, nombre: string) => Promise<void> | void;
};

export default function ServiceRow({ s, idx, auth, attemptEdit, handleEliminar }: Props) {
  return (
    <tr key={s.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
      <td className="p-3 text-center">{s.id}</td>
      <td className="p-3 text-center">{s.nombre}</td>
      <td className="p-3 text-center">{s.descripcion && String(s.descripcion).trim().length > 0 ? s.descripcion : `Servicio relacionado con ${String(s.nombre ?? '').toLowerCase()}`}</td>
      <td className="p-3 text-center">
        <div className="flex gap-2 justify-center">
          {(() => {
            const role = String(auth?.user?.role_name ?? "").trim().toUpperCase();
            if (role === "ADMINISTRADOR") {
              return (
                <>
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => attemptEdit(s)} title="Editar">
                    <FiEdit className="text-xl" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => handleEliminar(s.id!, s.nombre)} title="Eliminar">
                    <FiTrash2 className="text-xl" />
                  </button>
                </>
              );
            }
            return <span className="text-sm text-gray-500">Sin acciones</span>;
          })()}
        </div>
      </td>
    </tr>
  );
}
