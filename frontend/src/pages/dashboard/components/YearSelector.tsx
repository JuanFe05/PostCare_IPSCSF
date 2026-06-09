// src/pages/dashboard/components/YearSelector.tsx
interface YearSelectorProps {
  selectedYear: number;
  yearOptions: number[];
  onChange: (year: number) => void;
}

export default function YearSelector({ selectedYear, yearOptions, onChange }: YearSelectorProps) {
  return (
    <div className="relative flex-shrink-0">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <i className="fas fa-calendar-alt" style={{ color: 'rgba(147,174,245,0.9)', fontSize: '0.78rem' }}></i>
      </div>
      <select
        className="appearance-none"
        style={{
          height: '38px',
          paddingLeft: '2rem',
          paddingRight: '2rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '0.5rem',
          color: 'white',
          cursor: 'pointer',
          minWidth: '100px',
          outline: 'none',
        }}
        value={selectedYear}
        onChange={e => onChange(Number(e.target.value))}
      >
        {yearOptions.map(y => (
          <option key={y} value={y} style={{ background: '#1a338e', color: 'white' }}>{y}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <i className="fas fa-chevron-down" style={{ color: 'rgba(147,174,245,0.8)', fontSize: '0.65rem' }}></i>
      </div>
    </div>
  );
}
