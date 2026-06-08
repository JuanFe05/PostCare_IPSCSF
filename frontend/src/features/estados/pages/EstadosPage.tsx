import { useState, useEffect, type ChangeEvent } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import EstadoTable from '../components/EstadoTable';
import EstadoForm from '../components/EstadoForm';
import { getEstados, createEstado, updateEstado, deleteEstado } from '../Estado.api';
import type { EstadoAtencion } from '../types';
import Swal from 'sweetalert2';
import { exportToExcel } from '../../../utils/exportToExcel';

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
              <i className="fas fa-tasks" style={{ color: 'white', fontSize: '1.1rem' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1.05rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                Gestión de Estados de Atención
              </h2>
              <p style={{ color: 'rgba(147,174,245,0.8)', fontSize: '0.78rem', margin: 0 }}>
                {estados.length > 0 ? `${estados.length} registro${estados.length !== 1 ? 's' : ''} cargados` : 'Cargando...'}
              </p>
            </div>
          </div>
          {role === 'ADMINISTRADOR' && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAdd(true)}
                className="ui-btn ui-btn-ghost"
                style={{ height: '38px' }}
              >
                <i className="fas fa-plus" style={{ fontSize: '0.8rem' }} />
                Agregar Estado
              </button>
              <button
                onClick={() => exportToExcel(estados, 'estados')}
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
              placeholder="Buscar estados..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="ui-input"
              style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.875rem' }}
              title="Buscar por: ID, Nombre o Descripción"
            />
          </div>
        </div>

        {/* Tabla */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <EstadoTable estados={estados} loading={loading} searchTerm={searchTerm} auth={auth} attemptEdit={attemptEdit} handleEliminar={handleEliminar} />
        </div>
      </div>

      {showAdd && (
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
      )}

      {showEdit && editEstado && (
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
      )}
    </div>
  );
}
