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
  remoteResults?: Atencion[] | null;
  isRemoteSearching?: boolean;
}

export default function AtencionTable({ 
  atenciones, 
  loading, 
  searchTerm,
  selectedEstadoId,
  selectedSeguimientoId,
  auth,
  attemptEdit,
  handleEliminar,
  remoteResults = null,
  isRemoteSearching = false,
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
  // Calcular lista filtrada + ordenada (resultados locales)
  const displayed = useMemo(() => {
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

    const byFilters = filtered.filter((a: Atencion) => {
      if (selectedEstadoId && Number(a.id_estado_atencion) !== Number(selectedEstadoId)) return false;
      if (selectedSeguimientoId && Number(a.id_seguimiento_atencion ?? -1) !== Number(selectedSeguimientoId)) return false;
      return true;
    });

    return [...byFilters].sort((a, b) =>
      (b.fecha_atencion ?? '').localeCompare(a.fecha_atencion ?? '')
    );
  }, [atenciones, searchTerm, selectedEstadoId, selectedSeguimientoId]);

  // Función auxiliar de ordenamiento: más reciente → más antiguo
  const sortByFechaDesc = (list: Atencion[]) =>
    [...list].sort((a, b) =>
      (b.fecha_atencion ?? '').localeCompare(a.fecha_atencion ?? '')
    );

  // Resultados efectivos: locales primero (ya ordenados), remotos como fallback (se ordenan aquí)
  const effectiveData = useMemo(() => {
    if (displayed.length > 0) return displayed;
    if (remoteResults && remoteResults.length > 0) return sortByFechaDesc(remoteResults);
    return [];
  }, [displayed, remoteResults]);

  const isFromRemote = displayed.length === 0 && remoteResults != null && remoteResults.length > 0;

  // Calcular datos paginados
  const pageCount = Math.ceil(effectiveData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return effectiveData.slice(start, start + pageSize);
  }, [effectiveData, pageIndex, pageSize]);

  // ==================== Efectos ====================
  // Reset page cuando cambia el filtro o la fuente de resultados
  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm, selectedEstadoId, selectedSeguimientoId, isFromRemote]);

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

  if (displayed.length === 0 && effectiveData.length === 0) {
    if (isRemoteSearching) {
      return (
        <Table headers={headers} color="light">
          <tr>
            <td colSpan={visibleColumns.length} className="p-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              <i className="fas fa-spinner fa-spin mr-2" style={{ color: 'var(--brand-500)' }} />
              Buscando en base de datos...
            </td>
          </tr>
        </Table>
      );
    }

    if (remoteResults !== null) {
      return (
        <Table headers={headers} color="light">
          <tr>
            <td colSpan={visibleColumns.length} className="p-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              <i className="fas fa-database mr-2" />
              No se encontró ninguna atención con "<strong>{searchTerm}</strong>" en la base de datos.
            </td>
          </tr>
        </Table>
      );
    }

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

  // Renderizar con paginación
  return (
    <div>
      {isFromRemote && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.85rem',
            marginBottom: '0.75rem',
            borderRadius: '8px',
            background: 'rgba(34,72,179,0.08)',
            border: '1px solid rgba(34,72,179,0.2)',
            fontSize: '0.75rem',
            color: 'var(--brand-700, #1a338e)',
          }}
        >
          <i className="fas fa-database" style={{ fontSize: '0.7rem' }} />
          <span>
            Resultado de búsqueda en base de datos completa.
          </span>
        </div>
      )}
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
        dataLength={effectiveData.length}
        pageSize={pageSize}
        gotoPage={setPageIndex}
        nextPage={() => setPageIndex(prev => Math.min(prev + 1, pageCount - 1))}
        previousPage={() => setPageIndex(prev => Math.max(prev - 1, 0))}
      />
    </div>
  );
}
