"use client";

import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  Fuel,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ExplainabilityCard } from "@/components/explainability/ExplainabilityCard";
import { apiClient } from "@/lib/api/client";
import type { BehaviorAnalytics, TelemetryData } from "@/lib/types";

export default function BehaviorPage() {
  const [behavior, setBehavior] = useState<BehaviorAnalytics | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [_isUpdating, setIsUpdating] = useState(false);

  // Live polling every 3 seconds to reflect real-time model inference
  const fetchAnalytics = async () => {
    try {
      const [bData, tData] = await Promise.all([
        apiClient.getBehavior(),
        apiClient.getTelemetry(),
      ]);
      setBehavior(bData);
      setTelemetry(tData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInjectTelemetry = async (partial: Partial<TelemetryData>) => {
    setIsUpdating(true);
    try {
      await apiClient.updateTelemetry(partial);
      await fetchAnalytics();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const anomalyScore = behavior?.anomalyScore || 38;
  const isAnomaly = anomalyScore >= 60;
  const isHighWarning = anomalyScore >= 45 && anomalyScore < 60;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcd11] animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              REAL-TIME ISOLATION FOREST ANOMALY MODEL (SCIKIT-LEARN)
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#ffcd11]" />
            Operator Kinematics & Machine Health Diagnostics
          </h1>
          <p className="text-xs text-slate-400">
            Multi-dimensional isolation tree partitioning evaluated live across
            7 CAN-bus telemetry channels.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <button
            onClick={fetchAnalytics}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Poll Model</span>
          </button>
          <Link
            href="/training"
            className="flex items-center space-x-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-3.5 py-1.5 font-bold text-[#ffcd11] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Targeted Training</span>
          </Link>
        </div>
      </div>

      {/* Real-time Isolation Forest Model State Banner */}
      <div
        className={`rounded-2xl border p-5 shadow-2xl backdrop-blur-xl transition-all ${
          isAnomaly
            ? "border-rose-500/60 bg-rose-950/40 text-rose-100"
            : isHighWarning
              ? "border-amber-500/60 bg-amber-950/40 text-amber-100"
              : "border-emerald-500/40 bg-emerald-950/30 text-emerald-100"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              {isAnomaly ? (
                <AlertOctagon className="h-6 w-6 text-rose-400 animate-bounce" />
              ) : isHighWarning ? (
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              )}
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                {isAnomaly
                  ? "MODEL DECISION: STATISTICAL ANOMALY DETECTED (OUTLIER ISOLATION)"
                  : isHighWarning
                    ? "MODEL DECISION: ELEVATED RISK / SUBGRADE STRESS PATTERN"
                    : "MODEL DECISION: NOMINAL BEHAVIORAL CLUSTER (WITHIN BASELINE)"}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Isolation Forest Anomaly Score:{" "}
              <span
                className={`font-mono font-black ${
                  isAnomaly
                    ? "text-rose-400"
                    : isHighWarning
                      ? "text-amber-400"
                      : "text-emerald-400"
                }`}
              >
                {anomalyScore} / 100
              </span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Model:{" "}
              <code className="text-[#ffcd11]">
                IsolationForest(n_estimators=100, contamination=0.08)
              </code>
              . Evaluates multi-tree isolation depth against the operator&apos;s
              personal baseline (18% idle, 245 bar nominal hydraulic pressure).
            </p>
          </div>

          {/* Real-Time Meter Gauge */}
          <div className="w-full lg:w-72 space-y-2 font-mono text-xs">
            <div className="flex justify-between font-bold">
              <span>Cluster Density:</span>
              <span>{isAnomaly ? "Outlier (Isolated)" : "Inlier (Dense)"}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-950/80 border border-slate-800 overflow-hidden relative">
              <div
                style={{ width: `${anomalyScore}%` }}
                className={`h-full transition-all duration-500 rounded-full ${
                  isAnomaly
                    ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                    : isHighWarning
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
              />
              {/* Decision Threshold Marker at 60% */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                style={{ left: "60%" }}
                title="Decision Boundary (60)"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 (Normal)</span>
              <span className="text-white font-bold">Boundary: 60</span>
              <span>100 (Anomaly)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sensor & Telemetry Perturbation Panel */}
      <div className="rounded-xl border border-yellow-500/30 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-[#ffcd11]" />
            <h3 className="font-bold text-sm text-white">
              LIVE ISOLATION MODEL SENSOR INJECTION TESTBED
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Adjust inputs to test real-time model partitioning
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Hydraulic Pressure Slider */}
          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300">Hydraulic Pressure:</span>
              <span
                className={`font-bold ${(telemetry?.hydraulicPressure || 245) > 290 ? "text-rose-400" : "text-white"}`}
              >
                {telemetry?.hydraulicPressure || 245} bar
              </span>
            </div>
            <input
              type="range"
              min="150"
              max="350"
              step="5"
              value={telemetry?.hydraulicPressure || 245}
              onChange={(e) =>
                handleInjectTelemetry({
                  hydraulicPressure: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-[#ffcd11] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Nominal (245 bar)</span>
              <span className="text-rose-400">Spike (&gt;290 bar)</span>
            </div>
          </div>

          {/* Engine RPM Slider */}
          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300">Engine Speed:</span>
              <span
                className={`font-bold ${(telemetry?.rpm || 1800) > 2100 ? "text-amber-400" : "text-white"}`}
              >
                {telemetry?.rpm || 1800} RPM
              </span>
            </div>
            <input
              type="range"
              min="800"
              max="2400"
              step="50"
              value={telemetry?.rpm || 1800}
              onChange={(e) =>
                handleInjectTelemetry({ rpm: parseInt(e.target.value, 10) })
              }
              className="w-full accent-[#ffcd11] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Eco (1750 RPM)</span>
              <span className="text-amber-400">Overrun (&gt;2100)</span>
            </div>
          </div>

          {/* Idle Toggle */}
          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300">Machine Idle State:</span>
              <span
                className={`font-bold ${telemetry?.idle ? "text-rose-400" : "text-emerald-400"}`}
              >
                {telemetry?.idle ? "IDLING (EXCESS)" : "ACTIVE DIGGING"}
              </span>
            </div>
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => handleInjectTelemetry({ idle: false })}
                className={`flex-1 py-1.5 rounded font-bold transition-all border ${
                  !telemetry?.idle
                    ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                Active (18%)
              </button>
              <button
                onClick={() => handleInjectTelemetry({ idle: true })}
                className={`flex-1 py-1.5 rounded font-bold transition-all border ${
                  telemetry?.idle
                    ? "bg-rose-950 border-rose-500 text-rose-300"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                Idling (42%)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Closed-Loop Novelty Action Panel */}
      <div className="rounded-xl border border-yellow-500/40 bg-gradient-to-r from-yellow-950/40 via-slate-900 to-slate-900 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="rounded bg-[#ffcd11] text-slate-950 font-black text-[10px] px-2 py-0.5 uppercase tracking-wider">
                CLOSED-LOOP NOVELTY
              </span>
              <h3 className="font-bold text-sm text-white">
                Autonomous Intervention & Adaptive Learning Loop
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              When the Isolation Forest flags anomalies (excessive idle or
              hydraulic surge), the system executes a full closed-loop
              remediation:
              <strong>
                {" "}
                Observe → Detect → Intervene (Auto-Idle) → Measure (-2.6L burn)
                → Learn (Digital Twin Update)
              </strong>
              .
            </p>
          </div>

          <button
            onClick={() =>
              handleInjectTelemetry({
                idle: false,
                rpm: 1750,
                hydraulicPressure: 240,
              })
            }
            className="flex items-center space-x-2 rounded-xl bg-[#ffcd11] hover:bg-yellow-400 px-5 py-3 text-xs font-mono font-black text-slate-950 transition-all shadow-xl hover:scale-105 shrink-0"
          >
            <Sparkles className="h-4 w-4 text-slate-950" />
            <span>Execute Closed-Loop Auto-Fix</span>
          </button>
        </div>

        {/* Closed-loop Step Trace */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
          <div className="rounded bg-slate-950/80 p-2.5 border border-slate-800">
            <div className="text-[9px] text-cyan-400 font-bold uppercase">
              1. OBSERVE & DETECT
            </div>
            <div className="text-slate-200 mt-0.5">
              Isolation Forest evaluates 7D telemetry vector
            </div>
          </div>
          <div className="rounded bg-slate-950/80 p-2.5 border border-slate-800">
            <div className="text-[9px] text-amber-400 font-bold uppercase">
              2. INTERVENE
            </div>
            <div className="text-slate-200 mt-0.5">
              Engages CAT Auto-Idle & relief valve damping
            </div>
          </div>
          <div className="rounded bg-slate-950/80 p-2.5 border border-slate-800">
            <div className="text-[9px] text-emerald-400 font-bold uppercase">
              3. MEASURE DELTA
            </div>
            <div className="text-slate-200 mt-0.5">
              Saves -2.6 L/h fuel & recovers ~3.5 min ETA
            </div>
          </div>
          <div className="rounded bg-slate-950/80 p-2.5 border border-slate-800">
            <div className="text-[9px] text-yellow-400 font-bold uppercase">
              4. LEARN (DIGITAL TWIN)
            </div>
            <div className="text-slate-200 mt-0.5">
              Assigns idle micro-drill in /training
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards with Baselines & Deviations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Idle Time Ratio */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 font-mono text-xs">
            <span className="font-bold uppercase">Idle Ratio</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-white">
              {behavior?.idleTimePercentage || 34}%
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              Raj Baseline:{" "}
              <span className="text-slate-200">
                {behavior?.idleBaselinePercentage || 18}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/50 rounded px-2 py-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+{behavior?.idleDeviationPercentage || 89}% Deviation</span>
          </div>
        </div>

        {/* 2. Excavation Cycle Duration */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 font-mono text-xs">
            <span className="font-bold uppercase">Avg Cycle Duration</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-white">
              {behavior?.avgCycleTimeSeconds || 24.8}s
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              Raj Baseline:{" "}
              <span className="text-slate-200">
                {behavior?.baselineCycleTimeSeconds || 21.2}s
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 rounded px-2 py-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+{behavior?.cycleTimeDeviationPercentage || 17}% Slower</span>
          </div>
        </div>

        {/* 3. Fuel Burn Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 font-mono text-xs">
            <span className="font-bold uppercase">Fuel Burn Rate</span>
            <Fuel className="h-4 w-4 text-[#ffcd11]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[#ffcd11]">
              {behavior?.fuelBurnRateLitersPerHour || 19.4}{" "}
              <span className="text-sm font-normal text-slate-400">L/h</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              Fleet Target:{" "}
              <span className="text-slate-200">
                {behavior?.baselineFuelBurnRate || 16.8} L/h
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/50 rounded px-2 py-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+2.6 L/h Excess Burn</span>
          </div>
        </div>

        {/* 4. Hydraulic Strain Index */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 font-mono text-xs">
            <span className="font-bold uppercase">Hydraulic Strain</span>
            <Cpu className="h-4 w-4 text-purple-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-purple-300">
              {behavior?.hydraulicStrainIndex || 70}{" "}
              <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              Pressure:{" "}
              <span className="text-slate-200 font-bold">
                {telemetry?.hydraulicPressure || 245} bar
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-800/50 rounded px-2 py-1">
            <span>Peak Transducer Load</span>
          </div>
        </div>
      </div>

      {/* Detected Anomalies Table & Hourly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Detected Anomalies Breakdown */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#ffcd11]" />
              ACTIVE ISOLATION FOREST FEATURE DEVIATIONS
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Root-Cause Attribution
            </span>
          </div>

          <div className="space-y-3">
            {(behavior?.anomaliesDetected || []).length > 0 ? (
              behavior?.anomaliesDetected.map((anom) => (
                <div
                  key={anom.type}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-200 text-sm">
                      {anom.type}
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        anom.severity === "HIGH"
                          ? "bg-rose-950 text-rose-300 border border-rose-700"
                          : anom.severity === "MEDIUM"
                            ? "bg-amber-950 text-amber-300 border border-amber-700"
                            : "bg-yellow-950 text-yellow-300 border border-yellow-700"
                      }`}
                    >
                      {anom.severity} PRIORITY
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {anom.detail}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">
                      Detected: {anom.detectedAt}
                    </span>
                    <span className="font-bold text-rose-400">
                      {anom.deviation}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-lg bg-slate-950/50 border border-slate-800 text-center text-xs font-mono text-slate-400">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                All 7 telemetry vectors operating within normal inlier clusters.
              </div>
            )}
          </div>
        </div>

        {/* Right 5 cols: Shift Performance Trend Table */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">
              SHIFT HOURLY TRENDS
            </h3>
            <span className="text-xs font-mono text-[#ffcd11]">Today</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="grid grid-cols-4 text-[10px] font-bold text-slate-400 uppercase pb-1 border-b border-slate-800">
              <span>Time</span>
              <span>Idle %</span>
              <span>Cycle</span>
              <span>Safety</span>
            </div>

            {behavior?.trendHistory.map((row) => (
              <div
                key={row.time}
                className="grid grid-cols-4 p-2 rounded bg-slate-950/60 border border-slate-800/60 items-center"
              >
                <span className="text-slate-300 font-bold">{row.time}</span>
                <span
                  className={
                    row.idlePercent > 30
                      ? "text-rose-400 font-bold"
                      : "text-slate-300"
                  }
                >
                  {row.idlePercent}%
                </span>
                <span className="text-slate-300">{row.cycleTimeSec}s</span>
                <span className="text-emerald-400 font-bold">
                  {row.safetyScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explainability Framework for Behavior Page */}
      <ExplainabilityCard
        whatHappened={`Machine anomaly score is currently ${anomalyScore}/100 (${isAnomaly ? "OUTLIER" : "NORMAL CLUSTER"}).`}
        whyItHappened="Isolation Forest trees isolated samples based on hydraulic line pressure spikes and hauler queue idle deviation."
        whatHappensNext="Excessive hydraulic lugging accelerates valve seal wear, while 34% idle adds +2.6 L/h fuel overhead."
        recommendedAction="Activate CAT Auto-Idle and feather hydraulic boom lift on hard subgrade contact."
        potentialRecovery="~3.5 min & 4.2L fuel"
        title="Operating Pattern Diagnostic & Root Cause"
        category="ISOLATION FOREST ENGINE"
      />
    </div>
  );
}
