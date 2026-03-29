// src/pages/dashboard/components/TipoEmpresaLineChart.tsx
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { Atencion } from '../../../features/atenciones/types';
import Card, { CardHeader } from '../../../components/notus/Card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const PALETTE = [
  '#1a338e',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#14b8a6',
  '#2563eb',
];

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#94a3b8',
        usePointStyle: true,
        pointStyleWidth: 12,
        padding: 20,
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(10, 16, 50, 0.95)',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(26,51,142,0.4)',
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
      stacked: true,
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b', font: { size: 11 } },
      border: { color: 'rgba(255,255,255,0.08)' },
    },
    y: {
      stacked: true,
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b', font: { size: 11 } },
      border: { color: 'rgba(255,255,255,0.08)' },
      beginAtZero: true,
    },
  },
};

interface TipoEmpresaPolarChartProps {
  atenciones: Atencion[];
  loading: boolean;
}

export default function TipoEmpresaPolarChart({ atenciones, loading }: TipoEmpresaPolarChartProps) {
  const chartData = useMemo(() => {
    const tiposMap: Record<string, number[]> = {};
    for (const a of atenciones) {
      const tipo = a.tipo_empresa_nombre ?? 'Sin tipo';
      if (!tiposMap[tipo]) tiposMap[tipo] = Array(12).fill(0);
      if (!a.fecha_atencion) continue;
      const date = new Date(a.fecha_atencion);
      if (!isNaN(date.getTime())) tiposMap[tipo][date.getMonth()]++;
    }
    const tipos = Object.keys(tiposMap).sort();
    return {
      labels: MONTHS,
      datasets: tipos.map((tipo, i) => ({
        label: tipo,
        data: tiposMap[tipo],
        backgroundColor: PALETTE[i % PALETTE.length] + 'cc',
        borderColor: PALETTE[i % PALETTE.length],
        borderWidth: 1,
        borderRadius: 3,
        borderSkipped: false,
      })),
    };
  }, [atenciones]);

  return (
    <Card>
      <CardHeader color="lightBlue">
        <div>
          <h3 className="text-white text-xl font-bold leading-tight">Atenciones por Tipo de Empresa</h3>
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
        ) : atenciones.length === 0 ? (
          <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height: '320px' }}>
            Sin datos para el año seleccionado
          </div>
        ) : (
          <div style={{ height: '320px', position: 'relative' }}>
            <Bar data={chartData} options={CHART_OPTIONS} />
          </div>
        )}
      </div>
    </Card>
  );
}
