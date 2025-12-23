import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { Service } from "../types";
import ServiceForm from "../components/ServiceForm";
import ServiceTable from "../components/ServiceTable";
import Swal from "sweetalert2";
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";
import Search from "../../../components/search/Search";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  acquireServiceLock,
  releaseServiceLock,
  checkServiceLock,
} from "../Service.api";
import { IoMdAddCircleOutline } from "react-icons/io";

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
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>Gestión de Servicios</span>
      </h2>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex-shrink-0 flex items-center gap-3">
          {(() => {
            const role = String(auth?.user?.role_name ?? "").trim().toUpperCase();
            if (role === "ADMINISTRADOR") {
              return (
                <>
                  {/* Botón agregar */}
                  <button
                    onClick={() => setShowAdd(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer"
                  >
                    <IoMdAddCircleOutline className="text-lg" />
                    Agregar nuevo servicio
                  </button>

                  {/* Botón Exportar Excel */}
                  <ExportExcel data={services} fileName="services.xlsx" />
                </>
              );
            }

            return (
              <p className="text-sm text-gray-600">
                Solo administradores pueden gestionar servicios.
              </p>
            );
          })()}
        </div>

        <Search 
          value={searchTerm} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
          onClear={() => setSearchTerm('')} 
          placeholder="Buscar por ID, Nombre o Descripción"
        />
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && editService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
        </div>
      )}

      {/* Tabla de Servicios */}
      <ServiceTable
        services={services}
        loading={loading}
        searchTerm={searchTerm}
        auth={auth}
        attemptEdit={attemptEdit}
        handleEliminar={handleEliminar}
      />
    </div>
  );
}
