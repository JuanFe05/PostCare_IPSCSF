import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { Empresa } from "../types";
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from "../Empresa.api";
import Swal from "sweetalert2";
import EmpresaForm from "../components/EmpresaForm";
import EmpresaTable from "../components/EmpresaTable";
import { exportToExcel } from '../../../utils/exportToExcel';
import { Card, CardHeader, CardBody, Button } from "../../../components/notus";

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
    <div>
      <Card>
        <CardHeader color="lightBlue" className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-building text-2xl text-white"></i>
            <h6 className="text-lg font-bold text-white uppercase m-0">Gestión de Empresas</h6>
          </div>
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowAddEmpresa(true)}
                    color="white"
                    size="sm"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    AGREGAR EMPRESA
                  </Button>
                  <Button
                    color="white"
                    size="sm"
                    onClick={() => exportToExcel(empresas, 'empresas')}
                  >
                    <i className="fas fa-file-excel mr-2"></i>
                    EXPORTAR
                  </Button>
                </div>
              );
            }
            return null;
          })()}
        </CardHeader>
        
        <CardBody>
          {/* Buscador */}
          <div className="mb-8 flex justify-end">
            <div className="relative max-w-md w-full">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 h-[52px] border-2 border-gray-200 rounded-lg bg-white font-medium shadow-sm hover:shadow-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
                title="Buscar por: ID, Nombre o Tipo de Empresa"
              />
            </div>
          </div>

          {/* Tabla */}
          <EmpresaTable
            empresas={empresas}
            loading={loading}
            searchTerm={searchTerm}
            auth={auth}
            attemptEdit={attemptEdit}
            handleEliminar={handleEliminar}
          />
        </CardBody>
      </Card>

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
    </div>
  );
}
