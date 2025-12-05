import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import type { Empresa } from "../types";
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from "../Empresa.api";
import Swal from "sweetalert2";
import EmpresaForm from "./EmpresaForm";
import ExportExcel from "../../../components/exportExcel/ExportExcelButton";
import EmpresaRow from "./EmpresaRow";
import EmpresaSearch from "./EmpresaSearch";
import { useTable, usePagination } from 'react-table';

export default function EmpresaTable() {
  const [showAddEmpresa, setShowAddEmpresa] = useState(false);
  const [showEditEmpresa, setShowEditEmpresa] = useState(false);
  const [editEmpresa, setEditEmpresa] = useState<Empresa | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

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

  // calcular lista filtrada + ordenada
  const displayed = useMemo(() => {
    // filter
    const filtered = empresas.filter((e: Empresa) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(e.id ?? '').toLowerCase().includes(q);
      const nombreMatch = String(e.nombre ?? '').toLowerCase().includes(q);
      const tipoMatch = String(e.tipo_empresa_nombre ?? '').toLowerCase().includes(q);
      return idMatch || nombreMatch || tipoMatch;
    });

    // sort
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
  }, [empresas, searchTerm, sortKey, sortDir]);

  // react-table columns (used for headers and pagination only)
  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' as const },
    { Header: 'Nombre', accessor: 'nombre' as const },
    { Header: 'Tipo', accessor: 'tipo_empresa_nombre' as const },
    { Header: 'Acciones', accessor: 'id' as const },
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

  // Set page size to 11
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

        <EmpresaSearch value={searchTerm} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} onClear={() => setSearchTerm('')} placeholder="Buscar por nombre o tipo" />
      </div>

      {showAddEmpresa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <EmpresaForm onCancel={() => setShowAddEmpresa(false)} onSave={async ({ id_tipo_empresa, nombre }) => {
            setLoading(true);
            try {
              const nueva = await createEmpresa({ id_tipo_empresa, nombre });
              setEmpresas((prev: Empresa[]) => [nueva, ...prev]);
              setShowAddEmpresa(false);
              await Swal.fire({ icon: 'success', title: 'Empresa creada', text: `Empresa ${nombre} creada correctamente.` });
            } catch (err) {
              console.error("Error creando empresa:", err);
              await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear la empresa.' });
            } finally { setLoading(false); }
          }} />
        </div>
      )}

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
              } finally { setLoading(false); }
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Cargando empresas...</div>
      ) : (
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full text-sm divide-y table-auto">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                {columns.map((col: any) => (
                  <th key={col.accessor} className={`p-3 font-semibold ${col.accessor === 'id' ? 'w-16' : col.accessor === 'acciones' ? 'w-32' : 'text-center'} text-center select-none`} onClick={() => col.accessor !== 'acciones' && toggleSort(col.accessor)}>
                    <div className="flex items-center justify-center gap-1">
                      <span>{col.Header}</span>
                      {col.accessor !== 'acciones' && (
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
                  <td colSpan={4} className="p-6 text-center text-gray-500">No se encontraron empresas.</td>
                </tr>
              ) : (
                page.map((row: any, ridx: number) => {
                  const e: Empresa = row.original;
                  const globalIdx = pageIndex * 11 + ridx;
                  return (
                    <tr key={e.id} className={`${globalIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                      <EmpresaRow
                        e={e}
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

          {/* Pagination controls */}
          {data.length > 11 && (
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Mostrando <span className="font-semibold">{pageIndex * 11 + 1}</span> - <span className="font-semibold">{Math.min((pageIndex + 1) * 11, data.length)}</span> de <span className="font-semibold">{data.length}</span> empresas
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => gotoPage(0)} 
                  disabled={!canPreviousPage} 
                  className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${!canPreviousPage ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  title="Primera página"
                >
                  ««
                </button>
                <button 
                  onClick={() => previousPage()} 
                  disabled={!canPreviousPage} 
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${!canPreviousPage ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Anterior
                </button>
                
                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                  Página <span className="font-bold">{pageIndex + 1}</span> de <span className="font-bold">{pageOptions.length}</span>
                </span>
                
                <button 
                  onClick={() => nextPage()} 
                  disabled={!canNextPage} 
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${!canNextPage ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Siguiente
                </button>
                <button 
                  onClick={() => gotoPage(pageOptions.length - 1)} 
                  disabled={!canNextPage} 
                  className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${!canNextPage ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  title="Última página"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
