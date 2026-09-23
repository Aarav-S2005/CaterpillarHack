"use client";

import { Cpu, Radio, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { TelemetryGauges } from "@/components/machine/TelemetryGauges";
import { TelemetrySimulatorControls } from "@/components/machine/TelemetrySimulatorControls";
import { apiClient } from "@/lib/api/client";
import type { TelemetryData } from "@/lib/types";

export default function LiveMachinePage() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(2000);

  const fetchTelemetry = async () => {
    try {
      const data = await apiClient.getTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              HIGH-RATE TELEMETRY INGESTION BUS (20 HZ)
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            CAT 320 Next Gen Machine Diagnostics
          </h1>
          <p className="text-xs text-slate-400">
            Real-time CAN-bus telemetry stream, hydraulic pressure transducers,
            engine thermodynamics, and kinematics.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400">STREAM RATE:</span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="rounded bg-slate-900 border border-slate-800 text-white px-2.5 py-1 text-xs font-bold focus:border-[#ffcd11] focus:outline-none"
          >
            <option value={1000}>1.0s (Live Fast)</option>
            <option value={2000}>2.0s (Standard)</option>
            <option value={5000}>5.0s (Eco Mode)</option>
          </select>
        </div>
      </div>

      {/* Primary Telemetry Gauges */}
      <TelemetryGauges telemetry={telemetry} />

      {/* Detailed Diagnostic Transducer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Powertrain & Engine Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-[#ffcd11]" />
              <h3 className="font-bold text-sm text-white">
                POWERTRAIN & ENGINE
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              HEALTHY
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Engine Speed (RPM):</span>
              <span className="text-white font-bold">
                {telemetry?.rpm || 1840} RPM
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Coolant Temperature:</span>
              <span className="text-white font-bold">
                {telemetry?.engineTemperature || 82}°C
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Oil Pressure:</span>
              <span className="text-white font-bold">
                {telemetry?.oilPressure || 380} kPa
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Battery Voltage:</span>
              <span className="text-white font-bold">
                {telemetry?.batteryVoltage || 24.6} V
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Chassis Vibration:</span>
              <span className="text-white font-bold">
                {telemetry?.vibrationLevel || 2.1} mm/s
              </span>
            </div>
          </div>
        </div>

        {/* Hydraulics & Kinematics */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">
                HYDRAULICS & SWING
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              ELECTRO-HYDRAULIC
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Main Hydraulic Pressure:</span>
              <span className="text-cyan-400 font-bold">
                {telemetry?.hydraulicPressure || 245} BAR
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Upper Frame Swing Angle:</span>
              <span className="text-white font-bold">
                {telemetry?.swingAngle || 42}°
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Swing Velocity:</span>
              <span className="text-white font-bold">
                {telemetry?.swingSpeed?.toFixed(1) || "8.5"} °/s
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Travel Velocity:</span>
              <span className="text-white font-bold">
                {telemetry?.speed?.toFixed(1) || "0.8"} km/h
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Machine Heading:</span>
              <span className="text-white font-bold">
                {telemetry?.heading || 125}° (SE)
              </span>
            </div>
          </div>
        </div>

        {/* Safety Interlocks & Sensors */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                SAFETY SENSORS & INTERLOCKS
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#ffcd11] font-bold">
              ACTIVE
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Seatbelt Latch Sensor:</span>
              <span
                className={
                  telemetry?.seatbelt
                    ? "text-emerald-400 font-bold"
                    : "text-rose-400 font-bold animate-pulse"
                }
              >
                {telemetry?.seatbelt
                  ? "FASTENED (OK)"
                  : "UNLATCHED (VIOLATION)"}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">LiDAR Proximity Distance:</span>
              <span className="text-[#ffcd11] font-bold">
                {telemetry?.workerDistance?.toFixed(1) || "12.4"} meters
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Hydraulic Lockout Lever:</span>
              <span className="text-emerald-400 font-bold">
                UNLOCKED (ACTIVE)
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">Roll / Pitch Inclinometer:</span>
              <span className="text-white font-bold">
                3.2° Pitch / 1.4° Roll
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400">GNSS High Precision RTK:</span>
              <span className="text-emerald-400 font-bold">FIXED (±2cm)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Live Simulator Override Panel */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          REAL-TIME TELEMETRY OVERRIDE CONTROLS
        </div>
        <TelemetrySimulatorControls onUpdate={fetchTelemetry} />
      </div>
    </div>
  );
}
