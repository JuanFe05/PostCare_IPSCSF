import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { Service } from "../types";
import ServiceForm from "./ServiceForm";
import Swal from "sweetalert2";
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";
import Search from "../../../components/search/Search";
import ServiceRow from "./ServiceRow";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  acquireServiceLock,
  releaseServiceLock,
  checkServiceLock,
} from "../Service.api";

export default function ServicesTable() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

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

  // displayed (filter + sort)
  const displayed = useMemo(() => {
    const filtered = services.filter((s) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(s.id ?? "").toLowerCase().includes(q);
      const nombreMatch = String(s.nombre ?? "").toLowerCase().includes(q);
      const descMatch = String(s.descripcion ?? "").toLowerCase().includes(q);
      return idMatch || nombreMatch || descMatch;
    });

    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a: any, b: any) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === "asc" ? -1 : 1;
      if (vb == null) return sortDir === "asc" ? 1 : -1;
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [services, searchTerm, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    if (sortDir === "asc") setSortDir("desc");
    else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else setSortDir("asc");
  };

  return (
    <div className="p-6">
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
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow cursor-pointer"
                  >
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

      {/* TABLE */}
      {loading && <p>Cargando servicios...</p>}
      {!loading && services.length === 0 && <p>No hay servicios registrados.</p>}

      {!loading && services.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y table-auto">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th onClick={() => toggleSort("id")} className="p-3 font-semibold w-16 text-center cursor-pointer select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span>ID</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === "id" && sortDir === "asc" ? "text-blue-700" : "text-gray-300"}>▲</span>
                      <span className={sortKey === "id" && sortDir === "desc" ? "text-blue-700" : "text-gray-300"}>▼</span>
                    </span>
                  </div>
                </th>

                <th onClick={() => toggleSort("nombre")} className="p-3 font-semibold text-center cursor-pointer select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span>Nombre</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === "nombre" && sortDir === "asc" ? "text-blue-700" : "text-gray-300"}>▲</span>
                      <span className={sortKey === "nombre" && sortDir === "desc" ? "text-blue-700" : "text-gray-300"}>▼</span>
                    </span>
                  </div>
                </th>

                <th onClick={() => toggleSort("descripcion")} className="p-3 font-semibold text-center cursor-pointer select-none">
                  <div className="flex items-center justify-center gap-1">
                    <span>Descripción</span>
                    <span className="inline-flex flex-col ml-2 text-xs leading-none">
                      <span className={sortKey === "descripcion" && sortDir === "asc" ? "text-blue-700" : "text-gray-300"}>▲</span>
                      <span className={sortKey === "descripcion" && sortDir === "desc" ? "text-blue-700" : "text-gray-300"}>▼</span>
                    </span>
                  </div>
                </th>
                <th className="p-3 font-semibold w-32 text-center">
                  <div className="w-full text-center">Acciones</div>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {displayed.map((s, idx) => (
                <ServiceRow key={s.id} s={s} idx={idx} auth={auth} attemptEdit={attemptEdit} handleEliminar={handleEliminar} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No hay coincidencias */}
      {!loading && services.length > 0 && displayed.length === 0 && (
        <p className="mt-4">No se encontraron servicios que coincidan con "{searchTerm}".</p>
      )}
    </div>
  );
}
