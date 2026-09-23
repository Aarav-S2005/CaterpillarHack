from typing import List, Optional, Literal
from pydantic import BaseModel, Field

RiskLevel = Literal["LOW", "NORMAL", "WARNING", "HIGH", "CRITICAL"]

InterventionAction = Literal[
    "NO_ACTION",
    "VISUAL_WARNING",
    "AUDIO_WARNING",
    "STRONG_WARNING",
    "REDUCE_SPEED",
    "STOP_RECOMMENDATION",
    "SUPERVISOR_ALERT"
]

class TelemetryData(BaseModel):
    machineId: str = "CAT-320-01"
    machineModel: str = "CAT 320 Next Gen Hydraulic Excavator"
    rpm: int = 1840
    hydraulicPressure: int = 245
    engineTemperature: int = 82
    fuelLevel: int = 71
    seatbelt: bool = True
    idle: bool = False
    speed: float = 0.8
    swingAngle: float = 42.0
    swingSpeed: float = 8.5
    operatingHours: float = 1428.5
    latitude: float = 40.7128
    longitude: float = -74.0060
    heading: float = 125.0
    vibrationLevel: float = 2.1
    oilPressure: int = 380
    batteryVoltage: float = 24.6
    workerDistance: float = 12.4
    workerRelativeAngle: float = 85.0
    workerVelocity: float = 0.4
    timestamp: Optional[str] = None

class WorkerHazardContext(BaseModel):
    id: str
    name: str
    distance: float
    relativeAngle: float
    isStationary: bool
    velocity: float
    isInBlindZone: bool
    riskScore: int
    riskLevel: RiskLevel
    trajectoryConflictInSeconds: Optional[int] = None
    explanation: str

class EnvelopeThresholds(BaseModel):
    critical: float = 3.0
    high: float = 5.0
    warning: float = 10.0
    normal: float = 15.0

class PolicyEngineDecision(BaseModel):
    stateVector: dict
    selectedPolicy: str
    action: InterventionAction
    expectedReward: float
    deterministicOverride: bool

class SafetyState(BaseModel):
    overallRiskLevel: RiskLevel
    overallRiskScore: int
    seatbeltViolation: bool
    proximityBreach: bool
    blindZoneActive: bool
    activeIntervention: InterventionAction
    interventionReason: str
    recommendedOperatorAction: str
    workers: List[WorkerHazardContext]
    envelopeThresholds: EnvelopeThresholds
    policyEngineDecision: PolicyEngineDecision

class DelayFactor(BaseModel):
    name: str
    impactMinutes: int
    type: Literal["negative", "positive", "neutral"]
    description: str

class TaskItem(BaseModel):
    id: str
    title: str
    code: str
    type: Literal["Excavation", "Trenching", "Grading", "Loading", "Demolition"]
    status: Literal["IN_PROGRESS", "UPCOMING", "COMPLETED", "PAUSED"]
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    location: str
    targetVolume: float
    completedVolume: float
    targetDepth: float
    currentDepth: float
    material: str
    soilHardnessIndex: float
    progressPercentage: int
    scheduledStart: str
    originalETA: str
    currentETA: str
    delayMinutes: int
    weatherCondition: str
    factors: List[DelayFactor]

class SensorContext(BaseModel):
    rpm: int
    speed: float
    distance: float
    seatbelt: bool
    hydraulicPressure: int

class IncidentRecord(BaseModel):
    id: str
    timestamp: str
    operatorId: str
    operatorName: str
    machineId: str
    location: str
    type: Literal[
        "PROXIMITY_HAZARD",
        "SEATBELT_VIOLATION",
        "EXCESSIVE_IDLE",
        "RPM_OVERRUN",
        "HYDRAULIC_SURGE",
        "BLIND_ZONE_INCURSION"
    ]
    severity: RiskLevel
    title: str
    description: str
    sensorContext: SensorContext
    actionTaken: str
    resolutionStatus: Literal["OPEN", "INVESTIGATING", "ACKNOWLEDGED", "RESOLVED"]
    resolutionNotes: Optional[str] = None

class AnomalyDetail(BaseModel):
    type: str
    severity: Literal["LOW", "MEDIUM", "HIGH"]
    detail: str
    detectedAt: str
    deviation: str

class TrendPoint(BaseModel):
    time: str
    idlePercent: int
    cycleTimeSec: float
    rpmAvg: int
    safetyScore: int

