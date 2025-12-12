import { useState, useEffect, type ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../hooks/useAuth';
import type { Paciente } from '../types';
import { getPacientes, deletePaciente, updatePaciente } from '../Paciente.api';
import PacienteForm from '../components/PacienteForm';
import PacienteTable from '../components/PacienteTable';
import ExportExcel from '../../../components/exportExcel/ExportExcelButton';
import Search from '../../../components/search/Search';

export default function PacientesPage() {
  const { auth } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditPaciente, setShowEditPaciente] = useState(false);
  const [editPaciente, setEditPaciente] = useState<Paciente | null>(null);

  useEffect(() => {
    loadPacientes();
  }, []);

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
    setEditPaciente(paciente);
    setShowEditPaciente(true);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
      </div>

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
            onCancel={() => { setShowEditPaciente(false); setEditPaciente(null); }}
            onUpdate={async (id: string, data: any) => {
              setLoading(true);
              try {
                await updatePaciente(id, data);
                await loadPacientes();
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

