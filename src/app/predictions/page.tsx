"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ExplainabilityCard } from "@/components/explainability/ExplainabilityCard";
import { apiClient } from "@/lib/api/client";
import type { ETAPrediction } from "@/lib/types";

export default function PredictionsPage() {
  const [prediction, setPrediction] = useState<ETAPrediction | null>(null);

  useEffect(() => {
    apiClient.getPredictions().then(setPrediction).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcd11]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              TASK-TIME PREDICTION & MULTI-FACTOR DECOMPOSITION
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            Task ETA Forecasting & Causal Model
          </h1>
          <p className="text-xs text-slate-400">
            Machine learning regression integrating soil hardness,
            precipitation, swing rate, and queue wait times.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/simulator"
            className="flex items-center space-x-1.5 rounded-lg bg-[#ffcd11] hover:bg-yellow-400 px-3.5 py-2 text-xs font-mono font-bold text-slate-950 transition-colors shadow-lg"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch What-If Simulator</span>
          </Link>
        </div>
      </div>

      {/* Main ETA Hero Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Original ETA */}
          <div className="space-y-1 font-mono">
            <div className="text-xs text-slate-400 uppercase">
              Original Scheduled ETA
            </div>
            <div className="text-2xl font-bold text-slate-300 line-through">
              {prediction?.originalETA || "11:10 AM"}
            </div>
            <div className="text-[11px] text-slate-500">Target Shift Pace</div>
          </div>

          {/* Current Predicted ETA */}
          <div className="space-y-1 font-mono">
            <div className="text-xs text-slate-400 uppercase">
              Current Predicted ETA
            </div>
            <div className="text-3xl font-black text-[#ffcd11]">
              {prediction?.predictedETA || "11:28 AM"}
            </div>
            <div className="text-[11px] text-rose-400 font-bold">
              +{prediction?.delayMinutes || 18} Minutes Delay
            </div>
          </div>

          {/* Confidence Score */}
          <div className="space-y-1 font-mono">
            <div className="text-xs text-slate-400 uppercase">
              Model Confidence
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {prediction?.confidenceScore || 92}%
            </div>
            <div className="text-[11px] text-slate-400">
              High Kinematic Certainty
            </div>
          </div>

          {/* Recovery Potential */}
          <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/40 p-3.5 font-mono space-y-1">
            <div className="text-[10px] text-emerald-400 uppercase font-bold">
              Actionable Recovery
            </div>
            <div className="text-xl font-bold text-emerald-300">
              ~{prediction?.explainability.potentialTimeRecoveryMinutes || 9}{" "}
              Minutes
            </div>
            <div className="text-[10px] text-slate-400">
              Via Eco-Idle + Step-cutting
            </div>
          </div>
        </div>
      </div>

      {/* Delay Factor Breakdown Cards */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          FACTOR ATTRIBUTION CONTRIBUTING TO +{prediction?.delayMinutes || 18}{" "}
          MIN DELAY
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prediction?.breakdownFactors.map((f) => {
            const isNegative = f.impactMinutes > 0;
            return (
              <div
                key={f.factor}
                className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-2 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300 uppercase">
                    Category: {f.category}
                  </span>
                  <span
                    className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                      isNegative
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}
                  >
                    {isNegative
                      ? `+${f.impactMinutes} min`
                      : `${f.impactMinutes} min`}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white pt-1">
                  {f.factor}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {f.details}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Explainability Framework */}
      {prediction && (
        <ExplainabilityCard
          whatHappened={prediction.explainability.whatHappened}
          whyItHappened={prediction.explainability.whyItHappened}
          whatHappensNext={prediction.explainability.whatHappensNext}
          recommendedAction={prediction.explainability.recommendedAction}
          potentialRecovery={
            prediction.explainability.potentialTimeRecoveryMinutes
          }
        />
      )}
    </div>
  );
}
