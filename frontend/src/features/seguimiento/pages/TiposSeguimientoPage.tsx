import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../hooks/useAuth";
import SeguimientoForm from "../components/SeguimientoForm";
import SeguimientoTable from "../components/SeguimientoTable";
import { getTiposSeguimiento, createTipoSeguimiento, updateTipoSeguimiento, deleteTipoSeguimiento } from "../Seguimiento.api";
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";
import Search from "../../../components/search/Search";

export interface TipoSeguimiento {
  id: number;
  nombre: string;
  descripcion?: string;
}

export default function TiposSeguimientoPage() {
  const [tipos, setTipos] = useState<TipoSeguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTipo, setEditTipo] = useState<TipoSeguimiento | null>(null);
  const { auth } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTiposSeguimiento();
      setTipos(data);
    } catch (err) {
      console.error("Error cargando tipos de seguimiento:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    const res = await Swal.fire({
      title: `¿Eliminar ${nombre}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });
    if (!res.isConfirmed) return;
    try {
      await deleteTipoSeguimiento(id);
      setTipos((prev: TipoSeguimiento[]) => prev.filter((t: TipoSeguimiento) => t.id !== id));
      await Swal.fire({ icon: 'success', title: 'Eliminado', text: `${nombre} eliminado.` });
    } catch (err) {
      console.error('Error eliminando tipo seguimiento:', err);
      await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.' });
    }
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Tipos de Seguimiento</h2>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-shrink-0 flex items-center gap-3">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer">
                    Agregar nuevo tipo seguimiento
                  </button>
                  <ExportExcel data={tipos} fileName="seguimientos.xlsx" />
                </>
              );
            }
            return <p className="text-sm text-gray-600">Solo administradores pueden gestionar tipos.</p>;
          })()}
        </div>

        <Search 
          value={searchTerm} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
          onClear={() => setSearchTerm('')} 
          placeholder="Buscar por Nombre o Descripción"
        />
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <SeguimientoForm 
            isEdit={false} 
            onCancel={() => setShowAdd(false)} 
            onSave={async (payload) => {
              setLoading(true);
              try {
                const created = await createTipoSeguimiento(payload);
                setTipos((prev: TipoSeguimiento[]) => [created, ...prev]);
                setShowAdd(false);
                await Swal.fire({ icon: 'success', title: 'Creado', text: `Tipo ${created.nombre} creado.` });
              } catch (err) {
                console.error('Error creando tipo seguimiento:', err);
                await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear.' });
              } finally { 
                setLoading(false); 
              }
            }} 
          />
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && editTipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <SeguimientoForm 
            isEdit 
            initial={{ nombre: editTipo.nombre, descripcion: editTipo.descripcion }} 
            onCancel={() => { 
              setShowEdit(false); 
              setEditTipo(null); 
            }} 
            onSave={async (payload) => {
              if (!editTipo) return;
              setLoading(true);
              try {
                const updated = await updateTipoSeguimiento(editTipo.id, payload);
                setTipos((prev: TipoSeguimiento[]) => prev.map((p: TipoSeguimiento) => p.id === updated.id ? updated : p));
                setShowEdit(false);
                setEditTipo(null);
                await Swal.fire({ icon: 'success', title: 'Actualizado', text: `Tipo ${updated.nombre} actualizado.` });
              } catch (err) {
                console.error('Error actualizando tipo seguimiento:', err);
                await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar.' });
              } finally { 
                setLoading(false); 
              }
            }} 
          />
        </div>
      )}

      {/* Tabla de Tipos de Seguimiento */}
      <SeguimientoTable
        tipos={tipos}
        loading={loading}
        searchTerm={searchTerm}
        auth={auth}
        setEditTipo={setEditTipo}
        setShowEdit={setShowEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
}
