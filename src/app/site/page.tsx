"use client";

import {
  AlertOctagon,
  ArrowRight,
  Compass,
  Crosshair,
  HardHat,
  Radio,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/Toast";

export type ScenarioId =
  | "scenario_parallel"
  | "scenario_headon"
  | "scenario_cross_junction"
  | "scenario_lateral_safe";

interface EntityState {
  id: string;
  type: "machine" | "worker";
  name: string;
  modelCode: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  headingDeg: number;
  compassHeading: string;
  speedKmh: number;
  operatorName?: string;
  zone: string;
}

interface ScenarioData {
  id: ScenarioId;
  indexNumber: number;
  title: string;
  category: string;
  warningGiven: boolean;
  warningSeverity: "CRITICAL" | "HIGH" | "SAFE";
  badgeText: string;
  badgeClass: string;
  summary: string;
  entities: EntityState[];
  kinematicAnalysis: {
    relativeHeadingAngle: string;
    closingSpeedKmh: number;
    initialDistanceMeters: number;
    predictedClosestApproachMeters: number;
    timeToCollisionSeconds: number | null; // null if safe
    impactCoordinates: { x: number; y: number } | null;
  };
  evaluationRationale: string;
  recommendedAction: string;
}

const SCENARIOS: Record<ScenarioId, ScenarioData> = {
  scenario_parallel: {
    id: "scenario_parallel",
    indexNumber: 1,
    title: "Parallel Lane Transit (Same Direction & Speed)",
    category: "Co-Directional Fleet",
    warningGiven: false,
    warningSeverity: "SAFE",
    badgeText: "NO WARNING (SAFE)",
    badgeClass: "border-emerald-500/40 bg-emerald-950/40 text-emerald-300",
    summary:
      "Two heavy machines (CAT 730 Truck and CAT 966M Loader) travelling parallel Eastbound along separated haul corridors at 15 km/h and 12 km/h.",
    entities: [
      {
        id: "M-03",
        type: "machine",
        name: "CAT 730 Articulated Truck",
        modelCode: "730 EJ",
        x: 25,
        y: 40,
        headingDeg: 0,
        compassHeading: "East (0°)",
        speedKmh: 15.0,
        operatorName: "Marcus Vance",
        zone: "Zone 1 (Haul Lane A)",
      },
      {
        id: "M-02",
        type: "machine",
        name: "CAT 966M Wheel Loader",
        modelCode: "966M XE",
        x: 25,
        y: 60,
        headingDeg: 0,
        compassHeading: "East (0°)",
        speedKmh: 12.0,
        operatorName: "David Chen",
        zone: "Zone 1 (Haul Lane B)",
      },
    ],
    kinematicAnalysis: {
      relativeHeadingAngle: "0° (Parallel)",
      closingSpeedKmh: 0.0,
      initialDistanceMeters: 20.0,
      predictedClosestApproachMeters: 20.0,
      timeToCollisionSeconds: null,
      impactCoordinates: null,
    },
    evaluationRationale:
      "Because both vehicles share identical heading directions (0° East) and are offset by 20m laterally, their directional velocity vectors remain strictly parallel. Relative lateral distance never decreases below 20m. Therefore, NO collision warning is warranted.",
    recommendedAction:
      "Maintain current speed and lane separation. All autonomous corridor buffers nominal.",
  },

  scenario_headon: {
    id: "scenario_headon",
    indexNumber: 2,
    title: "Head-On Converging Trajectory (Opposing Directions)",
    category: "Vehicle ↔ Ground Crew",
    warningGiven: true,
    warningSeverity: "CRITICAL",
    badgeText: "CRITICAL WARNING (HEAD-ON)",
    badgeClass: "border-rose-500/50 bg-rose-950/40 text-rose-300",
    summary:
      "CAT 730 Haul Truck travelling East (0°) at 18 km/h and Ground Spotter Marcus walking West (180°) at 3 km/h on direct collision course.",
    entities: [
      {
        id: "M-03",
        type: "machine",
        name: "CAT 730 Articulated Truck",
        modelCode: "730 EJ",
        x: 18,
        y: 50,
        headingDeg: 0,
        compassHeading: "East (0°)",
        speedKmh: 18.0,
        operatorName: "Marcus Vance",
        zone: "Zone 1 (Single Haul Road)",
      },
      {
        id: "W-02",
        type: "worker",
        name: "Marcus Vance (Ground Spotter)",
        modelCode: "Ground Crew",
        x: 82,
        y: 50,
        headingDeg: 180,
        compassHeading: "West (180°)",
        speedKmh: 3.0,
        operatorName: "Marcus Vance",
        zone: "Zone 1 (In-Path Walking)",
      },
    ],
    kinematicAnalysis: {
      relativeHeadingAngle: "180° (Direct Head-On)",
      closingSpeedKmh: 21.0, // 18 + 3 = 21 km/h = 5.83 m/s
      initialDistanceMeters: 64.0,
      predictedClosestApproachMeters: 0.0,
      timeToCollisionSeconds: 7,
      impactCoordinates: { x: 50, y: 50 },
    },
    evaluationRationale:
      "Velocity vectors are antiparallel (180° heading opposition) on the exact same coordinate axis (y = 50). Combined closing speed of 21.0 km/h (5.83 m/s) results in a guaranteed collision in 7.0 seconds at midpoint (x=50, y=50). A CRITICAL WARNING must be issued immediately.",
    recommendedAction:
      "AUTONOMOUS INTERVENTION: CAT 730 automatically apply service retarder brake. Trigger wearable acoustic siren directing ground spotter to step 12m North immediately.",
  },

  scenario_cross_junction: {
    id: "scenario_cross_junction",
    indexNumber: 3,
    title: "90° Haul Road Cross-Junction (Intersecting Paths)",
    category: "Machine ↔ Machine Crossing",
    warningGiven: true,
    warningSeverity: "HIGH",
    badgeText: "HIGH WARNING (INTERSECTION)",
    badgeClass: "border-amber-500/50 bg-amber-950/40 text-amber-300",
    summary:
      "CAT 730 Truck travelling South (90°) at 15 km/h and CAT 966M Loader travelling East (0°) at 15 km/h converging simultaneously on the main crusher junction.",
    entities: [
      {
        id: "M-03",
        type: "machine",
        name: "CAT 730 Articulated Truck",
        modelCode: "730 EJ",
        x: 50,
        y: 20,
        headingDeg: 90,
        compassHeading: "South (90°)",
        speedKmh: 15.0,
        operatorName: "Marcus Vance",
        zone: "Zone 2 (North Approach)",
      },
      {
        id: "M-02",
        type: "machine",
        name: "CAT 966M Wheel Loader",
        modelCode: "966M XE",
        x: 20,
        y: 50,
        headingDeg: 0,
        compassHeading: "East (0°)",
        speedKmh: 15.0,
        operatorName: "David Chen",
        zone: "Zone 2 (West Approach)",
      },
    ],
    kinematicAnalysis: {
      relativeHeadingAngle: "90° (Perpendicular)",
      closingSpeedKmh: 21.2,
      initialDistanceMeters: 42.4,
      predictedClosestApproachMeters: 0.0,
      timeToCollisionSeconds: 5,
      impactCoordinates: { x: 50, y: 50 },
    },
    evaluationRationale:
      "Both machines travel at identical velocities (15 km/h) and are equidistant (30m) from intersection node (50, 50). Trajectory forward projection confirms simultaneous arrival at t = 5.0 seconds. A HIGH RIGHT-OF-WAY WARNING is triggered to prevent cross-traffic T-bone collision.",
    recommendedAction:
      "RIGHT-OF-WAY ARBITRATION: CAT 966M Loader must decelerate and hold at junction stop line. CAT 730 Haul Truck maintains crossing corridor.",
  },

  scenario_lateral_safe: {
    id: "scenario_lateral_safe",
    indexNumber: 4,
    title: "High-Speed Transit with Safe Lateral Standoff",
    category: "Speed vs Standoff Distance",
    warningGiven: false,
    warningSeverity: "SAFE",
    badgeText: "NO WARNING (SAFE STANDOFF)",
    badgeClass: "border-emerald-500/40 bg-emerald-950/40 text-emerald-300",
    summary:
      "CAT 730 Haul Truck travelling at high velocity (24 km/h Eastbound) past stationary Surveyor Elena positioned 35m away on the safe bench berm.",
    entities: [
      {
        id: "M-03",
        type: "machine",
        name: "CAT 730 Articulated Truck",
        modelCode: "730 EJ",
        x: 20,
        y: 25,
        headingDeg: 0,
        compassHeading: "East (0°)",
        speedKmh: 24.0,
        operatorName: "Marcus Vance",
        zone: "Zone 1 (Main Haul Expressway)",
      },
      {
        id: "W-01",
        type: "worker",
        name: "Elena Rostova (Surveyor)",
        modelCode: "Surveyor",
        x: 60,
        y: 65,
        headingDeg: 270,
        compassHeading: "West (270°)",
        speedKmh: 0.0,
        operatorName: "Elena Rostova",
        zone: "Zone 3 (Bench Berm Standoff)",
      },
    ],
    kinematicAnalysis: {
      relativeHeadingAngle: "Stationary Target (35m lateral offset)",
      closingSpeedKmh: 24.0,
      initialDistanceMeters: 56.5,
      predictedClosestApproachMeters: 40.0,
      timeToCollisionSeconds: null,
      impactCoordinates: null,
    },
    evaluationRationale:
      "Although the truck is travelling at high speed (24 km/h), its heading vector (y = 25) never intersects Elena's stationary position (y = 65). The closest point of approach is 40.0m, which is well above the 10.0m safety exclusion boundary. NO WARNING is issued, preventing false alarms.",
    recommendedAction:
      "No action required. High-speed transit is nominal along designated expressway corridor.",
  },
};

export default function SiteOverviewPage() {
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<ScenarioId>("scenario_parallel");
  const [selectedEntityId, setSelectedEntityId] = useState<string>("M-03");

  const currentScenario = SCENARIOS[selectedScenarioId];

  const handleSelectScenario = (id: ScenarioId) => {
    setSelectedScenarioId(id);
    const scen = SCENARIOS[id];
    setSelectedEntityId(scen.entities[0].id);

    if (scen.warningGiven) {
      toast.error(
        scen.badgeText,
        `TTC: ${scen.kinematicAnalysis.timeToCollisionSeconds}s • ${scen.summary.substring(0, 60)}...`,
      );
    } else {
      toast.success(
        scen.badgeText,
        "Kinematic vectors confirmed safe. Zero collision hazard.",
      );
    }
  };

  const selectedEntity =
    currentScenario.entities.find((e) => e.id === selectedEntityId) ||
    currentScenario.entities[0];

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffcd11] animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffcd11]">
              CATERPILLAR MINESTAR™ TRAJECTORY CONFLICT EVALUATOR
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Compass className="h-6 w-6 text-[#ffcd11]" />
            Direction & Velocity Conflict Verification
          </h1>
          <p className="text-xs text-slate-400">
            Evaluate how entity <strong>Direction (Heading Vector)</strong> and{" "}
            <strong>Speed</strong> determine whether a collision warning should
            or should not be triggered.
          </p>
        </div>
      </div>

      {/* 4 Deterministic Direction & Speed Test Scenarios */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-[#ffcd11]" />
            Select Kinematic Scenario to Evaluate:
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            4 Direction & Speed Test Cases
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => {
            const sc = SCENARIOS[id];
            const isSelected = selectedScenarioId === id;
            const isWarning = sc.warningGiven;

            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc.id)}
                className={`text-left rounded-xl p-3.5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? isWarning
                      ? "border-rose-500 bg-rose-950/40 ring-2 ring-rose-500/40 shadow-xl"
                      : "border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/40 shadow-xl"
                    : "border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      CASE 0{sc.indexNumber}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${sc.badgeClass}`}
                    >
                      {sc.warningGiven ? "WARNING" : "SAFE"}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white leading-snug mb-1">
                    {sc.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {sc.summary}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span
                    className={
                      isSelected ? "text-white font-bold" : "text-slate-500"
                    }
                  >
                    {isSelected ? "● Evaluating" : "Select Scenario"}
                  </span>
                  <ArrowRight
                    className={`h-3 w-3 ${
                      isSelected ? "text-[#ffcd11]" : "text-slate-600"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kinematic Evaluation Banner: Warning vs No Warning Verdict */}
      <div
        className={`rounded-xl border p-4 flex items-start space-x-3 text-xs font-mono shadow-xl transition-all ${
          currentScenario.warningGiven
            ? "border-rose-500/80 bg-rose-950/60 shadow-rose-950/50"
            : "border-emerald-500/60 bg-emerald-950/40 shadow-emerald-950/30"
        }`}
      >
        {currentScenario.warningGiven ? (
          <AlertOctagon className="h-6 w-6 shrink-0 text-rose-400 animate-bounce mt-0.5" />
        ) : (
          <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-400 mt-0.5" />
        )}

        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`font-black uppercase text-sm tracking-wider ${
                  currentScenario.warningGiven
                    ? "text-rose-300"
                    : "text-emerald-300"
                }`}
              >
                {currentScenario.warningGiven
                  ? "⚠ SYSTEM VERDICT: COLLISION WARNING ISSUED"
                  : "✓ SYSTEM VERDICT: NO WARNING ISSUED (SAFE KINEMATICS)"}
              </span>
              <span
                className={`rounded text-[10px] px-2 py-0.5 font-black border ${currentScenario.badgeClass}`}
              >
                {currentScenario.badgeText}
              </span>
            </div>

            {currentScenario.kinematicAnalysis.timeToCollisionSeconds && (
              <span className="rounded bg-rose-500 text-slate-950 font-black px-2 py-0.5 text-xs">
                TIME TO COLLISION:{" "}
                {currentScenario.kinematicAnalysis.timeToCollisionSeconds}s
              </span>
            )}
          </div>

          <p className="text-white text-xs leading-relaxed font-sans">
            <strong>Evaluation Rationale:</strong>{" "}
            {currentScenario.evaluationRationale}
          </p>

          <div
            className={`rounded p-2.5 border text-xs font-mono ${
              currentScenario.warningGiven
                ? "bg-black/60 border-rose-800/60 text-rose-200"
                : "bg-black/40 border-emerald-800/40 text-emerald-200"
            }`}
          >
            <span
              className={
                currentScenario.warningGiven
                  ? "text-amber-400 font-bold"
                  : "text-emerald-400 font-bold"
              }
            >
              REQUIRED ACTION:{" "}
            </span>
            {currentScenario.recommendedAction}
          </div>
        </div>
      </div>

      {/* Main Grid: 2D Spatial Map (8 cols) & Kinematic Telemetry Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2D Interactive Spatial Map Canvas */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#ffcd11]" />
              <h3 className="font-bold text-sm text-white">
                2D VECTOR RADAR — {currentScenario.title.toUpperCase()}
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Sector: 100m x 100m Grid
            </div>
          </div>

          <div className="relative aspect-video w-full rounded-xl bg-[#06090e] border border-slate-800 p-4 overflow-hidden bg-industrial-dots">
            {/* Zones demarcations */}
            <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-400 border border-slate-800/80 rounded px-2 py-0.5 bg-slate-950/80 pointer-events-none">
              Zone 1: Haul Expressway
            </div>
            <div className="absolute top-2 right-3 text-[9px] font-mono text-slate-400 border border-slate-800/80 rounded px-2 py-0.5 bg-slate-950/80 pointer-events-none">
              Zone 2: Primary Crusher Cross
            </div>
            <div className="absolute bottom-2 left-3 text-[9px] font-mono text-slate-400 border border-slate-800/80 rounded px-2 py-0.5 bg-slate-950/80 pointer-events-none">
              Zone 3: Bench Berm
            </div>
            <div className="absolute bottom-2 right-3 text-[9px] font-mono text-[#ffcd11] border border-yellow-500/30 bg-yellow-950/80 rounded px-2 py-0.5 font-bold pointer-events-none">
              Zone 4: Active Loading Pit
            </div>

            {/* SVG Vectors & Projected Rays */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
              {/* Velocity vectors for each entity */}
              {currentScenario.entities.map((ent) => {
                const rad = (ent.headingDeg * Math.PI) / 180;
                // Scale vector arrow length proportional to speed
                const speedLength = Math.max(6, ent.speedKmh * 1.5);
                const x2 = ent.x + Math.cos(rad) * speedLength;
                const y2 = ent.y + Math.sin(rad) * speedLength;
                const isSelected = selectedEntityId === ent.id;

                return (
                  <g key={`vec-${ent.id}`}>
                    {/* Direction Vector Arrow */}
                    <line
                      x1={`${ent.x}%`}
                      y1={`${ent.y}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke={ent.type === "machine" ? "#ffcd11" : "#38bdf8"}
                      strokeWidth={isSelected ? "3.5" : "2.5"}
                      strokeDasharray={ent.speedKmh > 0 ? "none" : "2 2"}
                    />
                    <circle
                      cx={`${x2}%`}
                      cy={`${y2}%`}
                      r={isSelected ? 4.5 : 3.5}
                      fill={ent.type === "machine" ? "#ffcd11" : "#38bdf8"}
                    />

                    {/* Extended Forward Path Ray */}
                    {ent.speedKmh > 0 && (
                      <line
                        x1={`${x2}%`}
                        y1={`${y2}%`}
                        x2={`${ent.x + Math.cos(rad) * 60}%`}
                        y2={`${ent.y + Math.sin(rad) * 60}%`}
                        stroke={
                          currentScenario.warningGiven ? "#f43f5e" : "#10b981"
                        }
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity={0.5}
                      />
                    )}
                  </g>
                );
              })}

              {/* Draw Impact Target if Warning Active */}
              {currentScenario.warningGiven &&
                currentScenario.kinematicAnalysis.impactCoordinates && (
                  <g key="impact-marker">
                    {(() => {
                      const ip =
                        currentScenario.kinematicAnalysis.impactCoordinates;
                      return (
                        <>
                          <circle
                            cx={`${ip.x}%`}
                            cy={`${ip.y}%`}
                            r="14"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                            className="animate-ping"
                            opacity={0.8}
                          />
                          <circle
                            cx={`${ip.x}%`}
                            cy={`${ip.y}%`}
                            r="5"
                            fill="#ef4444"
                          />
                        </>
                      );
                    })()}
                  </g>
                )}
            </svg>

            {/* Impact Point Floating Label */}
            {currentScenario.warningGiven &&
              currentScenario.kinematicAnalysis.impactCoordinates && (
                <div
                  style={{
                    left: `${currentScenario.kinematicAnalysis.impactCoordinates.x}%`,
                    top: `${currentScenario.kinematicAnalysis.impactCoordinates.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-9 pointer-events-none z-30"
                >
                  <span className="whitespace-nowrap rounded-md bg-rose-950 border border-rose-500 px-2 py-0.5 text-[9px] font-mono font-black text-rose-200 shadow-xl flex items-center gap-1 animate-pulse">
                    <Crosshair className="h-3 w-3 text-rose-400" />
                    PREDICTED IMPACT POINT (TTC:{" "}
                    {currentScenario.kinematicAnalysis.timeToCollisionSeconds}
                    s)
                  </span>
                </div>
              )}

            {/* Entity Nodes on Map */}
            {currentScenario.entities.map((ent) => {
              const isSelected = selectedEntityId === ent.id;
              const isMachine = ent.type === "machine";

              return (
                <div
                  key={ent.id}
                  onClick={() => setSelectedEntityId(ent.id)}
                  style={{ left: `${ent.x}%`, top: `${ent.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                    isSelected
                      ? "scale-125 z-20"
                      : "z-10 hover:scale-110 opacity-90"
                  }`}
                >
                  {/* Entity Icon Badge */}
                  {isMachine ? (
                    <div
                      style={{
                        transform: `rotate(${ent.headingDeg - 45}deg)`,
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold shadow-2xl transition-all ${
                        isSelected
                          ? "bg-[#ffcd11] border-white text-slate-950 font-black ring-4 ring-yellow-400/40"
                          : currentScenario.warningGiven
                            ? "bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-500/50"
                            : "bg-slate-900 border-slate-700 text-yellow-400"
                      }`}
                    >
                      <Truck className="h-5 w-5" />
                    </div>
                  ) : (
                    <div
                      style={{ transform: `rotate(${ent.headingDeg}deg)` }}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold shadow-lg transition-all ${
                        isSelected
                          ? "bg-cyan-500 border-white text-slate-950 ring-4 ring-cyan-400/40"
                          : currentScenario.warningGiven
                            ? "bg-rose-950 border-rose-400 text-rose-200 ring-4 ring-rose-500/50"
                            : "bg-cyan-950 border-cyan-400 text-cyan-300"
                      }`}
                    >
                      <HardHat className="h-4 w-4" />
                    </div>
                  )}

                  {/* Node Label */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/95 border border-slate-800 px-1.5 py-0.5 text-[8px] font-mono font-bold text-white shadow pointer-events-none">
                    {ent.name.split(" ")[0]} ({ent.speedKmh} km/h •{" "}
                    {ent.compassHeading})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded bg-[#ffcd11]" />
              <span>Heavy Machines (CAT Fleet)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Ground Personnel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded bg-rose-500" />
              <span>Projected Collision Interception</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Kinematic Telemetry Breakdown */}
        <div className="lg:col-span-4 space-y-4">
          {/* Kinematic Factors Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 shadow-xl">
            <h4 className="font-bold text-xs text-white border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>KINEMATICS VECTOR ANALYSIS</span>
              <span className="text-[10px] font-mono text-[#ffcd11]">
                MATH VERIFICATION
              </span>
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">
                  Relative Vector Alignment
                </span>
                <span className="text-white font-bold">
                  {currentScenario.kinematicAnalysis.relativeHeadingAngle}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Closing Velocity</span>
                <span className="text-[#ffcd11] font-bold">
                  {currentScenario.kinematicAnalysis.closingSpeedKmh} km/h
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Initial Separation</span>
                <span className="text-slate-300 font-bold">
                  {currentScenario.kinematicAnalysis.initialDistanceMeters}m
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Closest Approach (CPA)</span>
                <span
                  className={
                    currentScenario.kinematicAnalysis
                      .predictedClosestApproachMeters <= 10
                      ? "text-rose-400 font-bold"
                      : "text-emerald-400 font-bold"
                  }
                >
                  {
                    currentScenario.kinematicAnalysis
                      .predictedClosestApproachMeters
                  }
                  m
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Warning Required?</span>
                <span
                  className={`font-black px-2 py-0.5 rounded text-[11px] ${
                    currentScenario.warningGiven
                      ? "bg-rose-500 text-slate-950"
                      : "bg-emerald-500 text-slate-950"
                  }`}
                >
                  {currentScenario.warningGiven ? "YES (WARNING)" : "NO (SAFE)"}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Entity Inspector */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                {selectedEntity.type === "machine" ? (
                  <Truck className="h-4 w-4 text-[#ffcd11]" />
                ) : (
                  <HardHat className="h-4 w-4 text-cyan-400" />
                )}
                <div>
                  <h4 className="font-bold text-xs text-white">
                    {selectedEntity.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {selectedEntity.id} • {selectedEntity.modelCode}
                  </span>
                </div>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-mono text-slate-300">
                {selectedEntity.zone}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded bg-slate-950 p-2 border border-slate-800/80">
                <span className="text-[10px] text-slate-400">
                  Heading Vector
                </span>
                <p className="text-[#ffcd11] font-bold text-xs">
                  {selectedEntity.compassHeading}
                </p>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800/80">
                <span className="text-[10px] text-slate-400">Velocity</span>
                <p className="text-white font-bold text-xs">
                  {selectedEntity.speedKmh} km/h
                </p>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800/80">
                <span className="text-[10px] text-slate-400">Coordinates</span>
                <p className="text-slate-300 font-bold text-xs">
                  ({selectedEntity.x}m, {selectedEntity.y}m)
                </p>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800/80">
                <span className="text-[10px] text-slate-400">Operator</span>
                <p className="text-slate-300 font-bold text-xs truncate">
                  {selectedEntity.operatorName || "Field Spotter"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
