import type { TipoSeguimiento } from "./SeguimientoTable";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Props = {
  t: TipoSeguimiento;
  idx: number;
  auth: any;
  setEditTipo: (t: TipoSeguimiento) => void;
  setShowEdit: (v: boolean) => void;
  handleDelete: (id: number, nombre: string) => Promise<void> | void;
};

export default function SeguimientoRow({ t, idx, auth, setEditTipo, setShowEdit, handleDelete }: Props) {
  return (
    <tr key={t.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
      <td className="p-3 text-center">{t.id}</td>
      <td className="p-3 text-center">{t.nombre}</td>
      <td className="p-3 text-center">{t.descripcion ?? ''}</td>
      <td className="p-3 text-center">
        <div className="flex gap-2 justify-center">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => { setEditTipo(t); setShowEdit(true); }} title="Editar"><FiEdit className="text-xl" /></button>
                  <button className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => handleDelete(t.id, t.nombre)} title="Eliminar"><FiTrash2 className="text-xl" /></button>
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
