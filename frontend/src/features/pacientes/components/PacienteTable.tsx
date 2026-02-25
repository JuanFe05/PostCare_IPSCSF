import { useState, useEffect, useMemo } from 'react';
import type { Paciente } from '../types';
import PacienteRow from './PacienteRow';
import PacientePagination from './PacientePagination';
import { Table } from '../../../components/notus';
import VirtualizedTable from '../../../components/notus/VirtualizedTable';

interface PacienteTableProps {
  pacientes: Paciente[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  attemptEdit: (paciente: Paciente) => Promise<void> | void;
  handleEliminar: (id: string, nombre: string) => Promise<void> | void;
}

export default function PacienteTable({
  pacientes,
  loading,
  searchTerm,
  auth,
  attemptEdit,
  handleEliminar,
}: PacienteTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 7;
  const VIRTUALIZATION_THRESHOLD = 100; // Usar virtualización si hay más de 100 registros

  // Filtrar pacientes por término de búsqueda
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

  const useVirtualization = displayed.length > VIRTUALIZATION_THRESHOLD;

  // Calcular datos paginados (solo si no se usa virtualización)
  const pageCount = Math.ceil(displayed.length / pageSize);
  const paginatedData = useMemo(() => {
    if (useVirtualization) return displayed; // Mostrar todos si se virtualiza
    const start = pageIndex * pageSize;
    return displayed.slice(start, start + pageSize);
  }, [displayed, pageIndex, pageSize, useVirtualization]);

  // Reset page cuando cambia el filtro
  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm]);

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

  if (displayed.length === 0) {
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

  // Renderizar con virtualización para datasets grandes
  if (useVirtualization) {
    return (
      <div>
        <div className="mb-4 text-sm text-gray-600 text-center">
          Mostrando {displayed.length} pacientes (virtualizado para mejor rendimiento)
        </div>
        <VirtualizedTable headers={headers} color="light" rowHeight={60} height={600}>
          {displayed.map((paciente, idx) => (
            <tr key={paciente.id}>
              <PacienteRow
                paciente={paciente}
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
        dataLength={displayed.length}
        gotoPage={setPageIndex}
        nextPage={() => setPageIndex(prev => Math.min(prev + 1, pageCount - 1))}
        previousPage={() => setPageIndex(prev => Math.max(prev - 1, 0))}
      />
    </div>
  );
}
