import { useState, useEffect, type ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../hooks/useAuth';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { Paciente } from '../types';
import { getPacientes, deletePaciente, updatePaciente, acquirePacienteLock, releasePacienteLock, checkPacienteLock } from '../Paciente.api';
import PacienteForm from '../components/PacienteForm';
import PacienteTable from '../components/PacienteTable';
import { exportToExcel } from '../../../utils/exportToExcel';

export default function PacientesPage() {
  const { auth } = useAuth();
  const { subscribe } = useWebSocket();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditPaciente, setShowEditPaciente] = useState(false);
  const [editPaciente, setEditPaciente] = useState<Paciente | null>(null);
  const [heldLockId, setHeldLockId] = useState<string | null>(null);

  useEffect(() => {
    loadPacientes();
  }, []);

  // Suscribirse a eventos WebSocket para pacientes
  useEffect(() => {
    const unsubscribe = subscribe('pacientes', (message) => {
      console.log('[Pacientes] Evento WebSocket:', message);
      
      if (message.event === 'create') {
        // Añadir nuevo paciente al inicio
        setPacientes((prev) => {
          const exists = prev.some(p => p.id === message.data.id);
          if (exists) return prev;
          return [message.data, ...prev];
        });
      } else if (message.event === 'update') {
        // Actualizar paciente existente
        setPacientes((prev) =>
          prev.map((p) => (p.id === message.data.id ? message.data : p))
        );
      } else if (message.event === 'delete') {
        // Eliminar paciente
        setPacientes((prev) =>
          prev.filter((p) => p.id !== message.data.id)
        );
      }
    });

    return () => unsubscribe();
  }, [subscribe]);

  const loadPacientes = async () => {
    try {
      setLoading(true);
      const data = await getPacientes();
      console.log('Pacientes cargados:', data);
      setPacientes(data);
    } catch (error: any) {
      console.error('Error cargando pacientes:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.detail || error.message || 'Error desconocido';
      // Mostrar mensaje de error inline en la página en lugar de un modal
      console.warn('No se pudieron cargar los pacientes:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al paciente ${nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await deletePaciente(id);
        await loadPacientes();
        Swal.fire('Eliminado', 'El paciente ha sido eliminado correctamente', 'success');
      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || 'No se pudo eliminar el paciente';
        Swal.fire('Error', errorMsg, 'error');
      }
    }
  };

  const attemptEdit = async (paciente: Paciente) => {
    if (!paciente.id) {
      setEditPaciente(paciente);
      setShowEditPaciente(true);
      return;
    }
    try {
      const status = await checkPacienteLock(paciente.id);
      if (status.locked) {
        const by = status.lockedBy;
        const who = by?.username || by?.name || 'otro usuario';
        await Swal.fire({ icon: 'info', title: 'Registro en edición', text: `No se puede editar. Actualmente lo está editando ${who}.` });
        return;
      }

      const res = await acquirePacienteLock(paciente.id);
      if (res.lockedBy) {
        const who = res.lockedBy?.username || res.lockedBy?.name || 'otro usuario';
        const meId = auth?.user?.id ?? auth?.user?.username;
        if (res.lockedBy?.id && meId && String(res.lockedBy.id) !== String(meId)) {
          await Swal.fire({ icon: 'info', title: 'Registro en edición', text: `No se puede editar. Actualmente lo está editando ${who}.` });
          return;
        }
      }

      if (res.ok && !res.unsupported) {
        setHeldLockId(paciente.id);
        setEditPaciente(paciente);
        setShowEditPaciente(true);
        return;
      }

      if (res.ok && res.unsupported) {
        // backend doesn't support locks — allow edit
        setEditPaciente(paciente);
        setShowEditPaciente(true);
        return;
      }
    } catch (err) {
      console.warn('attemptEdit: lock check failed, allowing edit', err);
      setEditPaciente(paciente);
      setShowEditPaciente(true);
    }
  };

  const closeEditor = async () => {
    if (heldLockId) {
      try { await releasePacienteLock(heldLockId); } catch (_) { /* best-effort */ }
      setHeldLockId(null);
    }
    setShowEditPaciente(false);
    setEditPaciente(null);
  };

  // try to release lock on unload (best-effort)
  useEffect(() => {
    const handler = () => {
      if (heldLockId) {
        try { releasePacienteLock(heldLockId); } catch (_) { /* ignore */ }
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [heldLockId]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();

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
              <i className="fas fa-user-injured" style={{ color: 'white', fontSize: '1.1rem' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1.05rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                Gestión de Pacientes
              </h2>
              <p style={{ color: 'rgba(147,174,245,0.8)', fontSize: '0.78rem', margin: 0 }}>
                {pacientes.length > 0 ? `${pacientes.length} registro${pacientes.length !== 1 ? 's' : ''} cargados` : 'Cargando...'}
              </p>
            </div>
          </div>
          {role === 'ADMINISTRADOR' && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => exportToExcel(pacientes, 'pacientes')}
                className="ui-btn ui-btn-ghost"
                style={{ height: '38px' }}
              >
                <i className="fas fa-file-excel" style={{ fontSize: '0.8rem' }} />
                Exportar
              </button>
            </div>
          )}
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
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={handleSearch}
              className="ui-input"
              style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.875rem' }}
              title="Buscar por: ID, Nombre, Apellido o Email"
            />
          </div>
        </div>

        {/* Tabla */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <PacienteTable
            pacientes={pacientes}
            loading={loading}
            searchTerm={searchTerm}
            auth={auth}
            attemptEdit={attemptEdit}
            handleEliminar={handleEliminar}
          />
        </div>
      </div>

      <PacienteForm
        isOpen={showEditPaciente}
        isEditMode
        initialData={editPaciente ?? undefined}
        onCancel={closeEditor}
        onUpdate={async (id: string, data: any) => {
          setLoading(true);
          try {
            await updatePaciente(id, data);
            await loadPacientes();
            if (heldLockId) {
              try { await releasePacienteLock(heldLockId); } catch (e) { /* best-effort */ }
              setHeldLockId(null);
            }
            setShowEditPaciente(false);
            setEditPaciente(null);
            await Swal.fire('Actualizado', 'Paciente actualizado correctamente', 'success');
          } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'No se pudo actualizar el paciente';
            await Swal.fire('Error', errorMsg, 'error');
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}

