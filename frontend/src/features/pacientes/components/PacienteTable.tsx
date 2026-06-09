import { useState, useEffect, useMemo } from 'react';
import type { Paciente } from '../types';
import PacienteRow from './PacienteRow';
import PacientePagination from './PacientePagination';
import { Table } from '../../../components/notus';

interface PacienteTableProps {
  pacientes: Paciente[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  attemptEdit: (paciente: Paciente) => Promise<void> | void;
  handleEliminar: (id: string, nombre: string) => Promise<void> | void;
  remoteResults?: Paciente[] | null;
  isRemoteSearching?: boolean;
}

export default function PacienteTable({
  pacientes,
  loading,
  searchTerm,
  auth,
  attemptEdit,
  handleEliminar,
  remoteResults = null,
  isRemoteSearching = false,
}: PacienteTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 7;

  // Filtrar pacientes locales por término de búsqueda
  const displayed = useMemo(() => {
    if (!searchTerm.trim()) return pacientes;
    const term = searchTerm.toLowerCase();
    return pacientes.filter(
      (p) =>
        p.id.toLowerCase().includes(term) ||
        p.primer_nombre?.toLowerCase().includes(term) ||
        p.segundo_nombre?.toLowerCase().includes(term) ||
        p.primer_apellido?.toLowerCase().includes(term) ||
        p.segundo_apellido?.toLowerCase().includes(term) ||
        p.tipo_documento_codigo?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term)
    );
  }, [pacientes, searchTerm]);

  // Resultados efectivos: locales primero, remotos como fallback
  const effectiveData = useMemo(() => {
    if (displayed.length > 0) return displayed;
    if (remoteResults && remoteResults.length > 0) return remoteResults;
    return [];
  }, [displayed, remoteResults]);

  const isFromRemote = displayed.length === 0 && remoteResults != null && remoteResults.length > 0;

  // Calcular datos paginados
  const pageCount = Math.ceil(effectiveData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return effectiveData.slice(start, start + pageSize);
  }, [effectiveData, pageIndex, pageSize]);

  // Reset page cuando cambia el filtro o se obtienen resultados remotos
  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm, isFromRemote]);

  const headers = [
    'Tipo Doc', 
    'ID', 
    'Primer Nombre', 
    'Segundo Nombre', 
    'Primer Apellido', 
    'Segundo Apellido', 
    'Teléfono 1', 
    'Teléfono 2', 
    'Email', 
    'Acciones'
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-spinner fa-spin text-3xl text-blue-500" />
        <p className="mt-2 text-gray-600">Cargando pacientes...</p>
      </div>
    );
  }

  if (pacientes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <i className="fas fa-inbox text-4xl mb-2" />
        <p>No hay pacientes registrados.</p>
      </div>
    );
  }

  if (displayed.length === 0 && effectiveData.length === 0) {
    if (isRemoteSearching) {
      return (
        <Table headers={headers} color="light">
          <tr>
            <td colSpan={10} className="p-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
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
            <td colSpan={10} className="p-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              <i className="fas fa-database mr-2" />
              No se encontró ningún paciente con "<strong>{searchTerm}</strong>" en la base de datos.
            </td>
          </tr>
        </Table>
      );
    }

    return (
      <Table headers={headers} color="light">
        <tr>
          <td colSpan={10} className="p-6 text-center text-gray-500 text-xs">
            No se encontraron pacientes que coincidan con "{searchTerm}".
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
      <Table headers={headers} color="light">
        {paginatedData.map((paciente, ridx) => {
          const globalIdx = pageIndex * pageSize + ridx;
          return (
            <tr key={paciente.id}>
              <PacienteRow
                paciente={paciente}
                idx={globalIdx}
                auth={auth}
                attemptEdit={attemptEdit}
                handleEliminar={handleEliminar}
              />
            </tr>
          );
        })}
      </Table>

      <PacientePagination
        pageIndex={pageIndex}
        pageOptions={Array.from({ length: pageCount }, (_, i) => i)}
        canPreviousPage={pageIndex > 0}
        canNextPage={pageIndex < pageCount - 1}
        dataLength={effectiveData.length}
        gotoPage={setPageIndex}
        nextPage={() => setPageIndex(prev => Math.min(prev + 1, pageCount - 1))}
        previousPage={() => setPageIndex(prev => Math.max(prev - 1, 0))}
      />
    </div>
  );
}
