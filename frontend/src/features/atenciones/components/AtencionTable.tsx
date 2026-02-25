import { useState, useEffect, useMemo } from "react";
import type { Atencion } from "../types";
import AtencionRow from "./AtencionRow";
import AtencionPagination from "./AtencionPagination";
import { Table, VirtualizedTable } from '../../../components/notus';

// Umbral para activar virtualización (performance con datasets grandes)
const VIRTUALIZATION_THRESHOLD = 100;

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
  const pageSize = 7;

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

  // Determinar si usar virtualización
  const useVirtualization = displayed.length > VIRTUALIZATION_THRESHOLD;

  // Calcular datos paginados (solo si no se usa virtualización)
  const pageCount = Math.ceil(displayed.length / pageSize);
  const paginatedData = useMemo(() => {
    if (useVirtualization) return displayed; // Mostrar todos si se virtualiza
    const start = pageIndex * pageSize;
    return displayed.slice(start, start + pageSize);
  }, [displayed, pageIndex, pageSize, useVirtualization]);

  // ==================== Efectos ====================
  // Reset page cuando cambia el filtro
  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm, selectedEstadoId, selectedSeguimientoId]);

  // ==================== Renderizado ====================
  const headers = visibleColumns.map(c => c.Header);

  if (loading) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-spinner fa-spin text-3xl text-blue-500" />
        <p className="mt-2 text-gray-600">Cargando atenciones...</p>
      </div>
    );
  }

  if (atenciones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <i className="fas fa-inbox text-4xl mb-2" />
        <p>No hay atenciones registradas.</p>
      </div>
    );
  }

  if (displayed.length === 0) {
    return (
      <Table headers={headers} color="light">
        <tr>
          <td colSpan={visibleColumns.length} className="p-6 text-center text-gray-500 text-xs">
            No se encontraron atenciones con los filtros aplicados.
          </td>
        </tr>
      </Table>
    );
  }

  // Renderizar con virtualización para datasets grandes
  if (useVirtualization) {
    return (
      <div>
        <div className="mb-4 text-sm text-gray-600 text-center">
          Mostrando {displayed.length} atenciones (virtualizado para mejor rendimiento)
        </div>
        <VirtualizedTable headers={headers} color="light" rowHeight={80} height={600}>
          {displayed.map((atencion: Atencion, idx: number) => (
            <tr key={atencion.id_atencion}>
              <AtencionRow
                atencion={atencion}
                idx={idx}
                auth={auth}
                attemptEdit={attemptEdit}
                handleEliminar={handleEliminar}
              />
            </tr>
          ))}
        </VirtualizedTable>
      </div>
    );
  }

  // Renderizar con paginación tradicional para datasets pequeños
  return (
    <div>
      <Table headers={headers}>
        {paginatedData.map((atencion: Atencion, ridx: number) => {
          const globalIdx = pageIndex * pageSize + ridx;
          return (
            <tr key={atencion.id_atencion}>
              <AtencionRow
                atencion={atencion}
                idx={globalIdx}
                auth={auth}
                attemptEdit={attemptEdit}
                handleEliminar={handleEliminar}
              />
            </tr>
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
