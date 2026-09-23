"use client";

import { AlertOctagon, Eye, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ExplainabilityCard } from "@/components/explainability/ExplainabilityCard";
import { ProximityRadar } from "@/components/safety/ProximityRadar";
import { apiClient } from "@/lib/api/client";
import type { SafetyState, TelemetryData } from "@/lib/types";

export default function SafetyCenterPage() {
  const [safety, setSafety] = useState<SafetyState | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [envelopeThresholds, setEnvelopeThresholds] = useState({
    critical: 3.0,
    high: 5.0,
    warning: 10.0,
    normal: 15.0,
  });

  const loadData = async () => {
    try {
      const [sData, tData] = await Promise.all([
        apiClient.getSafetyState(),
        apiClient.getTelemetry(),
      ]);
      setSafety(sData);
      setTelemetry(tData);
      if (sData.envelopeThresholds) {
        setEnvelopeThresholds(sData.envelopeThresholds);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const _handleUpdateThresholds = async (
    newVal: Partial<typeof envelopeThresholds>,
  ) => {
    const updated = { ...envelopeThresholds, ...newVal };
    setEnvelopeThresholds(updated);
    await apiClient.updateSafetyThresholds(updated as Record<string, number>);
    loadData();
  };

  const isCritical = safety?.overallRiskLevel === "CRITICAL";
  const _isHigh = safety?.overallRiskLevel === "HIGH";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              SAFETY ENGINE & DETERMINISTIC ENVELOPE
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            Context-Aware Proximity & Hazard Vectoring
          </h1>
          <p className="text-xs text-slate-400">
            Hard safety bounds ensure non-negotiable operator/ground-crew
            protection with adaptive RL intervention.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/safety/incidents"
            className="flex items-center space-x-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/40 px-3.5 py-2 text-xs font-mono font-bold text-rose-300 transition-colors"
          >
            <AlertOctagon className="h-4 w-4" />
            <span>View Incident Log</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Radar on Left (5 cols) & Context-Aware Risk Engine on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <ProximityRadar safety={safety} telemetry={telemetry} interactive />

          {/* Hard Safety Envelope Deterministic Thresholds Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-[#ffcd11]" />
                <h3 className="font-bold text-sm text-white">
                  HARD SAFETY ENVELOPE BOUNDS
                </h3>
              </div>
              <span className="rounded bg-rose-950 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-800">
                Non-RL Deterministic
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Safety-critical boundaries cannot be bypassed by RL policies. When
              breached, deterministic overrides trigger immediately.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-rose-500/30">
                <span className="text-rose-400 font-bold">
                  &lt; 3.0m Distance:
                </span>
                <span className="text-rose-300 font-black">
                  CRITICAL (Instant Stop Rec)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-amber-500/30">
                <span className="text-amber-400 font-bold">
                  3.0m - 5.0m Distance:
                </span>
                <span className="text-amber-300 font-black">
                  HIGH RISK (Strong Warn / Speed Limit)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-yellow-500/30">
                <span className="text-yellow-400 font-bold">
                  5.0m - 10.0m Distance:
                </span>
                <span className="text-yellow-300">
                  WARNING (Visual & Audio Cue)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-emerald-500/30">
                <span className="text-emerald-400 font-bold">
                  &gt; 10.0m Distance:
                </span>
                <span className="text-emerald-300">
                  NORMAL (Clear Standoff)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Context-Aware Risk Calculation Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Interventions and Contextual Matrix */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffcd11] text-slate-950 font-bold">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    CONTEXT-AWARE RISK CALCULATION
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Distance + Velocity Vectors + Machine Rotation + Blind Zones
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-[#ffcd11]">
                {safety?.overallRiskScore || 10}/100 Risk Score
              </span>
            </div>

            {/* Comparison Cards: Context Example in action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Scenario A: Low Risk Case */}
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    SCENARIO A (Worker Moving Away)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    LOW RISK
                  </span>
                </div>
                <div className="text-xs font-mono space-y-1 text-slate-300">
                  <div>• Distance: 7.0 meters</div>
                  <div>• Worker Vector: Moving away (+0.6 m/s)</div>
                  <div>• Machine: Fixed heading, 0° swing</div>
                  <div>• Outcome: Safe standoff expanding</div>
                </div>
              </div>

              {/* Scenario B: High Risk Case */}
              <div className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-300">
                    SCENARIO B (Machine Rotating Toward)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    HIGH RISK
                  </span>
                </div>
                <div className="text-xs font-mono space-y-1 text-slate-300">
                  <div>• Distance: 7.0 meters (Identical)</div>
                  <div>• Worker Vector: Stationary in blind quadrant</div>
                  <div>• Machine: Rotating toward worker at 8.5°/s</div>
                  <div>• Outcome: Conflict in ~3.8 seconds</div>
                </div>
              </div>
            </div>

            {/* Active Workers Monitored Table */}
            <div className="space-y-2.5 pt-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Ground Personnel In Proximity Grid
              </div>

              {safety?.workers.map((w) => (
                <div
                  key={w.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{w.name}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                          w.riskLevel === "CRITICAL"
                            ? "bg-rose-950 text-rose-300 border border-rose-600"
                            : w.riskLevel === "HIGH"
                              ? "bg-amber-950 text-amber-300 border border-amber-600"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-600"
                        }`}
                      >
                        {w.riskLevel}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      {w.explanation}
                    </p>
                  </div>

                  <div className="text-right sm:shrink-0 space-y-0.5">
                    <div className="text-sm font-bold text-[#ffcd11]">
                      {w.distance}m Standoff
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {w.isInBlindZone
                        ? "⚠ In Blind Zone"
                        : "Clear Line of Sight"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Policy Engine Decision Card */}
            {safety?.policyEngineDecision && (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[#ffcd11] font-bold">
                  <span>RL ADAPTIVE POLICY STATE VECTOR</span>
                  <span>
                    Reward: {safety.policyEngineDecision.expectedReward}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800/80">
                  <div>
                    Min Dist:{" "}
                    {safety.policyEngineDecision.stateVector.minWorkerDist}m
                  </div>
                  <div>
                    Closing Vel:{" "}
                    {safety.policyEngineDecision.stateVector.relativeSpeed} m/s
                  </div>
                  <div>
                    Swing Rate:{" "}
                    {safety.policyEngineDecision.stateVector.swingRate}°/s
                  </div>
                  <div>
                    Seatbelt:{" "}
                    {safety.policyEngineDecision.stateVector.seatbeltStatus}
                  </div>
                </div>
                <div className="pt-2 text-slate-400 text-[11px]">
                  Active Policy:{" "}
                  <span className="text-white font-bold">
                    {safety.policyEngineDecision.selectedPolicy}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Explainability Framework for Safety Center */}
          <ExplainabilityCard
            whatHappened={
              isCritical
                ? "Ground surveyor has breached the 3.0m hard safety perimeter."
                : "Ground surveyor Marcus Vance monitored at safe standoff distance."
            }
            whyItHappened="Excavator upper structure rotation combined with worker path intersecting right blind quadrant."
            whatHappensNext="Deterministic stop override will engage if standoff drops under 3m or if swing velocity is accelerated."
            recommendedAction={
              safety?.recommendedOperatorAction ||
              "Maintain visual sweep of right mirror before executing 180° swing."
            }
            title="Safety Envelope Reasoning & Intervention Vector"
            category="SAFETY INTELLIGENCE"
          />
        </div>
      </div>
    </div>
  );
}
