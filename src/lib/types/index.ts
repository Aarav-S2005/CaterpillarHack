export type RiskLevel = "LOW" | "NORMAL" | "WARNING" | "HIGH" | "CRITICAL";

export type InterventionAction =
  | "NO_ACTION"
  | "VISUAL_WARNING"
  | "AUDIO_WARNING"
  | "STRONG_WARNING"
  | "REDUCE_SPEED"
  | "STOP_RECOMMENDATION"
  | "SUPERVISOR_ALERT";

export interface TelemetryData {
  machineId: string;
  machineModel: string;
  rpm: number;
  hydraulicPressure: number; // bar
  engineTemperature: number; // °C
  fuelLevel: number; // percentage
  seatbelt: boolean;
  idle: boolean;
  speed: number; // km/h
  swingAngle: number; // degrees 0-360
  swingSpeed: number; // deg/s
  operatingHours: number;
  latitude: number;
  longitude: number;
  heading: number; // degrees
  vibrationLevel: number; // mm/s
  oilPressure: number; // kPa
  batteryVoltage: number; // V
  workerDistance: number; // meters to closest worker
  workerRelativeAngle: number; // deg relative to machine heading
  workerVelocity: number; // m/s relative (- approaching, + moving away)
  timestamp: string;
}

export interface WorkerHazardContext {
  id: string;
  name: string;
  distance: number;
  relativeAngle: number;
  isStationary: boolean;
  velocity: number; // m/s
  isInBlindZone: boolean;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  trajectoryConflictInSeconds: number | null;
  explanation: string;
}

export interface SafetyState {
  overallRiskLevel: RiskLevel;
  overallRiskScore: number; // 0-100
  seatbeltViolation: boolean;
  proximityBreach: boolean;
  blindZoneActive: boolean;
  activeIntervention: InterventionAction;
  interventionReason: string;
  recommendedOperatorAction: string;
  workers: WorkerHazardContext[];
  envelopeThresholds: {
    critical: number; // e.g. <3m
    high: number; // e.g. 3-5m
    warning: number; // e.g. 5-10m
    normal: number; // e.g. >10m
  };
  policyEngineDecision: {
    stateVector: {
      minWorkerDist: number;
      relativeSpeed: number;
      swingRate: number;
      seatbeltStatus: string;
      weatherFactor: number;
    };
    selectedPolicy: string;
    action: InterventionAction;
    expectedReward: number;
    deterministicOverride: boolean;
  };
}

export interface TaskItem {
  id: string;
  title: string;
  code: string;
  type: "Excavation" | "Trenching" | "Grading" | "Loading" | "Demolition";
  status: "IN_PROGRESS" | "UPCOMING" | "COMPLETED" | "PAUSED";
  priority: "HIGH" | "MEDIUM" | "LOW";
  location: string;
  targetVolume: number; // m3
  completedVolume: number; // m3
  targetDepth: number; // meters
  currentDepth: number; // meters
  material:
    | "Hard Rock / Granite"
    | "Clay / Silt"
    | "Dense Sand"
    | "Gravel"
    | "Topsoil";
  soilHardnessIndex: number; // 1-10
  progressPercentage: number;
  scheduledStart: string;
  originalETA: string;
  currentETA: string;
  delayMinutes: number;
  weatherCondition:
    | "Clear"
    | "Moderate Rain"
    | "Heavy Rain"
    | "Muddy / Wet"
    | "High Heat";
  factors: {
    name: string;
    impactMinutes: number;
    type: "negative" | "positive" | "neutral";
    description: string;
  }[];
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  machineId: string;
  location: string;
  type:
    | "PROXIMITY_HAZARD"
    | "SEATBELT_VIOLATION"
    | "EXCESSIVE_IDLE"
    | "RPM_OVERRUN"
    | "HYDRAULIC_SURGE"
    | "BLIND_ZONE_INCURSION";
  severity: RiskLevel;
  title: string;
  description: string;
  sensorContext: {
    rpm: number;
    speed: number;
    distance: number;
    seatbelt: boolean;
    hydraulicPressure: number;
  };
  actionTaken: string;
  resolutionStatus: "OPEN" | "INVESTIGATING" | "ACKNOWLEDGED" | "RESOLVED";
  resolutionNotes?: string;
}

export interface BehaviorAnalytics {
  operatorId: string;
  idleTimePercentage: number;
  idleBaselinePercentage: number;
  idleDeviationPercentage: number;
  avgCycleTimeSeconds: number;
  baselineCycleTimeSeconds: number;
  cycleTimeDeviationPercentage: number;
  rpmSpikeCount: number;
  abruptMovementScore: number; // 0-100
  fuelBurnRateLitersPerHour: number;
  baselineFuelBurnRate: number;
  hydraulicStrainIndex: number; // 0-100
  anomalyScore: number; // 0-100 (Isolation Forest proxy)
  anomaliesDetected: {
    type: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    detail: string;
    detectedAt: string;
    deviation: string;
  }[];
  trendHistory: {
    time: string;
    idlePercent: number;
    cycleTimeSec: number;
    rpmAvg: number;
    safetyScore: number;
  }[];
}

