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
import Card, { CardHeader } from '../../../components/notus/Card';

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
    <Card>
      <CardHeader color="lightBlue">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-white text-xl font-bold leading-tight">Total Atenciones por Mes</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 text-sm text-white/80">
              <svg width="24" height="4" viewBox="0 0 24 4">
                <rect width="24" height="4" rx="2" fill="#818cf8" />
              </svg>
              {selectedYear}
            </span>
          </div>
        </div>
      </CardHeader>
      <div
        className="px-6 py-5"
        style={{ background: 'linear-gradient(160deg, #1a2060 0%, #0f1640 100%)', minHeight: '360px' }}
      >
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: '320px' }}>
            <div
              className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
              style={{ borderColor: '#1a338e' }}
            ></div>
          </div>
        ) : (
          <div style={{ height: '320px', position: 'relative' }}>
            <Line data={chartData} options={CHART_OPTIONS} />
          </div>
        )}
      </div>
    </Card>
  );
}
