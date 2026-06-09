// src/pages/dashboard/components/StatCard.tsx
interface StatCardProps {
  label: string;
  value: string;
  iconClass: string;
  iconBgClass: string;
}

export function StatCard({ label, value, iconClass, iconBgClass }: StatCardProps) {
  return (
    <div
      className="ui-card animate-fade-in-up"
      style={{ padding: '1.1rem 1.25rem' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              margin: '0 0 0.35rem 0',
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#0d1f6b',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {value}
          </p>
        </div>
        <div
          className={`flex items-center justify-center flex-shrink-0 rounded-xl ${iconBgClass}`}
          style={{ width: '44px', height: '44px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <i className={`${iconClass} text-white`} style={{ fontSize: '1.1rem' }}></i>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="ui-card animate-pulse" style={{ padding: '1.1rem 1.25rem' }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-2.5 rounded" style={{ width: '60%', background: 'var(--surface-border)' }}></div>
          <div className="h-7 rounded" style={{ width: '45%', background: 'var(--surface-border)' }}></div>
        </div>
        <div className="rounded-xl flex-shrink-0" style={{ width: '44px', height: '44px', background: 'var(--surface-border)' }}></div>
      </div>
    </div>
  );
}
