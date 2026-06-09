import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../hooks/useAuth";
import SeguimientoForm from "../components/SeguimientoForm";
import SeguimientoTable from "../components/SeguimientoTable";
import { getTiposSeguimiento, createTipoSeguimiento, updateTipoSeguimiento, deleteTipoSeguimiento } from "../Seguimiento.api";
import { exportToExcel } from '../../../utils/exportToExcel';

export interface TipoSeguimiento {
  id: number;
  nombre: string;
  descripcion?: string;
}

export default function TiposSeguimientoPage() {
  const [tipos, setTipos] = useState<TipoSeguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTipo, setEditTipo] = useState<TipoSeguimiento | null>(null);
  const { auth } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTiposSeguimiento();
      setTipos(data);
    } catch (err) {
      console.error("Error cargando tipos de seguimiento:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    const res = await Swal.fire({
      title: `¿Eliminar ${nombre}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });
    if (!res.isConfirmed) return;
    try {
      await deleteTipoSeguimiento(id);
      setTipos((prev: TipoSeguimiento[]) => prev.filter((t: TipoSeguimiento) => t.id !== id));
      await Swal.fire({ icon: 'success', title: 'Eliminado', text: `${nombre} eliminado.` });
    } catch (err) {
      console.error('Error eliminando tipo seguimiento:', err);
      await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.' });
    }
  };

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
              <i className="fas fa-search" style={{ color: 'white', fontSize: '1.1rem' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1.05rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                Gestión de Tipos de Seguimiento
              </h2>
              <p style={{ color: 'rgba(147,174,245,0.8)', fontSize: '0.78rem', margin: 0 }}>
                {tipos.length > 0 ? `${tipos.length} registro${tipos.length !== 1 ? 's' : ''} cargados` : 'Cargando...'}
              </p>
            </div>
          </div>
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowAdd(true)}
                    className="ui-btn ui-btn-ghost"
                    style={{ height: '38px' }}
                  >
                    <i className="fas fa-plus" style={{ fontSize: '0.8rem' }} />
                    Agregar Tipo
                  </button>
                  <button
                    onClick={() => exportToExcel(tipos, 'tipos-seguimiento')}
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
              placeholder="Buscar tipos de seguimiento..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="ui-input"
              style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.875rem' }}
              title="Buscar por: Nombre o Descripción"
            />
          </div>
        </div>

        {/* Tabla */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <SeguimientoTable
            tipos={tipos}
            loading={loading}
            searchTerm={searchTerm}
            auth={auth}
            setEditTipo={setEditTipo}
            setShowEdit={setShowEdit}
            handleDelete={handleDelete}
          />
        </div>
      </div>

      {/* ADD MODAL */}
      <SeguimientoForm
        isOpen={showAdd}
        isEdit={false}
        onCancel={() => setShowAdd(false)}
        onSave={async (payload) => {
          setLoading(true);
          try {
            const created = await createTipoSeguimiento(payload);
            setTipos((prev: TipoSeguimiento[]) => [created, ...prev]);
            setShowAdd(false);
            await Swal.fire({ icon: 'success', title: 'Creado', text: `Tipo ${created.nombre} creado.` });
          } catch (err) {
            console.error('Error creando tipo seguimiento:', err);
            await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear.' });
          } finally {
            setLoading(false);
          }
        }}
      />

      {/* EDIT MODAL */}
      <SeguimientoForm
        isOpen={showEdit}
        isEdit
        initial={editTipo ? { nombre: editTipo.nombre, descripcion: editTipo.descripcion } : undefined}
        onCancel={() => { setShowEdit(false); setEditTipo(null); }}
        onSave={async (payload) => {
          if (!editTipo) return;
          setLoading(true);
          try {
            const updated = await updateTipoSeguimiento(editTipo.id, payload);
            setTipos((prev: TipoSeguimiento[]) => prev.map((p: TipoSeguimiento) => p.id === updated.id ? updated : p));
            setShowEdit(false);
            setEditTipo(null);
            await Swal.fire({ icon: 'success', title: 'Actualizado', text: `Tipo ${updated.nombre} actualizado.` });
          } catch (err) {
            console.error('Error actualizando tipo seguimiento:', err);
            await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar.' });
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}
