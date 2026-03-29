// src/pages/dashboard/components/YearSelector.tsx
interface YearSelectorProps {
  selectedYear: number;
  yearOptions: number[];
  onChange: (year: number) => void;
}

export default function YearSelector({ selectedYear, yearOptions, onChange }: YearSelectorProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
        <i className="fas fa-calendar-alt text-sm" style={{ color: '#1a338e' }}></i>
      </div>
      <select
        className="appearance-none pl-9 pr-9 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer focus:outline-none transition-all"
        onFocus={e => {
          e.currentTarget.style.borderColor = '#1a338e';
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(26,51,142,0.2)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.boxShadow = '';
        }}
        onMouseEnter={e => {
          if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#1a338e';
        }}
        onMouseLeave={e => {
          if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '';
        }}
        value={selectedYear}
        onChange={e => onChange(Number(e.target.value))}
      >
        {yearOptions.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
      </div>
    </div>
  );
}
