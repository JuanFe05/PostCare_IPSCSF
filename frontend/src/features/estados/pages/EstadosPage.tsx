import { useState, useEffect, type ChangeEvent } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import EstadoTable from '../components/EstadoTable';
import EstadoForm from '../components/EstadoForm';
import { getEstados, createEstado, updateEstado, deleteEstado } from '../Estado.api';
import type { EstadoAtencion } from '../types';
import Swal from 'sweetalert2';
import { exportToExcel } from '../../../utils/exportToExcel';
import { Card, CardHeader, CardBody, Button } from '../../../components/notus';

export default function EstadosPage() {
  const { auth } = useAuth();
  const [estados, setEstados] = useState<EstadoAtencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editEstado, setEditEstado] = useState<EstadoAtencion | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getEstados();
      setEstados(data);
    } catch (err) {
      console.error('Error cargando estados:', err);
    } finally { setLoading(false); }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    try {
      await deleteEstado(id);
      setEstados(prev => prev.filter(e => e.id !== id));
      await Swal.fire('Eliminado', `Estado ${nombre} eliminado`, 'success');
    } catch (err: any) {
      console.error('Error eliminando estado:', err);
      await Swal.fire('Error', err?.response?.data?.detail || 'No se pudo eliminar', 'error');
    }
  };

  const attemptEdit = (e: EstadoAtencion) => { setEditEstado(e); setShowEdit(true); };

  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();

  return (
    <div>
      <Card>
        <CardHeader color="lightBlue" className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-tasks text-2xl text-white"></i>
            <h6 className="text-lg font-bold text-white uppercase m-0">Gestión de Estados de Atención</h6>
          </div>
          {role === 'ADMINISTRADOR' && (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAdd(true)}
                color="white"
                size="sm"
              >
                <i className="fas fa-plus mr-2"></i>
                AGREGAR ESTADO
              </Button>
              <Button
                color="white"
                size="sm"
                onClick={() => exportToExcel(estados, 'estados')}
              >
                <i className="fas fa-file-excel mr-2"></i>
                EXPORTAR
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardBody>
          {/* Buscador */}
          <div className="mb-8">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar estados por ID, nombre o descripción..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>
          </div>

          <EstadoTable estados={estados} loading={loading} searchTerm={searchTerm} auth={auth} attemptEdit={attemptEdit} handleEliminar={handleEliminar} />
        </CardBody>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <EstadoForm onCancel={() => setShowAdd(false)} onSave={async (payload) => {
            setLoading(true);
            try {
              const created = await createEstado(payload);
              setEstados(prev => [created, ...prev]);
              setShowAdd(false);
              await Swal.fire('Creado', 'Estado creado correctamente', 'success');
            } catch (err) {
              console.error('Error creando estado:', err);
              await Swal.fire('Error', 'No se pudo crear el estado', 'error');
            } finally { setLoading(false); }
          }} />
        </div>
      )}

      {showEdit && editEstado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <EstadoForm isEdit initial={editEstado} onCancel={() => { setShowEdit(false); setEditEstado(null); }} onSave={async (payload) => {
            setLoading(true);
            try {
              const updated = await updateEstado(editEstado.id, payload);
              setEstados(prev => prev.map(e => e.id === updated.id ? updated : e));
              setShowEdit(false);
              setEditEstado(null);
              await Swal.fire('Actualizado', 'Estado actualizado correctamente', 'success');
            } catch (err) {
              console.error('Error actualizando estado:', err);
              await Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
            } finally { setLoading(false); }
          }} />
        </div>
      )}
    </div>
  );
}
