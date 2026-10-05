import { Sun, Battery, Plug, ArrowRight, TrendingDown, Zap, Activity } from 'lucide-react';
import type { DecisionResult } from '@/utils/energyDecision';
import type { HourlyDataPoint } from '@/data/energyData';

interface DecisionEngineProps {
  decision: DecisionResult;
  point: HourlyDataPoint;
  onHourChange: (hour: number) => void;
  selectedHour: number;
}

const sourceConfig = {
  solar: {
    icon: Sun,
    label: 'SOLAR',
    gradient: 'from-solar-400 to-solar-600',
    ring: 'shadow-solar-500/30',
    text: 'text-solar-400',
    bg: 'bg-solar-400/10',
    border: 'border-solar-400/30',
  },
  battery: {
    icon: Battery,
    label: 'BATTERY',
    gradient: 'from-battery-300 to-battery-500',
    ring: 'shadow-battery-500/30',
    text: 'text-battery-300',
    bg: 'bg-battery-400/10',
    border: 'border-battery-400/30',
  },
  grid: {
    icon: Plug,
    label: 'GRID',
    gradient: 'from-grid-300 to-grid-500',
    ring: 'shadow-grid-500/30',
    text: 'text-grid-300',
    bg: 'bg-grid-400/10',
    border: 'border-grid-400/30',
  },
};

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-2 bg-base-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function DecisionEngine({ decision, point, onHourChange, selectedHour }: DecisionEngineProps) {
  const cfg = sourceConfig[decision.source];
  const Icon = cfg.icon;

  return (
    <div className="bg-base-800 rounded-2xl p-5 sm:p-6 card-glow animate-fade-in" id="optimization">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap size={18} className="text-solar-400" />
            Energy Decision Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time intelligent power source recommendation</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-base-700 px-3 py-1.5 rounded-lg">
          <Activity size={13} className="text-battery-400" />
          Auto-optimizing
        </div>
      </div>

      {/* Time selector */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Select Time:</span>
        <div className="flex-1 overflow-x-auto">
          <input
            type="range"
            min={0}
            max={23}
            value={selectedHour}
            onChange={(e) => onHourChange(Number(e.target.value))}
            className="w-full accent-solar-400 cursor-pointer"
          />
        </div>
        <span className="text-sm font-bold text-white tabular-nums bg-base-700 px-3 py-1 rounded-lg whitespace-nowrap">
          {String(selectedHour).padStart(2, '0')}:00
        </span>
      </div>

      {/* Main recommendation */}
      <div className={`relative rounded-2xl p-6 sm:p-8 bg-gradient-to-br ${cfg.gradient} ${cfg.ring} shadow-2xl overflow-hidden`}>
        <div className="absolute inset-0 bg-base-900/85" />
        <div className="relative">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Current Recommended Source</p>
          <div className="flex items-center gap-5 mb-5">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${cfg.bg} ${cfg.border} border-2 flex items-center justify-center`}>
              <Icon size={36} className={cfg.text} />
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{cfg.label}</h3>
              <p className="text-sm text-slate-300 mt-1">Primary energy source active</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-4">{decision.reason}</p>

          {/* Energy flow */}
          <div className="bg-base-900/60 rounded-xl p-4 border border-base-500">
            <p className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-wider">Energy Flow</p>
            <div className="flex flex-col gap-2.5">
              {decision.energyFlow.map((flow, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white font-medium">
                  <ArrowRight size={16} className={cfg.text} />
                  {flow}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        <div className="bg-base-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-battery-400" />
            <span className="text-xs text-slate-400">Grid Reduction</span>
          </div>
          <span className="text-2xl font-bold text-white tabular-nums">{decision.gridReduction}%</span>
        </div>
        <div className="bg-base-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sun size={14} className="text-solar-400" />
            <span className="text-xs text-slate-400">Solar Utilization</span>
          </div>
          <span className="text-2xl font-bold text-white tabular-nums">{decision.solarUtilization}%</span>
        </div>
        <div className="bg-base-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-solar-400" />
            <span className="text-xs text-slate-400">Energy Saved</span>
          </div>
          <span className="text-2xl font-bold text-white tabular-nums">{decision.energySaved}<span className="text-sm text-slate-400 ml-1">kW</span></span>
        </div>
        <div className="bg-base-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-amber-400" />
            <span className="text-xs text-slate-400">Energy Deficit</span>
          </div>
          <span className="text-2xl font-bold text-white tabular-nums">{decision.energyDeficit}<span className="text-sm text-slate-400 ml-1">kW</span></span>
        </div>
      </div>

      {/* Progress bars */}
      <div className="grid sm:grid-cols-3 gap-4 mt-5">
        <MiniBar label="Solar Utilization" value={decision.solarUtilization} max={100} color="bg-gradient-to-r from-solar-400 to-solar-500" />
        <MiniBar label="Battery Utilization" value={decision.batteryUtilization} max={100} color="bg-gradient-to-r from-battery-300 to-battery-500" />
        <MiniBar label="Grid Dependency" value={100 - decision.gridReduction} max={100} color="bg-gradient-to-r from-grid-300 to-grid-500" />
      </div>
    </div>
  );
}
