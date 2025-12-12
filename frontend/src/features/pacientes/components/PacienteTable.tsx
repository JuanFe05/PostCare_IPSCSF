import { useState, useEffect, useMemo } from 'react';
import { useTable, usePagination } from 'react-table';
import type { Paciente } from '../types';
import PacienteRow from './PacienteRow';
import PacientePagination from './PacientePagination';

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
  const [sortKey, setSortKey] = useState<keyof Paciente | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
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

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const columns = useMemo(
    () => [
      { Header: 'Tipo Doc', accessor: 'tipo_documento_codigo' as const },
      { Header: 'ID', accessor: 'id' as const },
      { Header: 'Primer Nombre', accessor: 'primer_nombre' as const },
      { Header: 'Segundo Nombre', accessor: 'segundo_nombre' as const },
      { Header: 'Primer Apellido', accessor: 'primer_apellido' as const },
      { Header: 'Segundo Apellido', accessor: 'segundo_apellido' as const },
      { Header: 'Teléfono 1', accessor: 'telefono_uno' as const },
      { Header: 'Teléfono 2', accessor: 'telefono_dos' as const },
      { Header: 'Email', accessor: 'email' as const },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data: sorted,
      initialState: { pageIndex: 0 } as any,
    },
    usePagination
  ) as any;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex },
  } = tableInstance;

  useEffect(() => {
    if (tableInstance.setPageSize) {
      tableInstance.setPageSize(10);
    }
  }, [tableInstance]);

  const handleSort = (key: keyof Paciente) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full text-sm divide-y table-auto">
          <thead className="bg-blue-100 text-blue-900 select-none">
            {headerGroups.map((headerGroup: any) => {
              const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupKey} {...headerGroupProps}>
                  {headerGroup.headers.map((column: any) => {
                    const { key: columnKey, ...columnProps } = column.getHeaderProps();
                    const accessor = column.id as keyof Paciente;
                    return (
                      <th
                        key={columnKey}
                        {...columnProps}
                        className="p-3 font-semibold text-center cursor-pointer"
                        onClick={() => handleSort(accessor)}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>{column.render('Header')}</span>
                          <span className="inline-flex flex-col ml-1 text-[10px] leading-none">
                            <span className={sortKey === accessor && sortDir === 'asc' ? 'text-blue-700' : 'text-gray-300'}>▲</span>
                            <span className={sortKey === accessor && sortDir === 'desc' ? 'text-blue-700' : 'text-gray-300'}>▼</span>
                          </span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-3 font-semibold w-32 text-center">
                    Acciones
                  </th>
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white">
            {page.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-gray-500">
                  {searchTerm
                    ? `No se encontraron pacientes que coincidan con "${searchTerm}".`
                    : 'No hay pacientes registrados.'}
                </td>
              </tr>
            ) : (
              page.map((row: any, ridx: number) => {
                prepareRow(row);
                const { key: rowKey, ...rowProps } = row.getRowProps();
                const paciente = row.original;
                return (
                  <tr
                    key={rowKey}
                    {...rowProps}
                    className={`${ridx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                  >
                    <PacienteRow
                      paciente={paciente}
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
      </div>

      <PacientePagination
        pageIndex={pageIndex}
        pageOptions={pageOptions}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        dataLength={sorted.length}
        gotoPage={gotoPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </div>
  );
}
