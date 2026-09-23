"use client";

import { Activity, Clock, Fuel, Gauge, Thermometer, Zap } from "lucide-react";
import type { TelemetryData } from "@/lib/types";

interface TelemetryGaugesProps {
  telemetry: TelemetryData | null;
}

export function TelemetryGauges({ telemetry }: TelemetryGaugesProps) {
  if (!telemetry) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 text-center text-slate-400 font-mono">
        Connecting to CAT 320 Telemetry Bus...
      </div>
    );
  }

  // RPM percentage for gauge (max 2400)
  const rpmPercent = Math.min(100, Math.round((telemetry.rpm / 2400) * 100));
  // Hydraulic percentage (max 350 bar)
  const hydPercent = Math.min(
    100,
    Math.round((telemetry.hydraulicPressure / 350) * 100),
  );
  // Engine temp percentage (max 120 C)
  const tempPercent = Math.min(
    100,
    Math.round((telemetry.engineTemperature / 120) * 100),
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Engine RPM */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Engine RPM
          </span>
          <Gauge className="h-4 w-4 text-[#ffcd11]" />
        </div>
        <div className="my-2">
          <div className="text-xl font-black font-mono tracking-tight text-white">
            {telemetry.rpm}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Target: 1800 RPM
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              telemetry.rpm > 2100 ? "bg-rose-500" : "bg-[#ffcd11]"
            }`}
            style={{ width: `${rpmPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Hydraulic Pressure */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Hydraulic
          </span>
          <Zap className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="my-2">
          <div className="text-xl font-black font-mono tracking-tight text-white">
            {telemetry.hydraulicPressure}{" "}
            <span className="text-xs font-normal text-slate-400">BAR</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Nominal: 240-280
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              telemetry.hydraulicPressure > 300 ? "bg-amber-500" : "bg-cyan-400"
            }`}
            style={{ width: `${hydPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Engine Temp */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Coolant Temp
          </span>
          <Thermometer className="h-4 w-4 text-orange-400" />
        </div>
        <div className="my-2">
          <div className="text-xl font-black font-mono tracking-tight text-white">
            {telemetry.engineTemperature}°C
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            Optimal Range
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-400 transition-all duration-300"
            style={{ width: `${tempPercent}%` }}
          />
        </div>
      </div>

      {/* 4. Fuel Level */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Fuel Tank
          </span>
          <Fuel className="h-4 w-4 text-[#ffcd11]" />
        </div>
        <div className="my-2">
          <div className="text-xl font-black font-mono tracking-tight text-[#ffcd11]">
            {telemetry.fuelLevel}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            ~5.4 hrs shift est
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#ffcd11] transition-all duration-300"
            style={{ width: `${telemetry.fuelLevel}%` }}
          />
        </div>
      </div>

      {/* 5. Ground Speed & Swing */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Speed / Swing
          </span>
          <Activity className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="my-2">
          <div className="text-xl font-black font-mono tracking-tight text-white">
            {telemetry.speed.toFixed(1)}{" "}
            <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Swing: {telemetry.swingSpeed.toFixed(1)}°/s ({telemetry.swingAngle}
            °)
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${Math.min(100, telemetry.speed * 10)}%` }}
          />
        </div>
      </div>

      {/* 6. Operating Hours */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Total Service
          </span>
          <Clock className="h-4 w-4 text-purple-400" />
        </div>
        <div className="my-2">
          <div className="text-xl font-black font-mono tracking-tight text-white">
            {telemetry.operatingHours.toFixed(1)}{" "}
            <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Service in 71.5h
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-purple-400"
            style={{ width: "82%" }}
          />
        </div>
      </div>
    </div>
  );
}
