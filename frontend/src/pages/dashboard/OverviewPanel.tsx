// src/pages/dashboard/OverviewPanel.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAtencionesByRango } from '../../features/atenciones/Atencion.api';
import type { Atencion } from '../../features/atenciones/types';
import YearSelector from './components/YearSelector';
import StatsGrid from './components/StatsGrid';
import AttentionsLineChart from './components/AttentionsLineChart';
import TipoEmpresaLineChart from './components/TipoEmpresaLineChart';
import EmpresaStatsTable from './components/EmpresaStatsTable';

function groupByMonth(atenciones: Atencion[]): number[] {
  const counts = Array.from({ length: 12 }, () => 0);
  for (const a of atenciones) {
    if (!a.fecha_atencion) continue;
    const date = new Date(a.fecha_atencion);
    if (!isNaN(date.getTime())) counts[date.getMonth()]++;
  }
  return counts;
}

export default function OverviewPanel() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= 2025; y--) years.push(y);
    return years;
  }, [currentYear]);

  const fetchData = useCallback(async (year: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAtencionesByRango(`${year}-01-01`, `${year}-12-31`);
      setAtenciones(data);
    } catch {
      setError('Error al cargar los datos del dashboard. Intente recargar la pagina.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear, fetchData]);

  const stats = useMemo(() => {
    const total = atenciones.length;
    const adm = atenciones.filter(a => /ADM/i.test(a.id_atencion)).length;
    const t = atenciones.filter(a => /^T/i.test(a.id_atencion) && !/ADM/i.test(a.id_atencion)).length;
    const pctAdm = total > 0 ? (adm / total) * 100 : 0;
    const pctT = total > 0 ? (t / total) * 100 : 0;
    return { total, adm, t, pctAdm: pctAdm.toFixed(1), pctT: pctT.toFixed(1) };
  }, [atenciones]);

  const monthData = useMemo(() => groupByMonth(atenciones), [atenciones]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Encabezado */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d1f6b 0%, #1a338e 55%, #2248b3 100%)',
          boxShadow: '0 4px 20px rgba(13,31,107,0.2)',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 90% 50%, rgba(14,165,233,0.15) 0%, transparent 50%)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
          }}
        />
        <div className="relative flex items-center justify-between px-6 py-4 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <i className="fas fa-chart-line" style={{ color: 'white', fontSize: '1.1rem' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1.05rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                Panel de Análisis
              </h2>
              <p style={{ color: 'rgba(147,174,245,0.8)', fontSize: '0.78rem', margin: 0 }}>
                Resumen de atenciones &middot; {selectedYear}
              </p>
            </div>
          </div>
          <YearSelector
            selectedYear={selectedYear}
            yearOptions={yearOptions}
            onChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Tarjetas */}
      <StatsGrid stats={stats} loading={loading} />

      {/* Graficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AttentionsLineChart monthData={monthData} selectedYear={selectedYear} loading={loading} />
        <TipoEmpresaLineChart atenciones={atenciones} loading={loading} />
      </div>

      {/* Tabla de empresas */}
      <EmpresaStatsTable atenciones={atenciones} loading={loading} />
    </div>
  );
}