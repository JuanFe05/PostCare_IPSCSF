import { useState, useEffect, useMemo } from "react";
import { getRoles } from "../Role.api";

// TIPO ROLE
export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  // CARGAR ROLES
  useEffect(() => {
    getRoles()
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error cargando roles:", err))
      .finally(() => setLoading(false));
  }, []);

  // FILTRO + ORDENAMIENTO
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Roles</h2>

      {/* TABLA */}
      {loading && <p>Cargando roles...</p>}
      {!loading && roles.length === 0 && <p>No hay roles registrados.</p>}

      {!loading && roles.length > 0 && (
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
              </tr>
            </thead>

            <tbody className="bg-white">
              {displayed.map((r, idx) => (
                <tr
                  key={r.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-3 text-center">{r.id}</td>
                  <td className="p-3 text-center">{r.nombre}</td>
                  <td className="p-3 text-center">{r.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
