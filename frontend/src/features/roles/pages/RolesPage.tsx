import { useState, useEffect } from "react";
import { useAuth } from '../../../hooks/useAuth';
import { getRoles, updateRol, acquireRoleLock, releaseRoleLock, checkRoleLock } from "../Role.api";
import RoleForm from "../components/RoleForm";
import RoleTable from "../components/RoleTable";
import Swal from 'sweetalert2';
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";

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
    <div className="py-6">
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

      {/* EDIT MODAL */}
      {showEdit && editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <RoleForm
            initial={editRole}
            isEdit={true}
            onCancel={async () => { await closeEditor(); }}
            onSave={async (payload) => {
              try {
                const updated = await updateRol({ id: editRole.id, nombre: payload.nombre ?? '', descripcion: payload.descripcion ?? '' });
                setRoles((prev: Role[]) => prev.map((rr: Role) => (rr.id === updated.id ? updated : rr)));
                // release lock if held
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
      )}

      {/* Tabla de Roles */}
      <RoleTable
        roles={roles}
        loading={loading}
        auth={auth}
        attemptEdit={attemptEdit}
      />
    </div>
  );
}
