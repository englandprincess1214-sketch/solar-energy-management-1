export interface HourlyDataPoint {
  hour: number;
  time: string;
  solar: number;   // kW
  demand: number;  // kW
  battery: number; // % 0–100
  grid: number;    // kW drawn from grid
  batteryFlow: number; // kW (+charging, -discharging)
}

export interface DailyDataPoint {
  day: string;
  solar: number;  // kWh
  demand: number; // kWh
  battery: number;// avg %
  grid: number;   // kWh
}

const pad = (h: number) => `${String(h).padStart(2, '0')}:00`;

// Realistic solar curve (kW) — bell-shaped around solar noon
const solarCurve: number[] = [
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // 00–05
  0.3, 1.2, 3.0, 5.2, 7.0, 8.5, // 06–11
  9.2, 8.9, 8.4, 7.2, 5.1, 3.0, // 12–17
  1.2, 0.3, 0.0, 0.0, 0.0, 0.0, // 18–23
];

// Realistic building demand (kW) — night baseline, working-hours peak, evening bump
const demandCurve: number[] = [
  2.2, 2.0, 1.9, 2.0, 2.1, 2.3, // 00–05
  3.0, 4.5, 6.0, 7.0, 7.5, 7.8, // 06–11
  7.2, 7.8, 8.0, 7.5, 7.0, 6.2, // 12–17
  6.8, 7.5, 6.5, 5.0, 3.8, 2.8, // 18–23
];

const MIN_BATTERY = 20;

function buildHourlyData(): HourlyDataPoint[] {
  const points: HourlyDataPoint[] = [];
  let battery = 65; // starting charge at midnight (%)

  for (let h = 0; h < 24; h++) {
    const solar = solarCurve[h];
    const demand = demandCurve[h];

    let grid = 0;
    let batteryFlow = 0;

    if (solar >= demand) {
      // Solar covers demand; excess charges battery
      const excess = solar - demand;
      batteryFlow = excess;
      const chargeAmt = Math.min(excess * 0.5, 100 - battery);
      battery = Math.min(100, battery + chargeAmt * 0.4);
    } else if (battery > MIN_BATTERY) {
      // Battery covers the deficit
      const deficit = demand - solar;
      batteryFlow = -deficit;
      battery = Math.max(MIN_BATTERY - 5, battery - deficit * 0.8);
    } else {
      // Grid covers the deficit
      const deficit = demand - solar;
      grid = deficit;
      batteryFlow = 0;
    }

    points.push({
      hour: h,
      time: pad(h),
      solar: Math.round(solar * 10) / 10,
      demand: Math.round(demand * 10) / 10,
      battery: Math.round(battery),
      grid: Math.round(grid * 10) / 10,
      batteryFlow: Math.round(batteryFlow * 10) / 10,
    });
  }

  return points;
}

export const hourlyData: HourlyDataPoint[] = buildHourlyData();

export const dailyData: DailyDataPoint[] = [
  { day: 'Mon', solar: 52, demand: 118, battery: 68, grid: 38 },
  { day: 'Tue', solar: 58, demand: 122, battery: 72, grid: 32 },
  { day: 'Wed', solar: 61, demand: 115, battery: 75, grid: 28 },
  { day: 'Thu', solar: 44, demand: 128, battery: 55, grid: 52 },
  { day: 'Fri', solar: 49, demand: 120, battery: 62, grid: 42 },
  { day: 'Sat', solar: 55, demand: 95,  battery: 70, grid: 25 },
  { day: 'Sun', solar: 63, demand: 88,  battery: 82, grid: 18 },
];

export const forecastData = hourlyData.map((p) => ({
  time: p.time,
  hour: p.hour,
  solar: p.solar,
  demand: p.demand,
  // Add slight forecast variance for "predicted" feel
  solarForecast: Math.round((p.solar * (p.solar > 0 ? 0.92 + Math.sin(p.hour) * 0.06 : 1)) * 10) / 10,
  demandForecast: Math.round((p.demand * (0.95 + Math.cos(p.hour * 0.5) * 0.04)) * 10) / 10,
}));
