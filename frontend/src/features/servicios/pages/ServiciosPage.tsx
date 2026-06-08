import { useState, useEffect, lazy, Suspense } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { Service } from "../types";
import ServiceTable from "../components/ServiceTable";
import Swal from "sweetalert2";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  acquireServiceLock,
  releaseServiceLock,
  checkServiceLock,
} from "../Service.api";


// Lazy loading del formulario pesado
const ServiceForm = lazy(() => import("../components/ServiceForm"));

export default function ServiciosPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { auth } = useAuth();
  const [heldLockId, setHeldLockId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      console.error("Error cargando servicios:", err);
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleEliminar = async (id: number, nombre: string) => {
    const result = await Swal.fire({
      title: `¿Eliminar el servicio "${nombre}"?`,
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
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      await Swal.fire({ icon: "success", title: "Eliminado", text: `Servicio "${nombre}" eliminado.` });
    } catch (err) {
      console.error("Error eliminando servicio:", err);
      await Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar el servicio." });
    }
  };

  // ATTEMPT EDIT (lock logic)
  const attemptEdit = async (s: Service) => {
    try {
      // 1. Verificar si está bloqueado
      const status = await checkServiceLock(s.id!);

      if (status.locked) {
        const by = status.lockedBy;
        const who = by?.username || by?.name || "otro usuario";
        await Swal.fire({
          icon: "info",
          title: "Registro en edición",
          text: `No se puede editar. Actualmente lo está editando ${who}.`
        });
        return;
      }

      // 2. Intentar adquirir el lock
      const res = await acquireServiceLock(s.id!);

      // Si otro usuario lo tiene
      if (res.lockedBy && res.lockedBy.id !== auth?.user?.id) {
        const who = res.lockedBy?.username || res.lockedBy?.name || "otro usuario";
        await Swal.fire({
          icon: "info",
          title: "Registro en edición",
          text: `No se puede editar. Actualmente lo está editando ${who}.`
        });
        return;
      }

      // 3. Lock adquirido correctamente → abrir modal
      setHeldLockId(s.id!);
      setEditService(s);
      setShowEdit(true);

    } catch (err) {
      console.warn("attemptEdit: lock check failed, allowing edit", err);

      // Si falla el lock, permitir edición igual
      setEditService(s);
      setShowEdit(true);
    }
  };

  const closeEditor = async () => {
    if (heldLockId) {
      try {
        await releaseServiceLock(heldLockId);
      } catch (e) {
        console.warn("release lock failed", e);
      }
      setHeldLockId(null);
    }
    setShowEdit(false);
    setEditService(null);
  };

  // release lock on unload
  useEffect(() => {
    const handler = () => {
      if (heldLockId) {
        try { releaseServiceLock(heldLockId); } catch (_) { /* best-effort */ }
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
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
              <i className="fas fa-medkit" style={{ color: 'white', fontSize: '1.1rem' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1.05rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                Gestión de Servicios
              </h2>
              <p style={{ color: 'rgba(147,174,245,0.8)', fontSize: '0.78rem', margin: 0 }}>
                {services.length > 0 ? `${services.length} registro${services.length !== 1 ? 's' : ''} cargados` : 'Cargando...'}
              </p>
            </div>
          </div>
          {(() => {
            const role = String(auth?.user?.role_name ?? "").trim().toUpperCase();
            if (role === "ADMINISTRADOR") {
              return (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowAdd(true)}
                    className="ui-btn ui-btn-ghost"
                    style={{ height: '38px' }}
                  >
                    <i className="fas fa-plus" style={{ fontSize: '0.8rem' }} />
                    Agregar Servicio
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
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="ui-input"
              style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.875rem' }}
              title="Buscar por: ID, Nombre o Descripción"
            />
          </div>
        </div>

        {/* Tabla de Servicios */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <ServiceTable
            services={services}
            loading={loading}
            searchTerm={searchTerm}
            auth={auth}
            attemptEdit={attemptEdit}
            handleEliminar={handleEliminar}
          />
        </div>
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <Suspense fallback={<div className="bg-white p-8 rounded-lg shadow-xl"><p className="text-gray-600">Cargando formulario...</p></div>}>
            <ServiceForm
              onCancel={() => setShowAdd(false)}
              onSave={async ({ nombre }) => {
              if (!nombre) {
                await Swal.fire({ icon: "warning", title: "Datos incompletos", text: "El nombre es obligatorio." });
                return;
              }
              setLoading(true);
              try {
                const nuevo = await createService({ nombre });
                setServices((prev) => [nuevo, ...prev]);
                setShowAdd(false);
                await Swal.fire({ icon: "success", title: "Servicio creado", text: `Servicio "${nombre}" creado correctamente.` });
              } catch (err) {
                console.error("Error creando servicio:", err);
                await Swal.fire({ icon: "error", title: "Error", text: "No se pudo crear el servicio." });
              } finally {
                setLoading(false);
              }
            }}
          />
        </Suspense>
      )}

      {/* EDIT MODAL */}
      {showEdit && editService && (
        <Suspense fallback={<div className="bg-white p-8 rounded-lg shadow-xl"><p className="text-gray-600">Cargando formulario...</p></div>}>
            <ServiceForm
              isEdit
              initial={{ nombre: editService.nombre, descripcion: editService.descripcion }}
              onCancel={closeEditor}
            onSave={async ({ nombre }) => {
              if (!editService) return;
              setLoading(true);
              try {
                const actualizado = await updateService({ id: editService.id, nombre });
                setServices((prev) => prev.map((s) => (s.id === actualizado.id ? actualizado : s)));
                if (heldLockId) {
                  try { await releaseServiceLock(heldLockId); } catch (e) { }
                  setHeldLockId(null);
                }
                setShowEdit(false);
                setEditService(null);
                await Swal.fire({ icon: "success", title: "Servicio actualizado", text: `Servicio "${nombre}" actualizado correctamente.` });
              } catch (err) {
                console.error("Error actualizando servicio:", err);
                await Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el servicio." });
              } finally {
                setLoading(false);
              }
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
