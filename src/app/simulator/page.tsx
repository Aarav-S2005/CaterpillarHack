"use client";

import { RotateCcw, Sliders, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { WhatIfScenarioInput, WhatIfScenarioResult } from "@/lib/types";

export default function SimulatorPage() {
  const [params, setParams] = useState<WhatIfScenarioInput>({
    idleTimeReductionPercent: 10,
    cycleTimeReductionSeconds: 4,
    weatherCondition: "Moderate Rain",
    operatorSkillBoostPercent: 5,
    rpmOptimizationPercent: 10,
  });

  const [result, setResult] = useState<WhatIfScenarioResult | null>(null);
  const [_loading, setLoading] = useState(false);

  const runSimulation = async (currentParams = params) => {
    setLoading(true);
    try {
      const simResult = await apiClient.runWhatIfSimulation(currentParams);
      setResult(simResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(params);
  }, []);

  const handleSliderChange = (newParams: Partial<WhatIfScenarioInput>) => {
    const updated = { ...params, ...newParams };
    setParams(updated);
    runSimulation(updated);
  };

  const applyPreset = (type: "aggressive" | "rainy" | "eco") => {
    let p: WhatIfScenarioInput;
    if (type === "aggressive") {
      p = {
        idleTimeReductionPercent: 20,
        cycleTimeReductionSeconds: 8,
        weatherCondition: "Clear",
        operatorSkillBoostPercent: 10,
        rpmOptimizationPercent: 15,
      };
    } else if (type === "rainy") {
      p = {
        idleTimeReductionPercent: 0,
        cycleTimeReductionSeconds: 0,
        weatherCondition: "Heavy Rain",
        operatorSkillBoostPercent: 0,
        rpmOptimizationPercent: 0,
      };
    } else {
      p = {
        idleTimeReductionPercent: 15,
        cycleTimeReductionSeconds: 2,
        weatherCondition: "Moderate Rain",
        operatorSkillBoostPercent: 5,
        rpmOptimizationPercent: 20,
      };
    }
    setParams(p);
    runSimulation(p);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcd11] animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              COUNTERFACTUAL REASONING & WHAT-IF ENGINE
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#ffcd11]" />
            Hypothetical Operational Scenario Simulator
          </h1>
          <p className="text-xs text-slate-400">
            Dynamically evaluate &quot;what-if&quot; counterfactual variations
            in idle %, swing cycle cadence, weather severity, and operator
            training to project precise ETA, fuel, and cost impacts.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => applyPreset("eco")}
            className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 font-bold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
          >
            Eco-Optimization
          </button>
          <button
            onClick={() => applyPreset("aggressive")}
            className="rounded-lg border border-yellow-500/40 bg-yellow-950/40 px-3 py-1.5 font-bold text-[#ffcd11] hover:bg-yellow-900/50 transition-colors"
          >
            Max Production
          </button>
          <button
            onClick={() => applyPreset("rainy")}
            className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-1.5 font-bold text-rose-300 hover:bg-rose-900/50 transition-colors"
          >
            Heavy Storm
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left (5 cols) & Projected Deltas on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Counterfactual Sliders */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#ffcd11]" />
              COUNTERFACTUAL PARAMETERS
            </h3>
            <button
              onClick={() => {
                const defaultP: WhatIfScenarioInput = {
                  idleTimeReductionPercent: 10,
                  cycleTimeReductionSeconds: 4,
                  weatherCondition: "Moderate Rain",
                  operatorSkillBoostPercent: 5,
                  rpmOptimizationPercent: 10,
                };
                setParams(defaultP);
                runSimulation(defaultP);
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* 1. Idle Time Reduction */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Reduce Idle Time:</span>
              <span className="text-[#ffcd11] font-bold">
                -{params.idleTimeReductionPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={params.idleTimeReductionPercent}
              onChange={(e) =>
                handleSliderChange({
                  idleTimeReductionPercent: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-[#ffcd11] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>0% (Current 34%)</span>
              <span>10% (Target 24%)</span>
              <span>25% (Optimal 9%)</span>
            </div>
          </div>

          {/* 2. Excavation Cycle Time Reduction */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Cycle Time Reduction:</span>
              <span className="text-[#ffcd11] font-bold">
                -{params.cycleTimeReductionSeconds} sec / cycle
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={params.cycleTimeReductionSeconds}
              onChange={(e) =>
                handleSliderChange({
                  cycleTimeReductionSeconds: parseFloat(e.target.value),
                })
              }
              className="w-full accent-[#ffcd11] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>0s (24.8s)</span>
              <span>-4s (20.8s)</span>
              <span>-10s (14.8s)</span>
            </div>
          </div>

          {/* 3. Weather Scenario Toggle */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Hypothetical Weather:</span>
              <span className="text-cyan-400 font-bold">
                {params.weatherCondition}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["Clear", "Moderate Rain", "Heavy Rain"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => handleSliderChange({ weatherCondition: w })}
                  className={`rounded-lg py-2 text-xs font-mono font-bold transition-all border ${
                    params.weatherCondition === w
                      ? "bg-cyan-950 border-cyan-500 text-cyan-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Operator Skill Boost from Training */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">
                Operator Skill Boost (Post-Training):
              </span>
              <span className="text-emerald-400 font-bold">
                +{params.operatorSkillBoostPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={params.operatorSkillBoostPercent}
              onChange={(e) =>
                handleSliderChange({
                  operatorSkillBoostPercent: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-[#ffcd11] cursor-pointer"
            />
          </div>

          {/* 5. RPM Tuning */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Eco-RPM Power Tuning:</span>
              <span className="text-[#ffcd11] font-bold">
                +{params.rpmOptimizationPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="2"
              value={params.rpmOptimizationPercent}
              onChange={(e) =>
                handleSliderChange({
                  rpmOptimizationPercent: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-[#ffcd11] cursor-pointer"
            />
          </div>
        </div>

        {/* Right 7 Cols: Projected Delta Outcome & Comparison Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top 3 KPI Outcome Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Projected ETA */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Simulated ETA
              </div>
              <div className="text-2xl font-black font-mono text-[#ffcd11] mt-1">
                {result?.simulatedETA || "11:12 AM"}
              </div>
              <div className="mt-1 text-xs font-mono font-bold text-emerald-400">
                {result?.timeDeltaMinutes && result.timeDeltaMinutes < 0
                  ? `${Math.abs(result.timeDeltaMinutes)} min faster`
                  : `${result?.timeDeltaMinutes || 0} min delta`}
              </div>
            </div>

            {/* Projected Fuel Delta */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Fuel Impact
              </div>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {result?.fuelDeltaLiters && result.fuelDeltaLiters < 0
                  ? `${result.fuelDeltaLiters} L`
                  : `+${result?.fuelDeltaLiters || 0} L`}
              </div>
              <div className="mt-1 text-xs font-mono text-slate-400">
                Shift Burn Rate Delta
              </div>
            </div>

            {/* Projected Net Cost Savings */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Projected Savings
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                ${result?.estimatedCostSavingUSD || 34}
              </div>
              <div className="mt-1 text-xs font-mono text-slate-400">
                Per Shift Estimate
              </div>
            </div>
          </div>

          {/* Detailed Side-by-Side Comparison Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center justify-between pb-3 border-b border-slate-800">
              <span>SIMULATED OUTCOME VS CURRENT STATE</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Closed-Loop What-If Validation
              </span>
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-slate-400 pb-1 border-b border-slate-800">
                <span className="col-span-5">Metric</span>
                <span className="col-span-2 text-right">Current</span>
                <span className="col-span-2 text-right">Simulated</span>
                <span className="col-span-3 text-right">Net Delta</span>
              </div>

              {result?.comparisonItems.map((item) => (
                <div
                  key={item.metric}
                  className="grid grid-cols-12 items-center p-2.5 rounded bg-slate-950/70 border border-slate-800/80"
                >
                  <span className="col-span-5 text-slate-200 font-bold">
                    {item.metric}
                  </span>
                  <span className="col-span-2 text-right text-slate-400">
                    {item.current}
                  </span>
                  <span className="col-span-2 text-right text-white font-bold">
                    {item.simulated}
                  </span>
                  <span
                    className={`col-span-3 text-right font-bold ${
                      item.isImprovement ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {item.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
