"use client";

import { Activity, ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ClosedLoopVisualizer } from "@/components/closed-loop/ClosedLoopVisualizer";
import { CopilotWidget } from "@/components/copilot/CopilotWidget";
import { ExplainabilityCard } from "@/components/explainability/ExplainabilityCard";
import { TelemetryGauges } from "@/components/machine/TelemetryGauges";
import { ProximityRadar } from "@/components/safety/ProximityRadar";
import { apiClient } from "@/lib/api/client";
import type {
  BehaviorAnalytics,
  ETAPrediction,
  SafetyState,
  TaskItem,
  TelemetryData,
} from "@/lib/types";

export default function DashboardPage() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [safety, setSafety] = useState<SafetyState | null>(null);
  const [task, setTask] = useState<TaskItem | null>(null);
  const [behavior, setBehavior] = useState<BehaviorAnalytics | null>(null);
  const [eta, setEta] = useState<ETAPrediction | null>(null);
  const [_loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [tData, sData, tasksData, bData, etaData] = await Promise.all([
        apiClient.getTelemetry(),
        apiClient.getSafetyState(),
        apiClient.getTasks(),
        apiClient.getBehavior(),
        apiClient.getPredictions(),
      ]);
      setTelemetry(tData);
      setSafety(sData);
      setTask(tasksData[0]);
      setBehavior(bData);
      setEta(etaData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Intelligence Hub Headline & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffcd11] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              INTELLIGENT COMMAND CENTER • CAT 320 COPILOT
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
            Closed-Loop Human-Machine Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Observing machine kinematics, operator baseline, environmental
            resistance, and live proximity envelope.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/simulator"
            className="flex items-center space-x-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-3.5 py-2 text-xs font-mono font-bold text-[#ffcd11] transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>What-If Simulator</span>
          </Link>
          <Link
            href="/safety"
            className="flex items-center space-x-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 text-xs font-mono font-bold text-slate-200 transition-all"
          >
            <span>Safety Envelope</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Live Machine Telemetry Ribbon */}
      <TelemetryGauges telemetry={telemetry} />

      {/* Central 3-Column Operational Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Current Task & ETA Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Current Task Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#ffcd11] border border-yellow-500/30">
                    CURRENT TASK
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {task?.code || "CAT-EX-402"}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {task?.progressPercentage || 72}% COMPLETE
                </span>
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-base text-white">
                  {task?.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{task?.location}</p>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>
                    Volume: {task?.completedVolume} / {task?.targetVolume} m³
                  </span>
                  <span>
                    Depth: {task?.currentDepth}m / {task?.targetDepth}m
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#ffcd11] transition-all duration-500"
                    style={{ width: `${task?.progressPercentage || 72}%` }}
                  />
                </div>
              </div>

              {/* ETA Prediction Box */}
              <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Scheduled ETA:</span>
                  <span className="text-slate-300 line-through">
                    {task?.originalETA}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Predicted ETA:</span>
                  <span className="text-[#ffcd11] font-bold text-sm">
                    {task?.currentETA}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span className="text-rose-400 font-bold">
                    Net Task Delay:
                  </span>
                  <span className="text-rose-400 font-bold">
                    +{task?.delayMinutes} Minutes
                  </span>
                </div>
              </div>

              {/* Delay Contributors list */}
              <div className="mt-4 space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  ETA Contributor Breakdown
                </div>
                {task?.factors.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between text-xs rounded bg-slate-950/50 p-2 border border-slate-800/60"
                  >
                    <span className="text-slate-300 truncate max-w-[200px]">
                      {f.name}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        f.impactMinutes > 0
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {f.impactMinutes > 0
                        ? `+${f.impactMinutes}m`
                        : `${f.impactMinutes}m`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/tasks"
              className="mt-5 flex items-center justify-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs font-mono text-slate-300 hover:text-white hover:border-yellow-500/40 transition-colors"
            >
              <span>View All Site Tasks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Behavior / Anomaly Insight Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-[#ffcd11]" />
                <h3 className="font-bold text-sm text-white">
                  OPERATING PATTERNS
                </h3>
              </div>
              <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#ffcd11] border border-yellow-500/30">
                Isolation Forest Proxy
              </span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">
                    Idle Time Ratio
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {behavior?.idleTimePercentage}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px] uppercase">
                    Operator Baseline
                  </div>
                  <div className="text-xs text-slate-300">
                    {behavior?.idleBaselinePercentage}%
                  </div>
                </div>
                <div className="rounded bg-rose-950/80 border border-rose-800/60 px-2 py-1 text-right">
                  <div className="text-[9px] text-rose-300">Deviation</div>
                  <div className="text-xs font-black text-rose-300">
                    +{behavior?.idleDeviationPercentage}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">
                    Excavation Cycle
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {behavior?.avgCycleTimeSeconds}s
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Baseline 21.2s
                  </div>
                </div>
                <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">
                    Hydraulic Strain
                  </div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">
                    {behavior?.hydraulicStrainIndex}/100
                  </div>
                  <div className="text-[9px] text-slate-500">Nominal 28</div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-yellow-950/30 border border-yellow-500/30 p-3 text-xs text-slate-200">
              <div className="font-bold text-[#ffcd11] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Adaptive Intervention Opportunity
              </div>
              <p className="mt-1 text-[11px] text-slate-300">
                Engaging auto-idle during dump truck wait will recover ~9
                minutes of delay and save 4.2L of fuel today.
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: Live Safety Center & Proximity Radar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <ProximityRadar safety={safety} telemetry={telemetry} interactive />

          {/* Today's Recommendation & Action Recovery Card */}
          <div className="rounded-xl border border-yellow-500/40 bg-gradient-to-b from-yellow-950/30 to-slate-900/90 p-5 shadow-xl">
            <div className="flex items-center space-x-2 text-[#ffcd11]">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-black text-sm tracking-wide uppercase">
                TODAY&apos;S COPILOT RECOMMENDATION
              </h3>
            </div>

            <p className="mt-3 text-xs font-semibold text-white leading-relaxed">
              &quot;Reduce idle periods during loading swaps and step-cut hard
              clay in 15cm slices.&quot;
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">
                  Potential Recovery
                </div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  ~9 Minutes
                </div>
              </div>
              <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Fuel Savings</div>
                <div className="text-base font-bold text-[#ffcd11] mt-0.5">
                  ~4.2 Liters
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href="/simulator"
                className="flex-1 rounded-lg bg-[#ffcd11] hover:bg-yellow-400 py-2 text-center text-xs font-bold text-slate-950 font-mono transition-colors"
              >
                Test in What-If Sim
              </Link>
              <Link
                href="/training"
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 py-2 text-center text-xs font-bold text-slate-300 font-mono transition-colors"
              >
                Launch Micro-Drill
              </Link>
            </div>
          </div>
        </div>

        {/* Column 3: AI Copilot Interactive Widget (4 cols) */}
        <div className="lg:col-span-4">
          <CopilotWidget embedded />
        </div>
      </div>

      {/* Full Width Explainability Framework (The 4 Questions) */}
      {eta && (
        <ExplainabilityCard
          whatHappened={eta.explainability.whatHappened}
          whyItHappened={eta.explainability.whyItHappened}
          whatHappensNext={eta.explainability.whatHappensNext}
          recommendedAction={eta.explainability.recommendedAction}
          potentialRecovery={eta.explainability.potentialTimeRecoveryMinutes}
        />
      )}

      {/* Closed-Loop Learning System Diagram */}
      <ClosedLoopVisualizer />
    </div>
  );
}
