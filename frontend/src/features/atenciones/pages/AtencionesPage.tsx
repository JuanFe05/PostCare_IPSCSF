import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { ChangeEvent } from "react";
import React from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from "../../../hooks/useAuth";
import { useWebSocket } from "../../../hooks/useWebSocket";
import type { Atencion, NewAtencionConPaciente, UpdateAtencion, EstadoAtencion, SeguimientoAtencion } from "../types";
import { getAtenciones, getAtencionesByRango, searchAtenciones, createAtencionConPaciente, updateAtencion, deleteAtencion, acquireAtencionLock, releaseAtencionLock, checkAtencionLock, getEstadosAtencion, getSeguimientosAtencion } from "../Atencion.api";
import { syncPacientesRangoFechas } from "../../../api/Sync.api";
import Swal from "sweetalert2";
import AtencionForm from "../components/AtencionForm";
import SyncModal from "../components/SyncModal";
import ExportDateRangeModal from "../components/ExportDateRangeModal";
import AtencionTable from '../components/AtencionTable';
import { prepareAtencionesPorServicio } from "../utils";

// Input personalizado para el DatePicker de fecha de atención
const DateFilterInput = React.forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void; isActive?: boolean; onClear?: (e: React.MouseEvent) => void }>(
  ({ value, onClick, isActive, onClear }, ref) => (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className={`atf-filter-btn${isActive ? ' atf-filter-btn--active' : ''}`}
    >
      <i className="fas fa-calendar-alt" style={{ fontSize: '0.8rem', flexShrink: 0 }} />
      <span className="atf-filter-btn-label">{value || 'Fecha atención'}</span>
      {isActive ? (
        <button
          type="button"
          className="atf-active-clear"
          onClick={(e) => { e.stopPropagation(); onClear?.(e); }}
          title="Quitar filtro de fecha"
        >
          <i className="fas fa-times" />
        </button>
      ) : (
        <i className="fas fa-chevron-down atf-chevron" />
      )}
    </button>
  )
);

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
  const [remoteResults, setRemoteResults] = useState<Atencion[] | null>(null);
  const [isRemoteSearching, setIsRemoteSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [estados, setEstados] = useState<EstadoAtencion[]>([]);
  const [seguimientos, setSeguimientos] = useState<SeguimientoAtencion[]>([]);
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  const [selectedSeguimientoId, setSelectedSeguimientoId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [heldLockId, setHeldLockId] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const { auth } = useAuth();
  const { subscribe } = useWebSocket();

  const loadAtenciones = useCallback(async () => {
    setLoading(true);
    try {
      const fecha = selectedDate ? selectedDate.toISOString().split('T')[0] : undefined;
      // Cuando se filtra por fecha específica, se eliminan restricciones para obtener
      // TODOS los registros de ese día (el backend soporta hasta 100 000)
      const limit = fecha ? 100000 : 500;
      const data = await getAtenciones(0, limit, fecha);
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

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  // Cuenta dinámica: refleja los registros actualmente visibles tras aplicar todos los filtros
  const filteredCount = useMemo(() => {
    const source = (remoteResults !== null && remoteResults.length > 0 && !atenciones.some((a) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      return (
        String(a.id_atencion ?? '').toLowerCase().includes(q) ||
        String(a.id_paciente ?? '').toLowerCase().includes(q) ||
        String(a.nombre_paciente ?? '').toLowerCase().includes(q) ||
        String(a.nombre_empresa ?? '').toLowerCase().includes(q) ||
        String(a.nombre_estado_atencion ?? '').toLowerCase().includes(q)
      );
    })) ? remoteResults : atenciones;

    return source.filter((a) => {
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matches = (
          String(a.id_atencion ?? '').toLowerCase().includes(q) ||
          String(a.id_paciente ?? '').toLowerCase().includes(q) ||
          String(a.nombre_paciente ?? '').toLowerCase().includes(q) ||
          String(a.nombre_empresa ?? '').toLowerCase().includes(q) ||
          String(a.nombre_estado_atencion ?? '').toLowerCase().includes(q)
        );
        if (!matches) return false;
      }
      if (selectedEstadoId && Number(a.id_estado_atencion) !== Number(selectedEstadoId)) return false;
      if (selectedSeguimientoId && Number(a.id_seguimiento_atencion ?? -1) !== Number(selectedSeguimientoId)) return false;
      return true;
    }).length;
  }, [atenciones, remoteResults, searchTerm, selectedEstadoId, selectedSeguimientoId]);

  // Búsqueda remota: cuando los filtros locales no encuentran la atención en los 500 cargados,
  // consulta la BD completa buscando por ID Atención o ID Paciente.
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!searchTerm.trim()) {
      setRemoteResults(null);
      setIsRemoteSearching(false);
      return;
    }

    const term = searchTerm.trim().toLowerCase();
    const hasLocal = atenciones.some((a) => {
      if (selectedEstadoId && Number(a.id_estado_atencion) !== Number(selectedEstadoId)) return false;
      if (selectedSeguimientoId && Number(a.id_seguimiento_atencion ?? -1) !== Number(selectedSeguimientoId)) return false;
      return (
        String(a.id_atencion ?? '').toLowerCase().includes(term) ||
        String(a.id_paciente ?? '').toLowerCase().includes(term) ||
        String(a.nombre_paciente ?? '').toLowerCase().includes(term) ||
        String(a.nombre_empresa ?? '').toLowerCase().includes(term) ||
        String(a.nombre_estado_atencion ?? '').toLowerCase().includes(term)
      );
    });

    if (hasLocal) {
      setRemoteResults(null);
      setIsRemoteSearching(false);
      return;
    }

    // No hay resultados locales → buscar en la BD después de un debounce
    setIsRemoteSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchAtenciones({ search: searchTerm.trim(), limit: 500 });
        setRemoteResults(results);
      } catch (err) {
        console.warn('Búsqueda remota de atenciones fallida:', err);
        setRemoteResults([]);
      } finally {
        setIsRemoteSearching(false);
      }
    }, 450);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchTerm, atenciones, selectedEstadoId, selectedSeguimientoId]);



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
                {loading
                  ? 'Cargando...'
                  : filteredCount !== atenciones.length
                  ? `${filteredCount} de ${atenciones.length} registro${atenciones.length !== 1 ? 's' : ''}`
                  : `${atenciones.length} registro${atenciones.length !== 1 ? 's' : ''} cargados`}
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

            {/* ── Filtro unificado Estado / Seguimiento ── */}
            <div className="atf-filter-wrap" ref={filterDropdownRef}>
              <button
                type="button"
                className={`atf-filter-btn${(selectedEstadoId !== null || selectedSeguimientoId !== null) ? ' atf-filter-btn--active' : ''}`}
                onClick={() => setShowFilterDropdown(v => !v)}
              >
                <i className="fas fa-layer-group" style={{ fontSize: '0.78rem', flexShrink: 0 }} />
                <span className="atf-filter-btn-label">
                  {selectedEstadoId !== null
                    ? (estados.find(s => s.id === selectedEstadoId)?.nombre ?? 'Estado')
                    : selectedSeguimientoId !== null
                    ? (seguimientos.find(s => s.id === selectedSeguimientoId)?.nombre ?? 'Seguimiento')
                    : 'Estado / Seguimiento'}
                </span>
                {(selectedEstadoId !== null || selectedSeguimientoId !== null) ? (
                  <button
                    type="button"
                    className="atf-active-clear"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEstadoId(null);
                      setSelectedSeguimientoId(null);
                      setSelectedFilter(null);
                      setShowFilterDropdown(false);
                    }}
                    title="Quitar filtro"
                  >
                    <i className="fas fa-times" />
                  </button>
                ) : (
                  <i className={`fas fa-chevron-down atf-chevron${showFilterDropdown ? ' atf-chevron--open' : ''}`} />
                )}
              </button>

              {showFilterDropdown && (
                <div className="atf-panel">
                  {/* Estados */}
                  {estados.length > 0 && (
                    <div className="atf-section">
                      <div className="atf-section-header">
                        <span className="atf-section-dot" style={{ background: '#3b82f6' }} />
                        Estados
                      </div>
                      {estados.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          className={`atf-option${selectedEstadoId === st.id ? ' atf-option--selected' : ''}`}
                          onClick={() => {
                            setSelectedEstadoId(st.id);
                            setSelectedSeguimientoId(null);
                            setSelectedFilter(`estado:${st.id}`);
                            setShowFilterDropdown(false);
                          }}
                        >
                          <i className="fas fa-check atf-option-check" style={{ opacity: selectedEstadoId === st.id ? 1 : 0, color: '#3b82f6' }} />
                          {st.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Seguimientos */}
                  {seguimientos.length > 0 && (
                    <div className="atf-section">
                      <div className="atf-section-header">
                        <span className="atf-section-dot" style={{ background: '#10b981' }} />
                        Seguimientos
                      </div>
                      {seguimientos.map((sg) => (
                        <button
                          key={sg.id}
                          type="button"
                          className={`atf-option${selectedSeguimientoId === sg.id ? ' atf-option--selected' : ''}`}
                          onClick={() => {
                            setSelectedSeguimientoId(sg.id);
                            setSelectedEstadoId(null);
                            setSelectedFilter(`seguimiento:${sg.id}`);
                            setShowFilterDropdown(false);
                          }}
                        >
                          <i className="fas fa-check atf-option-check" style={{ opacity: selectedSeguimientoId === sg.id ? 1 : 0, color: '#10b981' }} />
                          {sg.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Filtro de fecha con trigger personalizado ── */}
            <div className="atf-filter-wrap">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                popperClassName="atf-datepicker-popper"
                customInput={
                  <DateFilterInput
                    isActive={!!selectedDate}
                    onClear={() => setSelectedDate(null)}
                  />
                }
              />
            </div>

            {/* ── Limpiar todos ── */}
            {(selectedFilter !== null && selectedDate !== null) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFilter(null);
                  setSelectedEstadoId(null);
                  setSelectedSeguimientoId(null);
                  setSelectedDate(null);
                }}
                className="ui-btn ui-btn-outline"
                style={{ height: '38px', fontSize: '0.78rem', gap: '5px' }}
                title="Limpiar todos los filtros"
              >
                <i className="fas fa-times" style={{ fontSize: '0.7rem' }} />
                Limpiar todo
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
                placeholder="Buscar por ID Atención o ID Paciente..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="ui-input"
                style={{ paddingLeft: '2.2rem', paddingRight: searchTerm ? '2.2rem' : '0.75rem', height: '40px', fontSize: '0.875rem' }}
                title="Buscar por ID Atención o ID Paciente"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  title="Limpiar búsqueda"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'var(--text-muted, #94a3b8)',
                    color: 'white',
                    fontSize: '0.6rem',
                    cursor: 'pointer',
                    padding: 0,
                    lineHeight: 1,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-500, #3b82f6)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--text-muted, #94a3b8)')}
                >
                  <i className="fas fa-times" />
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
            remoteResults={remoteResults}
            isRemoteSearching={isRemoteSearching}
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

      <AtencionForm
        isOpen={showAddAtencion}
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

      <AtencionForm
        isOpen={showEditAtencion}
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
        initialData={editAtencion ?? undefined}
        isEditMode={true}
        userId={auth?.user?.id}
      />
    </div>
  );
}
