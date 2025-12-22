import { useState, useEffect, type ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../hooks/useAuth';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { Paciente } from '../types';
import { getPacientes, deletePaciente, updatePaciente, acquirePacienteLock, releasePacienteLock, checkPacienteLock } from '../Paciente.api';
import PacienteForm from '../components/PacienteForm';
import PacienteTable from '../components/PacienteTable';
import ExportExcel from '../../../components/exportExcel/ExportExcelButton';
import Search from '../../../components/search/Search';

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
      Swal.fire('Error', `No se pudieron cargar los pacientes: ${errorMsg}`, 'error');
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

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>Gestión de Pacientes</span>
      </h2>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex-shrink-0 flex items-center gap-3">
          {role === 'ADMINISTRADOR' && (
            <ExportExcel
              data={pacientes}
              fileName="pacientes"
            />
          )}
        </div>

        <Search value={searchTerm} onChange={handleSearch} onClear={handleClearSearch} placeholder="Buscar por ID, Nombre, Teléfono o Email" />
      </div>

      <PacienteTable
        pacientes={pacientes}
        loading={loading}
        searchTerm={searchTerm}
        auth={auth}
        attemptEdit={attemptEdit}
        handleEliminar={handleEliminar}
      />

      {showEditPaciente && editPaciente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <PacienteForm
            isEditMode
            initialData={editPaciente}
            onCancel={closeEditor}
            onUpdate={async (id: string, data: any) => {
              setLoading(true);
              try {
                await updatePaciente(id, data);
                await loadPacientes();
                // release lock if held
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
      )}
    </div>
  );
}

