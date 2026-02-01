import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../hooks/useAuth";
import SeguimientoForm from "../components/SeguimientoForm";
import SeguimientoTable from "../components/SeguimientoTable";
import { getTiposSeguimiento, createTipoSeguimiento, updateTipoSeguimiento, deleteTipoSeguimiento } from "../Seguimiento.api";
import { exportToExcel } from '../../../utils/exportToExcel';
import { Card, CardHeader, CardBody, Button } from "../../../components/notus";

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
    <div>
      <Card>
        <CardHeader color="lightBlue" className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fas fa-search text-2xl text-white"></i>
            <h6 className="text-lg font-bold text-white uppercase m-0">Gestión de Tipos de Seguimiento</h6>
          </div>
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowAdd(true)}
                    color="white"
                    size="sm"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    AGREGAR TIPO
                  </Button>
                  <Button
                    color="white"
                    size="sm"
                    onClick={() => exportToExcel(tipos, 'tipos-seguimiento')}
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
          <div className="mb-8">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar tipos de seguimiento por nombre o descripción..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>
          </div>

          <SeguimientoTable
            tipos={tipos}
            loading={loading}
            searchTerm={searchTerm}
            auth={auth}
            setEditTipo={setEditTipo}
            setShowEdit={setShowEdit}
            handleDelete={handleDelete}
          />
        </CardBody>
      </Card>

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
    </div>
  );
}
