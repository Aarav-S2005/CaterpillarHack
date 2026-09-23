"use client";

import {
  Activity,
  Clock,
  Fuel,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function AnalyticsPage() {
  const fleetData = [
    {
      unit: "CAT 320 #01 (Raj Kumar)",
      type: "Excavator",
      safetyScore: 94,
      prodScore: 87,
      fuelBurn: "19.4 L/h",
      idlePct: "34%",
      status: "Active",
    },
    {
      unit: "CAT 950M #04 (Elena R.)",
      type: "Wheel Loader",
      safetyScore: 91,
      prodScore: 92,
      fuelBurn: "22.1 L/h",
      idlePct: "18%",
      status: "Active",
    },
    {
      unit: "CAT D6T #02 (Samir P.)",
      type: "Dozer",
      safetyScore: 96,
      prodScore: 84,
      fuelBurn: "28.5 L/h",
      idlePct: "14%",
      status: "Active",
    },
    {
      unit: "CAT 730 #08 (Carlos G.)",
      type: "Dump Truck",
      safetyScore: 89,
      prodScore: 90,
      fuelBurn: "24.2 L/h",
      idlePct: "22%",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcd11]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              FLEET TELEMETRY & PRODUCTIVITY BENCHMARKS
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            Operational Analytics & Historical Reports
          </h1>
          <p className="text-xs text-slate-400">
            Cross-fleet comparison, longitudinal safety compliance trends, and
            fuel economy benchmarks.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-slate-400">
          <span>Range:</span>
          <span className="rounded bg-slate-900 border border-slate-800 text-white font-bold px-3 py-1">
            Last 30 Days
          </span>
        </div>
      </div>

      {/* Top 4 Metric Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex justify-between text-slate-400">
            <span className="font-bold uppercase">Fleet Safety Index</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-3">93.2</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
            <TrendingUp className="h-3 w-3" /> +2.4% vs Last Month
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex justify-between text-slate-400">
            <span className="font-bold uppercase">Fleet Avg Productivity</span>
            <Activity className="h-4 w-4 text-[#ffcd11]" />
          </div>
          <div className="text-3xl font-black text-[#ffcd11] mt-3">88.4</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Target: 85.0 Baseline
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex justify-between text-slate-400">
            <span className="font-bold uppercase">Total Fuel Consumed</span>
            <Fuel className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white mt-3">1,842 L</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
            <TrendingDown className="h-3 w-3" /> -4.1% via Eco-Idle
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex justify-between text-slate-400">
            <span className="font-bold uppercase">Total Operating Hours</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 mt-3">
            142.8 hrs
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Zero Lost Time Incidents
          </div>
        </div>
      </div>

      {/* Fleet Comparison Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center justify-between pb-3 border-b border-slate-800">
          <span>ACTIVE MACHINERY & OPERATOR BENCHMARKS</span>
          <span className="text-xs font-mono text-slate-400 font-normal">
            Zone 4 Quarry Site
          </span>
        </h3>

        <div className="space-y-2 font-mono text-xs overflow-x-auto">
          <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-slate-400 pb-1 border-b border-slate-800 min-w-[600px]">
            <span className="col-span-4">Unit & Operator</span>
            <span className="col-span-2 text-center">Safety Score</span>
            <span className="col-span-2 text-center">Productivity</span>
            <span className="col-span-2 text-center">Fuel Burn</span>
            <span className="col-span-2 text-right">Idle %</span>
          </div>

          {fleetData.map((f) => (
            <div
              key={f.unit}
              className={`grid grid-cols-12 items-center p-3 rounded border min-w-[600px] ${
                f.unit.includes("Raj Kumar")
                  ? "bg-yellow-500/10 border-yellow-500/40 text-white font-bold"
                  : "bg-slate-950/60 border-slate-800/80 text-slate-300"
              }`}
            >
              <div className="col-span-4">
                <div className="font-bold text-white">{f.unit}</div>
                <div className="text-[10px] text-slate-400">{f.type}</div>
              </div>
              <div className="col-span-2 text-center font-bold text-emerald-400">
                {f.safetyScore}
              </div>
              <div className="col-span-2 text-center font-bold text-[#ffcd11]">
                {f.prodScore}
              </div>
              <div className="col-span-2 text-center text-slate-300">
                {f.fuelBurn}
              </div>
              <div className="col-span-2 text-right font-bold">{f.idlePct}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
