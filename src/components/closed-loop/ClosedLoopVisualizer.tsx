"use client";

import {
  AlertTriangle,
  Brain,
  Eye,
  GraduationCap,
  Ruler,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

const loopSteps = [
  {
    step: 1,
    title: "OBSERVE",
    icon: Eye,
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-950/30",
    desc: "Ingests high-rate RPM (1840), hydraulic pressure (245 bar), seatbelt status, and 360° LiDAR radar vectors.",
    activeData: "12.4m Worker Distance • 0.8 km/h Speed",
  },
  {
    step: 2,
    title: "UNDERSTAND",
    icon: Brain,
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-950/30",
    desc: "Fuses machine kinematics with operator baseline (Raj Kumar), soil density (Clay 7.2), and rainy weather context.",
    activeData: "Sector 4B Pit • 72% Complete",
  },
  {
    step: 3,
    title: "DETECT",
    icon: Search,
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-950/30",
    desc: "Spots +89% idle deviation and rear swing arc proximity incursions before danger thresholds are reached.",
    activeData: "Idle 34% (Baseline 18%)",
  },
  {
    step: 4,
    title: "PREDICT",
    icon: TrendingUp,
    color: "text-orange-400",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-950/30",
    desc: "Foresees 18-minute ETA delay and trajectory conflict probability within 18s window.",
    activeData: "Predicted ETA: 11:28 AM (+18m)",
  },
  {
    step: 5,
    title: "INTERVENE",
    icon: AlertTriangle,
    color: "text-rose-400",
    borderColor: "border-rose-500/30",
    bgColor: "bg-rose-950/30",
    desc: "Dispatches contextual audio/visual cues or locks travel speed deterministically inside the 3m Hard Safety Envelope.",
    activeData: "Action: STRONG_WARNING",
  },
  {
    step: 6,
    title: "MEASURE",
    icon: Ruler,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-950/30",
    desc: "Tracks operator reaction latency (0.8s swing braking) and verifies clearance before cycle resumption.",
    activeData: "Operator Response Time: 0.82s",
  },
  {
    step: 7,
    title: "LEARN",
    icon: GraduationCap,
    color: "text-yellow-400",
    borderColor: "border-yellow-500/40",
    bgColor: "bg-yellow-950/30",
    desc: "Feeds outcome back into Operator Digital Twin, updating skill scores and generating targeted micro-drills.",
    activeData: "Safety: 94 | Prod: 87",
  },
];

export function ClosedLoopVisualizer() {
  const [selectedStep, setSelectedStep] = useState(0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffcd11] text-slate-950 font-black text-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-wide">
              CLOSED-LOOP ADAPTIVE INTELLIGENCE CYCLE
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Observe → Understand → Detect → Predict → Intervene → Measure →
              Learn
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 rounded-full bg-slate-950 border border-slate-800 px-3 py-1 text-[11px] font-mono font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Self-Optimizing Loop</span>
        </div>
      </div>

      {/* Horizontal Step Sequence */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {loopSteps.map((s, idx) => {
          const Icon = s.icon;
          const isSelected = selectedStep === idx;
          return (
            <button
              key={s.title}
              onClick={() => setSelectedStep(idx)}
              className={`flex flex-col items-start rounded-lg p-2.5 text-left transition-all border ${
                isSelected
                  ? `${s.bgColor} ${s.borderColor} ring-1 ring-[#ffcd11]/50 shadow-md`
                  : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  0{s.step}
                </span>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="mt-2 text-xs font-bold font-mono tracking-wider text-slate-200">
                {s.title}
              </div>
              <div className="mt-1 text-[10px] font-mono text-slate-400 line-clamp-1 truncate w-full">
                {s.activeData}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Step Expanded Inspector */}
      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/90 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold font-mono text-[#ffcd11] border border-yellow-500/30">
              STEP 0{loopSteps[selectedStep].step}:{" "}
              {loopSteps[selectedStep].title}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live System Ingestion & Policy Execution
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {loopSteps[selectedStep].desc}
          </p>
        </div>
        <div className="shrink-0 rounded-lg bg-slate-900 border border-slate-800 px-4 py-2.5 text-right font-mono">
          <div className="text-[10px] uppercase text-slate-400">
            Telemetry / State Snapshot
          </div>
          <div className="text-xs font-bold text-[#ffcd11] mt-0.5">
            {loopSteps[selectedStep].activeData}
          </div>
        </div>
      </div>
    </div>
  );
}
