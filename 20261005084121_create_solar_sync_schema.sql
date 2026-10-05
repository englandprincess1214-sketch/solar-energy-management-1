/*
# SolarSync — Core Database Schema

1. Overview
   This migration creates the persistence layer for the SolarSync intelligent
   energy management dashboard. It is a single-tenant prototype with no
   authentication — all data is intentionally shared/public, so row-level
   security policies allow both the anon and authenticated roles full CRUD
   access.

2. New Tables

   a. energy_readings — one row per hourly energy snapshot
      - id           (uuid, primary key)
      - hour         (int 0–23, the hour-of-day this reading represents)
      - time_label   (text, e.g. "12:00" for display)
      - solar        (numeric, solar generation in kW)
      - demand       (numeric, building consumption in kW)
      - battery      (int, battery charge percentage 0–100)
      - grid         (numeric, power drawn from grid in kW)
      - battery_flow (numeric, +charging / -discharging in kW)
      - recorded_at  (timestamptz, when the reading was stored)

   b. energy_forecasts — one row per hourly forecast data point
      - id              (uuid, primary key)
      - hour            (int 0–23)
      - time_label      (text, e.g. "12:00")
      - solar_forecast  (numeric, predicted solar generation in kW)
      - demand_forecast (numeric, predicted building demand in kW)
      - created_at      (timestamptz)

   c. energy_anomalies — one row per detected anomaly
      - id          (uuid, primary key)
      - detected_at (text, human-readable detection time)
      - expected    (numeric, expected consumption in kWh)
      - actual      (numeric, actual consumption in kWh)
      - difference  (numeric, actual - expected in kWh)
      - status      (text: 'Normal' | 'Warning' | 'Critical')
      - reason      (text, possible reason for the anomaly)
      - created_at  (timestamptz)

3. Security
   - RLS enabled on all three tables.
   - Four separate policies per table (SELECT / INSERT / UPDATE / DELETE),
     all scoped TO anon, authenticated with USING (true) / WITH CHECK (true)
     because this is a single-tenant prototype with intentionally public data.

4. Indexes
   - energy_readings: index on hour for fast lookups.
   - energy_forecasts: index on hour.
   - energy_anomalies: index on status for filtering by severity.
*/

-- ── energy_readings ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS energy_readings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hour         int NOT NULL,
  time_label   text NOT NULL,
  solar        numeric NOT NULL DEFAULT 0,
  demand       numeric NOT NULL DEFAULT 0,
  battery      int NOT NULL DEFAULT 0,
  grid         numeric NOT NULL DEFAULT 0,
  battery_flow numeric NOT NULL DEFAULT 0,
  recorded_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_energy_readings_hour ON energy_readings(hour);

ALTER TABLE energy_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_energy_readings" ON energy_readings;
CREATE POLICY "anon_select_energy_readings" ON energy_readings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_energy_readings" ON energy_readings;
CREATE POLICY "anon_insert_energy_readings" ON energy_readings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_energy_readings" ON energy_readings;
CREATE POLICY "anon_update_energy_readings" ON energy_readings
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_energy_readings" ON energy_readings;
CREATE POLICY "anon_delete_energy_readings" ON energy_readings
  FOR DELETE TO anon, authenticated USING (true);

-- ── energy_forecasts ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS energy_forecasts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hour            int NOT NULL,
  time_label      text NOT NULL,
  solar_forecast  numeric NOT NULL DEFAULT 0,
  demand_forecast numeric NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_energy_forecasts_hour ON energy_forecasts(hour);

ALTER TABLE energy_forecasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_energy_forecasts" ON energy_forecasts;
CREATE POLICY "anon_select_energy_forecasts" ON energy_forecasts
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_energy_forecasts" ON energy_forecasts;
CREATE POLICY "anon_insert_energy_forecasts" ON energy_forecasts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_energy_forecasts" ON energy_forecasts;
CREATE POLICY "anon_update_energy_forecasts" ON energy_forecasts
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_energy_forecasts" ON energy_forecasts;
CREATE POLICY "anon_delete_energy_forecasts" ON energy_forecasts
  FOR DELETE TO anon, authenticated USING (true);

-- ── energy_anomalies ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS energy_anomalies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_at text NOT NULL,
  expected    numeric NOT NULL DEFAULT 0,
  actual      numeric NOT NULL DEFAULT 0,
  difference  numeric NOT NULL DEFAULT 0,
  status      text NOT NULL DEFAULT 'Normal',
  reason      text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_energy_anomalies_status ON energy_anomalies(status);

ALTER TABLE energy_anomalies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_energy_anomalies" ON energy_anomalies;
CREATE POLICY "anon_select_energy_anomalies" ON energy_anomalies
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_energy_anomalies" ON energy_anomalies;
CREATE POLICY "anon_insert_energy_anomalies" ON energy_anomalies
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_energy_anomalies" ON energy_anomalies;
CREATE POLICY "anon_update_energy_anomalies" ON energy_anomalies
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_energy_anomalies" ON energy_anomalies;
CREATE POLICY "anon_delete_energy_anomalies" ON energy_anomalies
  FOR DELETE TO anon, authenticated USING (true);
