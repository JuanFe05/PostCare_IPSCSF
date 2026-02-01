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
  const pageSize = 10;

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

  // Calcular datos paginados
  const pageCount = Math.ceil(displayed.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return displayed.slice(start, start + pageSize);
  }, [displayed, pageIndex, pageSize]);

  // Reset page cuando cambia el filtro
  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm]);

  return loading ? (
    <div className="text-center py-8 text-xs">Cargando pacientes...</div>
  ) : (
    <div>
      <Table 
        headers={[
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
        ]} 
        color="light"
      >
        {displayed.length === 0 ? (
          <tr>
            <td colSpan={10} className="p-6 text-center text-gray-500 text-xs">
              {searchTerm
                ? `No se encontraron pacientes que coincidan con "${searchTerm}".`
                : 'No hay pacientes registrados.'}
            </td>
          </tr>
        ) : (
          paginatedData.map((paciente, ridx) => {
            const globalIdx = pageIndex * pageSize + ridx;
            return (
              <PacienteRow
                key={paciente.id}
                paciente={paciente}
                idx={globalIdx}
                auth={auth}
                attemptEdit={attemptEdit}
                handleEliminar={handleEliminar}
              />
            );
          })
        )}
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
