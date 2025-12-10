import { useState, useEffect, type ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../hooks/useAuth';
import type { Paciente } from '../types';
import { getPacientes, deletePaciente } from '../Paciente.api';
import PacienteTable from '../components/PacienteTable';
import ExportExcel from '../../../components/exportExcel/ExportExcelButton';
import Search from '../../../components/search/Search';

export default function PacientesPage() {
  const { auth } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const attemptEdit = async () => {
    Swal.fire('En desarrollo', 'La edición de pacientes estará disponible próximamente', 'info');
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

      <div className="mb-6 flex items-center justify-between gap-4">
        {role === 'ADMINISTRADOR' ? (
          <div className="flex gap-2">
            <ExportExcel
              data={pacientes}
              fileName="pacientes"
            />
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            Solo los administradores pueden exportar datos
          </div>
        )}

        <Search value={searchTerm} onChange={handleSearch} onClear={handleClearSearch} placeholder="Buscar pacientes..." />
      </div>

      <PacienteTable
        pacientes={pacientes}
        loading={loading}
        searchTerm={searchTerm}
        auth={auth}
        attemptEdit={attemptEdit}
        handleEliminar={handleEliminar}
      />
    </div>
  );
}

