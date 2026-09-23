"use client";

import {
  AlertTriangle,
  Radio,
  ShieldAlert,
  ShieldCheck,
  User,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { SafetyState, TelemetryData } from "@/lib/types";

interface AppHeaderProps {
  onToggleSimulatorModal?: () => void;
}

export function AppHeader({ onToggleSimulatorModal }: AppHeaderProps) {
  const [timeStr, setTimeStr] = useState<string>("");
  const [safety, setSafety] = useState<SafetyState | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveHeaders = async () => {
    try {
      const [sData, tData] = await Promise.all([
        apiClient.getSafetyState(),
        apiClient.getTelemetry(),
      ]);
      setSafety(sData);
      setTelemetry(tData);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchLiveHeaders();
    const timer = setInterval(fetchLiveHeaders, 3000);
    return () => clearInterval(timer);
  }, []);

  const isCritical = safety?.overallRiskLevel === "CRITICAL";
  const isHigh = safety?.overallRiskLevel === "HIGH";
  const isWarning = safety?.overallRiskLevel === "WARNING";
  const hasSeatbeltAlert = safety?.seatbeltViolation;

  return (
    <header className="sticky top-0 z-40 flex flex-col border-b border-slate-800/80 bg-[#080b10]/95 backdrop-blur-md">
      {/* Critical Emergency Banner if Safety Envelope Breached */}
      {(isCritical || isHigh || hasSeatbeltAlert) && (
        <div
          className={`flex items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
            isCritical
              ? "bg-rose-950/90 text-rose-200 border-b border-rose-600 animate-pulse"
              : isHigh
                ? "bg-amber-950/90 text-amber-200 border-b border-amber-500"
                : "bg-yellow-950/80 text-yellow-200 border-b border-yellow-500"
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-current" />
            <span>
              {isCritical
                ? `CRITICAL SAFETY INTERVENTION: ${safety?.interventionReason} — ACTION: ${safety?.recommendedOperatorAction}`
                : isHigh
                  ? `HIGH PROXIMITY HAZARD: Worker within envelope radius — ${safety?.recommendedOperatorAction}`
                  : `SAFETY NOTICE: ${safety?.interventionReason}`}
            </span>
          </div>
          <Link
            href="/safety"
            className="ml-4 underline hover:text-white shrink-0 font-bold"
          >
            Open Safety Radar →
          </Link>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand / System Title */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffcd11] text-slate-950 font-black tracking-tighter text-xl shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
              CAT
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                  OPERATOR COPILOT
                </span>
                <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#ffcd11] border border-yellow-500/30">
                  Adaptive AI v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                CAT 320 Next Gen • Unit #CAT-320-01
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Live Machine Telemetry Pills */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 rounded-md bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-slate-300">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">TELEMETRY:</span>
            <span className="font-bold text-white">
              {telemetry?.rpm || 1840} RPM
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">HYD:</span>
            <span className="font-bold text-white">
              {telemetry?.hydraulicPressure || 245} BAR
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">FUEL:</span>
            <span className="font-bold text-[#ffcd11]">
              {telemetry?.fuelLevel || 71}%
            </span>
          </div>

          <div
            className={`flex items-center space-x-1.5 rounded-md border px-3 py-1.5 font-bold ${
              telemetry?.seatbelt
                ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
                : "border-rose-500/40 bg-rose-950/60 text-rose-300 animate-pulse"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{telemetry?.seatbelt ? "SEATBELT ON" : "SEATBELT OFF"}</span>
          </div>

          <div
            className={`flex items-center space-x-1.5 rounded-md border px-3 py-1.5 font-bold ${
              isCritical
                ? "border-rose-500 bg-rose-950/60 text-rose-300"
                : isHigh
                  ? "border-amber-500 bg-amber-950/50 text-amber-300"
                  : isWarning
                    ? "border-yellow-500 bg-yellow-950/40 text-yellow-300"
                    : "border-emerald-500/30 bg-emerald-950/30 text-emerald-400"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>
              RADAR: {safety?.workers[0]?.distance.toFixed(1) || "12.4"}M (
              {safety?.overallRiskLevel || "NORMAL"})
            </span>
          </div>
        </div>

        {/* Right: Actions, Audio, Time, Operator Profile */}
        <div className="flex items-center space-x-3">
          {/* Quick Telemetry Simulator Trigger */}
          {onToggleSimulatorModal && (
            <button
              onClick={onToggleSimulatorModal}
              className="flex items-center space-x-1.5 rounded-md bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-2.5 py-1.5 text-xs font-semibold text-[#ffcd11] transition-colors"
              title="Open Live Telemetry & Threat Simulator"
            >
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sim Controls</span>
            </button>
          )}

          {/* Audio Alert Toggle */}
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className="rounded-md border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:text-white transition-colors"
            title={audioMuted ? "Unmute safety chime" : "Mute safety chime"}
          >
            {audioMuted ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            )}
          </button>

          {/* Time & Shift */}
          <div className="hidden sm:block text-right">
            <div className="font-mono text-xs font-bold text-white">
              {timeStr || "11:28 AM"}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">
              Shift: Day A (07:00-15:30)
            </div>
          </div>

          {/* Operator Avatar & Quick Link */}
          <Link
            href="/operator"
            className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900/90 p-1.5 hover:border-yellow-500/40 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-yellow-400 font-bold text-xs border border-yellow-500/30">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden md:block text-left pr-1">
              <div className="text-xs font-bold text-slate-200">Raj Kumar</div>
              <div className="text-[10px] text-emerald-400 font-mono">
                Score: 94
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
