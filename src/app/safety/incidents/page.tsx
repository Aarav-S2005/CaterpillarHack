"use client";

import {
  Activity,
  AlertOctagon,
  ArrowLeft,
  CheckCircle2,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { IncidentRecord } from "@/lib/types";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [selectedIncident, setSelectedIncident] =
    useState<IncidentRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [_loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const data = await apiClient.getIncidents();
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleResolve = async () => {
    if (!selectedIncident) return;
    try {
      const resolved = await apiClient.resolveIncident(
        selectedIncident.id,
        resolutionNotes ||
          "Operator acknowledged safety protocols and verified clearance.",
      );
      setIncidents((prev) =>
        prev.map((i) => (i.id === resolved.id ? resolved : i)),
      );
      setSelectedIncident(resolved);
      setResolutionNotes("");
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = incidents.filter((i) => {
    if (filterSeverity === "ALL") return true;
    return i.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href="/safety"
              className="text-xs font-mono text-[#ffcd11] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Safety Center
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <AlertOctagon className="h-6 w-6 text-rose-500" />
            Safety & Anomaly Incident Management
          </h1>
          <p className="text-xs text-slate-400">
            Autonomous audit trail of proximity breaches, unlatched motions, RPM
            spikes, and supervisor interventions.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <Filter className="h-4 w-4 text-slate-400" />
          {["ALL", "CRITICAL", "HIGH", "WARNING"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all border ${
                filterSeverity === sev
                  ? "bg-yellow-500/20 text-[#ffcd11] border-yellow-500/40 font-bold"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Incident List (5 cols) & Inspector (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-slate-400 px-1 flex justify-between">
            <span>RECORDED INCIDENTS ({filtered.length})</span>
            <span>REAL-TIME AUDIT LOG</span>
          </div>

          {filtered.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            const isCritical = inc.severity === "CRITICAL";
            const isHigh = inc.severity === "HIGH";
            const isOpen = inc.resolutionStatus === "OPEN";

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-[#ffcd11] bg-slate-900/90 shadow-lg"
                    : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                        isCritical
                          ? "bg-rose-950 text-rose-300 border border-rose-600"
                          : isHigh
                            ? "bg-amber-950 text-amber-300 border border-amber-600"
                            : "bg-yellow-950 text-yellow-300 border border-yellow-600"
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {inc.id}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isOpen
                        ? "bg-rose-950 text-rose-400 border border-rose-800 animate-pulse"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}
                  >
                    {inc.resolutionStatus}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-bold text-sm text-white">{inc.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {inc.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                  <span>{inc.timestamp}</span>
                  <span>{inc.location}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Incident Detail View */}
        {selectedIncident && (
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-rose-950 px-2 py-0.5 text-xs font-mono font-bold text-rose-300 border border-rose-700">
                      {selectedIncident.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedIncident.type}
                    </span>
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    {selectedIncident.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedIncident.location} • {selectedIncident.timestamp}
                  </p>
                </div>

                <div className="text-right font-mono">
                  <span
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${
                      selectedIncident.resolutionStatus === "OPEN"
                        ? "bg-rose-950 text-rose-300 border border-rose-600"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-600"
                    }`}
                  >
                    {selectedIncident.resolutionStatus}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs leading-relaxed">
                <div className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Incident Narrative & Telemetry Ingestion
                </div>
                <p className="text-slate-300 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Sensor Context Snapshot */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11] flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  <span>Telemetry State at Time of Trigger</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <div className="text-[10px] text-slate-400">RPM</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {selectedIncident.sensorContext.rpm} RPM
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <div className="text-[10px] text-slate-400">
                      Ground Speed
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {selectedIncident.sensorContext.speed} km/h
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <div className="text-[10px] text-slate-400">
                      Worker Dist
                    </div>
                    <div className="text-sm font-bold text-rose-400 mt-0.5">
                      {selectedIncident.sensorContext.distance} meters
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Seatbelt</div>
                    <div
                      className={`text-sm font-bold mt-0.5 ${
                        selectedIncident.sensorContext.seatbelt
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {selectedIncident.sensorContext.seatbelt
                        ? "Buckled"
                        : "Unlatched"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Taken by Copilot */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Autonomous Copilot Intervention
                </div>
                <p className="text-[#ffcd11] bg-yellow-950/20 p-3 rounded-lg border border-yellow-500/30 font-mono">
                  {selectedIncident.actionTaken}
                </p>
              </div>

              {/* Resolution Workflow */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-mono font-bold uppercase text-slate-300">
                  Incident Resolution & Operator Sign-off
                </div>

                {selectedIncident.resolutionStatus === "RESOLVED" ? (
                  <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 p-3 text-xs text-emerald-300 font-mono">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Incident Verified &
                      Closed
                    </div>
                    <p className="mt-1 text-slate-300">
                      Notes:{" "}
                      {selectedIncident.resolutionNotes ||
                        "Acknowledged and cleared."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      rows={2}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add investigation notes / verification of clearance..."
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-[#ffcd11] focus:outline-none font-mono"
                    />
                    <button
                      onClick={handleResolve}
                      className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-mono font-bold text-white transition-colors shadow-lg"
                    >
                      Sign Off & Resolve Incident
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
