import { AreaChart, Area, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Sun, Zap } from 'lucide-react';

interface ForecastCardProps {
  data: { time: string; hour: number; solar: number; demand: number; solarForecast: number; demandForecast: number }[];
}

function ForecastTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; unit: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-base-900 border border-base-500 rounded-xl p-3 shadow-xl min-w-[140px]">
      <p className="text-xs font-semibold text-slate-300 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-3 text-xs py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: entry.color }} />
            <span className="text-slate-400">{entry.name}</span>
          </div>
          <span className="text-white font-semibold tabular-nums">{entry.value} {unit}</span>
        </div>
      ))}
    </div>
  );
}

export function SolarForecastCard({ data }: ForecastCardProps) {
  const peak = Math.max(...data.map((d) => d.solarForecast));
  const peakHour = data.find((d) => d.solarForecast === peak)?.hour ?? 12;
  const total = Math.round(data.reduce((sum, d) => sum + d.solarForecast, 0) * 10) / 10;

  return (
    <div className="bg-base-800 rounded-2xl p-5 sm:p-6 card-glow animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-solar-400/10">
            <Sun size={18} className="text-solar-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Solar Forecast</h3>
            <p className="text-xs text-slate-400">Next 24 hours</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-sm font-bold text-solar-400 tabular-nums">{total} kWh</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="fcSolar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fcSolarActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#15233d" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ForecastTooltip unit="kW" />} />
          <Area type="monotone" dataKey="solar" name="Actual Solar" stroke="#f59e0b" strokeWidth={1.5} fill="url(#fcSolarActual)" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="solarForecast" name="Forecast Solar" stroke="#fbbf24" strokeWidth={2.5} fill="url(#fcSolar)" />
          <ReferenceLine x={`${String(peakHour).padStart(2, '0')}:00`} stroke="#fbbf24" strokeOpacity={0.3} strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-slate-400">Peak at <span className="text-solar-400 font-semibold">{String(peakHour).padStart(2, '0')}:00</span></span>
        <span className="text-slate-400">Max: <span className="text-white font-semibold tabular-nums">{peak} kW</span></span>
      </div>
    </div>
  );
}

export function DemandForecastCard({ data }: ForecastCardProps) {
  const peak = Math.max(...data.map((d) => d.demandForecast));
  const peakHour = data.find((d) => d.demandForecast === peak)?.hour ?? 12;
  const total = Math.round(data.reduce((sum, d) => sum + d.demandForecast, 0) * 10) / 10;

  return (
    <div className="bg-base-800 rounded-2xl p-5 sm:p-6 card-glow animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-grid-400/10">
            <Zap size={18} className="text-grid-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Demand Forecast</h3>
            <p className="text-xs text-slate-400">Next 24 hours</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-sm font-bold text-grid-300 tabular-nums">{total} kWh</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#15233d" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ForecastTooltip unit="kW" />} />
          <Line type="monotone" dataKey="demand" name="Actual Demand" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="demandForecast" name="Forecast Demand" stroke="#60a5fa" strokeWidth={2.5} dot={false} />
          <ReferenceLine x={`${String(peakHour).padStart(2, '0')}:00`} stroke="#60a5fa" strokeOpacity={0.3} strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-slate-400">Peak at <span className="text-grid-300 font-semibold">{String(peakHour).padStart(2, '0')}:00</span></span>
        <span className="text-slate-400">Max: <span className="text-white font-semibold tabular-nums">{peak} kW</span></span>
      </div>
    </div>
  );
}
