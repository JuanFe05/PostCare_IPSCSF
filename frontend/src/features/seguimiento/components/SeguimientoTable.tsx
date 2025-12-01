import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAuth } from "../../../hooks/useAuth";
import SeguimientoForm from "./SeguimientoForm";
import { getTiposSeguimiento, createTipoSeguimiento, updateTipoSeguimiento, deleteTipoSeguimiento } from "../Seguimiento.api";
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";

export interface TipoSeguimiento {
  id: number;
  nombre: string;
  descripcion?: string;
}

export default function SeguimientoTable() {
  const [tipos, setTipos] = useState<TipoSeguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTipo, setEditTipo] = useState<TipoSeguimiento | null>(null);
  const { auth } = useAuth();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  const displayedTipos = useMemo(() => {
    const q = String(search ?? '').trim().toLowerCase();
    const filtered = tipos.filter((t: TipoSeguimiento) => {
      if (!q) return true;
      const nombre = String(t.nombre ?? '').toLowerCase();
      const desc = String(t.descripcion ?? '').toLowerCase();
      return nombre.includes(q) || desc.includes(q);
    });

    if (!sortKey || !sortDir) return filtered;

    return [...filtered].sort((a: any, b: any) => {
      const va = a[sortKey as keyof TipoSeguimiento];
      const vb = b[sortKey as keyof TipoSeguimiento];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === 'asc' ? -1 : 1;
      if (vb == null) return sortDir === 'asc' ? 1 : -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
      }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [tipos, search, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') setSortDir('desc');
    else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    } else setSortDir('asc');
  };

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTiposSeguimiento();
      setTipos(data);
    } catch (err) {
      console.error("Error cargando tipos de seguimiento:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    const res = await Swal.fire({
      title: `¿Eliminar ${nombre}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });
    if (!res.isConfirmed) return;
      try {
      await deleteTipoSeguimiento(id);
      setTipos((prev: TipoSeguimiento[]) => prev.filter((t: TipoSeguimiento) => t.id !== id));
      await Swal.fire({ icon: 'success', title: 'Eliminado', text: `${nombre} eliminado.` });
    } catch (err) {
      console.error('Error eliminando tipo seguimiento:', err);
      await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.' });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Tipos de Seguimiento</h2>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-shrink-0 flex items-center gap-3">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer">Agregar nuevo tipo seguimiento</button>
                  <ExportExcel data={displayedTipos} fileName="seguimientos.xlsx" />
                </>
              );
            }
            return <p className="text-sm text-gray-600">Solo administradores pueden gestionar tipos.</p>;
          })()}
        </div>

        <div className="flex items-center gap-2 w-full max-w-md justify-end">
          <input
            type="text"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Buscar por Nombre o Descripción"
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition border-gray-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">Limpiar</button>
          )}
        </div>
      </div>

      {loading && <p>Cargando tipos...</p>}
      {!loading && tipos.length === 0 && <p>No hay tipos registrados.</p>}

      {/** Filtrado local */}
      {/** compute filtered list */}

      {!loading && tipos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y table-auto">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th onClick={() => toggleSort('id')} className="p-3 font-semibold w-16 text-center cursor-pointer select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span>ID</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === 'id' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                      <span className={sortKey === 'id' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                    </span>
                  </div>
                </th>

                <th onClick={() => toggleSort('nombre')} className="p-3 font-semibold text-center cursor-pointer select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span>Nombre</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === 'nombre' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                      <span className={sortKey === 'nombre' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                    </span>
                  </div>
                </th>

                <th onClick={() => toggleSort('descripcion')} className="p-3 font-semibold text-center cursor-pointer select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span>Descripción</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === 'descripcion' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                      <span className={sortKey === 'descripcion' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                    </span>
                  </div>
                </th>
                <th className="p-3 font-semibold w-32 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {displayedTipos.map((t: TipoSeguimiento, idx: number) => (
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No hay coincidencias */}
      {!loading && tipos.length > 0 && displayedTipos.length === 0 && (
        <p className="mt-4">No se encontraron tipos que coincidan con "{search}".</p>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <SeguimientoForm isEdit={false} onCancel={() => setShowAdd(false)} onSave={async (payload) => {
            setLoading(true);
            try {
              const created = await createTipoSeguimiento(payload);
              setTipos((prev: TipoSeguimiento[]) => [created, ...prev]);
              setShowAdd(false);
              await Swal.fire({ icon: 'success', title: 'Creado', text: `Tipo ${created.nombre} creado.` });
            } catch (err) {
              console.error('Error creando tipo seguimiento:', err);
              await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear.' });
            } finally { setLoading(false); }
          }} />
        </div>
      )}

      {showEdit && editTipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <SeguimientoForm isEdit initial={{ nombre: editTipo.nombre, descripcion: editTipo.descripcion }} onCancel={() => { setShowEdit(false); setEditTipo(null); }} onSave={async (payload) => {
            if (!editTipo) return;
            setLoading(true);
            try {
              const updated = await updateTipoSeguimiento(editTipo.id, payload);
              setTipos((prev: TipoSeguimiento[]) => prev.map((p: TipoSeguimiento) => p.id === updated.id ? updated : p));
              setShowEdit(false);
              setEditTipo(null);
              await Swal.fire({ icon: 'success', title: 'Actualizado', text: `Tipo ${updated.nombre} actualizado.` });
            } catch (err) {
              console.error('Error actualizando tipo seguimiento:', err);
              await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar.' });
            } finally { setLoading(false); }
          }} />
        </div>
      )}
    </div>
  );
}
