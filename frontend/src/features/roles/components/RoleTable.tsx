import { useState, useMemo } from "react";
import { FiEdit } from 'react-icons/fi';

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
}

interface RoleTableProps {
  roles: Role[];
  loading: boolean;
  auth: any;
  attemptEdit: (role: Role) => void;
}

export default function RoleTable({ roles, loading, auth, attemptEdit }: RoleTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  // ORDENAMIENTO
  const displayed = useMemo(() => {
    const filtered = roles;

    if (!sortKey || !sortDir) return filtered;

    return [...filtered].sort((a: any, b: any) => {
      const va = a[sortKey];
      const vb = b[sortKey];

      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }

      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [roles, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    if (sortDir === "asc") setSortDir("desc");
    else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else {
      setSortDir("asc");
    }
  };

  return loading ? (
    <div className="text-center py-8">Cargando roles...</div>
  ) : roles.length === 0 ? (
    <p>No hay roles registrados.</p>
  ) : (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y table-auto">
          <thead className="bg-blue-100 text-blue-900 select-none">
          <tr>
            <th
              onClick={() => toggleSort("id")}
              className="p-3 font-semibold text-center cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1">
                <span>ID</span>
                <span className="inline-flex flex-col ml-1 text-[10px] leading-none">
                  <span className={sortKey === 'id' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                  <span className={sortKey === 'id' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                </span>
              </div>
            </th>
            <th
              onClick={() => toggleSort("nombre")}
              className="p-3 font-semibold text-center cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1">
                <span>Nombre</span>
                <span className="inline-flex flex-col ml-1 text-[10px] leading-none">
                  <span className={sortKey === 'nombre' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                  <span className={sortKey === 'nombre' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                </span>
              </div>
            </th>
            <th
              onClick={() => toggleSort("descripcion")}
              className="p-3 font-semibold text-center cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1">
                <span>Descripción</span>
                <span className="inline-flex flex-col ml-1 text-[10px] leading-none">
                  <span className={sortKey === 'descripcion' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                  <span className={sortKey === 'descripcion' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                </span>
              </div>
            </th>
            <th className="p-3 font-semibold w-32 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-white">
          {displayed.map((r: Role, idx: number) => {
            const role = String(r.nombre ?? '').trim().toUpperCase();
            return (
              <tr
                key={r.id}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
              >
                <td className="p-3 text-center">{r.id}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    role === 'ADMINISTRADOR' ? 'bg-blue-100 text-blue-700'
                    : role === 'FACTURADOR' ? 'bg-yellow-100 text-yellow-700'
                    : role === 'ASESOR' ? 'bg-orange-100 text-orange-700'
                    : 'bg-yellow-100 text-yellow-700'}
                  `}>{r.nombre || ''}</span>
                </td>
                <td className="p-3 text-center">{r.descripcion}</td>
                <td className="p-3 text-center">
                  {(() => {
                    const roleName = String(auth?.user?.role_name ?? '').trim().toUpperCase();
                    if (roleName === 'ADMINISTRADOR') {
                      return (
                        <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => attemptEdit(r)} title="Editar">
                          <FiEdit className="text-xl" />
                        </button>
                      );
                    }
                    return <span className="text-sm text-gray-500">Sin acciones</span>;
                  })()}
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
