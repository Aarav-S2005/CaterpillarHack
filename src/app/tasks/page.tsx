"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { ExplainabilityCard } from "@/components/explainability/ExplainabilityCard";
import { apiClient } from "@/lib/api/client";
import type { TaskItem } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getTasks().then((data) => {
      setTasks(data);
      setSelectedTask(data[0]);
      setLoading(false);
    });
  }, []);

  const handleUpdateProgress = async (newProgress: number) => {
    if (!selectedTask) return;
    const completedVol = Math.round(
      (newProgress / 100) * selectedTask.targetVolume,
    );
    const updated = await apiClient.updateTask({
      id: selectedTask.id,
      progressPercentage: newProgress,
      completedVolume: completedVol,
      status: newProgress === 100 ? "COMPLETED" : "IN_PROGRESS",
    });

    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcd11]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              DAILY TASK ASSIGNMENTS & ETA ENGINE
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            Daily Production & Excavation Board
          </h1>
          <p className="text-xs text-slate-400">
            Real-time tracking of volume displacement, trench depths, soil
            resistance, and delay attribution.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-300">
            Operator:{" "}
            <span className="font-bold text-[#ffcd11]">Raj Kumar</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-300">
            Assigned: <span className="font-bold text-white">CAT 320 #01</span>
          </div>
        </div>
      </div>

      {/* Grid: Task Cards List (5 cols) & Task Detail Inspector (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Task Cards List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>SHIFT ASSIGNMENTS ({tasks.length})</span>
            <span>SORT: PRIORITY</span>
          </div>

          {tasks.map((t) => {
            const isSelected = selectedTask?.id === t.id;
            const isCompleted = t.status === "COMPLETED";
            const isInProgress = t.status === "IN_PROGRESS";

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-[#ffcd11] bg-slate-900/90 shadow-lg shadow-yellow-500/5"
                    : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-mono font-bold uppercase ${
                        isInProgress
                          ? "bg-yellow-500/20 text-[#ffcd11] border border-yellow-500/30"
                          : isCompleted
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {t.code}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      t.priority === "HIGH"
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : t.priority === "MEDIUM"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {t.priority} PRIORITY
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-sm text-white">{t.title}</h3>
                  <div className="mt-1 flex items-center space-x-1.5 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-[#ffcd11] shrink-0" />
                    <span className="truncate">{t.location}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-300">
                    <span>{t.progressPercentage}% Completed</span>
                    <span>
                      {t.completedVolume} / {t.targetVolume} m³
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#ffcd11] transition-all"
                      style={{ width: `${t.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* ETA summary */}
                <div className="mt-3 flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/60">
                  <div className="text-slate-400">
                    ETA:{" "}
                    <span className="font-bold text-white">{t.currentETA}</span>
                  </div>
                  {t.delayMinutes > 0 ? (
                    <span className="font-bold text-rose-400">
                      +{t.delayMinutes}m delay
                    </span>
                  ) : t.delayMinutes < 0 ? (
                    <span className="font-bold text-emerald-400">
                      {t.delayMinutes}m ahead
                    </span>
                  ) : (
                    <span className="text-slate-400">On Track</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Task Detailed Inspector */}
        {selectedTask && (
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-mono font-bold text-[#ffcd11] border border-yellow-500/30">
                      {selectedTask.code}
                    </span>
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      Type: {selectedTask.type}
                    </span>
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    {selectedTask.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedTask.location}
                  </p>
                </div>

                <div className="text-right font-mono">
                  <div className="text-[10px] uppercase text-slate-400">
                    Current ETA
                  </div>
                  <div className="text-xl font-black text-[#ffcd11]">
                    {selectedTask.currentETA}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Orig: {selectedTask.originalETA} (
                    {selectedTask.delayMinutes > 0
                      ? `+${selectedTask.delayMinutes}m`
                      : "0m"}
                    )
                  </div>
                </div>
              </div>

              {/* Physical Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">
                    Target Volume
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {selectedTask.targetVolume} m³
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Done: {selectedTask.completedVolume} m³
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">
                    Trench Depth
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {selectedTask.targetDepth} m
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Current: {selectedTask.currentDepth} m
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">
                    Soil Hardness
                  </div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">
                    {selectedTask.soilHardnessIndex} / 10
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {selectedTask.material}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">
                    Weather / Slope
                  </div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">
                    {selectedTask.weatherCondition}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    12% Grade Slope
                  </div>
                </div>
              </div>

              {/* Interactive Progress Adjustment Slider */}
              <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-4 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold">
                    Simulate Task Progress Update:
                  </span>
                  <span className="text-[#ffcd11] font-bold">
                    {selectedTask.progressPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedTask.progressPercentage}
                  onChange={(e) =>
                    handleUpdateProgress(parseInt(e.target.value, 10))
                  }
                  className="w-full accent-[#ffcd11] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% (Not Started)</span>
                  <span>50% (Mid-shift)</span>
                  <span>100% (Completed & Verified)</span>
                </div>
              </div>

              {/* Delay Attribution Factors */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>ETA DELAY ATTRIBUTION MODEL</span>
                  <span className="text-[#ffcd11] font-bold">
                    Net: +{selectedTask.delayMinutes}m
                  </span>
                </div>

                {selectedTask.factors.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTask.factors.map((f) => (
                      <div
                        key={f.name}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-slate-200">
                            {f.name}
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            {f.description}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 font-mono font-bold px-2 py-1 rounded ${
                            f.impactMinutes > 0
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                              : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                          }`}
                        >
                          {f.impactMinutes > 0
                            ? `+${f.impactMinutes} min`
                            : `${f.impactMinutes} min`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 text-center text-xs text-slate-400 font-mono">
                    No delay factors detected for this upcoming assignment.
                  </div>
                )}
              </div>
            </div>

            {/* Explainability Card for the Selected Task */}
            <ExplainabilityCard
              whatHappened={`Task ${selectedTask.code} running with ${selectedTask.delayMinutes} min delay offset.`}
              whyItHappened={`Heavy clay material resistance (index ${selectedTask.soilHardnessIndex}/10) coupled with wet ground and loading idle.`}
              whatHappensNext="Hauler dispatch schedule will shift by 14 minutes if loading cycle pace is not recovered."
              recommendedAction="Engage Eco-Idle mode during truck arrival and utilize step-cut benching."
              potentialRecovery="~9 min"
              title="Task Delay Causal Analysis"
              category="PRODUCTION INTELLIGENCE"
            />
          </div>
        )}
      </div>
    </div>
  );
}
