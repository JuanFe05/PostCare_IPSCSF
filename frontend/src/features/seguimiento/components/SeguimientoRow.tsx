import type { TipoSeguimiento } from "./SeguimientoTable";

type Props = {
  tipo: TipoSeguimiento;
  auth: any;
  setEditTipo: (tipo: TipoSeguimiento) => void;
  setShowEdit: (show: boolean) => void;
  handleDelete: (id: number, nombre: string) => Promise<void> | void;
};

export default function SeguimientoRow({ tipo, auth, setEditTipo, setShowEdit, handleDelete }: Props) {
  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
  
  return (
    <>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-20">{tipo.id}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-48">{tipo.nombre}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-4 text-center">
        <div className="max-w-2xl break-words mx-auto">
          {tipo.descripcion ?? '-'}
        </div>
      </td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center w-32">
        {role === 'ADMINISTRADOR' ? (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setEditTipo(tipo); setShowEdit(true); }}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
              title="Editar"
            >
              <i className="fas fa-edit text-lg" />
            </button>
            <button
              onClick={() => handleDelete(tipo.id, tipo.nombre)}
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
}
