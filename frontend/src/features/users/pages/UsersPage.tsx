import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from '../../../hooks/useAuth';
import type { Usuario } from "../types";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, acquireUserLock, releaseUserLock, checkUserLock } from "../Users.api";
import Swal from "sweetalert2";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";
import { exportToExcel } from '../../../utils/exportToExcel';

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
    <div className="animate-fade-in-up">
      {/* Header de la página */}
      <div
        className="rounded-2xl mb-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d1f6b 0%, #1a338e 55%, #2248b3 100%)',
          boxShadow: '0 4px 20px rgba(13,31,107,0.2)',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 90% 50%, rgba(14,165,233,0.15) 0%, transparent 50%)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
          }}
        />
        <div className="relative flex items-center justify-between px-6 py-4 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <i className="fas fa-users-cog" style={{ color: 'white', fontSize: '1.1rem' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1.05rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                Gestión de Usuarios
              </h2>
              <p style={{ color: 'rgba(147,174,245,0.8)', fontSize: '0.78rem', margin: 0 }}>
                {usuarios.length > 0 ? `${usuarios.length} registro${usuarios.length !== 1 ? 's' : ''} cargados` : 'Cargando...'}
              </p>
            </div>
          </div>
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowAddUser(true)}
                    className="ui-btn ui-btn-ghost"
                    style={{ height: '38px' }}
                  >
                    <i className="fas fa-plus" style={{ fontSize: '0.8rem' }} />
                    Agregar Usuario
                  </button>
                  <button
                    onClick={() => exportToExcel(usuarios, 'usuarios')}
                    className="ui-btn ui-btn-ghost"
                    style={{ height: '38px' }}
                  >
                    <i className="fas fa-file-excel" style={{ fontSize: '0.8rem' }} />
                    Exportar
                  </button>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Tarjeta principal */}
      <div className="ui-card animate-fade-in-up stagger-1">
        {/* Barra de búsqueda */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--surface-border)',
            background: 'var(--brand-50)',
          }}
        >
          <div className="relative ml-auto" style={{ minWidth: '280px', flex: '1 1 280px', maxWidth: '400px' }}>
            <i
              className="fas fa-search"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="ui-input"
              style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.875rem' }}
              title="Buscar por: ID, Nombre de Usuario o Email"
            />
          </div>
        </div>

        {/* Tabla */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <UserTable
            usuarios={usuarios}
            loading={loading}
            searchTerm={searchTerm}
            auth={auth}
            attemptEdit={attemptEdit}
            handleEliminar={handleEliminar}
          />
        </div>
      </div>

      {/* Modal Agregar Usuario */}
      <UserForm
        isOpen={showAddUser}
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

      {/* Modal Editar Usuario */}
      <UserForm
        isOpen={showEditUser}
        isEdit={true}
        initial={editUser ?? undefined}
        onCancel={closeEditor}
        onSave={async ({ username, email, role_id, estado }) => {
          if (!editUser) return;
          let new_role_id = editUser.role_id ?? 2;
          if (typeof role_id === 'number') new_role_id = role_id;
          setLoading(true);
          try {
            const actualizado = await updateUsuario({ ...editUser, username, email, role_id: new_role_id, estado });
            setUsuarios((prev: Usuario[]) => prev.map((u: Usuario) => (u.id === actualizado.id ? actualizado : u)));
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
      />
    </div>
  );
}
