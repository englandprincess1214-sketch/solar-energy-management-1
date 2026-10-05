import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useState } from 'react';
import { Sun, Zap, Battery, Plug } from 'lucide-react';
import type { HourlyDataPoint, DailyDataPoint } from '@/data/energyData';

interface EnergyChartProps {
  data: HourlyDataPoint[];
  dailyData: DailyDataPoint[];
}

type RangeType = '24H' | '7D';
type ChartType = 'area' | 'line' | 'bar';

const seriesConfig = {
  solar: { name: 'Solar Generation', color: '#fbbf24', icon: Sun },
  demand: { name: 'Building Demand', color: '#60a5fa', icon: Zap },
  battery: { name: 'Battery Level', color: '#34d399', icon: Battery },
  grid: { name: 'Grid Usage', color: '#a78bfa', icon: Plug },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-base-900 border border-base-500 rounded-xl p-3 shadow-xl min-w-[160px]">
      <p className="text-xs font-semibold text-slate-300 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-3 text-xs py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: entry.color }} />
            <span className="text-slate-400">{entry.name}</span>
          </div>
          <span className="text-white font-semibold tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function EnergyChart({ data, dailyData }: EnergyChartProps) {
  const [range, setRange] = useState<RangeType>('24H');
  const [visible, setVisible] = useState<Record<string, boolean>>({ solar: true, demand: true, battery: true, grid: true });
  const [chartType, setChartType] = useState<ChartType>('area');

  const chartData = range === '24H' ? data : dailyData;
  const xKey = range === '24H' ? 'time' : 'day';
  const yUnit = range === '24H' ? 'kW' : 'kWh';
  const batteryUnit = range === '24H' ? '%' : '%';

  const toggleSeries = (key: string) => setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  const renderChart = () => {
    const commonProps = {
      data: chartData as unknown as Record<string, number | string>[],
      margin: { top: 10, right: 10, left: -10, bottom: 0 },
    };

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart {...commonProps} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#15233d" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#15233d' }} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(36,59,99,0.3)' }} />
            {visible.solar && <Bar dataKey="solar" name="Solar Generation" fill={seriesConfig.solar.color} radius={[4, 4, 0, 0]} maxBarSize={30} />}
            {visible.demand && <Bar dataKey="demand" name="Building Demand" fill={seriesConfig.demand.color} radius={[4, 4, 0, 0]} maxBarSize={30} />}
            {visible.grid && <Bar dataKey="grid" name="Grid Usage" fill={seriesConfig.grid.color} radius={[4, 4, 0, 0]} maxBarSize={30} />}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#15233d" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#15233d' }} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ display: 'none' }} />
            {visible.solar && <Line type="monotone" dataKey="solar" name="Solar Generation" stroke={seriesConfig.solar.color} strokeWidth={2.5} dot={false} />}
            {visible.demand && <Line type="monotone" dataKey="demand" name="Building Demand" stroke={seriesConfig.demand.color} strokeWidth={2.5} dot={false} />}
            {visible.battery && <Line type="monotone" dataKey="battery" name="Battery Level" stroke={seriesConfig.battery.color} strokeWidth={2.5} dot={false} />}
            {visible.grid && <Line type="monotone" dataKey="grid" name="Grid Usage" stroke={seriesConfig.grid.color} strokeWidth={2.5} dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="gradSolar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesConfig.solar.color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={seriesConfig.solar.color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradDemand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesConfig.demand.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={seriesConfig.demand.color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradBattery" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesConfig.battery.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={seriesConfig.battery.color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradGrid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesConfig.grid.color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={seriesConfig.grid.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#15233d" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#15233d' }} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {visible.solar && <Area type="monotone" dataKey="solar" name="Solar Generation" stroke={seriesConfig.solar.color} strokeWidth={2.5} fill="url(#gradSolar)" />}
          {visible.demand && <Area type="monotone" dataKey="demand" name="Building Demand" stroke={seriesConfig.demand.color} strokeWidth={2.5} fill="url(#gradDemand)" />}
          {visible.battery && <Area type="monotone" dataKey="battery" name="Battery Level" stroke={seriesConfig.battery.color} strokeWidth={2} fill="url(#gradBattery)" />}
          {visible.grid && <Area type="monotone" dataKey="grid" name="Grid Usage" stroke={seriesConfig.grid.color} strokeWidth={2} fill="url(#gradGrid)" />}
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-base-800 rounded-2xl p-5 sm:p-6 card-glow animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Energy Generation vs Consumption</h2>
          <p className="text-xs text-slate-400 mt-0.5">Interactive {range === '24H' ? '24-hour' : '7-day'} overview · units in {yUnit} (battery in {batteryUnit})</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-base-700 rounded-lg p-1">
            {(['24H', '7D'] as RangeType[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${range === r ? 'bg-base-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex bg-base-700 rounded-lg p-1">
            {(['area', 'line', 'bar'] as ChartType[]).map((c) => (
              <button
                key={c}
                onClick={() => setChartType(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${chartType === c ? 'bg-base-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Series toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(seriesConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const isVisible = visible[key];
          return (
            <button
              key={key}
              onClick={() => toggleSeries(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isVisible
                  ? 'bg-base-700 border-base-500 text-white'
                  : 'bg-base-800 border-base-700 text-slate-500'
              }`}
            >
              <Icon size={14} style={{ color: isVisible ? cfg.color : undefined }} />
              {cfg.name}
            </button>
          );
        })}
      </div>

      {renderChart()}
    </div>
  );
}
