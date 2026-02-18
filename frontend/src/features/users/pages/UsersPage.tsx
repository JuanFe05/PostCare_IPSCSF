import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from '../../../hooks/useAuth';
import type { Usuario } from "../types";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, acquireUserLock, releaseUserLock, checkUserLock } from "../Users.api";
import Swal from "sweetalert2";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";
import { exportToExcel } from '../../../utils/exportToExcel';
import { Card, CardHeader, CardBody, Button } from "../../../components/notus";

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
    <div>
      <Card>
        <CardHeader color="lightBlue" className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-users-cog text-2xl text-white"></i>
            <h6 className="text-lg font-bold text-white uppercase m-0">Gestión de Usuarios</h6>
          </div>
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowAddUser(true)}
                    color="white"
                    size="sm"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    AGREGAR USUARIO
                  </Button>
                  <Button
                    color="white"
                    size="sm"
                    onClick={() => exportToExcel(usuarios, 'usuarios')}
                  >
                    <i className="fas fa-file-excel mr-2"></i>
                    EXPORTAR
                  </Button>
                </div>
              );
            }
            return null;
          })()}
        </CardHeader>
        
        <CardBody>
          {/* Buscador */}
          <div className="mb-8 flex justify-end">
            <div className="relative max-w-md w-full">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 h-[52px] border-2 border-gray-200 rounded-lg bg-white font-medium shadow-sm hover:shadow-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
                title="Buscar por: ID, Nombre de Usuario o Email"
              />
            </div>
          </div>

          {/* Tabla */}
          <UserTable
            usuarios={usuarios}
            loading={loading}
            searchTerm={searchTerm}
            auth={auth}
            attemptEdit={attemptEdit}
            handleEliminar={handleEliminar}
          />
        </CardBody>
      </Card>

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
    </div>
  );
}