export interface ETAPrediction {
  taskId: string;
  taskTitle: string;
  originalETA: string;
  predictedETA: string;
  delayMinutes: number;
  confidenceScore: number; // 0-100%
  breakdownFactors: {
    factor: string;
    impactMinutes: number;
    category: "Soil" | "Weather" | "Operator Idle" | "Cycle Pace" | "Equipment";
    details: string;
  }[];
  explainability: {
    whatHappened: string;
    whyItHappened: string;
    whatHappensNext: string;
    recommendedAction: string;
    potentialTimeRecoveryMinutes: number;
  };
}

export interface WhatIfScenarioInput {
  idleTimeReductionPercent: number; // e.g. 10
  cycleTimeReductionSeconds: number; // e.g. 8
  weatherCondition: "Clear" | "Moderate Rain" | "Heavy Rain";
  operatorSkillBoostPercent: number; // e.g. 5
  rpmOptimizationPercent: number; // e.g. 10
}

export interface WhatIfScenarioResult {
  baselineETA: string;
  simulatedETA: string;
  timeDeltaMinutes: number; // negative = saved, positive = added
  fuelDeltaLiters: number;
  estimatedCostSavingUSD: number;
  safetyIndexDelta: number;
  comparisonItems: {
    metric: string;
    current: string;
    simulated: string;
    delta: string;
    isImprovement: boolean;
  }[];
}

export interface OperatorProfile {
  id: string;
  name: string;
  employeeId: string;
  experienceYears: number;
  assignedMachine: string;
  avatarUrl: string;
  safetyScore: number; // 0-100
  productivityScore: number; // 0-100
  trainingProgressPercentage: number;
  operatingHoursTotal: number;
  shiftHoursToday: number;
  strengths: string[];
  growthAreas: string[];
  certifications: {
    name: string;
    issuedDate: string;
    status: "ACTIVE" | "EXPIRING_SOON" | "RECERTIFICATION_REQUIRED";
  }[];
  skillGraph: {
    category: string;
    score: number;
    maxScore: number;
    benchmarkAverage: number;
  }[];
  evolutionHistory: {
    date: string;
    safetyScore: number;
    productivityScore: number;
    notes: string;
  }[];
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: "Safety" | "Efficiency" | "Machine Mastery" | "Hazard Mitigation";
  durationMinutes: number;
  format: "Interactive Sim" | "Micro-Lesson" | "Video & Quiz" | "Guided Drill";
  progressPercentage: number;
  completed: boolean;
  recommendedReason: string;
  triggeredByAnomaly?: string;
  keyTakeaways: string[];
  beforeScore?: number;
  afterScore?: number;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface CopilotMessage {
  id: string;
  sender: "operator" | "copilot";
  timestamp: string;
  text: string;
  referencedData?: {
    type: "TASK" | "TELEMETRY" | "SAFETY" | "ETA" | "TRAINING";
    title: string;
    snippet: string;
  };
  suggestedActions?: {
    label: string;
    actionType:
      | "NAVIGATE"
      | "TRIGGER_SIMULATION"
      | "ACKNOWLEDGE_INCIDENT"
      | "OPEN_TRAINING";
    payload: string;
  }[];
}

export interface SiteMachineObject {
  id: string;
  name: string;
  type: "Excavator" | "Wheel Loader" | "Dozer" | "Dump Truck";
  operatorName: string;
  x: number; // 0-100 site grid
  y: number;
  heading: number;
  speed: number;
  status: "OPERATING" | "IDLE" | "TRAVELLING" | "WARNING";
  fuelLevel: number;
  zone: string;
}

export interface SiteWorkerObject {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  heading: number;
  speed: number;
  safetyVestEquipped: boolean;
  proximityRiskLevel: RiskLevel;
}

export interface SiteConflictWarning {
  id: string;
  sourceEntity?: string;
  targetEntity?: string;
  machineIdA?: string;
  machineIdB?: string;
  projectedCollisionSeconds: number;
  riskLevel?: RiskLevel;
  severity?: RiskLevel;
  zone: string;
  description: string;
  recommendedManeuver?: string;
  conflictType?:
    | "INSTANT_PROXIMITY"
    | "CONVERGING_TRAJECTORY"
    | "DIRECT_IN_PATH"
    | "PERSONNEL_PINCH";
  distanceMeters?: number;
  closingSpeedKmh?: number;
  impactPoint?: { x: number; y: number };
}

export interface ClosedLoopStep {
  stepNumber: number;
  title: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING";
  summary: string;
  metrics: string;
}
