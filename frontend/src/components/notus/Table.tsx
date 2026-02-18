import type { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  headers: string[];
  color?: 'light' | 'dark';
}

export default function Table({ children, headers, color = 'light' }: TableProps) {
  const headerBg = color === 'light' ? 'bg-gray-100' : 'bg-gray-700';
  const headerText = color === 'light' ? 'text-gray-700' : 'text-gray-200';
  const borderColor = color === 'light' ? 'border-gray-200' : 'border-gray-600';

  // Calcular ancho mínimo basado en cantidad de columnas
  const getMinWidth = () => {
    if (headers.length > 10) return '1600px'; // Atenciones, Pacientes
    if (headers.length > 6) return '1200px';  // Tablas medianas
    return 'auto'; // Tablas pequeñas
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="items-center w-full bg-transparent border-collapse" style={{ minWidth: getMinWidth() }}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-bold text-center ${headerBg} ${headerText} ${borderColor}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}
