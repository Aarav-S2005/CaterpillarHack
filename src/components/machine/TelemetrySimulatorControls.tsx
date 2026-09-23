"use client";

import { CheckCircle, UserX, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { TelemetryData } from "@/lib/types";

interface TelemetrySimulatorControlsProps {
  onClose?: () => void;
  onUpdate?: () => void;
}

export function TelemetrySimulatorControls({
  onClose,
  onUpdate,
}: TelemetrySimulatorControlsProps) {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [_loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    apiClient.getTelemetry().then(setTelemetry).catch(console.error);
  }, []);

  const handleApply = (partial: Partial<TelemetryData>, immediate = false) => {
    // 1. Instant local optimistic update for smooth UI
    setTelemetry((prev) => (prev ? { ...prev, ...partial } : null));

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const sendUpdate = async () => {
      setLoading(true);
      try {
        const updated = await apiClient.updateTelemetry(partial);
        setTelemetry(updated);
        setSuccessNotice("Live telemetry updated!");
        setTimeout(() => setSuccessNotice(null), 2000);
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (immediate) {
      sendUpdate();
    } else {
      debounceTimerRef.current = setTimeout(sendUpdate, 150);
    }
  };

  const applyPreset = (presetName: string) => {
    if (presetName === "normal") {
      handleApply({
        seatbelt: true,
        workerDistance: 14.5,
        workerVelocity: 0.2,
        speed: 0.8,
        rpm: 1840,
        hydraulicPressure: 245,
        swingSpeed: 6.0,
      });
    } else if (presetName === "critical_worker") {
      handleApply({
        seatbelt: true,
        workerDistance: 2.4, // <3m breach
        workerVelocity: -1.2,
        speed: 1.2,
        rpm: 1880,
        hydraulicPressure: 250,
        swingSpeed: 12.0,
      });
    } else if (presetName === "seatbelt_violation") {
      handleApply({
        seatbelt: false, // Unfastened!
        workerDistance: 15.0,
        speed: 4.5, // Moving!
        rpm: 1650,
        hydraulicPressure: 210,
      });
    } else if (presetName === "high_hydraulic") {
      handleApply({
        seatbelt: true,
        workerDistance: 11.0,
        rpm: 2150,
        hydraulicPressure: 310, // Near relief valve
        idle: false,
      });
    }
  };

  if (!telemetry) return null;

  return (
    <div className="rounded-2xl border border-yellow-500/40 bg-[#0c1017] p-5 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffcd11] text-slate-950 font-bold">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              LIVE TELEMETRY & THREAT SIMULATOR
              <span className="rounded bg-yellow-500/20 px-1.5 py-0.2 text-[10px] font-mono text-[#ffcd11] border border-yellow-500/30">
                Interactive Testbed
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Directly override sensor state to verify real-time deterministic
              interventions.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Preset Action Buttons */}
      <div className="mt-4">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
          Scenario Presets
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset("normal")}
            className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-2 text-left hover:bg-emerald-900/50 transition-colors"
          >
            <div className="text-xs font-bold text-emerald-300">
              1. Normal Op
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              14.5m dist • Belt ON
            </div>
          </button>

          <button
            onClick={() => applyPreset("critical_worker")}
            className="rounded-lg border border-rose-500/50 bg-rose-950/50 p-2 text-left hover:bg-rose-900/60 transition-colors"
          >
            <div className="text-xs font-bold text-rose-300 flex items-center gap-1">
              <UserX className="h-3 w-3" />
              2. &lt;3m Hard Breach
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              2.4m dist • Stop Rec
            </div>
          </button>

          <button
            onClick={() => applyPreset("seatbelt_violation")}
            className="rounded-lg border border-amber-500/40 bg-amber-950/40 p-2 text-left hover:bg-amber-900/50 transition-colors"
          >
            <div className="text-xs font-bold text-amber-300">
              3. Seatbelt Alert
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Moving + Belt OFF
            </div>
          </button>

          <button
            onClick={() => applyPreset("high_hydraulic")}
            className="rounded-lg border border-yellow-500/40 bg-yellow-950/40 p-2 text-left hover:bg-yellow-900/50 transition-colors"
          >
            <div className="text-xs font-bold text-yellow-300">
              4. Hyd Surge
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              310 bar • 2150 RPM
            </div>
          </button>
        </div>
      </div>

      {/* Dynamic Sliders */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
        {/* Worker Distance Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Ground Worker Distance:</span>
            <span
              className={`font-bold ${
                telemetry.workerDistance < 3
                  ? "text-rose-400 font-black"
                  : telemetry.workerDistance < 5
                    ? "text-amber-400"
                    : telemetry.workerDistance < 10
                      ? "text-yellow-400"
                      : "text-emerald-400"
              }`}
            >
              {telemetry.workerDistance.toFixed(1)} meters
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            step="0.5"
            value={telemetry.workerDistance}
            onChange={(e) =>
              handleApply({ workerDistance: parseFloat(e.target.value) })
            }
            className="w-full accent-[#ffcd11] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span className="text-rose-400 font-bold">&lt;3m Critical</span>
            <span className="text-amber-400">3-5m High</span>
            <span className="text-yellow-400">5-10m Warning</span>
            <span className="text-emerald-400">&gt;10m Safe</span>
          </div>
        </div>

        {/* Seatbelt Toggle */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Operator Seatbelt:</span>
            <span
              className={
                telemetry.seatbelt
                  ? "text-emerald-400 font-bold"
                  : "text-rose-400 font-bold"
              }
            >
              {telemetry.seatbelt
                ? "BUCKLED (COMPLIANT)"
                : "UNFASTENED (VIOLATION)"}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleApply({ seatbelt: true })}
              className={`flex-1 rounded-lg py-2 text-xs font-mono font-bold transition-all border ${
                telemetry.seatbelt
                  ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                  : "bg-slate-900 border-slate-800 text-slate-400"
              }`}
            >
              Buckled
            </button>
            <button
              onClick={() => handleApply({ seatbelt: false })}
              className={`flex-1 rounded-lg py-2 text-xs font-mono font-bold transition-all border ${
                !telemetry.seatbelt
                  ? "bg-rose-950 border-rose-500 text-rose-300"
                  : "bg-slate-900 border-slate-800 text-slate-400"
              }`}
            >
              Unfastened
            </button>
          </div>
        </div>

        {/* Ground Speed Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Machine Travel Speed:</span>
            <span className="text-white font-bold">
              {telemetry.speed.toFixed(1)} km/h
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.2"
            value={telemetry.speed}
            onChange={(e) => handleApply({ speed: parseFloat(e.target.value) })}
            className="w-full accent-[#ffcd11] cursor-pointer"
          />
        </div>

        {/* Engine RPM */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Engine RPM:</span>
            <span className="text-white font-bold">{telemetry.rpm} RPM</span>
          </div>
          <input
            type="range"
            min="800"
            max="2300"
            step="50"
            value={telemetry.rpm}
            onChange={(e) => handleApply({ rpm: parseInt(e.target.value, 10) })}
            className="w-full accent-[#ffcd11] cursor-pointer"
          />
        </div>

        {/* Hydraulic Pressure */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Hydraulic Pressure:</span>
            <span className="text-white font-bold">
              {telemetry.hydraulicPressure} bar
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="340"
            step="5"
            value={telemetry.hydraulicPressure}
            onChange={(e) =>
              handleApply({ hydraulicPressure: parseInt(e.target.value, 10) })
            }
            className="w-full accent-[#ffcd11] cursor-pointer"
          />
        </div>

        {/* Swing Speed */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Swing Rate (Rotation):</span>
            <span className="text-white font-bold">
              {telemetry.swingSpeed.toFixed(1)} °/s
            </span>
          </div>
          <input
            type="range"
            min="-15"
            max="15"
            step="0.5"
            value={telemetry.swingSpeed}
            onChange={(e) =>
              handleApply({ swingSpeed: parseFloat(e.target.value) })
            }
            className="w-full accent-[#ffcd11] cursor-pointer"
          />
        </div>
      </div>

      {successNotice && (
        <div className="mt-3 flex items-center justify-center space-x-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 rounded-lg p-2">
          <CheckCircle className="h-4 w-4" />
          <span>{successNotice}</span>
        </div>
      )}
    </div>
  );
}
