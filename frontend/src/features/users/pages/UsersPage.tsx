import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from '../../../hooks/useAuth';
import type { Usuario } from "../types";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, acquireUserLock, releaseUserLock, checkUserLock } from "../Users.api";
import Swal from "sweetalert2";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";
import Search from "../../../components/search/Search";

export default function UsersPage() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>Gestión de Usuarios</span>
      </h2>

      <div className="mb-6 flex items-center justify-between">
        {/* CONTENEDOR IZQUIERDO (Agregar + Exportar Excel) */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  {/* Botón AGREGAR USUARIO */}
                  <button
                    onClick={() => setShowAddUser(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer"
                  >
                    Agregar nuevo usuario
                  </button>

                  {/* Botón EXPORTAR EXCEL */}
                  <ExportExcel data={usuarios} fileName="usuarios.xlsx" />
                </>
              );
            }

            return (
              <p className="text-sm text-gray-600">
                Solo administradores pueden gestionar usuarios.
              </p>
            );
          })()}
        </div>

        <Search 
          value={searchTerm} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
          onClear={() => setSearchTerm('')} 
          placeholder="Buscar por ID, Usuario o Correo"
        />
      </div>

      {/* Modal Agregar Usuario */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UserForm 
            onCancel={() => setShowAddUser(false)} 
            onSave={async ({ username, email, role_id, password, estado }) => {
              setLoading(true);
              try {
                const nuevo = await createUsuario({ username, email, password, estado, role_id });
                setUsuarios((prev: Usuario[]) => [nuevo, ...prev]);
                setShowAddUser(false);
                await Swal.fire({ icon: 'success', title: 'Usuario creado', text: `Usuario ${username} creado correctamente.` });
              } catch (err) {
                console.error("Error creando usuario:", err);
                await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el usuario.' });
              } finally { 
                setLoading(false); 
              }
            }} 
          />
        </div>
      )}

      {/* Modal Editar Usuario */}
      {showEditUser && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UserForm 
            onCancel={closeEditor} 
            onSave={async ({ username, email, role_id, estado }) => {
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
              } finally { 
                setLoading(false); 
              }
            }} 
            initial={editUser} 
            isEdit={true} 
          />
        </div>
      )}

      {/* Tabla de Usuarios */}
      <UserTable
        usuarios={usuarios}
        loading={loading}
        searchTerm={searchTerm}
        auth={auth}
        attemptEdit={attemptEdit}
        handleEliminar={handleEliminar}
      />
    </div>
  );
}
