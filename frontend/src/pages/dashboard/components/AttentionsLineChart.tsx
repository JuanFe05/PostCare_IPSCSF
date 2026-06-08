// src/pages/dashboard/components/AttentionsLineChart.tsx
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface AttentionsLineChartProps {
  monthData: number[];
  selectedYear: number;
  loading: boolean;
}

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#94a3b8',
        usePointStyle: true,
        pointStyleWidth: 12,
        padding: 24,
        font: { size: 12 },
      },
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(10, 16, 50, 0.95)',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(129, 140, 248, 0.4)',
      borderWidth: 1,
      padding: 12,
      callbacks: {
        label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
          ` ${ctx.dataset.label}: ${ctx.parsed.y ?? 0} atenciones`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b', font: { size: 12 } },
      border: { color: 'rgba(255,255,255,0.08)' },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b', font: { size: 12 } },
      border: { color: 'rgba(255,255,255,0.08)' },
      beginAtZero: true,
    },
  },
};

export default function AttentionsLineChart({ monthData, selectedYear, loading }: AttentionsLineChartProps) {
  const chartData = useMemo(() => ({
    labels: MONTHS,
    datasets: [
      {
        label: `Atenciones ${selectedYear}`,
        data: monthData,
        borderColor: '#1a338e',
        backgroundColor: 'rgba(26, 51, 142, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#1a338e',
        pointBorderColor: '#0f1640',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: false,
      },
    ],
  }), [monthData, selectedYear]);

  return (
    <div className="ui-card overflow-hidden">
      {/* Chart header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1f6b 0%, #1a338e 55%, #2248b3 100%)',
          padding: '0.875rem 1.25rem',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <i className="fas fa-chart-line" style={{ color: 'white', fontSize: '0.85rem' }} />
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Total Atenciones por Mes
            </h3>
          </div>
          <span
            className="flex items-center gap-1.5"
            style={{ fontSize: '0.78rem', color: 'rgba(147,174,245,0.9)', fontWeight: 600 }}
          >
            <svg width="18" height="3" viewBox="0 0 18 3">
              <rect width="18" height="3" rx="1.5" fill="#93aef5" />
            </svg>
            {selectedYear}
          </span>
        </div>
      </div>
      {/* Chart body */}
      <div
        className="px-6 py-5"
        style={{ background: 'linear-gradient(160deg, #1a2060 0%, #0f1640 100%)', minHeight: '360px' }}
      >
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: '320px' }}>
            <div
              className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
              style={{ borderColor: '#93aef5' }}
            ></div>
          </div>
        ) : (
          <div style={{ height: '320px', position: 'relative' }}>
            <Line data={chartData} options={CHART_OPTIONS} />
          </div>
        )}
      </div>
    </div>
  );
}