class BehaviorAnalytics(BaseModel):
    operatorId: str
    idleTimePercentage: int
    idleBaselinePercentage: int
    idleDeviationPercentage: int
    avgCycleTimeSeconds: float
    baselineCycleTimeSeconds: float
    cycleTimeDeviationPercentage: int
    rpmSpikeCount: int
    abruptMovementScore: int
    fuelBurnRateLitersPerHour: float
    baselineFuelBurnRate: float
    hydraulicStrainIndex: int
    anomalyScore: int
    anomaliesDetected: List[AnomalyDetail]
    trendHistory: List[TrendPoint]

class BreakdownFactor(BaseModel):
    factor: str
    impactMinutes: int
    category: Literal["Soil", "Weather", "Operator Idle", "Cycle Pace", "Equipment"]
    details: str

class ExplainabilityDetails(BaseModel):
    whatHappened: str
    whyItHappened: str
    whatHappensNext: str
    recommendedAction: str
    potentialTimeRecoveryMinutes: int

class ETAPrediction(BaseModel):
    taskId: str
    taskTitle: str
    originalETA: str
    predictedETA: str
    delayMinutes: int
    confidenceScore: int
    breakdownFactors: List[BreakdownFactor]
    explainability: ExplainabilityDetails

class WhatIfScenarioInput(BaseModel):
    idleTimeReductionPercent: int = 10
    cycleTimeReductionSeconds: float = 4.0
    weatherCondition: Literal["Clear", "Moderate Rain", "Heavy Rain"] = "Moderate Rain"
    operatorSkillBoostPercent: int = 5
    rpmOptimizationPercent: int = 10

class ComparisonItem(BaseModel):
    metric: str
    current: str
    simulated: str
    delta: str
    isImprovement: bool

class WhatIfScenarioResult(BaseModel):
    baselineETA: str
    simulatedETA: str
    timeDeltaMinutes: int
    fuelDeltaLiters: float
    estimatedCostSavingUSD: int
    safetyIndexDelta: int
    comparisonItems: List[ComparisonItem]

class Certification(BaseModel):
    name: str
    issuedDate: str
    status: Literal["ACTIVE", "EXPIRING_SOON", "RECERTIFICATION_REQUIRED"]

class SkillItem(BaseModel):
    category: str
    score: int
    maxScore: int
    benchmarkAverage: int

class EvolutionRecord(BaseModel):
    date: str
    safetyScore: int
    productivityScore: int
    notes: str

class OperatorProfile(BaseModel):
    id: str
    name: str
    employeeId: str
    experienceYears: float
    assignedMachine: str
    avatarUrl: str
    safetyScore: int
    productivityScore: int
    trainingProgressPercentage: int
    operatingHoursTotal: int
    shiftHoursToday: float
    strengths: List[str]
    growthAreas: List[str]
    certifications: List[Certification]
    skillGraph: List[SkillItem]
    evolutionHistory: List[EvolutionRecord]

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctIndex: int
    explanation: str

class TrainingCourse(BaseModel):
    id: str
    title: str
    category: Literal["Safety", "Efficiency", "Machine Mastery", "Hazard Mitigation"]
    durationMinutes: int
    format: Literal["Interactive Sim", "Micro-Lesson", "Video & Quiz", "Guided Drill"]
    progressPercentage: int
    completed: bool
    recommendedReason: str
    triggeredByAnomaly: Optional[str] = None
    keyTakeaways: List[str]
    beforeScore: Optional[int] = None
    afterScore: Optional[int] = None
    quiz: List[QuizQuestion]

class CopilotAction(BaseModel):
    label: str
    actionType: Literal["NAVIGATE", "TRIGGER_SIMULATION", "ACKNOWLEDGE_INCIDENT", "OPEN_TRAINING"]
    payload: str

class CopilotReference(BaseModel):
    type: Literal["TASK", "TELEMETRY", "SAFETY", "ETA", "TRAINING"]
    title: str
    snippet: str

class CopilotMessage(BaseModel):
    id: str
    sender: Literal["operator", "copilot"]
    timestamp: str
    text: str
    referencedData: Optional[CopilotReference] = None
    suggestedActions: Optional[List[CopilotAction]] = None

class SiteMachineObject(BaseModel):
    id: str
    name: str
    type: Literal["Excavator", "Wheel Loader", "Dozer", "Dump Truck"]
    operatorName: str
    x: float
    y: float
    heading: float
    speed: float
    status: Literal["OPERATING", "IDLE", "TRAVELLING", "WARNING"]
    fuelLevel: int
    zone: str

class SiteWorkerObject(BaseModel):
    id: str
    name: str
    role: str
    x: float
    y: float
    heading: float
    speed: float
    safetyVestEquipped: bool
    proximityRiskLevel: RiskLevel

class SiteConflictWarning(BaseModel):
    id: str
    sourceEntity: str
    targetEntity: str
    projectedCollisionSeconds: int
    riskLevel: RiskLevel
    zone: str
    description: str
