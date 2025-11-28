import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from '../../../hooks/useAuth';
import type { Usuario } from "../types";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, acquireUserLock, releaseUserLock, checkUserLock } from "../Users.api";
import Swal from "sweetalert2";
import UserForm from "./UserForm";
import UserSearch from "./UserSearch";
import UserRow from "./UserRow";

export default function UserTable() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

  const { auth } = useAuth();
  const [heldLockId, setHeldLockId] = useState<number | null>(null);

  useEffect(() => {
    getUsuarios()
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Error al cargar usuarios:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleEliminar = async (id: number, username: string) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${username}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUsuario(id);
      setUsuarios((prev: Usuario[]) => prev.filter((u: Usuario) => u.id !== id));
      await Swal.fire({ title: "Eliminado", text: `El usuario ${username} ha sido eliminado.`, icon: "success" });
    } catch (error) {
      console.error("Error al eliminar:", error);
      await Swal.fire({ title: "Error", text: "No se pudo eliminar el usuario.", icon: "error" });
    }
  };

  // Intentar adquirir el bloqueo del lado del servidor antes de abrir el editor.
  const attemptEdit = async (u: Usuario) => {
    if (!u.id) {
      setEditUser(u);
      setShowEditUser(true);
      return;
    }
    try {
      // primero comprueba si alguien más tiene el bloqueo
      const status = await checkUserLock(u.id);
      if (status.locked) {
        const by = status.lockedBy;
        const who = by?.username || by?.name || 'otro usuario';
        await Swal.fire({ icon: 'info', title: 'Registro en edición', text: `No se puede editar. Actualmente lo está editando ${who}.` });
        return;
      }
      // no bloqueado; intentar adquirir el bloqueo
      const res = await acquireUserLock(u.id);
      console.debug('acquireUserLock response', res);
      // Si el backend informa que está bloqueado por otra persona, bloquear.
      if (res.lockedBy) {
        const who = res.lockedBy?.username || res.lockedBy?.name || 'otro usuario';
        // si está bloqueado por el usuario actual, permitir la edición
        const meId = auth?.user?.id ?? auth?.user?.username;
        if (res.lockedBy?.id && meId && String(res.lockedBy.id) !== String(meId)) {
          await Swal.fire({ icon: 'info', title: 'Registro en edición', text: `No se puede editar. Actualmente lo está editando ${who}.` });
          return;
        }
      }
      if (res.ok && !res.unsupported) {
        setHeldLockId(u.id);
        setEditUser(u);
        setShowEditUser(true);
        return;
      }
      if (res.ok && res.unsupported) {
        // el backend no soporta bloqueos; permitir edición como alternativa
        setEditUser(u);
        setShowEditUser(true);
        return;
      }
    } catch (err) {
      console.warn('attemptEdit: lock check failed, allowing edit', err);
      setEditUser(u);
      setShowEditUser(true);
    }
  };

  const closeEditor = async () => {
    if (heldLockId) {
      await releaseUserLock(heldLockId);
      setHeldLockId(null);
    }
    setShowEditUser(false);
    setEditUser(null);
  };

  // intentar liberar el bloqueo al descargar la página (no garantizado)
  useEffect(() => {
    const handler = () => {
      if (heldLockId) {
        try {
          // intento de liberación asíncrona de mejor esfuerzo; puede no completarse al descargar la página
          releaseUserLock(heldLockId);
        } catch (_) {
          // ignore
        }
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [heldLockId]);

  // calcular lista filtrada + ordenada
  const displayed = useMemo(() => {
    // filter
    const filtered = usuarios.filter((u) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(u.id ?? '').toLowerCase().includes(q);
      const usernameMatch = String(u.username ?? '').toLowerCase().includes(q);
      const emailMatch = String(u.email ?? '').toLowerCase().includes(q);
      return idMatch || usernameMatch || emailMatch;
    });

    // sort
    if (!sortKey || !sortDir) return filtered;
    const sorted = [...filtered].sort((a: any, b: any) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === 'asc' ? -1 : 1;
      if (vb == null) return sortDir === 'asc' ? 1 : -1;
      // special handling for boolean (estado)
      if (typeof va === 'boolean' || typeof vb === 'boolean') {
        const na = va ? 1 : 0;
        const nb = vb ? 1 : 0;
        return sortDir === 'asc' ? na - nb : nb - na;
      }
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return sorted;
  }, [usuarios, searchTerm, sortKey, sortDir]);

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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>Gestión de Usuarios</span>
      </h2>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex-shrink-0">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <button onClick={() => setShowAddUser(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer">
                  Agregar nuevo usuario
                </button>
              );
            }
            return <p className="text-sm text-gray-600">Solo administradores pueden gestionar usuarios.</p>;
          })()}
        </div>
        <UserSearch
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm("")}
          placeholder="Buscar por ID, Usuario o Correo"
        />
      </div>

      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UserForm onCancel={() => setShowAddUser(false)} onSave={async ({ username, email, role_id, password, estado }) => {
            setLoading(true);
            try {
              const nuevo = await createUsuario({ username, email, password, estado, role_id });
              setUsuarios((prev: Usuario[]) => [nuevo, ...prev]);
              setShowAddUser(false);
              await Swal.fire({ icon: 'success', title: 'Usuario creado', text: `Usuario ${username} creado correctamente.` });
            } catch (err) {
              console.error("Error creando usuario:", err);
              await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el usuario.' });
            } finally { setLoading(false); }
          }} />
        </div>
      )}

      {showEditUser && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UserForm onCancel={() => setShowEditUser(false)} onSave={async ({ username, email, role_id, estado }) => {
            if (!editUser) return;
            let new_role_id = editUser.role_id ?? 2;
            if (typeof role_id === 'number') new_role_id = role_id;
            setLoading(true);
            try {
              const actualizado = await updateUsuario({ ...editUser, username, email, role_id: new_role_id, estado });
              setUsuarios((prev: Usuario[]) => prev.map((u: Usuario) => (u.id === actualizado.id ? actualizado : u)));
              setShowEditUser(false);
              setEditUser(null);
              await Swal.fire({ icon: 'success', title: 'Usuario actualizado', text: `Usuario ${username} actualizado.` });
            } catch (err) {
              console.error("Error actualizando usuario:", err);
              await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el usuario.' });
            } finally { setLoading(false); }
          }} initial={{ username: editUser.username, email: editUser.email, role_id: editUser.role_id, rol: editUser.role_name, estado: editUser.estado }} isEdit={true} />
        </div>
      )}

      {loading && <p>Cargando usuarios...</p>}
      {!loading && usuarios.length === 0 && <p>No hay usuarios registrados.</p>}

      {!loading && usuarios.length > 0 && (
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
                <th onClick={() => toggleSort('username')} className="p-3 font-semibold w-1/5 text-center cursor-pointer select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span>Usuario</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === 'username' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                      <span className={sortKey === 'username' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                    </span>
                  </div>
                </th>
                <th onClick={() => toggleSort('email')} className="p-3 font-semibold w-2/5 text-center cursor-pointer select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span>Correo</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === 'email' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                      <span className={sortKey === 'email' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                    </span>
                  </div>
                </th>
                <th onClick={() => toggleSort('estado')} className="p-3 font-semibold w-32 text-center cursor-pointer select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span>Estado</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === 'estado' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                      <span className={sortKey === 'estado' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                    </span>
                  </div>
                </th>
                <th onClick={() => toggleSort('role_name')} className="p-3 font-semibold w-32 text-center cursor-pointer select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span>Rol</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === 'role_name' && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                      <span className={sortKey === 'role_name' && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                    </span>
                  </div>
                </th>
                <th className="p-3 font-semibold w-32 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {displayed.map((u, idx) => (
                <UserRow key={u.id} u={u} idx={idx} auth={auth} attemptEdit={attemptEdit} handleEliminar={handleEliminar} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No hay coincidencias */}
      {!loading && usuarios.length > 0 && displayed.length === 0 && (
        <p className="mt-4">No se encontraron usuarios que coincidan con "{searchTerm}".</p>
      )}
      {showEditUser && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UserForm onCancel={closeEditor} onSave={async ({ username, email, role_id, estado }) => {
            if (!editUser) return;
            let new_role_id = editUser.role_id ?? 2;
            if (typeof role_id === 'number') new_role_id = role_id;
            setLoading(true);
            try {
              const actualizado = await updateUsuario({ ...editUser, username, email, role_id: new_role_id, estado });
              setUsuarios((prev: Usuario[]) => prev.map((u: Usuario) => (u.id === actualizado.id ? actualizado : u)));
              // release lock if held
              if (heldLockId) {
                await releaseUserLock(heldLockId);
                setHeldLockId(null);
              }
              setShowEditUser(false);
              setEditUser(null);
              await Swal.fire({ icon: 'success', title: 'Usuario actualizado', text: `Usuario ${username} actualizado.` });
            } catch (err) {
              console.error("Error actualizando usuario:", err);
              await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el usuario.' });
            } finally { setLoading(false); }
          }} initial={editUser} isEdit={true} />
        </div>
      )}
    </div>
  );
}
