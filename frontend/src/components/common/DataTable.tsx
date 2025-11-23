import React from 'react';

type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  striped?: boolean;
}

export default function DataTable<T>({ columns, data, actions, striped = true }: Props<T>) {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`p-3 text-left text-xs font-medium text-gray-700 ${col.className ?? ''}`}>
                {col.label}
              </th>
            ))}
            {actions && <th className="p-3 text-center text-xs font-medium text-gray-700">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
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
