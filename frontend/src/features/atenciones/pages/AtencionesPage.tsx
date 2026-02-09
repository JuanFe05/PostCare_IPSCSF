import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useWebSocket } from "../../../hooks/useWebSocket";
import type { Atencion, NewAtencionConPaciente, UpdateAtencion } from "../types";
import { getAtenciones, getAtencionesByRango, createAtencionConPaciente, updateAtencion, deleteAtencion, acquireAtencionLock, releaseAtencionLock, checkAtencionLock, getEstadosAtencion, getSeguimientosAtencion } from "../Atencion.api";
import { syncPacientesRangoFechas } from "../../../api/Sync.api";
import Swal from "sweetalert2";
import AtencionForm from "../components/AtencionForm";
import SyncModal from "../components/SyncModal";
import ExportDateRangeModal from "../components/ExportDateRangeModal";
import AtencionTable from '../components/AtencionTable';
import { Card, CardHeader, CardBody, Button } from '../../../components/notus';
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
  const [estados, setEstados] = useState<any[]>([]);
  const [seguimientos, setSeguimientos] = useState<any[]>([]);
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  const [selectedSeguimientoId, setSelectedSeguimientoId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [heldLockId, setHeldLockId] = useState<string | null>(null);

  const { auth } = useAuth();
  const { subscribe } = useWebSocket();

  const loadAtenciones = async () => {
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
  };

  useEffect(() => {
    loadAtenciones();
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

  // recargar cuando cambie la fecha seleccionada
  useEffect(() => {
    loadAtenciones();
  }, [selectedDate]);

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
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error al sincronizar datos';
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
    } catch (error: any) {
      setIsExporting(false);
      console.error('Error al exportar:', error);
      
      if (error?.message !== 'Exportación cancelada') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'No se pudo exportar los datos',
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
      try { await releaseAtencionLock(heldLockId); } catch (_) { /* best-effort */ }
      setHeldLockId(null);
    }
    setShowEditAtencion(false);
    setEditAtencion(null);
  };

  // try to release lock on unload (best-effort)
  useEffect(() => {
    const handler = () => {
      if (heldLockId) {
        try { releaseAtencionLock(heldLockId); } catch (_) { /* ignore */ }
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [heldLockId]);



  return (
    <div>
      <Card>
        <CardHeader color="lightBlue" className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-clipboard-list text-2xl text-white"></i>
            <h6 className="text-lg font-bold text-white uppercase m-0">Gestión de Atenciones</h6>
          </div>
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            const isAdmin = role.includes('ADMINISTRADOR');
            const canAdd = isAdmin || role.includes('ASESOR') || role.includes('FACTURADOR');

            return (
              <div className="flex items-center gap-3">
                {canAdd && (
                  <Button
                    onClick={() => setShowAddAtencion(true)}
                    color="white"
                    size="sm"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    AGREGAR ATENCIÓN
                  </Button>
                )}

                {isAdmin && (
                  <>
                    <Button
                      onClick={() => setShowSyncModal(true)}
                      color="white"
                      size="sm"
                      title="Sincronizar desde Clínica Florida"
                    >
                      <i className="fas fa-sync-alt mr-2"></i>
                      SINCRONIZAR
                    </Button>

                    <Button
                      onClick={() => setShowExportModal(true)}
                      color="white"
                      size="sm"
                      title="Exportar a Excel"
                    >
                      <i className="fas fa-file-excel mr-2"></i>
                      EXPORTAR
                    </Button>
                  </>
                )}
              </div>
            );
          })()}
        </CardHeader>
        
        <CardBody>
          {/* Filtros y búsqueda */}
          <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Filtros a la izquierda */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Select estado/seguimiento con diseño mejorado estilo Notus */}
              <div className="relative">
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
                  className="h-[52px] pl-4 pr-10 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:shadow-lg hover:border-blue-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 cursor-pointer appearance-none min-w-[260px]"
                  title="Filtrar por estado o seguimiento"
                >
                  <option value="">Estado / Seguimiento</option>
                  {estados.length > 0 && (
                    <optgroup label="Estados" className="font-semibold">
                      {estados.map((st: any) => (
                        <option key={`estado-${st.id}`} value={`estado:${st.id}`}>{st.nombre}</option>
                      ))}
                    </optgroup>
                  )}
                  {seguimientos.length > 0 && (
                    <optgroup label="Seguimientos" className="font-semibold">
                      {seguimientos.map((sg: any) => (
                        <option key={`seguimiento-${sg.id}`} value={`seguimiento:${sg.id}`}>{sg.nombre}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <i className="fas fa-chevron-down text-blue-500 text-sm"></i>
                </div>
              </div>

              {/* Date picker mejorado - wrapper clickeable */}
              <div 
                className="relative group cursor-pointer"
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
                  if (input && e.target === e.currentTarget) {
                    input.showPicker?.();
                  }
                }}
              >
                <input
                  type="date"
                  value={selectedDate ?? ''}
                  onChange={(e) => setSelectedDate(e.target.value ? e.target.value : null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).showPicker?.();
                  }}
                  className="h-[52px] w-full px-4 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:shadow-lg hover:border-blue-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 cursor-pointer min-w-[200px]"
                  style={{ colorScheme: 'light' }}
                  title="Filtrar por fecha de atención"
                />
              </div>
            </div>

            {/* Buscador a la derecha */}
            <div className="relative max-w-md w-full lg:w-auto lg:min-w-[350px]">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar atenciones..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 h-[52px] border-2 border-gray-200 rounded-lg bg-white font-medium shadow-sm hover:shadow-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
                title="Buscar por: ID Atención, ID Paciente, Nombre Paciente o Empresa"
              />
            </div>
          </div>

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
        </CardBody>
      </Card>

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
              } catch (err: any) {
                console.error("Error creando atención:", err);
                const detail = err.response?.data?.detail || err.message || '';
                let userMsg = 'No se pudo crear la atención.';
                // Detect common duplicate/constraint messages
                if (err?.response?.status === 409) {
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
            onSave={async () => {}} // No se usa en modo edición
            onUpdate={async (id: string, data: UpdateAtencion) => {
              setLoading(true);
              try {
                const actualizada = await updateAtencion(id, data);
                setAtenciones((prev: Atencion[]) => 
                  prev.map((a: Atencion) => a.id_atencion === id ? actualizada : a)
                );
                // release lock if held
                if (heldLockId) {
                  try { await releaseAtencionLock(heldLockId); } catch (e) { /* best-effort */ }
                  setHeldLockId(null);
                }
                setShowEditAtencion(false);
                setEditAtencion(null);
                await Swal.fire({ icon: 'success', title: 'Atención actualizada', text: `Atención actualizada correctamente.` });
              } catch (err: any) {
                console.error("Error actualizando atención:", err);
                const errorMsg = err.response?.data?.detail || 'No se pudo actualizar la atención.';
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
