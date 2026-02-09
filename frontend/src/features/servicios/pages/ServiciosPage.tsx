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
import { Card, CardHeader, CardBody, Button } from '../../../components/notus';

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
    <div>
      <Card>
        <CardHeader color="lightBlue" className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-medkit text-2xl text-white"></i>
            <h6 className="text-lg font-bold text-white uppercase m-0">Gestión de Servicios</h6>
          </div>
          {(() => {
            const role = String(auth?.user?.role_name ?? "").trim().toUpperCase();
            if (role === "ADMINISTRADOR") {
              return (
                <Button
                  color="white"
                  size="sm"
                  onClick={() => setShowAdd(true)}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Agregar Servicio
                </Button>
              );
            }
            return null;
          })()}
        </CardHeader>

        <CardBody>
          {/* Search bar */}
          <div className="mb-8 flex justify-end">
            <div className="relative max-w-md w-full">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 h-[52px] border-2 border-gray-200 rounded-lg bg-white font-medium shadow-sm hover:shadow-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
                title="Buscar por: ID, Nombre o Descripción"
              />
            </div>
          </div>

          {/* Tabla de Servicios */}
          <ServiceTable
            services={services}
            loading={loading}
            searchTerm={searchTerm}
            auth={auth}
            attemptEdit={attemptEdit}
            handleEliminar={handleEliminar}
          />
        </CardBody>
      </Card>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && editService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
        </div>
      )}
    </div>
  );
}
