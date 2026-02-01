import { useState, useEffect, useMemo } from "react";
import type { Atencion } from "../types";
import AtencionRow from "./AtencionRow";
import AtencionPagination from "./AtencionPagination";
import { Table } from '../../../components/notus';

interface AtencionTableProps {
  atenciones: Atencion[];
  loading: boolean;
  searchTerm: string;
  selectedEstadoId?: number | null;
  selectedSeguimientoId?: number | null;
  auth: any;
  attemptEdit: (atencion: Atencion) => void;
  handleEliminar: (id: string, nombrePaciente: string) => Promise<void>;
}

export default function AtencionTable({ 
  atenciones, 
  loading, 
  searchTerm,
  selectedEstadoId,
  selectedSeguimientoId,
  auth,
  attemptEdit,
  handleEliminar 
}: AtencionTableProps) {
  // ==================== Estado ====================
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  // ==================== Verificación de Roles ====================
  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
  const isAdmin = role === 'ADMINISTRADOR';
  const canViewTipoEmpresa = isAdmin || role === 'ASESOR' || role === 'FACTURADOR';

  // ==================== Definición de Columnas ====================
  const columns = [
    { Header: 'Acciones', accessor: 'acciones' },
    { Header: 'Estado', accessor: 'nombre_estado_atencion' },
    { Header: 'Seguimiento', accessor: 'nombre_seguimiento_atencion' },
    { Header: 'ID Atención', accessor: 'id_atencion' },
    { Header: 'F. Atención', accessor: 'fecha_atencion' },
    { Header: 'ID Paciente', accessor: 'id_paciente' },
    { Header: 'Paciente', accessor: 'nombre_paciente' },
    { Header: 'Empresa', accessor: 'nombre_empresa' },
    { Header: 'Tipo Empresa', accessor: 'tipo_empresa_nombre' },
    { Header: 'Teléfono 1', accessor: 'telefono_uno' },
    { Header: 'Teléfono 2', accessor: 'telefono_dos' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Servicios', accessor: 'servicios' },
    { Header: 'Observación', accessor: 'observacion' },
  ];

  // Columnas adicionales solo para ADMINISTRADOR
  const adminColumns = isAdmin ? [
    { Header: 'Usuario Modificación', accessor: 'nombre_usuario_modificacion' },
    { Header: 'Fecha Modificación', accessor: 'fecha_modificacion' },
  ] : [];

  const allColumns = [...columns, ...adminColumns];

  // Filtrar columnas visibles según permisos
  const visibleColumns = allColumns.filter((col: any) => {
    if (col.accessor === 'tipo_empresa_nombre' && !canViewTipoEmpresa) return false;
    return true;
  });

  // ==================== Valores Derivados (Memoized) ====================
  // Calcular lista filtrada + ordenada
  const displayed = useMemo(() => {
    // Filtrar por búsqueda
    const filtered = atenciones.filter((a: Atencion) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(a.id_atencion ?? '').toLowerCase().includes(q);
      const idPacienteMatch = String(a.id_paciente ?? '').toLowerCase().includes(q);
      const pacienteMatch = String(a.nombre_paciente ?? '').toLowerCase().includes(q);
      const empresaMatch = String(a.nombre_empresa ?? '').toLowerCase().includes(q);
      const estadoMatch = String(a.nombre_estado_atencion ?? '').toLowerCase().includes(q);
      return idMatch || idPacienteMatch || pacienteMatch || empresaMatch || estadoMatch;
    });

    // Aplicar filtros por estado/seguimiento
    const byFilters = filtered.filter((a: Atencion) => {
      if (selectedEstadoId && Number(a.id_estado_atencion) !== Number(selectedEstadoId)) return false;
      if (selectedSeguimientoId && Number(a.id_seguimiento_atencion ?? -1) !== Number(selectedSeguimientoId)) return false;
      return true;
    });

    // Ordenar por fecha_atencion descendente (más reciente primero)
    const sorted = [...byFilters].sort((a: any, b: any) => {
      const dateA = new Date(a.fecha_atencion);
      const dateB = new Date(b.fecha_atencion);
      return dateB.getTime() - dateA.getTime();
    });
    
    return sorted;
  }, [atenciones, searchTerm, selectedEstadoId, selectedSeguimientoId]);

  // Calcular datos paginados
  const pageCount = Math.ceil(displayed.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return displayed.slice(start, start + pageSize);
  }, [displayed, pageIndex, pageSize]);

  // ==================== Efectos ====================
  // Reset page cuando cambia el filtro
  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm, selectedEstadoId, selectedSeguimientoId]);

  // ==================== Renderizado ====================
  return loading ? (
    <div className="text-center text-gray-500 py-12 text-xs">
      Cargando atenciones...
    </div>
  ) : displayed.length === 0 ? (
    <div className="text-center text-gray-400 py-12 text-xs">
      No se encontraron atenciones.
    </div>
  ) : (
    <div>
      <Table headers={visibleColumns.map(c => c.Header)}>
        {paginatedData.map((atencion: Atencion, ridx: number) => {
          const globalIdx = pageIndex * pageSize + ridx;
          return (
            <AtencionRow
              key={atencion.id_atencion}
              atencion={atencion}
              idx={globalIdx}
              auth={auth}
              attemptEdit={attemptEdit}
              handleEliminar={handleEliminar}
            />
          );
        })}
      </Table>

      <AtencionPagination
        pageIndex={pageIndex}
        pageOptions={Array.from({ length: pageCount }, (_, i) => i)}
        canPreviousPage={pageIndex > 0}
        canNextPage={pageIndex < pageCount - 1}
        dataLength={displayed.length}
        pageSize={pageSize}
        gotoPage={setPageIndex}
        nextPage={() => setPageIndex(prev => Math.min(prev + 1, pageCount - 1))}
        previousPage={() => setPageIndex(prev => Math.max(prev - 1, 0))}
      />
    </div>
  );
}
