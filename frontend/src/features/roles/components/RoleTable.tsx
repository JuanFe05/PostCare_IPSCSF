import { useState, useEffect, useMemo } from "react";
import { FiEdit } from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';
import { getRoles, updateRol, acquireRoleLock, releaseRoleLock, checkRoleLock } from "../Role.api";
import RoleForm from "./RoleForm";
import Swal from 'sweetalert2';
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";


// TIPO ROLE
export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [heldLockId, setHeldLockId] = useState<number | null>(null);
  const { auth } = useAuth();

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [heldLockId, setHeldLockId] = useState<number | null>(null);

  // CARGAR ROLES
  useEffect(() => {
    getRoles()
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error cargando roles:", err))
      .finally(() => setLoading(false));
  }, []);

<<<<<<< HEAD
  // release lock on unload
  useEffect(() => {
    const handler = () => {
      if (heldLockId) {
        try { releaseRoleLock(heldLockId); } catch (_) { /* best-effort */ }
=======
  // Attempt to edit with lock acquire/check
  const attemptEdit = async (r: Role) => {
    if (!r.id) {
      setEditRole(r);
      setShowEdit(true);
      return;
    }
    try {
      const status = await checkRoleLock(r.id);
      if (status.locked) {
        const by = status.lockedBy;
        const who = by?.username || by?.name || 'otro usuario';
        await Swal.fire({ icon: 'info', title: 'Registro en edición', text: `No se puede editar. Actualmente lo está editando ${who}.` });
        return;
      }

      const res = await acquireRoleLock(r.id);
      if (res.lockedBy) {
        const who = res.lockedBy?.username || res.lockedBy?.name || 'otro usuario';
        const meId = auth?.user?.id ?? auth?.user?.username;
        if (res.lockedBy?.id && meId && String(res.lockedBy.id) !== String(meId)) {
          await Swal.fire({ icon: 'info', title: 'Registro en edición', text: `No se puede editar. Actualmente lo está editando ${who}.` });
          return;
        }
      }

      if (res.ok && !res.unsupported) {
        setHeldLockId(r.id);
        setEditRole(r);
        setShowEdit(true);
        return;
      }

      if (res.ok && res.unsupported) {
        // backend doesn't support locks — allow edit
        setEditRole(r);
        setShowEdit(true);
        return;
      }
    } catch (err) {
      console.warn('attemptEdit: lock check failed, allowing edit', err);
      setEditRole(r);
      setShowEdit(true);
    }
  };

  const closeEditor = async () => {
    if (heldLockId) {
      await releaseRoleLock(heldLockId);
      setHeldLockId(null);
    }
    setShowEdit(false);
    setEditRole(null);
  };

  // try to release lock on unload (best-effort)
  useEffect(() => {
    const handler = () => {
      if (heldLockId) {
        try { releaseRoleLock(heldLockId); } catch (_) { /* ignore */ }
>>>>>>> develop
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [heldLockId]);

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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Roles</h2>

      {/* BOTÓN EXPORTAR (solo ADMINISTRADOR) */}
      <div className="mb-6">
        {(() => {
          const roleName = String(auth?.user?.role_name ?? '').trim().toUpperCase();
          if (roleName === 'ADMINISTRADOR') {
            return <ExportExcel data={roles} fileName="roles.xlsx" />;
          }
          return null;
        })()}
      </div>

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
                      <span className={`px-2 py-1 rounded text-xs font-bold ${role === 'ADMINISTRADOR'
                          ? 'bg-blue-100 text-blue-700'
                          : role === 'FACTURADOR'
                            ? 'bg-yellow-100 text-yellow-700'
                            : role === 'ASESOR'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}>{r.nombre || ''}</span>
                    </td>
                    <td className="p-3 text-center">{r.descripcion}</td>
                    <td className="p-3 text-center">
                      {(() => {
                        const roleName = String(auth?.user?.role_name ?? '').trim().toUpperCase();
                        if (roleName === 'ADMINISTRADOR') {
                          return (
<<<<<<< HEAD
                            <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={async () => {
                              // attempt to acquire lock before editing
                              try {
                                const status = await checkRoleLock(r.id!);
                                if (status.locked) {
                                  const by = status.lockedBy;
                                  const who = by?.username || by?.name || 'otro usuario';
                                  await Swal.fire({ icon: 'info', title: 'Registro en edición', text: `No se puede editar. Actualmente lo está editando ${who}.` });
                                  return;
                                }
                              } catch (e) {
                                // ignore status check failure and continue to acquire attempt
                              }

                              try {
                                const res = await acquireRoleLock(r.id!);
                                if (res && res.lockedBy && res.lockedBy.id && res.lockedBy.id !== auth?.user?.id) {
                                  const who = res.lockedBy?.username || res.lockedBy?.name || 'otro usuario';
                                  await Swal.fire({ icon: 'info', title: 'Registro en edición', text: `No se puede editar. Actualmente lo está editando ${who}.` });
                                  return;
                                }
                                // acquired
                                setHeldLockId(r.id!);
                                setEditRole(r);
                                setShowEdit(true);
                              } catch (err) {
                                console.warn('Lock acquire failed, allowing edit', err);
                                setEditRole(r);
                                setShowEdit(true);
                              }
                            }} title="Editar">
=======
                            <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => attemptEdit(r)} title="Editar">
>>>>>>> develop
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
      )}

      {showEdit && editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <RoleForm
            initial={editRole}
            isEdit={true}
<<<<<<< HEAD
            onCancel={async () => { if (heldLockId) { try { await releaseRoleLock(heldLockId); } catch (_) {} setHeldLockId(null); } setShowEdit(false); setEditRole(null); }}
=======
            onCancel={async () => { await closeEditor(); }}
>>>>>>> develop
            onSave={async (payload) => {
              try {
                const updated = await updateRol({ id: editRole.id, nombre: payload.nombre ?? '', descripcion: payload.descripcion ?? '' });
                setRoles((prev: Role[]) => prev.map((rr: Role) => (rr.id === updated.id ? updated : rr)));
                // release lock if held
                if (heldLockId) {
<<<<<<< HEAD
                  try { await releaseRoleLock(heldLockId); } catch (e) { /* best-effort */ }
=======
                  await releaseRoleLock(heldLockId);
>>>>>>> develop
                  setHeldLockId(null);
                }
                setShowEdit(false);
                setEditRole(null);
                await Swal.fire({ icon: 'success', title: 'Rol actualizado', text: `Rol ${updated.nombre} actualizado.` });
              } catch (err) {
                console.error('Error actualizando rol:', err);
                await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el rol.' });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
