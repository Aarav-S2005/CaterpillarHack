"use client";

import {
  Activity,
  Award,
  CheckCircle2,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { OperatorProfile } from "@/lib/types";

export default function OperatorPage() {
  const [operator, setOperator] = useState<OperatorProfile | null>(null);

  useEffect(() => {
    apiClient.getOperatorProfile().then(setOperator).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcd11]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              OPERATOR DIGITAL TWIN & SKILL GRAPH
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            Operator Competency & Behavioral Twin
          </h1>
          <p className="text-xs text-slate-400">
            Continuously evolving cognitive and kinematic profile learned from
            2,840+ operating hours of telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/training"
            className="flex items-center space-x-1.5 rounded-lg bg-[#ffcd11] hover:bg-yellow-400 px-3.5 py-2 text-xs font-mono font-bold text-slate-950 transition-colors shadow-lg"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Open Training Hub</span>
          </Link>
        </div>
      </div>

      {/* Operator Hero Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border-2 border-yellow-500/40 text-yellow-400 text-2xl font-black shadow-lg">
              RK
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">
                  {operator?.name || "Raj Kumar"}
                </h2>
                <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#ffcd11] border border-yellow-500/30">
                  Tier-4 Master
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {operator?.employeeId} • {operator?.experienceYears} Years
                Heavy Civil Experience
              </p>
              <p className="text-xs text-slate-300 font-mono mt-1">
                Assigned Unit:{" "}
                <span className="font-bold text-white">
                  {operator?.assignedMachine}
                </span>
              </p>
            </div>
          </div>

          {/* Core Scores */}
          <div className="flex items-center space-x-4 font-mono">
            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-400 uppercase">
                Safety Score
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                {operator?.safetyScore || 94}
              </div>
              <div className="text-[9px] text-slate-500">Top 5% Site</div>
            </div>

            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-400 uppercase">
                Productivity
              </div>
              <div className="text-2xl font-black text-[#ffcd11] mt-0.5">
                {operator?.productivityScore || 87}
              </div>
              <div className="text-[9px] text-slate-500">Above Fleet Avg</div>
            </div>

            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-400 uppercase">
                Training
              </div>
              <div className="text-2xl font-black text-cyan-400 mt-0.5">
                {operator?.trainingProgressPercentage || 78}%
              </div>
              <div className="text-[9px] text-slate-500">Cert Compliant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Graph & Strengths / Growth Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Skill Graph Bars vs Benchmark */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#ffcd11]" />
              OPERATOR SKILL GRAPH & BENCHMARK COMPARISON
            </h3>
            <span className="text-xs font-mono text-slate-400">
              0 - 100 Scale
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {operator?.skillGraph.map((skill) => (
              <div key={skill.category} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-bold">
                    {skill.category}
                  </span>
                  <div className="space-x-3 text-[11px]">
                    <span className="text-slate-400">
                      Fleet Avg:{" "}
                      <span className="text-slate-300">
                        {skill.benchmarkAverage}
                      </span>
                    </span>
                    <span className="font-bold text-[#ffcd11]">
                      Raj: {skill.score}/100
                    </span>
                  </div>
                </div>

                <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  {/* Operator score bar */}
                  <div
                    className={`h-full rounded-full transition-all ${
                      skill.score >= 85
                        ? "bg-emerald-400"
                        : skill.score >= 70
                          ? "bg-[#ffcd11]"
                          : "bg-amber-400"
                    }`}
                    style={{ width: `${skill.score}%` }}
                  />
                  {/* Benchmark indicator marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white"
                    style={{ left: `${skill.benchmarkAverage}%` }}
                    title={`Fleet benchmark: ${skill.benchmarkAverage}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Strengths, Growth Areas, Certifications */}
        <div className="lg:col-span-5 space-y-6">
          {/* Strengths & Growth Areas */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white">OBSERVED STRENGTHS</h3>
            <div className="space-y-2">
              {operator?.strengths.map((s) => (
                <div
                  key={s}
                  className="flex items-center space-x-2 text-xs font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{s}</span>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-sm text-white pt-2">
              GROWTH AREAS (AI IDENTIFIED)
            </h3>
            <div className="space-y-2">
              {operator?.growthAreas.map((g) => (
                <div
                  key={g}
                  className="flex items-center space-x-2 text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-lg"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Certifications */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-[#ffcd11]" />
              ACTIVE CERTIFICATIONS
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {operator?.certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-200">{cert.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Issued: {cert.issuedDate}
                    </div>
                  </div>
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800">
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Longitudinal Profile Evolution Log */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white">
          PROFILE EVOLUTION & CLOSED-LOOP ADAPTATION
        </h3>
        <div className="space-y-3 font-mono text-xs">
          {operator?.evolutionHistory.map((h, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between rounded-lg bg-slate-950/70 p-3 border border-slate-800 gap-4"
            >
              <div className="space-y-0.5">
                <div className="text-slate-400 text-[10px]">{h.date}</div>
                <div className="text-slate-200 font-bold">{h.notes}</div>
              </div>
              <div className="text-right shrink-0 space-x-3">
                <span className="text-emerald-400 font-bold">
                  Safety: {h.safetyScore}
                </span>
                <span className="text-[#ffcd11] font-bold">
                  Prod: {h.productivityScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
