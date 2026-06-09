import { useState, useEffect } from "react";
import { useAuth } from '../../../hooks/useAuth';
import { getRoles, updateRol, acquireRoleLock, releaseRoleLock, checkRoleLock } from "../Role.api";
import RoleForm from "../components/RoleForm";
import RoleTable from "../components/RoleTable";
import Swal from 'sweetalert2';
import { exportToExcel } from '../../../utils/exportToExcel';

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [heldLockId, setHeldLockId] = useState<number | null>(null);
  const { auth } = useAuth();

  // CARGAR ROLES
  useEffect(() => {
    getRoles()
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error cargando roles:", err))
      .finally(() => setLoading(false));
  }, []);

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
      try { await releaseRoleLock(heldLockId); } catch (_) { /* best-effort */ }
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
              <i className="fas fa-user-shield" style={{ color: 'white', fontSize: '1.1rem' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1.05rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                Gestión de Roles
              </h2>
              <p style={{ color: 'rgba(147,174,245,0.8)', fontSize: '0.78rem', margin: 0 }}>
                {roles.length > 0 ? `${roles.length} registro${roles.length !== 1 ? 's' : ''} cargados` : 'Cargando...'}
              </p>
            </div>
          </div>
          {(() => {
            const roleName = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (roleName === 'ADMINISTRADOR') {
              return (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => exportToExcel(roles, 'roles')}
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
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <RoleTable
            roles={roles}
            loading={loading}
            auth={auth}
            attemptEdit={attemptEdit}
          />
        </div>
      </div>

      {/* EDIT MODAL */}
      <RoleForm
        isOpen={showEdit}
        initial={editRole ?? undefined}
        isEdit={true}
        onCancel={async () => { await closeEditor(); }}
        onSave={async (payload) => {
          if (!editRole) return;
          try {
            const updated = await updateRol({ id: editRole.id, nombre: payload.nombre ?? '', descripcion: payload.descripcion ?? '' });
            setRoles((prev: Role[]) => prev.map((rr: Role) => (rr.id === updated.id ? updated : rr)));
            if (heldLockId) {
              try { await releaseRoleLock(heldLockId); } catch (e) { /* best-effort */ }
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
  );
}
