import { useState, useEffect, type ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../hooks/useAuth';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { Paciente } from '../types';
import { getPacientes, deletePaciente, updatePaciente, acquirePacienteLock, releasePacienteLock, checkPacienteLock } from '../Paciente.api';
import PacienteForm from '../components/PacienteForm';
import PacienteTable from '../components/PacienteTable';
import { exportToExcel } from '../../../utils/exportToExcel';
import { Card, CardHeader, CardBody, Button } from '../../../components/notus';

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

  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();

  return (
    <div>
      <Card>
        <CardHeader color="lightBlue" className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-user-injured text-2xl text-white"></i>
            <h6 className="text-lg font-bold text-white uppercase m-0">Gestión de Pacientes</h6>
          </div>
          {role === 'ADMINISTRADOR' && (
            <Button
              color="white"
              size="sm"
              onClick={() => exportToExcel(pacientes, 'pacientes')}
            >
              <i className="fas fa-file-excel mr-2"></i>
              EXPORTAR
            </Button>
          )}
        </CardHeader>
        
        <CardBody>
          {/* Buscador */}
          <div className="mb-8">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar pacientes por ID, nombre, teléfono o email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>
          </div>

          <PacienteTable
            pacientes={pacientes}
            loading={loading}
            searchTerm={searchTerm}
            auth={auth}
            attemptEdit={attemptEdit}
            handleEliminar={handleEliminar}
          />
        </CardBody>
      </Card>

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

