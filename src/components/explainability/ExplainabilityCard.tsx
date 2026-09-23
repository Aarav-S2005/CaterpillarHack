"use client";

import { Clock, HelpCircle } from "lucide-react";

interface ExplainabilityProps {
  whatHappened: string;
  whyItHappened: string;
  whatHappensNext: string;
  recommendedAction: string;
  potentialRecovery?: string | number;
  title?: string;
  category?: string;
}

export function ExplainabilityCard({
  whatHappened,
  whyItHappened,
  whatHappensNext,
  recommendedAction,
  potentialRecovery,
  title = "AI Explainability & Causal Reasoning Engine",
  category = "PREDICTION & SAFETY DIAGNOSTICS",
}: ExplainabilityProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-[#ffcd11]">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-wide">
              {title}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              {category}
            </p>
          </div>
        </div>
        {potentialRecovery && (
          <div className="flex items-center space-x-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 font-mono">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>Recovery: ~{potentialRecovery} min</span>
          </div>
        )}
      </div>

      {/* 4 Pillars of Explainability Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. What happened */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-cyan-400 uppercase">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-cyan-950 border border-cyan-800 text-[11px]">
                1
              </span>
              <span>WHAT IS HAPPENING?</span>
            </div>
            <p className="mt-2 text-xs text-slate-200 leading-relaxed">
              {whatHappened}
            </p>
          </div>
        </div>

        {/* 2. Why it happened */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-amber-400 uppercase">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-950 border border-amber-800 text-[11px]">
                2
              </span>
              <span>WHY DID IT HAPPEN?</span>
            </div>
            <p className="mt-2 text-xs text-slate-200 leading-relaxed">
              {whyItHappened}
            </p>
          </div>
        </div>

        {/* 3. What will happen next */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-rose-400 uppercase">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-950 border border-rose-800 text-[11px]">
                3
              </span>
              <span>WHAT WILL HAPPEN NEXT?</span>
            </div>
            <p className="mt-2 text-xs text-slate-200 leading-relaxed">
              {whatHappensNext}
            </p>
          </div>
        </div>

        {/* 4. What should the operator do */}
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-[#ffcd11] uppercase">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-yellow-950 border border-yellow-700 text-[11px]">
                4
              </span>
              <span>WHAT SHOULD I DO?</span>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-100 leading-relaxed">
              {recommendedAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
