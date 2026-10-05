import { useState, useMemo } from 'react';
import { Sun, Zap, Battery, Plug, AlertTriangle, ChevronRight, Database, CloudOff } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import MetricCard from '@/components/MetricCard';
import EnergyChart from '@/components/EnergyChart';
import DecisionEngine from '@/components/DecisionEngine';
import { SolarForecastCard, DemandForecastCard } from '@/components/ForecastCard';
import AnomalyCard from '@/components/AnomalyCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { getDecision } from '@/utils/energyDecision';

export default function App() {
  const { hourly, daily, forecasts, anomalies, source, loading } = useDashboardData();
  const [selectedHour, setSelectedHour] = useState(12);

  const currentPoint = useMemo(() => hourly[selectedHour] ?? hourly[0], [hourly, selectedHour]);
  const decision = useMemo(() => getDecision(currentPoint), [currentPoint]);

  const gridDependency = useMemo(() => {
    if (currentPoint.demand <= 0) return 0;
    return Math.round((currentPoint.grid / currentPoint.demand) * 100);
  }, [currentPoint]);

  const batteryTrend = useMemo(() => {
    const prev = hourly[Math.max(0, selectedHour - 1)]?.battery ?? currentPoint.battery;
    const diff = currentPoint.battery - prev;
    if (diff > 0) return { text: `+${diff}% vs last hr`, up: true };
    if (diff < 0) return { text: `${diff}% vs last hr`, up: false };
    return { text: 'Stable', up: null };
  }, [currentPoint, selectedHour, hourly]);

  const criticalCount = anomalies.filter((a) => a.status === 'Critical').length;
  const warningCount = anomalies.filter((a) => a.status === 'Warning').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 flex items-center justify-center animate-pulse-slow">
            <Sun size={32} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-solar-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-battery-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-grid-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-slate-400">Loading SolarSync Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-900">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-solar-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[400px] bg-grid-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] bg-battery-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative">
        <DashboardHeader />

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Overview Section */}
          <section id="overview" className="space-y-6 scroll-mt-20">
            {/* Hero label */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Energy Overview</h2>
                <p className="text-sm text-slate-400 mt-1">Real-time monitoring at {String(selectedHour).padStart(2, '0')}:00 · {currentPoint.solar > 0 ? 'Daytime' : 'Nighttime'} mode</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Data source indicator */}
                {source === 'database' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-battery-400/10 border border-battery-400/20">
                    <Database size={13} className="text-battery-400" />
                    <span className="text-xs font-medium text-battery-300">Live Database</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
                    <CloudOff size={13} className="text-amber-400" />
                    <span className="text-xs font-medium text-amber-300">Local Sample Data</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-800 border border-base-600">
                  <Sun size={13} className="text-solar-400" />
                  <span className="text-slate-300">Solar: <span className="text-white font-semibold">{currentPoint.solar} kW</span></span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-800 border border-base-600">
                  <Zap size={13} className="text-grid-300" />
                  <span className="text-slate-300">Demand: <span className="text-white font-semibold">{currentPoint.demand} kW</span></span>
                </div>
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <MetricCard
                title="Solar Generation"
                value={currentPoint.solar.toFixed(1)}
                unit="kW"
                icon={Sun}
                accent="solar"
                subtitle={currentPoint.solar > 5 ? 'Peak production' : currentPoint.solar > 0 ? 'Active generation' : 'No generation'}
                trend={currentPoint.solar > 0 ? 'Producing energy' : 'Standby mode'}
                trendUp={currentPoint.solar > 0 ? true : null}
              />
              <MetricCard
                title="Building Load"
                value={currentPoint.demand.toFixed(1)}
                unit="kW"
                icon={Zap}
                accent="grid"
                subtitle={currentPoint.demand > 6 ? 'High demand period' : currentPoint.demand > 3 ? 'Normal usage' : 'Low usage'}
                trend={currentPoint.demand > 6 ? 'High load' : 'Normal load'}
                trendUp={currentPoint.demand > 6 ? false : null}
              />
              <MetricCard
                title="Battery Charge"
                value={String(currentPoint.battery)}
                unit="%"
                icon={Battery}
                accent="battery"
                subtitle={currentPoint.battery > 70 ? 'Well charged' : currentPoint.battery > 30 ? 'Moderate charge' : 'Low charge'}
                trend={batteryTrend.text}
                trendUp={batteryTrend.up}
              />
              <MetricCard
                title="Grid Dependency"
                value={String(gridDependency)}
                unit="%"
                icon={Plug}
                accent="grid"
                subtitle={gridDependency === 0 ? 'Grid-independent' : gridDependency < 30 ? 'Low dependency' : 'High dependency'}
                trend={gridDependency === 0 ? 'Off-grid mode' : `${gridDependency}% from grid`}
                trendUp={gridDependency === 0 ? true : null}
              />
            </div>

            {/* Main chart */}
            <EnergyChart data={hourly} dailyData={daily} />
          </section>

          {/* Decision Engine Section */}
          <section className="scroll-mt-20">
            <DecisionEngine
              decision={decision}
              point={currentPoint}
              onHourChange={setSelectedHour}
              selectedHour={selectedHour}
            />
          </section>

          {/* Forecast Section */}
          <section id="forecast" className="space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2 pt-2">
              <h2 className="text-xl font-bold text-white">Energy Forecast</h2>
              <ChevronRight size={18} className="text-slate-500" />
              <span className="text-sm text-slate-400">Predicted generation & demand for the next 24 hours</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <SolarForecastCard data={forecasts} />
              <DemandForecastCard data={forecasts} />
            </div>
          </section>

          {/* Anomalies Section */}
          <section id="anomalies" className="space-y-4 scroll-mt-20 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Energy Anomaly Detection</h2>
                <ChevronRight size={18} className="text-slate-500" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/10 border border-red-400/20">
                  <AlertTriangle size={13} className="text-red-400" />
                  <span className="text-xs font-semibold text-red-400">{criticalCount} Critical</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
                  <AlertTriangle size={13} className="text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">{warningCount} Warnings</span>
                </div>
              </div>
            </div>

            {anomalies.length === 0 ? (
              <div className="bg-base-800 rounded-2xl p-10 text-center card-glow">
                <AlertTriangle size={32} className="text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No anomalies detected. All systems normal.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                {anomalies.map((anomaly) => (
                  <AnomalyCard key={anomaly.id} anomaly={anomaly} />
                ))}
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="border-t border-base-700 pt-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sun size={16} className="text-solar-400" />
              <span className="text-sm font-bold text-white">SolarSync</span>
              <span className="text-xs text-slate-500">· Intelligent Energy Management MVP</span>
            </div>
            <p className="text-xs text-slate-500">
              {source === 'database' ? 'Powered by Supabase' : 'Built for hackathon demo'} · All data is simulated
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
