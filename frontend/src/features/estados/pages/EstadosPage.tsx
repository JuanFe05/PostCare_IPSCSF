import { useState, useEffect, type ChangeEvent } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import EstadoTable from '../components/EstadoTable';
import EstadoForm from '../components/EstadoForm';
import { getEstados, createEstado, updateEstado, deleteEstado } from '../Estado.api';
import type { EstadoAtencion } from '../types';
import Swal from 'sweetalert2';
import Search from '../../../components/search/Search';
import { IoMdAddCircleOutline } from 'react-icons/io';

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
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Estados de Atención</h2>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex-shrink-0 flex items-center gap-3">
          {role === 'ADMINISTRADOR' ? (
            <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2"><IoMdAddCircleOutline />Agregar estado</button>
          ) : (
            <p className="text-sm text-gray-600">Solo administradores pueden gestionar estados.</p>
          )}
        </div>

        <Search value={searchTerm} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} onClear={() => setSearchTerm('')} placeholder="Buscar por ID, nombre o descripción" />
      </div>

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

      <EstadoTable estados={estados} loading={loading} searchTerm={searchTerm} auth={auth} attemptEdit={attemptEdit} handleEliminar={handleEliminar} />
    </div>
  );
}
