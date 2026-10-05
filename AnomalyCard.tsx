import { AlertTriangle, CheckCircle, AlertOctagon, Clock, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Anomaly } from '@/data/anomalyData';

interface AnomalyCardProps {
  anomaly: Anomaly;
}

const statusConfig = {
  Normal: {
    icon: CheckCircle,
    color: 'text-battery-400',
    bg: 'bg-battery-400/10',
    border: 'border-battery-400/30',
    bar: 'bg-battery-400',
    label: 'Normal',
  },
  Warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    bar: 'bg-amber-400',
    label: 'Warning',
  },
  Critical: {
    icon: AlertOctagon,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    bar: 'bg-red-400',
    label: 'Critical',
  },
};

export default function AnomalyCard({ anomaly }: AnomalyCardProps) {
  const [expanded, setExpanded] = useState(anomaly.status !== 'Normal');
  const cfg = statusConfig[anomaly.status];
  const Icon = cfg.icon;
  const isAbnormal = anomaly.difference > 0 && anomaly.status !== 'Normal';

  return (
    <div className={`bg-base-800 rounded-2xl border ${cfg.border} card-glow overflow-hidden transition-all hover:bg-base-700`}>
      <div className={`h-1 ${cfg.bar}`} />
      <button onClick={() => setExpanded(!expanded)} className="w-full p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${cfg.bg} flex-shrink-0`}>
              <Icon size={18} className={cfg.color} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                {isAbnormal && (
                  <span className="text-xs text-slate-400 bg-base-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <TrendingUp size={11} /> +{anomaly.difference} kWh
                  </span>
                )}
              </div>
              <p className="text-sm text-white font-medium truncate">{anomaly.reason}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Clock size={11} /> {anomaly.time}
              </p>
            </div>
          </div>
          {expanded ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 animate-fade-in">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-base-700 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Expected</p>
              <p className="text-lg font-bold text-white tabular-nums">{anomaly.expected}<span className="text-xs text-slate-400 ml-0.5">kWh</span></p>
            </div>
            <div className="bg-base-700 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Actual</p>
              <p className={`text-lg font-bold tabular-nums ${isAbnormal ? cfg.color : 'text-white'}`}>{anomaly.actual}<span className="text-xs text-slate-400 ml-0.5">kWh</span></p>
            </div>
            <div className="bg-base-700 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Loss</p>
              <p className={`text-lg font-bold tabular-nums ${anomaly.difference > 0 ? 'text-red-400' : 'text-battery-400'}`}>
                {anomaly.difference > 0 ? '+' : ''}{anomaly.difference}<span className="text-xs text-slate-400 ml-0.5">kWh</span>
              </p>
            </div>
          </div>
          <div className="bg-base-700 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Possible Reason</p>
            <p className="text-sm text-white">{anomaly.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
