import type { TipoSeguimiento } from "./SeguimientoTable";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Props = {
  tipo: TipoSeguimiento;
  auth: any;
  setEditTipo: (tipo: TipoSeguimiento) => void;
  setShowEdit: (show: boolean) => void;
  handleDelete: (id: number, nombre: string) => Promise<void> | void;
};

export default function SeguimientoRow({ tipo, auth, setEditTipo, setShowEdit, handleDelete }: Props) {
  return (
    <>
      <td className="p-3 text-center">{tipo.id}</td>
      <td className="p-3 text-center">{tipo.nombre}</td>
      <td className="p-3 text-center">{tipo.descripcion ?? ''}</td>
      <td className="p-3 text-center">
        <div className="flex gap-2 justify-center">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => { setEditTipo(tipo); setShowEdit(true); }} title="Editar">
                    <FiEdit className="text-xl" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => handleDelete(tipo.id, tipo.nombre)} title="Eliminar">
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
