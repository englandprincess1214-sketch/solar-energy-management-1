import { Sun, Zap, Activity, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean | null;
  accent: 'solar' | 'battery' | 'grid' | 'anomaly';
  subtitle?: string;
}

const accentMap = {
  solar: {
    bar: 'from-solar-400 to-solar-600',
    icon: 'text-solar-400 bg-solar-400/10',
    glow: 'shadow-solar-500/10',
  },
  battery: {
    bar: 'from-battery-300 to-battery-500',
    icon: 'text-battery-300 bg-battery-400/10',
    glow: 'shadow-battery-500/10',
  },
  grid: {
    bar: 'from-grid-300 to-grid-500',
    icon: 'text-grid-300 bg-grid-400/10',
    glow: 'shadow-grid-500/10',
  },
  anomaly: {
    bar: 'from-amber-400 to-red-500',
    icon: 'text-amber-400 bg-amber-400/10',
    glow: 'shadow-amber-500/10',
  },
};

export default function MetricCard({ title, value, unit, icon: Icon, trend, trendUp, accent, subtitle }: MetricCardProps) {
  const a = accentMap[accent];
  return (
    <div className={`relative bg-base-800 rounded-2xl p-5 card-glow ${a.glow} overflow-hidden animate-fade-in transition-all hover:bg-base-700 hover:scale-[1.02]`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${a.bar}`} />
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${a.icon}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white tabular-nums">{value}</span>
        {unit && <span className="text-sm text-slate-400 font-medium">{unit}</span>}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1.5 mt-3">
          <Activity size={12} className={trendUp === null ? 'text-slate-400' : trendUp ? 'text-battery-400' : 'text-anomaly-crit'} />
          <span className={`text-xs font-medium ${trendUp === null ? 'text-slate-400' : trendUp ? 'text-battery-400' : 'text-anomaly-crit'}`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
