import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { Empresa } from "../types";
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from "../Empresa.api";
import Swal from "sweetalert2";
import EmpresaForm from "../components/EmpresaForm";
import EmpresaTable from "../components/EmpresaTable";
import { exportToExcel } from '../../../utils/exportToExcel';

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
              <i className="fas fa-building" style={{ color: 'white', fontSize: '1.1rem' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1.05rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                Gestión de Empresas
              </h2>
              <p style={{ color: 'rgba(147,174,245,0.8)', fontSize: '0.78rem', margin: 0 }}>
                {empresas.length > 0 ? `${empresas.length} registro${empresas.length !== 1 ? 's' : ''} cargados` : 'Cargando...'}
              </p>
            </div>
          </div>
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowAddEmpresa(true)}
                    className="ui-btn ui-btn-ghost"
                    style={{ height: '38px' }}
                  >
                    <i className="fas fa-plus" style={{ fontSize: '0.8rem' }} />
                    Agregar Empresa
                  </button>
                  <button
                    onClick={() => exportToExcel(empresas, 'empresas')}
                    className="ui-btn ui-btn-ghost"
                    style={{ height: '38px' }}
                  >
                    <i className="fas fa-file-excel" style={{ fontSize: '0.8rem' }} />
                    Exportar
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
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="ui-input"
              style={{ paddingLeft: '2.2rem', height: '40px', fontSize: '0.875rem' }}
              title="Buscar por: ID, Nombre o Tipo de Empresa"
            />
          </div>
        </div>

        {/* Tabla */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <EmpresaTable
            empresas={empresas}
            loading={loading}
            searchTerm={searchTerm}
            auth={auth}
            attemptEdit={attemptEdit}
            handleEliminar={handleEliminar}
          />
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddEmpresa && (
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
      )}

      {/* EDIT MODAL */}
      {showEditEmpresa && editEmpresa && (
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
      )}
    </div>
  );
}
