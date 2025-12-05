import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { Atencion, NewAtencion, UpdateAtencion } from "../types";
import { getAtenciones, createAtencion, updateAtencion, deleteAtencion } from "../Atencion.api";
import Swal from "sweetalert2";
import AtencionForm from "./AtencionForm";
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";
import AtencionRow from "./AtencionRow";
import AtencionSearch from "./AtencionSearch";
import AtencionPagination from "./AtencionPagination";
import { useTable, usePagination } from 'react-table';

export default function AtencionTable() {
  const [showAddAtencion, setShowAddAtencion] = useState(false);
  const [showEditAtencion, setShowEditAtencion] = useState(false);
  const [editAtencion, setEditAtencion] = useState<Atencion | null>(null);
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

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

  // Calcular lista filtrada + ordenada
  const displayed = useMemo(() => {
    // Filtrar
    const filtered = atenciones.filter((a: Atencion) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(a.id_atencion ?? '').toLowerCase().includes(q);
      const pacienteMatch = String(a.nombre_paciente ?? '').toLowerCase().includes(q);
      const empresaMatch = String(a.nombre_empresa ?? '').toLowerCase().includes(q);
      const estadoMatch = String(a.nombre_estado_atencion ?? '').toLowerCase().includes(q);
      return idMatch || pacienteMatch || empresaMatch || estadoMatch;
    });

    // Ordenar
    if (!sortKey || !sortDir) return filtered;
    const sorted = [...filtered].sort((a: any, b: any) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === 'asc' ? -1 : 1;
      if (vb == null) return sortDir === 'asc' ? 1 : -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return sorted;
  }, [atenciones, searchTerm, sortKey, sortDir]);

  // Columnas de react-table
  const columns = useMemo(() => [
    { Header: 'ID Atención', accessor: 'id_atencion' as const },
    { Header: 'ID Paciente', accessor: 'id_paciente' as const },
    { Header: 'Fecha Atención', accessor: 'fecha_atencion' as const },
    { Header: 'Paciente', accessor: 'nombre_paciente' as const },
    { Header: 'Teléfono 1', accessor: 'telefono_uno' as const },
    { Header: 'Teléfono 2', accessor: 'telefono_dos' as const },
    { Header: 'Email', accessor: 'email' as const },
    { Header: 'Empresa', accessor: 'nombre_empresa' as const },
    { Header: 'Estado', accessor: 'nombre_estado_atencion' as const },
    { Header: 'Seguimiento', accessor: 'nombre_seguimiento_atencion' as const },
    { Header: 'Servicios', accessor: 'servicios' as const },
    { Header: 'Acciones', accessor: 'id_atencion' as const },
  ], []);

  const data = useMemo(() => displayed, [displayed]);

  const tableInstance: any = useTable({ columns, data, initialState: { pageIndex: 0 } as any }, usePagination);
  const {
    getTableProps,
    getTableBodyProps,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex },
    gotoPage,
    nextPage,
    previousPage,
  } = tableInstance;

  // Establecer el tamaño de página en 11
  useEffect(() => {
    if (tableInstance.setPageSize) {
      tableInstance.setPageSize(11);
    }
  }, [tableInstance]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') setSortDir('desc');
    else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    } else setSortDir('asc');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>Gestión de Atenciones</span>
      </h2>

      <div className="mb-6 flex items-center justify-between">
        {/* CONTENEDOR IZQUIERDO (Agregar + Exportar Excel) */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <>
                  {/* Botón AGREGAR ATENCIÓN */}
                  <button
                    onClick={() => setShowAddAtencion(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer"
                  >
                    Agregar nueva atención
                  </button>

                  {/* Botón EXPORTAR EXCEL */}
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

        <AtencionSearch 
          value={searchTerm} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
          onClear={() => setSearchTerm('')} 
          placeholder="Buscar por ID, paciente, empresa o estado" 
        />
      </div>

      {/* MODAL AGREGAR */}
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

      {/* MODAL EDITAR */}
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

      {loading ? (
        <div className="text-center py-8">Cargando atenciones...</div>
      ) : (
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full text-sm divide-y table-auto">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                {columns.map((col: any) => (
                  <th 
                    key={col.accessor} 
                    className={`p-3 font-semibold text-center select-none ${
                      col.accessor === 'servicios' || col.accessor === 'id_atencion' ? '' : 'cursor-pointer'
                    }`} 
                    onClick={() => col.accessor !== 'servicios' && col.accessor !== 'id_atencion' && toggleSort(col.accessor)}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{col.Header}</span>
                      {col.accessor !== 'servicios' && col.accessor !== 'id_atencion' && (
                        <span className="inline-flex flex-col ml-2 text-xs leading-none">
                          <span className={sortKey === col.accessor && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                          <span className={sortKey === col.accessor && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody {...getTableBodyProps()} className="bg-white">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-6 text-center text-gray-500">No se encontraron atenciones.</td>
                </tr>
              ) : (
                page.map((row: any, ridx: number) => {
                  const atencion: Atencion = row.original;
                  const globalIdx = pageIndex * 11 + ridx;
                  return (
                    <tr key={atencion.id_atencion} className={`${globalIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                      <AtencionRow
                        atencion={atencion}
                        idx={globalIdx}
                        auth={auth}
                        attemptEdit={attemptEdit}
                        handleEliminar={handleEliminar}
                      />
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <AtencionPagination
            pageIndex={pageIndex}
            pageOptions={pageOptions}
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            dataLength={data.length}
            gotoPage={gotoPage}
            nextPage={nextPage}
            previousPage={previousPage}
          />
        </div>
      )}
    </div>
  );
}
