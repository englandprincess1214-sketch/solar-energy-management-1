import type { HourlyDataPoint } from '@/data/energyData';

export interface DecisionResult {
  source: 'solar' | 'battery' | 'grid';
  sourceLabel: string;
  reason: string;
  energyFlow: string[];
  gridReduction: number;    // %
  solarUtilization: number; // %
  batteryUtilization: number; // %
  energySaved: number;      // kW (non-grid energy)
  excessSolar: number;      // kW
  energyDeficit: number;    // kW
  batteryLevel: number;
  solarGen: number;
  demand: number;
}

const MIN_BATTERY = 20;

export function getDecision(point: HourlyDataPoint): DecisionResult {
  const { solar, demand, battery, grid } = point;
  const totalDemand = demand > 0 ? demand : 0.1;

  if (solar >= demand) {
    const excess = Math.round((solar - demand) * 10) / 10;
    const gridReduction = 100;
    return {
      source: 'solar',
      sourceLabel: 'SOLAR',
      reason: 'Solar generation is currently higher than building demand. The building is fully powered by solar with excess energy charging the battery.',
      energyFlow: ['Solar → Building', 'Excess Solar → Battery'],
      gridReduction,
      solarUtilization: 100,
      batteryUtilization: Math.round((excess / totalDemand) * 100),
      energySaved: demand,
      excessSolar: excess,
      energyDeficit: 0,
      batteryLevel: battery,
      solarGen: solar,
      demand,
    };
  }

  if (battery > MIN_BATTERY) {
    const deficit = Math.round((demand - solar) * 10) / 10;
    const nonGrid = solar + deficit;
    const gridReduction = Math.round((nonGrid / totalDemand) * 100);
    return {
      source: 'battery',
      sourceLabel: 'BATTERY',
      reason: 'Solar generation is insufficient but battery has sufficient charge. The system draws from battery to reduce grid dependency.',
      energyFlow: ['Solar → Building', 'Battery → Building'],
      gridReduction,
      solarUtilization: Math.round((solar / totalDemand) * 100),
      batteryUtilization: Math.round((deficit / totalDemand) * 100),
      energySaved: nonGrid,
      excessSolar: 0,
      energyDeficit: deficit,
      batteryLevel: battery,
      solarGen: solar,
      demand,
    };
  }

  const deficit = Math.round((demand - solar) * 10) / 10;
  const nonGrid = solar;
  const gridReduction = Math.round((nonGrid / totalDemand) * 100);
  return {
    source: 'grid',
    sourceLabel: 'GRID',
    reason: 'Solar generation and battery are both insufficient. The building must draw from the grid to meet demand.',
    energyFlow: ['Solar → Building', 'Grid → Building'],
    gridReduction,
    solarUtilization: Math.round((solar / totalDemand) * 100),
    batteryUtilization: 0,
    energySaved: nonGrid,
    excessSolar: 0,
    energyDeficit: deficit,
    batteryLevel: battery,
    solarGen: solar,
    demand,
  };
}
