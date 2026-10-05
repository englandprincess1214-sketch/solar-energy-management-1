export interface Anomaly {
  id: string;
  time: string;
  expected: number; // kWh
  actual: number;   // kWh
  difference: number;
  status: 'Normal' | 'Warning' | 'Critical';
  reason: string;
}

export const anomalies: Anomaly[] = [
  {
    id: 'a1',
    time: '2026-10-05 14:32',
    expected: 42,
    actual: 57,
    difference: 15,
    status: 'Critical',
    reason: 'Unexpected consumption spike',
  },
  {
    id: 'a2',
    time: '2026-10-05 11:15',
    expected: 38,
    actual: 46,
    difference: 8,
    status: 'Warning',
    reason: 'Equipment inefficiency',
  },
  {
    id: 'a3',
    time: '2026-10-05 09:00',
    expected: 30,
    actual: 28,
    difference: -2,
    status: 'Normal',
    reason: 'Within expected range',
  },
  {
    id: 'a4',
    time: '2026-10-04 17:45',
    expected: 45,
    actual: 61,
    difference: 16,
    status: 'Critical',
    reason: 'Possible energy leakage',
  },
  {
    id: 'a5',
    time: '2026-10-04 13:20',
    expected: 40,
    actual: 49,
    difference: 9,
    status: 'Warning',
    reason: 'Solar generation drop',
  },
  {
    id: 'a6',
    time: '2026-10-04 08:10',
    expected: 25,
    actual: 27,
    difference: 2,
    status: 'Normal',
    reason: 'Within expected range',
  },
];
