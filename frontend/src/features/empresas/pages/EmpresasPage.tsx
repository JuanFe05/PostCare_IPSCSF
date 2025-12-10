import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { Empresa } from "../types";
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from "../Empresa.api";
import Swal from "sweetalert2";
import EmpresaForm from "../components/EmpresaForm";
import EmpresaTable from "../components/EmpresaTable";
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";
import Search from "../../../components/search/Search";

export default function EmpresasPage() {
  const [showAddEmpresa, setShowAddEmpresa] = useState(false);
  const [showEditEmpresa, setShowEditEmpresa] = useState(false);
  const [editEmpresa, setEditEmpresa] = useState<Empresa | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { auth } = useAuth();

  useEffect(() => {
    getEmpresas()
      .then((data) => setEmpresas(data))
      .catch((err) => console.error("Error al cargar empresas:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleEliminar = async (id: number, nombre: string) => {
    const result = await Swal.fire({
      title: `¿Eliminar la empresa "${nombre}"?`,
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
      await deleteEmpresa(id);
      setEmpresas((prev: Empresa[]) => prev.filter((e: Empresa) => e.id !== id));
      await Swal.fire({ title: "Eliminada", text: `La empresa ${nombre} ha sido eliminada.`, icon: "success" });
    } catch (error) {
      console.error("Error al eliminar:", error);
      await Swal.fire({ title: "Error", text: "No se pudo eliminar la empresa.", icon: "error" });
    }
  };

  const attemptEdit = (e: Empresa) => {
    setEditEmpresa(e);
    setShowEditEmpresa(true);
  };

  const closeEditor = () => {
    setShowEditEmpresa(false);
    setEditEmpresa(null);
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>Gestión de Empresas</span>
      </h2>

      <div className="mb-6 flex items-center justify-between">
        {/* CONTENEDOR IZQUIERDO (Agregar + Exportar Excel) */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  {/* Botón AGREGAR EMPRESA */}
                  <button
                    onClick={() => setShowAddEmpresa(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer"
                  >
                    Agregar nueva empresa
                  </button>

                  {/* Botón EXPORTAR EXCEL */}
                  <ExportExcel data={empresas} fileName="empresas.xlsx" />
                </>
              );
            }

            return (
              <p className="text-sm text-gray-600">
                Solo administradores pueden gestionar empresas.
              </p>
            );
          })()}
        </div>

        <Search 
          value={searchTerm} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
          onClear={() => setSearchTerm('')} 
          placeholder="Buscar por ID, Nombre o Tipo"
        />
      </div>

      {/* ADD MODAL */}
      {showAddEmpresa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <EmpresaForm 
            onCancel={() => setShowAddEmpresa(false)} 
            onSave={async ({ id_tipo_empresa, nombre }) => {
              setLoading(true);
              try {
                const nueva = await createEmpresa({ id_tipo_empresa, nombre });
                setEmpresas((prev: Empresa[]) => [nueva, ...prev]);
                setShowAddEmpresa(false);
                await Swal.fire({ icon: 'success', title: 'Empresa creada', text: `Empresa ${nombre} creada correctamente.` });
              } catch (err) {
                console.error("Error creando empresa:", err);
                await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear la empresa.' });
              } finally { 
                setLoading(false); 
              }
            }} 
          />
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditEmpresa && editEmpresa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <EmpresaForm
            isEdit
            initial={{ id_tipo_empresa: editEmpresa.id_tipo_empresa, nombre: editEmpresa.nombre }}
            onCancel={closeEditor}
            onSave={async ({ id_tipo_empresa, nombre }) => {
              setLoading(true);
              try {
                const updated = await updateEmpresa({ ...editEmpresa, id_tipo_empresa, nombre });
                setEmpresas((prev: Empresa[]) => prev.map((e: Empresa) => (e.id === updated.id ? updated : e)));
                closeEditor();
                await Swal.fire({ icon: 'success', title: 'Empresa actualizada', text: `Empresa ${nombre} actualizada correctamente.` });
              } catch (err) {
                console.error("Error actualizando empresa:", err);
                await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la empresa.' });
              } finally { 
                setLoading(false); 
              }
            }}
          />
        </div>
      )}

      {/* Tabla de Empresas */}
      <EmpresaTable
        empresas={empresas}
        loading={loading}
        searchTerm={searchTerm}
        auth={auth}
        attemptEdit={attemptEdit}
        handleEliminar={handleEliminar}
      />
    </div>
  );
}
