import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  hourlyData as localHourly,
  dailyData as localDaily,
  forecastData as localForecast,
  type HourlyDataPoint,
  type DailyDataPoint,
} from '@/data/energyData';
import { anomalies as localAnomalies, type Anomaly } from '@/data/anomalyData';

export interface ForecastPoint {
  time: string;
  hour: number;
  solar: number;
  demand: number;
  solarForecast: number;
  demandForecast: number;
}

export interface DashboardData {
  hourly: HourlyDataPoint[];
  daily: DailyDataPoint[];
  forecasts: ForecastPoint[];
  anomalies: Anomaly[];
  source: 'database' | 'local';
  error: string | null;
}

export function useDashboardData(): DashboardData & { loading: boolean } {
  const [data, setData] = useState<DashboardData>({
    hourly: localHourly,
    daily: localDaily,
    forecasts: localForecast,
    anomalies: localAnomalies,
    source: 'local',
    error: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const [readingsRes, forecastsRes, anomaliesRes] = await Promise.all([
          supabase.from('energy_readings').select('*').order('hour', { ascending: true }),
          supabase.from('energy_forecasts').select('*').order('hour', { ascending: true }),
          supabase.from('energy_anomalies').select('*').order('created_at', { ascending: false }),
        ]);

        if (cancelled) return;

        const readingsError = readingsRes.error;
        const forecastsError = forecastsRes.error;
        const anomaliesError = anomaliesRes.error;

        if (readingsError || forecastsError || anomaliesError) {
          const msg = readingsError?.message || forecastsError?.message || anomaliesError?.message || 'Unknown error';
          console.warn('Supabase fetch failed, using local data:', msg);
          setData((prev) => ({ ...prev, loading: false, error: msg }));
          setLoading(false);
          return;
        }

        const hourly: HourlyDataPoint[] = (readingsRes.data || []).map((r) => ({
          hour: r.hour,
          time: r.time_label,
          solar: Number(r.solar),
          demand: Number(r.demand),
          battery: Number(r.battery),
          grid: Number(r.grid),
          batteryFlow: Number(r.battery_flow),
        }));

        const forecasts: ForecastPoint[] = (forecastsRes.data || []).map((f) => {
          const base = hourly.find((h) => h.hour === f.hour);
          return {
            time: f.time_label,
            hour: f.hour,
            solar: base?.solar ?? 0,
            demand: base?.demand ?? 0,
            solarForecast: Number(f.solar_forecast),
            demandForecast: Number(f.demand_forecast),
          };
        });

        const anomalies: Anomaly[] = (anomaliesRes.data || []).map((a) => ({
          id: a.id,
          time: a.detected_at,
          expected: Number(a.expected),
          actual: Number(a.actual),
          difference: Number(a.difference),
          status: a.status,
          reason: a.reason,
        }));

        if (hourly.length === 0) {
          console.warn('No energy_readings returned, using local data');
          setData((prev) => ({ ...prev, loading: false }));
          setLoading(false);
          return;
        }

        setData({
          hourly: hourly.length === 24 ? hourly : localHourly,
          daily: localDaily,
          forecasts: forecasts.length === 24 ? forecasts : localForecast,
          anomalies: anomalies.length > 0 ? anomalies : localAnomalies,
          source: 'database',
          error: null,
        });
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Network error';
        console.warn('Supabase fetch threw, using local data:', msg);
        setData((prev) => ({ ...prev, loading: false, error: msg }));
        setLoading(false);
      }
    }

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...data, loading };
}
