"use client";

import { Bot, Cpu, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { CopilotWidget } from "@/components/copilot/CopilotWidget";
import { apiClient } from "@/lib/api/client";
import type {
  ETAPrediction,
  SafetyState,
  TaskItem,
  TelemetryData,
} from "@/lib/types";

export default function CopilotPage() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [safety, setSafety] = useState<SafetyState | null>(null);
  const [task, setTask] = useState<TaskItem | null>(null);
  const [eta, setEta] = useState<ETAPrediction | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.getTelemetry(),
      apiClient.getSafetyState(),
      apiClient.getTasks(),
      apiClient.getPredictions(),
    ]).then(([t, s, tasks, e]) => {
      setTelemetry(t);
      setSafety(s);
      setTask(tasks[0]);
      setEta(e);
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#ffcd11] animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              INTELLIGENT REASONING & CONVERSATIONAL ASSISTANT
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-[#ffcd11]" />
            CAT Digital Operator Copilot
          </h1>
          <p className="text-xs text-slate-400">
            Natural language assistant that understands live machine CAN-bus
            metrics, safety envelopes, and project constraints.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg font-bold">
          <Cpu className="h-4 w-4" />
          <span>Fused Context Model Active</span>
        </div>
      </div>

      {/* Main Grid: Copilot Widget on Left (8 cols) & Live Context Inspector on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <CopilotWidget />
        </div>

        {/* Live Context Side Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Radio className="h-4 w-4 text-[#ffcd11]" />
              LIVE FUSED STATE CONTEXT
            </h3>

            {/* Task context */}
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">
                Active Assignment
              </div>
              <div className="text-sm font-bold text-white">
                {task?.title || "Sector 4B Excavation"}
              </div>
              <div className="text-slate-400 text-[11px]">
                Progress:{" "}
                <span className="text-[#ffcd11] font-bold">
                  {task?.progressPercentage || 72}%
                </span>{" "}
                | ETA: {eta?.predictedETA || "11:28 AM"}
              </div>
            </div>

            {/* Safety context */}
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">
                Live Safety Radar
              </div>
              <div className="text-sm font-bold text-white">
                Standoff:{" "}
                <span className="text-cyan-400">
                  {telemetry?.workerDistance?.toFixed(1) || "12.4"}m
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Risk Index:{" "}
                <span className="text-emerald-400 font-bold">
                  {safety?.overallRiskScore || 10}/100
                </span>
              </div>
            </div>

            {/* Telemetry context */}
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">
                Engine & Hydraulics
              </div>
              <div className="text-slate-200">
                RPM:{" "}
                <span className="font-bold text-white">
                  {telemetry?.rpm || 1840}
                </span>{" "}
                | Hyd: {telemetry?.hydraulicPressure || 245} bar
              </div>
              <div className="text-slate-400 text-[11px]">
                Fuel: {telemetry?.fuelLevel || 71}% | Seatbelt:{" "}
                {telemetry?.seatbelt ? "Buckled" : "Unlatched"}
              </div>
            </div>

            {/* Context Notice */}
            <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
              Copilot answers dynamically query the above live telemetry, delay
              attribution models, and incident histories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
