import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { FaSyncAlt } from 'react-icons/fa';
import { useAuth } from "../../../hooks/useAuth";
import type { Atencion, NewAtencionConPaciente, UpdateAtencion } from "../types";
import { getAtenciones, createAtencionConPaciente, updateAtencion, deleteAtencion } from "../Atencion.api";
import { syncPacientesRangoFechas } from "../../../api/Sync.api";
import Swal from "sweetalert2";
import AtencionForm from "../components/AtencionForm";
import SyncModal from "../components/SyncModal";
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";
import AtencionTable from '../components/AtencionTable';
import Search from "../../../components/search/Search";
import { IoMdAddCircleOutline } from "react-icons/io";

export default function AtencionesPage() {
  const [showAddAtencion, setShowAddAtencion] = useState(false);
  const [showEditAtencion, setShowEditAtencion] = useState(false);
  const [editAtencion, setEditAtencion] = useState<Atencion | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { auth } = useAuth();

  const loadAtenciones = async () => {
    setLoading(true);
    try {
      const data = await getAtenciones(0, 500);
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
            const isAdmin = role.includes('ADMINISTRADOR');
            const canAdd = isAdmin || role.includes('ASESOR') || role.includes('FACTURADOR');

            return (
              <>
                {canAdd && (
                  <button
                    onClick={() => setShowAddAtencion(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer"
                  >
                    <IoMdAddCircleOutline />
                    Agregar nueva atención
                  </button>
                )}

                {isAdmin && (
                  <>
                    <button
                      onClick={() => setShowSyncModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 shadow cursor-pointer"
                      title="Sincronizar desde Clínica Florida"
                    >
                      <FaSyncAlt />
                      Sincronizar
                    </button>

                    <ExportExcel data={atenciones} fileName="atenciones.xlsx" />
                  </>
                )}
              </>
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

      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <SyncModal
            isOpen={showSyncModal}
            onClose={() => setShowSyncModal(false)}
            onSync={handleSync}
          />
        </div>
      )}

      {showAddAtencion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <AtencionForm 
            onCancel={() => setShowAddAtencion(false)} 
            onSave={async (data: NewAtencionConPaciente) => {
              setLoading(true);
              try {
                const nueva = await createAtencionConPaciente(data);
                setAtenciones((prev: Atencion[]) => [nueva, ...prev]);
                setShowAddAtencion(false);
                await Swal.fire({ icon: 'success', title: 'Atención creada', text: `Atención creada correctamente.` });
              } catch (err: any) {
                console.error("Error creando atención:", err);
                const errorMsg = err.response?.data?.detail || 'No se pudo crear la atención.';
                await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
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
                closeEditor();
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
