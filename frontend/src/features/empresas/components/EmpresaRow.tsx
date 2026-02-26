import type { Empresa } from "../types";

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
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">{empresa.id}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
        <span className="font-semibold">{empresa.nombre}</span>
      </td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">{empresa.tipo_empresa_nombre || 'N/A'}</td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
        {(() => {
          const role = String(auth?.user?.role_name ?? "").trim().toUpperCase();
          if (role === "ADMINISTRADOR") {
            return (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => attemptEdit(empresa)}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
                  title="Editar"
                >
                  <i className="fas fa-edit text-lg" />
                </button>
                <button
                  onClick={() => handleEliminar(empresa.id!, empresa.nombre)}
                  className="text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer"
                  title="Eliminar"
                >
                  <i className="fas fa-trash text-lg" />
                </button>
              </div>
            );
          }
          return <span className="text-gray-400 text-xs">Sin permisos</span>;
        })()}
      </td>
    </>
  );
}
