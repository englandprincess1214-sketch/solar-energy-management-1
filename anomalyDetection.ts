import type { Anomaly } from '@/data/anomalyData';

export const NORMAL_THRESHOLD = 5;   // kWh
export const WARNING_THRESHOLD = 10; // kWh

export function classifyAnomaly(difference: number): Anomaly['status'] {
  if (difference <= NORMAL_THRESHOLD) return 'Normal';
  if (difference <= WARNING_THRESHOLD) return 'Warning';
  return 'Critical';
}

export function detectAnomaly(expected: number, actual: number): Anomaly {
  const difference = Math.round((actual - expected) * 10) / 10;
  const status = classifyAnomaly(difference);
  const reasons: Record<Anomaly['status'], string> = {
    Normal: 'Within expected range',
    Warning: difference > 0 ? 'Equipment inefficiency' : 'Lower than expected usage',
    Critical: difference > 12 ? 'Possible energy leakage' : 'Unexpected consumption spike',
  };
  return {
    id: `detected-${Date.now()}`,
    time: new Date().toISOString().slice(0, 16).replace('T', ' '),
    expected,
    actual,
    difference,
    status,
    reason: reasons[status],
  };
}
