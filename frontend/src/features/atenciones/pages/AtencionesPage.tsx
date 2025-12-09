import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { Atencion, NewAtencion, UpdateAtencion } from "../types";
import { getAtenciones, createAtencion, updateAtencion, deleteAtencion } from "../Atencion.api";
import Swal from "sweetalert2";
import AtencionForm from "../components/AtencionForm";
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";
import AtencionTable from '../components/AtencionTable';
import Search from "../../../components/search/Search";

export default function AtencionesPage() {
  const [showAddAtencion, setShowAddAtencion] = useState(false);
  const [showEditAtencion, setShowEditAtencion] = useState(false);
  const [editAtencion, setEditAtencion] = useState<Atencion | null>(null);
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { auth } = useAuth();

  useEffect(() => {
    getAtenciones(0, 500)
      .then((data) => {
        console.log("Atenciones recibidas:", data);
        console.log("Total de atenciones:", data.length);
        setAtenciones(data);
      })
      .catch((err) => {
        console.error("Error al cargar atenciones:", err);
        console.error("Error detail:", err.response?.data);
      })
      .finally(() => setLoading(false));
  }, []);

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

  const attemptEdit = (atencion: Atencion) => {
    setEditAtencion(atencion);
    setShowEditAtencion(true);
  };

  const closeEditor = () => {
    setShowEditAtencion(false);
    setEditAtencion(null);
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>Gestión de Atenciones</span>
      </h2>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex-shrink-0 flex items-center gap-3">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  <button
                    onClick={() => setShowAddAtencion(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer"
                  >
                    Agregar nueva atención
                  </button>
                  <ExportExcel data={atenciones} fileName="atenciones.xlsx" />
                </>
              );
            }
            return (
              <p className="text-sm text-gray-600">
                Solo administradores pueden gestionar atenciones.
              </p>
            );
          })()}
        </div>

        <Search 
          value={searchTerm} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
          onClear={() => setSearchTerm('')} 
          placeholder="Buscar por ID, Paciente, Empresa o Estado" 
        />
      </div>

      {showAddAtencion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <AtencionForm 
            onCancel={() => setShowAddAtencion(false)} 
            onSave={async (data: NewAtencion) => {
              setLoading(true);
              try {
                const nueva = await createAtencion(data);
                setAtenciones((prev: Atencion[]) => [nueva, ...prev]);
                setShowAddAtencion(false);
                await Swal.fire({ icon: 'success', title: 'Atención creada', text: `Atención creada correctamente.` });
              } catch (err: any) {
                console.error("Error creando atención:", err);
                const errorMsg = err.response?.data?.detail || 'No se pudo crear la atención.';
                await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
              } finally { setLoading(false); }
            }} 
          />
        </div>
      )}

      {showEditAtencion && editAtencion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <AtencionForm
            isEdit
            initial={{
              id_paciente: editAtencion.id_paciente,
              id_empresa: editAtencion.id_empresa,
              id_estado_atencion: editAtencion.id_estado_atencion,
              id_seguimiento_atencion: editAtencion.id_seguimiento_atencion,
              observacion: editAtencion.observacion,
              servicios: editAtencion.servicios.map(s => s.id_servicio)
            }}
            onCancel={closeEditor}
            onSave={async (data: NewAtencion) => {
              setLoading(true);
              try {
                const updateData: UpdateAtencion = {
                  id_empresa: data.id_empresa,
                  id_estado_atencion: data.id_estado_atencion,
                  id_seguimiento_atencion: data.id_seguimiento_atencion,
                  observacion: data.observacion,
                  servicios: data.servicios
                };
                const updated = await updateAtencion(editAtencion.id_atencion, updateData);
                setAtenciones((prev: Atencion[]) => prev.map((a: Atencion) => (a.id_atencion === updated.id_atencion ? updated : a)));
                closeEditor();
                await Swal.fire({ icon: 'success', title: 'Atención actualizada', text: `Atención actualizada correctamente.` });
              } catch (err: any) {
                console.error("Error actualizando atención:", err);
                const errorMsg = err.response?.data?.detail || 'No se pudo actualizar la atención.';
                await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
              } finally { setLoading(false); }
            }}
          />
        </div>
      )}

      <AtencionTable 
        atenciones={atenciones}
        loading={loading}
        searchTerm={searchTerm}
        auth={auth}
        attemptEdit={attemptEdit}
        handleEliminar={handleEliminar}
      />
    </div>
  );
}
