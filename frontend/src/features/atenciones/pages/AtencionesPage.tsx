import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useWebSocket } from "../../../hooks/useWebSocket";
import type { Atencion, NewAtencionConPaciente, UpdateAtencion, EstadoAtencion, SeguimientoAtencion } from "../types";
import { getAtenciones, getAtencionesByRango, createAtencionConPaciente, updateAtencion, deleteAtencion, acquireAtencionLock, releaseAtencionLock, checkAtencionLock, getEstadosAtencion, getSeguimientosAtencion } from "../Atencion.api";
import { syncPacientesRangoFechas } from "../../../api/Sync.api";
import Swal from "sweetalert2";
import AtencionForm from "../components/AtencionForm";
import SyncModal from "../components/SyncModal";
import ExportDateRangeModal from "../components/ExportDateRangeModal";
import AtencionTable from '../components/AtencionTable';
import { prepareAtencionesPorServicio } from "../utils";

export default function AtencionesPage() {
  const [showAddAtencion, setShowAddAtencion] = useState(false);
  const [showEditAtencion, setShowEditAtencion] = useState(false);
  const [editAtencion, setEditAtencion] = useState<Atencion | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [estados, setEstados] = useState<EstadoAtencion[]>([]);
  const [seguimientos, setSeguimientos] = useState<SeguimientoAtencion[]>([]);
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  const [selectedSeguimientoId, setSelectedSeguimientoId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [heldLockId, setHeldLockId] = useState<string | null>(null);

  const { auth } = useAuth();
  const { subscribe } = useWebSocket();

  const loadAtenciones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAtenciones(0, 500, selectedDate ?? undefined);
      console.log("Atenciones recibidas:", data);
      console.log("Total de atenciones:", data.length);
      setAtenciones(data);
    } catch (err) {
      console.error("Error al cargar atenciones:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadAtenciones();
  }, [loadAtenciones]);

  // cargar listas para filtros
  useEffect(() => {
    (async () => {
      try {
        const e = await getEstadosAtencion();
        setEstados(e);
      } catch (err) {
        console.error('Error cargando estados:', err);
      }
      try {
        const s = await getSeguimientosAtencion();
        setSeguimientos(s);
      } catch (err) {
        console.error('Error cargando seguimientos:', err);
      }
    })();
  }, []);



  // Suscribirse a eventos WebSocket para atenciones
  useEffect(() => {
    const unsubscribe = subscribe('atenciones', (message) => {
      console.log('[Atenciones] Evento WebSocket:', message);
      
      if (message.event === 'create') {
        // Añadir nueva atención al inicio
        setAtenciones((prev) => {
          const exists = prev.some(a => a.id_atencion === message.data.id_atencion);
          if (exists) return prev;
          return [message.data, ...prev];
        });
      } else if (message.event === 'update') {
        // Actualizar atención existente
        setAtenciones((prev) =>
          prev.map((a) => (a.id_atencion === message.data.id_atencion ? message.data : a))
        );
      } else if (message.event === 'delete') {
        // Eliminar atención
        setAtenciones((prev) =>
          prev.filter((a) => a.id_atencion !== message.data.id_atencion)
        );
      }
    });

    return () => unsubscribe();
  }, [subscribe]);

  const handleSync = async (fechaInicio: string, fechaFin: string) => {
    try {
      const result = await syncPacientesRangoFechas({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });
      
      await loadAtenciones();
      
      Swal.fire({
        icon: 'success',
        title: 'Sincronización exitosa',
        html: `
          <div class="text-left space-y-2">
            <p class="font-bold text-lg mb-2">Pacientes:</p>
            <p><strong>Creados:</strong> ${result.pacientes.creados}</p>
            <p><strong>Actualizados:</strong> ${result.pacientes.actualizados}</p>
            <p><strong>Omitidos:</strong> ${result.pacientes.omitidos}</p>
            
            <p class="font-bold text-lg mt-4 mb-2">Atenciones:</p>
            <p><strong>Creadas:</strong> ${result.atenciones.creadas}</p>
            <p><strong>Actualizadas:</strong> ${result.atenciones.actualizadas}</p>
            <p><strong>Omitidas:</strong> ${result.atenciones.omitidas}</p>
            
            <p class="font-bold text-lg mt-4 mb-2">Resumen:</p>
            <p><strong>Registros procesados:</strong> ${result.registros_procesados}</p>
          </div>
        `,
      });
    } catch (error) {
      const axiosErr = error as { response?: { data?: { detail?: string } } };
      const errorMsg = axiosErr.response?.data?.detail || 'Error al sincronizar datos';
      Swal.fire('Error', errorMsg, 'error');
    }
  };

  const handleExportWithRange = async (startDate: Date, endDate: Date) => {
    setIsExporting(true);
    
    try {
      // Formatear fechas a YYYY-MM-DD
      const inicio = startDate.toISOString().split('T')[0];
      const fin = endDate.toISOString().split('T')[0];
      
      // Obtener datos del servidor filtrados por rango
      const atencionesFiltradas = await getAtencionesByRango(inicio, fin);
      
      if (!atencionesFiltradas || atencionesFiltradas.length === 0) {
        setShowExportModal(false);
        setIsExporting(false);
        Swal.fire({
          icon: 'info',
          title: 'Sin datos',
          text: 'No se encontraron atenciones en el rango seleccionado',
          confirmButtonColor: '#1938bc'
        });
        return;
      }
      
      // Preparar datos para exportación
      const datosPreparados = prepareAtencionesPorServicio(atencionesFiltradas);
      
      // Importar dinámicamente la función de exportación
      const { exportToExcel } = await import("../../../utils/exportToExcel");
      exportToExcel(datosPreparados, "atenciones.xlsx");
      
      // Cerrar modal y mostrar éxito
      setShowExportModal(false);
      setIsExporting(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Exportación exitosa',
        text: `Se han exportado ${atencionesFiltradas.length} atenciones`,
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      setIsExporting(false);
      console.error('Error al exportar:', error);
      const exportErr = error as { message?: string };
      if (exportErr?.message !== 'Exportación cancelada') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: exportErr?.message || 'No se pudo exportar los datos',
          confirmButtonColor: '#1938bc'
        });
      }
    }
  };

  const handleEliminar = async (id: string, nombrePaciente: string) => {
    const result = await Swal.fire({
      title: `¿Eliminar la atención del paciente "${nombrePaciente}"?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteAtencion(id);
      setAtenciones((prev: Atencion[]) => prev.filter((a: Atencion) => a.id_atencion !== id));
      await Swal.fire({ title: "Eliminada", text: `La atención ha sido eliminada.`, icon: "success" });
    } catch (error) {
      console.error("Error al eliminar:", error);
      await Swal.fire({ title: "Error", text: "No se pudo eliminar la atención.", icon: "error" });
    }
  };

  const attemptEdit = async (atencion: Atencion) => {
    if (!atencion.id_atencion) {
      setEditAtencion(atencion);
      setShowEditAtencion(true);
      return;
    }
    try {
      const status = await checkAtencionLock(atencion.id_atencion);
      if (status.locked) {
        const by = status.lockedBy;
        const who = by?.username || by?.name || 'otro usuario';
        await Swal.fire({ icon: 'info', title: 'Registro en edición', text: `No se puede editar. Actualmente lo está editando ${who}.` });
        return;
      }

      const res = await acquireAtencionLock(atencion.id_atencion);
      if (res.lockedBy) {
        const who = res.lockedBy?.username || res.lockedBy?.name || 'otro usuario';
        const meId = auth?.user?.id ?? auth?.user?.username;
        if (res.lockedBy?.id && meId && String(res.lockedBy.id) !== String(meId)) {
          await Swal.fire({ icon: 'info', title: 'Registro en edición', text: `No se puede editar. Actualmente lo está editando ${who}.` });
          return;
        }
      }

      if (res.ok && !res.unsupported) {
        setHeldLockId(atencion.id_atencion);
        setEditAtencion(atencion);
        setShowEditAtencion(true);
        return;
      }

      if (res.ok && res.unsupported) {
        // backend doesn't support locks — allow edit
        setEditAtencion(atencion);
        setShowEditAtencion(true);
        return;
      }
    } catch (err) {
      console.warn('attemptEdit: lock check failed, allowing edit', err);
      setEditAtencion(atencion);
      setShowEditAtencion(true);
    }
  };

  const closeEditor = async () => {
    if (heldLockId) {
      try { await releaseAtencionLock(heldLockId); } catch { /* best-effort */ }
      setHeldLockId(null);
    }
    setShowEditAtencion(false);
    setEditAtencion(null);
  };

  // try to release lock on unload (best-effort)
  useEffect(() => {
    const handler = () => {
      if (heldLockId) {
        try { releaseAtencionLock(heldLockId); } catch { /* ignore */ }
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [heldLockId]);



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
        {/* Fondo decorativo */}
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
              <i className="fas fa-clipboard-list" style={{ color: 'white', fontSize: '1.1rem' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1.05rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                Gestión de Atenciones
              </h2>
              <p style={{ color: 'rgba(147,174,245,0.8)', fontSize: '0.78rem', margin: 0 }}>
                {atenciones.length > 0 ? `${atenciones.length} registro${atenciones.length !== 1 ? 's' : ''} cargados` : 'Cargando...'}
              </p>
            </div>
          </div>

          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            const isAdmin = role.includes('ADMINISTRADOR');
            const canAdd = isAdmin || role.includes('ASESOR') || role.includes('FACTURADOR');
            return (
              <div className="flex items-center gap-2 flex-wrap">
                {canAdd && (
                  <button
                    onClick={() => setShowAddAtencion(true)}
                    className="ui-btn ui-btn-ghost"
                    style={{ height: '38px' }}
                  >
                    <i className="fas fa-plus" style={{ fontSize: '0.8rem' }} />
                    Agregar Atención
                  </button>
                )}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setShowSyncModal(true)}
                      className="ui-btn ui-btn-ghost"
                      style={{ height: '38px' }}
                      title="Sincronizar desde Clínica Florida"
                    >
                      <i className="fas fa-sync-alt" style={{ fontSize: '0.8rem' }} />
                      Sincronizar
                    </button>
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="ui-btn ui-btn-ghost"
                      style={{ height: '38px' }}
                      title="Exportar a Excel"
                    >
                      <i className="fas fa-file-excel" style={{ fontSize: '0.8rem' }} />
                      Exportar
                    </button>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Tarjeta principal */}
      <div className="ui-card animate-fade-in-up stagger-1">
        {/* Barra de filtros */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--surface-border)',
            background: 'var(--brand-50)',
          }}
        >
          <div className="flex flex-col sm:flex-row gap-3 items-center flex-wrap">
            {/* Filtro estado/seguimiento */}
            <div className="relative" style={{ minWidth: '240px', flex: '0 0 auto' }}>
              <i
                className="fas fa-filter"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--brand-400)',
                  fontSize: '0.78rem',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              <select
                value={selectedFilter ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedFilter(v || null);
                  if (!v) {
                    setSelectedEstadoId(null);
                    setSelectedSeguimientoId(null);
                  } else {
                    const [type, id] = v.split(':');
                    if (type === 'estado') {
                      setSelectedEstadoId(Number(id));
                      setSelectedSeguimientoId(null);
                    } else if (type === 'seguimiento') {
                      setSelectedSeguimientoId(Number(id));
                      setSelectedEstadoId(null);
                    } else {
                      setSelectedEstadoId(null);
                      setSelectedSeguimientoId(null);
                    }
                  }
                }}
                className="ui-input"
                style={{ paddingLeft: '2rem', height: '40px', fontSize: '0.875rem' }}
                title="Filtrar por estado o seguimiento"
              >
                <option value="">Estado / Seguimiento</option>
                {estados.length > 0 && (
                  <optgroup label="Estados">
                    {estados.map((st) => (
                      <option key={`estado-${st.id}`} value={`estado:${st.id}`}>{st.nombre}</option>
                    ))}
                  </optgroup>
                )}
                {seguimientos.length > 0 && (
                  <optgroup label="Seguimientos">
                    {seguimientos.map((sg) => (
                      <option key={`seguimiento-${sg.id}`} value={`seguimiento:${sg.id}`}>{sg.nombre}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Filtro por fecha */}
            <div className="relative" style={{ minWidth: '190px', flex: '0 0 auto' }}>
              <i
                className="fas fa-calendar-alt"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--brand-400)',
                  fontSize: '0.78rem',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              <input
                type="date"
                value={selectedDate ?? ''}
                onChange={(e) => setSelectedDate(e.target.value || null)}
                className="ui-input"
                style={{ paddingLeft: '2rem', height: '40px', fontSize: '0.875rem', colorScheme: 'light' }}
                title="Filtrar por fecha de atención"
              />
            </div>

            {/* Limpiar filtros */}
            {(selectedFilter || selectedDate) && (
              <button
                onClick={() => {
                  setSelectedFilter(null);
                  setSelectedEstadoId(null);
                  setSelectedSeguimientoId(null);
                  setSelectedDate(null);
                }}
                className="ui-btn ui-btn-outline"
                style={{ height: '40px', fontSize: '0.8rem', gap: '6px' }}
                title="Limpiar filtros"
              >
                <i className="fas fa-times" style={{ fontSize: '0.75rem' }} />
                Limpiar
              </button>
            )}

            {/* Buscador */}
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
                placeholder="Buscar por ID, paciente, empresa..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="ui-input"
                style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.875rem' }}
                title="Buscar por: ID Atención, ID Paciente, Nombre Paciente o Empresa"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <i className="fas fa-times-circle" style={{ fontSize: '0.85rem' }} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <AtencionTable
            atenciones={atenciones}
            loading={loading}
            searchTerm={searchTerm}
            selectedEstadoId={selectedEstadoId}
            selectedSeguimientoId={selectedSeguimientoId}
            auth={auth}
            attemptEdit={attemptEdit}
            handleEliminar={handleEliminar}
          />
        </div>
      </div>

      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSync={handleSync}
      />

      <ExportDateRangeModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportWithRange}
        isLoading={isExporting}
      />

      {showAddAtencion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <AtencionForm
            onCancel={() => setShowAddAtencion(false)}
            onSave={async (data: NewAtencionConPaciente) => {
              setLoading(true);
              try {
                const nueva = await createAtencionConPaciente(data);
                setAtenciones((prev: Atencion[]) => {
                  const exists = prev.some(a => a.id_atencion === nueva.id_atencion);
                  if (exists) return prev;
                  return [nueva, ...prev];
                });
                setShowAddAtencion(false);
                await Swal.fire({ icon: 'success', title: 'Atención creada', text: `Atención creada correctamente.` });
              } catch (err) {
                console.error("Error creando atención:", err);
                const axiosErr = err as { response?: { data?: { detail?: string }; status?: number }; message?: string };
                const detail = axiosErr.response?.data?.detail || axiosErr.message || '';
                let userMsg = 'No se pudo crear la atención.';
                if (axiosErr?.response?.status === 409) {
                  userMsg = 'Ya existe una atención con ese Id. Verifique el Id Atención e inténtelo de nuevo.';
                } else if (typeof detail === 'string' && /duplicate|already exists|unique|integrityerror|duplicate entry/i.test(detail)) {
                  userMsg = 'Ya existe una atención con ese Id. Verifique el Id Atención e inténtelo de nuevo.';
                } else if (detail) {
                  userMsg = detail;
                }
                await Swal.fire({ icon: 'error', title: 'Error', text: userMsg });
              } finally { setLoading(false); }
            }}
            userId={auth?.user?.id}
          />
        </div>
      )}

      {showEditAtencion && editAtencion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <AtencionForm
            onCancel={closeEditor}
            onSave={async () => {}}
            onUpdate={async (id: string, data: UpdateAtencion) => {
              setLoading(true);
              try {
                const actualizada = await updateAtencion(id, data);
                setAtenciones((prev: Atencion[]) =>
                  prev.map((a: Atencion) => a.id_atencion === id ? actualizada : a)
                );
                if (heldLockId) {
                  try { await releaseAtencionLock(heldLockId); } catch { /* best-effort */ }
                  setHeldLockId(null);
                }
                setShowEditAtencion(false);
                setEditAtencion(null);
                await Swal.fire({ icon: 'success', title: 'Atención actualizada', text: `Atención actualizada correctamente.` });
              } catch (err) {
                console.error("Error actualizando atención:", err);
                const axiosErr = err as { response?: { data?: { detail?: string } } };
                const errorMsg = axiosErr.response?.data?.detail || 'No se pudo actualizar la atención.';
                await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
              } finally { setLoading(false); }
            }}
            initialData={editAtencion}
            isEditMode={true}
            userId={auth?.user?.id}
          />
        </div>
      )}
    </div>
  );
}
