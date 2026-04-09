// src/pages/dashboard/components/StatsGrid.tsx
import { StatCard, SkeletonCard } from './StatCard';

interface Stats {
  total: number;
  adm: number;
  t: number;
  pctAdm: string;
  pctT: string;
}

interface StatsGridProps {
  stats: Stats;
  loading: boolean;
}

export default function StatsGrid({ stats, loading }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        label="Total Atenciones"
        value={stats.total.toLocaleString('es-CO')}
        iconClass="fas fa-hospital-user"
        iconBgClass="bg-sky-500"
      />
      <StatCard
        label="Atenciones Urgencias"
        value={stats.adm.toLocaleString('es-CO')}
        iconClass="fas fa-id-card"
        iconBgClass="bg-orange-400"
      />
      <StatCard
        label="Atenciones Externas"
        value={stats.t.toLocaleString('es-CO')}
        iconClass="fas fa-file-medical"
        iconBgClass="bg-emerald-400"
      />
      <StatCard
        label="Atenciones Urgencias"
        value={`${stats.pctAdm}%`}
        iconClass="fas fa-percent"
        iconBgClass="bg-pink-400"
      />
      <StatCard
        label="Atenciones Externas"
        value={`${stats.pctT}%`}
        iconClass="fas fa-chart-pie"
        iconBgClass="bg-purple-400"
      />
    </div>
  );
}
