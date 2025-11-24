import React from 'react';

type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  filterable?: boolean;
};

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  striped?: boolean;
}

export default function DataTable<T>({ columns, data, actions, striped = true }: Props<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc' | null>(null);
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  const onSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
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

  const onFilterChange = (key: string, value: string) => {
    setFilters((f: Record<string, string>) => ({ ...f, [key]: value }));
  };

  const filtered = React.useMemo(() => {
    return data.filter((row) => {
      return Object.keys(filters).every((k) => {
        const v = filters[k];
        if (!v) return true;
        const cell = String((row as any)[k] ?? '').toLowerCase();
        return cell.includes(v.toLowerCase());
      });
    });
  }, [data, filters]);

  const sorted = React.useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const sortedCopy = [...filtered].sort((a: any, b: any) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return -1;
      if (vb == null) return 1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return sortedCopy;
  }, [filtered, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`p-3 text-left text-xs font-medium text-gray-700 ${col.className ?? ''} select-none`}
                onClick={() => onSort(col.key, col.sortable)}
              >
                <div className="flex items-center gap-2">
                  <span>{col.label}</span>
                  {col.sortable && sortKey === col.key && (
                    <span className="text-xs">{sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : ''}</span>
                  )}
                </div>
              </th>
            ))}
            {actions && <th className="p-3 text-center text-xs font-medium text-gray-700">Acciones</th>}
          </tr>
          {/* Filters row */}
          {columns.some((c) => c.filterable) && (
            <tr className="bg-white">
              {columns.map((col) => (
                <th key={`${col.key}-filter`} className={`p-2 ${col.className ?? ''}`}>
                  {col.filterable ? (
                    <input
                      type="text"
                      value={filters[col.key] ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilterChange(col.key, e.target.value)}
                      placeholder={`Filtrar ${col.label}`}
                      className="w-full p-2 border rounded text-xs"
                    />
                  ) : null}
                </th>
              ))}
              {actions && <th className="p-2" />}
            </tr>
          )}
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr key={idx} className={`${striped && idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
              {columns.map((col) => (
                <td key={col.key} className="p-3 align-middle text-gray-800">
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
              {actions && <td className="p-3 text-center">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
