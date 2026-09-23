"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { SafetyState, TelemetryData } from "@/lib/types";

interface ProximityRadarProps {
  safety: SafetyState | null;
  telemetry: TelemetryData | null;
  interactive?: boolean;
}

export function ProximityRadar({ safety, telemetry }: ProximityRadarProps) {
  const currentWorker = safety?.workers[0];
  const workerDist = currentWorker ? currentWorker.distance : 12.4;
  const workerAngle = telemetry?.workerRelativeAngle || 85;
  const swingAngle = telemetry?.swingAngle || 42;
  const _swingSpeed = telemetry?.swingSpeed || 8.5;

  // Radar dimensions & scales (Center is 150, 150. Max radius 130px represents 25 meters)
  const cx = 150;
  const cy = 150;
  const scale = 130 / 20; // 6.5px per meter

  const r3m = 3 * scale;
  const r5m = 5 * scale;
  const r10m = 10 * scale;
  const r20m = 20 * scale;

  // Worker coordinates on radar relative to machine heading (0 deg = North)
  const workerRad = ((workerAngle - 90) * Math.PI) / 180;
  const workerX = cx + Math.min(135, workerDist * scale) * Math.cos(workerRad);
  const workerY = cy + Math.min(135, workerDist * scale) * Math.sin(workerRad);

  // Worker B (Derek Shaw at 24.5m, 170 deg)
  const worker2Angle = 170;
  const worker2Dist = 24.5;
  const worker2Rad = ((worker2Angle - 90) * Math.PI) / 180;
  const worker2X =
    cx + Math.min(140, worker2Dist * (scale * 0.7)) * Math.cos(worker2Rad);
  const worker2Y =
    cy + Math.min(140, worker2Dist * (scale * 0.7)) * Math.sin(worker2Rad);

  const isCritical = safety?.overallRiskLevel === "CRITICAL";
  const isHigh = safety?.overallRiskLevel === "HIGH";
  const isWarning = safety?.overallRiskLevel === "WARNING";

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#ffcd11] animate-ping" />
              PROXIMITY RADAR & SAFETY ENVELOPE
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            360° Context-Aware Hazard Vectoring • Blind Zone Scanner
          </p>
        </div>
        <div
          className={`flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-bold font-mono ${
            isCritical
              ? "bg-rose-950 text-rose-300 border border-rose-600 animate-pulse"
              : isHigh
                ? "bg-amber-950 text-amber-300 border border-amber-500"
                : isWarning
                  ? "bg-yellow-950 text-yellow-300 border border-yellow-500"
                  : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
          }`}
        >
          {isCritical ? (
            <ShieldAlert className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          <span>
            {safety?.overallRiskLevel || "NORMAL"} (
            {safety?.overallRiskScore || 10}/100)
          </span>
        </div>
      </div>

      <div className="relative my-3 flex items-center justify-center">
        <svg
          viewBox="0 0 300 300"
          className="w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-full bg-[#070a0f] border border-slate-800 shadow-inner overflow-hidden"
        >
          {/* Radar Background Grids */}
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffcd11" stopOpacity="0.06" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#080b10" stopOpacity="0.9" />
            </radialGradient>
            <linearGradient
              id="blindZoneRear"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient
              id="blindZoneRight"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <circle cx={cx} cy={cy} r={145} fill="url(#radarGlow)" />

          {/* Blind Zone Cones */}
          {/* Rear Blind Zone (135° to 225°) */}
          <path
            d={`M ${cx} ${cy} L ${cx + 140 * Math.cos((45 * Math.PI) / 180)} ${cy + 140 * Math.sin((45 * Math.PI) / 180)} A 140 140 0 0 1 ${cx + 140 * Math.cos((135 * Math.PI) / 180)} ${cy + 140 * Math.sin((135 * Math.PI) / 180)} Z`}
            fill="url(#blindZoneRear)"
          />
          {/* Right Blind Zone (70° to 110°) */}
          <path
            d={`M ${cx} ${cy} L ${cx + 140 * Math.cos((-20 * Math.PI) / 180)} ${cy + 140 * Math.sin((-20 * Math.PI) / 180)} A 140 140 0 0 1 ${cx + 140 * Math.cos((20 * Math.PI) / 180)} ${cy + 140 * Math.sin((20 * Math.PI) / 180)} Z`}
            fill="url(#blindZoneRight)"
          />

          {/* Hard Safety Envelope Range Rings */}
          {/* 20m Outer ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r20m}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          {/* 10m Warning ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r10m}
            fill="none"
            stroke="#eab308"
            strokeOpacity="0.4"
            strokeWidth="1.2"
            strokeDasharray="4,2"
          />
          {/* 5m High Risk ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r5m}
            fill="none"
            stroke="#f97316"
            strokeOpacity="0.6"
            strokeWidth="1.5"
          />
          {/* 3m Critical Envelope */}
          <circle
            cx={cx}
            cy={cy}
            r={r3m}
            fill="rgba(239, 68, 68, 0.08)"
            stroke="#ef4444"
            strokeWidth="1.8"
            strokeDasharray="2,2"
          />

          {/* Axis lines */}
          <line
            x1={cx}
            y1={5}
            x2={cx}
            y2={295}
            stroke="#1e293b"
            strokeWidth="1"
          />
          <line
            x1={5}
            y1={cy}
            x2={295}
            y2={cy}
            stroke="#1e293b"
            strokeWidth="1"
          />

          {/* Range Labels */}
          <text
            x={cx + 4}
            y={cy - r3m + 10}
            fill="#ef4444"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            3m
          </text>
          <text
            x={cx + 4}
            y={cy - r5m + 10}
            fill="#f97316"
            fontSize="8"
            fontFamily="monospace"
          >
            5m
          </text>
          <text
            x={cx + 4}
            y={cy - r10m + 10}
            fill="#eab308"
            fontSize="8"
            fontFamily="monospace"
          >
            10m
          </text>
          <text
            x={cx + 4}
            y={cy - r20m + 10}
            fill="#64748b"
            fontSize="8"
            fontFamily="monospace"
          >
            20m
          </text>

          {/* Rotating Radar Sweep Line */}
          <g
            className="animate-radar origin-center"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            <line
              x1={cx}
              y1={cy}
              x2={cx + 140}
              y2={cy}
              stroke="#ffcd11"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />
            <path
              d={`M ${cx} ${cy} L ${cx + 140} ${cy} A 140 140 0 0 0 ${cx + 140 * Math.cos((-30 * Math.PI) / 180)} ${cy + 140 * Math.sin((-30 * Math.PI) / 180)} Z`}
              fill="rgba(255, 205, 17, 0.15)"
            />
          </g>

          {/* Machine Icon in Center */}
          <g
            transform={`translate(${cx}, ${cy}) rotate(${telemetry?.heading || 0})`}
          >
            {/* Tracks */}
            <rect
              x="-10"
              y="-16"
              width="6"
              height="32"
              rx="2"
              fill="#334155"
              stroke="#0f172a"
            />
            <rect
              x="4"
              y="-16"
              width="6"
              height="32"
              rx="2"
              fill="#334155"
              stroke="#0f172a"
            />
            {/* Machine Body */}
            <rect
              x="-7"
              y="-12"
              width="14"
              height="24"
              rx="2"
              fill="#ffcd11"
              stroke="#b45309"
              strokeWidth="1"
            />
            {/* Cab */}
            <rect x="-6" y="-10" width="6" height="10" rx="1" fill="#0f172a" />
            {/* Boom Arm pointing up/forward with swing angle */}
            <line
              x1="0"
              y1="-8"
              x2="0"
              y2="-28"
              stroke="#ffcd11"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${swingAngle})`}
            />
          </g>

          {/* Worker 1 Blip (Marcus Vance) */}
          <g transform={`translate(${workerX}, ${workerY})`}>
            {/* Pulsing ring if high or critical */}
            {(isCritical || isHigh) && (
              <circle
                cx="0"
                cy="0"
                r="12"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                className="animate-ping"
              />
            )}
            <circle
              cx="0"
              cy="0"
              r="6"
              fill={
                isCritical
                  ? "#ef4444"
                  : isHigh
                    ? "#f59e0b"
                    : isWarning
                      ? "#eab308"
                      : "#06b6d4"
              }
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Trajectory vector arrow */}
            {currentWorker?.velocity && (
              <line
                x1="0"
                y1="0"
                x2={currentWorker.velocity < 0 ? -10 : 10}
                y2={currentWorker.velocity < 0 ? 8 : -8}
                stroke="#ffcd11"
                strokeWidth="1.5"
                strokeDasharray="2,1"
              />
            )}
            <text
              x="8"
              y="3"
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {currentWorker?.name.split(" ")[0] || "Worker"} (
              {workerDist.toFixed(1)}m)
            </text>
          </g>

          {/* Worker 2 Blip (Derek Shaw) */}
          <g transform={`translate(${worker2X}, ${worker2Y})`}>
            <circle
              cx="0"
              cy="0"
              r="4"
              fill="#06b6d4"
              stroke="#ffffff"
              strokeWidth="1"
            />
            <text
              x="6"
              y="2"
              fill="#94a3b8"
              fontSize="8"
              fontFamily="monospace"
            >
              Derek (24.5m)
            </text>
          </g>
        </svg>
      </div>

      {/* Safety Legend & Context Status */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-800/80 pt-2.5">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
          <span>&lt;3m Hard Stop Limit</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>3-5m High Risk Ring</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 shrink-0" />
          <span>5-10m Warning Zone</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shrink-0" />
          <span>&gt;10m Normal Safe Zone</span>
        </div>
      </div>

      {/* Active Intervention Box */}
      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 p-2.5">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          RL INTERVENTION POLICY DISPATCH
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#ffcd11]">
            {safety?.activeIntervention || "NO_ACTION"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {safety?.policyEngineDecision.selectedPolicy.includes("OVERRIDE")
              ? "Deterministic Envelope"
              : "Adaptive PPO Policy"}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-300">
          {safety?.recommendedOperatorAction ||
            "Operating within safe parameters."}
        </p>
      </div>
    </div>
  );
}
