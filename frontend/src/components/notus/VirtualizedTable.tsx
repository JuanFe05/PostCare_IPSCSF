import { useRef, useState, type ReactNode } from 'react';

interface VirtualizedTableProps {
  children: ReactNode[];
  headers: string[];
  color?: 'light' | 'dark';
  rowHeight?: number;
  height?: number;
}

export default function VirtualizedTable({ 
  children, 
  headers, 
  color = 'light',
  rowHeight = 60,
  height = 600
}: VirtualizedTableProps) {
  const headerBg = color === 'light' ? 'bg-gray-100' : 'bg-gray-700';
  const headerText = color === 'light' ? 'text-gray-700' : 'text-gray-200';
  const borderColor = color === 'light' ? 'border-gray-200' : 'border-gray-600';
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calcular ancho mínimo basado en cantidad de columnas
  const getMinWidth = () => {
    if (headers.length > 10) return '1600px';
    if (headers.length > 6) return '1200px';
    return 'auto';
  };

  // Convertir children a array
  const itemsArray = Array.isArray(children) ? children : [children];

  // Calcular qué elementos mostrar basado en scroll
  const itemCount = itemsArray.length;
  const visibleCount = Math.ceil(height / rowHeight) + 2; // Buffer de 2 items
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
  const endIndex = Math.min(itemCount, startIndex + visibleCount);
  
  const visibleItems = itemsArray.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;
  const totalHeight = itemCount * rowHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Header fijo */}
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
      </table>

      {/* Cuerpo virtualizado con scroll */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        style={{ 
          height: `${height}px`, 
          overflow: 'auto',
          position: 'relative'
        }}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            <table className="items-center w-full bg-transparent border-collapse" style={{ minWidth: getMinWidth() }}>
              <tbody>
                {visibleItems}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
