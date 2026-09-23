"use client";

import { CheckCircle2, Gauge, Save, Settings, Shield } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [criticalThreshold, setCriticalThreshold] = useState("3.0");
  const [highThreshold, setHighThreshold] = useState("5.0");
  const [warningThreshold, setWarningThreshold] = useState("10.0");
  const [audioVolume, setAudioVolume] = useState("85");
  const [units, setUnits] = useState("metric");
  const [machineProfile, setMachineProfile] = useState("CAT 320 Next Gen");
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcd11]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              SYSTEM CONFIGURATION & SAFETY BOUNDARIES
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#ffcd11]" />
            Copilot System & Deterministic Boundary Settings
          </h1>
          <p className="text-xs text-slate-400">
            Configure safety envelope threshold radii, audio intervention
            chimes, engineering units, and machine parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 rounded-lg bg-[#ffcd11] hover:bg-yellow-400 px-4 py-2 text-xs font-mono font-bold text-slate-950 transition-colors shadow-lg"
        >
          <Save className="h-4 w-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedNotice && (
        <div className="rounded-xl bg-emerald-950/80 border border-emerald-500/50 p-3 text-xs font-mono font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            System configuration and deterministic safety envelopes updated
            successfully!
          </span>
        </div>
      )}

      {/* Grid Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Hard Safety Envelope Configuration */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Shield className="h-5 w-5 text-rose-400" />
            <h3 className="font-bold text-sm text-white">
              HARD SAFETY ENVELOPE RADII
            </h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold">
                Critical Stop Limit (&lt; meters):
              </label>
              <input
                type="number"
                step="0.5"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-[#ffcd11] focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">
                Default: 3.0m. Deterministic machine halt recommendation.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">
                High Risk Ring (meters):
              </label>
              <input
                type="number"
                step="0.5"
                value={highThreshold}
                onChange={(e) => setHighThreshold(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-[#ffcd11] focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">
                Default: 5.0m. Strong audio-visual alerts & swing speed limiter.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">
                Warning Perimeter (meters):
              </label>
              <input
                type="number"
                step="0.5"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-[#ffcd11] focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">
                Default: 10.0m. Visual dashboard notification.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Machine Profile & Units */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Gauge className="h-5 w-5 text-[#ffcd11]" />
            <h3 className="font-bold text-sm text-white">
              MACHINE & TELEMETRY CONFIG
            </h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold">
                Active Machine Profile:
              </label>
              <select
                value={machineProfile}
                onChange={(e) => setMachineProfile(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-[#ffcd11] focus:outline-none"
              >
                <option value="CAT 320 Next Gen">
                  CAT 320 Next Gen Hydraulic Excavator
                </option>
                <option value="CAT 336 Heavy">
                  CAT 336 Heavy Excavator (36 Ton)
                </option>
                <option value="CAT 950M Loader">
                  CAT 950M Medium Wheel Loader
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">
                Engineering Units:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUnits("metric")}
                  className={`rounded-lg py-2.5 text-xs font-bold border ${
                    units === "metric"
                      ? "bg-yellow-500/20 border-[#ffcd11] text-[#ffcd11]"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  Metric (km/h, bar, m³, °C)
                </button>
                <button
                  type="button"
                  onClick={() => setUnits("imperial")}
                  className={`rounded-lg py-2.5 text-xs font-bold border ${
                    units === "imperial"
                      ? "bg-yellow-500/20 border-[#ffcd11] text-[#ffcd11]"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  Imperial (mph, psi, yd³, °F)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-bold">
                <span>Audio Alert Chime Volume:</span>
                <span className="text-[#ffcd11]">{audioVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audioVolume}
                onChange={(e) => setAudioVolume(e.target.value)}
                className="w-full accent-[#ffcd11] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
