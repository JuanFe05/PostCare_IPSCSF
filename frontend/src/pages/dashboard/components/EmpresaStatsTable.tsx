// src/pages/dashboard/components/EmpresaStatsTable.tsx
import { useMemo, useState } from 'react';
import type { Atencion } from '../../../features/atenciones/types';

interface EmpresaRow {
  nombre: string;
  urgencias: number;
  externas: number;
  total: number;
  pct: string;
}

interface EmpresaStatsTableProps {
  atenciones: Atencion[];
  loading: boolean;
}

const PAGE_SIZE = 6;

export default function EmpresaStatsTable({ atenciones, loading }: EmpresaStatsTableProps) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<keyof EmpresaRow>('total');
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    const map: Record<string, { urgencias: number; externas: number; total: number }> = {};
    for (const a of atenciones) {
      const key = a.nombre_empresa ?? 'Sin empresa';
      if (!map[key]) map[key] = { urgencias: 0, externas: 0, total: 0 };
      map[key].total++;
      if (/ADM/i.test(a.id_atencion)) {
        map[key].urgencias++;
      } else if (/^T/i.test(a.id_atencion)) {
        map[key].externas++;
      }
    }
    const grandTotal = atenciones.length;
    return Object.entries(map).map(([nombre, v]): EmpresaRow => ({
      nombre,
      urgencias: v.urgencias,
      externas: v.externas,
      total: v.total,
      pct: grandTotal > 0 ? ((v.total / grandTotal) * 100).toFixed(1) : '0.0',
    }));
  }, [atenciones]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = sortField === 'nombre' ? a.nombre : Number(sortField === 'pct' ? a.pct : a[sortField]);
      const bv = sortField === 'nombre' ? b.nombre : Number(sortField === 'pct' ? b.pct : b[sortField]);
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [rows, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: keyof EmpresaRow) => {
    if (field === sortField) setSortAsc(v => !v);
    else { setSortField(field); setSortAsc(false); }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: keyof EmpresaRow }) => {
    if (sortField !== field) return <i className="fas fa-sort text-gray-300 ml-1 text-[10px]" />;
    return <i className={`fas fa-sort-${sortAsc ? 'up' : 'down'} ml-1 text-[10px]`} style={{ color: '#1a338e' }} />;
  };

  return (
    <div className="bg-white rounded shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1a338e 0%, #2563eb 100%)' }}
          >
            <i className="fas fa-building text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-700 leading-tight">Atenciones por Empresa</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{rows.length} empresa{rows.length !== 1 ? 's' : ''} registrada{rows.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: '#1a338e12', color: '#1a338e' }}>
            <i className="fas fa-table-list text-[10px]"></i>
            {sorted.length} registros
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100" style={{ background: 'linear-gradient(to right, #1a338e08, #1a338e03)' }}>
              {(
                [
                  { field: 'nombre' as const, label: 'Nombre Empresa' },
                  { field: 'urgencias' as const, label: 'Ingresos Urgencias' },
                  { field: 'externas' as const, label: 'Ingresos Consulta Externa' },
                  { field: 'total' as const, label: 'Total' },
                  { field: 'pct' as const, label: 'Porcentaje' },
                ]
              ).map(({ field, label }) => (
                <th
                  key={field}
                  className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 cursor-pointer select-none whitespace-nowrap hover:text-gray-700 transition-colors"
                  onClick={() => handleSort(field)}
                >
                  {label}
                  <SortIcon field={field} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                  Sin datos para el período seleccionado
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => {
                const pctNum = parseFloat(row.pct);
                const barColor = pctNum > 30 ? '#1a338e' : pctNum > 10 ? '#0ea5e9' : '#14b8a6';
                return (
                  <tr
                    key={row.nombre}
                    className={`border-b border-gray-50 transition-colors hover:bg-blue-50/30 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-700 max-w-[220px] truncate" title={row.nombre}>
                      {row.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0"></span>
                        <span className="text-gray-600 font-medium">{row.urgencias.toLocaleString('es-CO')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                        <span className="text-gray-600 font-medium">{row.externas.toLocaleString('es-CO')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-700">
                      {row.total.toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, pctNum)}%`, backgroundColor: barColor }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600 w-10 text-right">{row.pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              className="px-2.5 py-1 rounded text-xs font-medium text-gray-500 border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className="px-2.5 py-1 rounded text-xs font-medium text-gray-500 border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
