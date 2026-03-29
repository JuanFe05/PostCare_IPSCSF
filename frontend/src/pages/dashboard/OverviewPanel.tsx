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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-700">Panel de Analisis</h2>
          <p className="text-sm text-gray-400 mt-0.5">Resumen de atenciones &middot; {selectedYear}</p>
        </div>
        <YearSelector
          selectedYear={selectedYear}
          yearOptions={yearOptions}
          onChange={setSelectedYear}
        />
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