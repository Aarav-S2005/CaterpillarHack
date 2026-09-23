from datetime import datetime
from typing import List, Optional
from ..models.schemas import (
    TelemetryData,
    OperatorProfile,
    TaskItem,
    IncidentRecord,
    BehaviorAnalytics,
    TrainingCourse,
    CopilotMessage,
    SiteMachineObject,
    SiteWorkerObject,
    SiteConflictWarning,
    EnvelopeThresholds,
)

class DataStore:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataStore, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.envelope_thresholds = EnvelopeThresholds(
            critical=3.0,
            high=5.0,
            warning=10.0,
            normal=15.0
        )

        self.telemetry = TelemetryData(
            machineId="CAT-320-01",
            machineModel="CAT 320 Next Gen Hydraulic Excavator",
            rpm=1840,
            hydraulicPressure=245,
            engineTemperature=82,
            fuelLevel=71,
            seatbelt=True,
            idle=False,
            speed=0.8,
            swingAngle=42.0,
            swingSpeed=8.5,
            operatingHours=1428.5,
            latitude=40.7128,
            longitude=-74.0060,
            heading=125.0,
            vibrationLevel=2.1,
            oilPressure=380,
            batteryVoltage=24.6,
            workerDistance=12.4,
            workerRelativeAngle=85.0,
            workerVelocity=0.4,
            timestamp=datetime.now().isoformat()
        )

        self.operator = OperatorProfile(
            id="OP-9821",
            name="Raj Kumar",
            employeeId="CAT-EMP-8842",
            experienceYears=3.5,
            assignedMachine="CAT 320 Next Gen",
            avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            safetyScore=94,
            productivityScore=87,
            trainingProgressPercentage=78,
            operatingHoursTotal=2840,
            shiftHoursToday=4.8,
            strengths=[
                "Excavation Cycle Precision",
                "Hazard Evasion & Response",
                "Grade Consistency"
            ],
            growthAreas=[
                "Idle Time Management During Loading",
                "Hydraulic Surge Moderation",
                "Swing Arc Efficiency"
            ],
            certifications=[
                {"name": "CAT Tier-4 Heavy Excavator Master", "issuedDate": "2024-02-15", "status": "ACTIVE"},
                {"name": "OSHA Subpart P Trenching & Excavation", "issuedDate": "2024-08-10", "status": "ACTIVE"},
                {"name": "Autonomous Site Safety Protocol Level 2", "issuedDate": "2025-01-20", "status": "ACTIVE"}
            ],
            skillGraph=[
                {"category": "Excavation", "score": 82, "maxScore": 100, "benchmarkAverage": 74},
                {"category": "Safety & Compliance", "score": 94, "maxScore": 100, "benchmarkAverage": 81},
                {"category": "Loading Cycles", "score": 71, "maxScore": 100, "benchmarkAverage": 76},
                {"category": "Fuel Efficiency", "score": 68, "maxScore": 100, "benchmarkAverage": 70},
                {"category": "Pre-check & Diagnostics", "score": 90, "maxScore": 100, "benchmarkAverage": 80},
                {"category": "Trenching Stability", "score": 85, "maxScore": 100, "benchmarkAverage": 75}
            ],
            evolutionHistory=[
                {"date": "2026-08-01", "safetyScore": 88, "productivityScore": 81, "notes": "Baseline evaluation upon site onboarding."},
                {"date": "2026-08-20", "safetyScore": 91, "productivityScore": 84, "notes": "Completed Blind-Zone Radar awareness micro-course."},
                {"date": "2026-09-10", "safetyScore": 94, "productivityScore": 87, "notes": "Reduced idle swing deviations by 14%."}
            ]
        )

        self.tasks = [
            TaskItem(
                id="TASK-402",
                title="Sector 4B Foundation Pit Excavation",
                code="CAT-EX-402",
                type="Excavation",
                status="IN_PROGRESS",
                priority="HIGH",
                location="Zone 4 — North Quarry Rim (Grid N-12)",
                targetVolume=420.0,
                completedVolume=302.4,
                targetDepth=4.5,
                currentDepth=3.2,
                material="Clay / Silt",
                soilHardnessIndex=7.2,
                progressPercentage=72,
                scheduledStart="07:30 AM",
                originalETA="11:10 AM",
                currentETA="11:28 AM",
                delayMinutes=18,
                weatherCondition="Moderate Rain",
                factors=[
                    {
                        "name": "Hard Soil / Sub-base Clay",
                        "impactMinutes": 9,
                        "type": "negative",
                        "description": "Soil hardness 7.2 requires heavier tooth engagement and multi-pass cutting."
                    },
                    {
                        "name": "Moderate Rain & Wet Terrain",
                        "impactMinutes": 6,
                        "type": "negative",
                        "description": "Decreased traction on 12% slope reducing swing cadence by 1.2s per cycle."
                    },
                    {
                        "name": "Idle Time During Dump Truck Wait",
                        "impactMinutes": 3,
                        "type": "negative",
                        "description": "Engine left idling at 1200 RPM while Haul Truck #3 repositioned."
                    },
                    {
                        "name": "Operator High Bucket Fill Factor",
                        "impactMinutes": -4,
                        "type": "positive",
                        "description": "High 96% bucket fill rate recovered ~4 minutes of delay."
                    }
                ]
            ),
            TaskItem(
                id="TASK-403",
                title="Culvert Trenching & Drainage Line B",
                code="CAT-TR-403",
                type="Trenching",
                status="UPCOMING",
                priority="MEDIUM",
                location="Zone 2 — East Access Road",
                targetVolume=180.0,
                completedVolume=0.0,
                targetDepth=2.1,
                currentDepth=0.0,
                material="Dense Sand",
                soilHardnessIndex=4.8,
                progressPercentage=0,
                scheduledStart="01:00 PM",
                originalETA="03:45 PM",
                currentETA="03:45 PM",
                delayMinutes=0,
                weatherCondition="Clear",
                factors=[]
            ),
            TaskItem(
                id="TASK-401",
                title="North Perimeter Berm Grading",
                code="CAT-GR-401",
                type="Grading",
                status="COMPLETED",
                priority="LOW",
                location="Zone 1 — Perimeter",
                targetVolume=150.0,
                completedVolume=150.0,
                targetDepth=0.5,
                currentDepth=0.5,
                material="Topsoil",
                soilHardnessIndex=3.1,
                progressPercentage=100,
                scheduledStart="06:00 AM",
                originalETA="07:20 AM",
                currentETA="07:14 AM",
                delayMinutes=-6,
                weatherCondition="Clear",
                factors=[
                    {
                        "name": "Smooth Topsoil & Optimal Engine Tuning",
                        "impactMinutes": -6,
                        "type": "positive",
                        "description": "Finished 6 minutes ahead of schedule."
                    }
                ]
            )
        ]

        self.incidents = [
            IncidentRecord(
                id="INC-2026-0923-01",
                timestamp="10:48 AM Today",
                operatorId="OP-9821",
                operatorName="Raj Kumar",
                machineId="CAT-320-01",
                location="Zone 4 North Quarry",
                type="PROXIMITY_HAZARD",
                severity="HIGH",
                title="Worker Incursion in Rear Swing Blind Zone",
                description="Ground surveyor Marcus Vance crossed into 4.2m radius while upper structure was swinging clockwise at 7.2 deg/s.",
                sensorContext={
                    "rpm": 1820,
                    "speed": 0.0,
                    "distance": 4.2,
                    "seatbelt": True,
                    "hydraulicPressure": 230
                },
                actionTaken="Operator Copilot issued STRONG_WARNING audio-visual cue; operator applied swing brake in 0.8s.",
                resolutionStatus="RESOLVED",
                resolutionNotes="Operator verified visual clearance before resuming excavation. Surveyor notified of active swing perimeter."
            ),
            IncidentRecord(
                id="INC-2026-0923-02",
                timestamp="08:14 AM Today",
                operatorId="OP-9821",
                operatorName="Raj Kumar",
                machineId="CAT-320-01",
                location="Zone 1 Staging Area",
                type="SEATBELT_VIOLATION",
                severity="WARNING",
                title="Machine Motion with Seatbelt Unfastened",
                description="Machine propelled forward at 1.4 km/h for 6 seconds without seatbelt buckled.",
                sensorContext={
                    "rpm": 1450,
                    "speed": 1.4,
                    "distance": 28.0,
                    "seatbelt": False,
                    "hydraulicPressure": 190
                },
                actionTaken="Audio reminder chimed and dashboard locked high-speed travel mode until fastened.",
                resolutionStatus="RESOLVED",
                resolutionNotes="Seatbelt fastened promptly. Operator acknowledged pre-check requirement."
            )
        ]

        self.training_courses = [
            TrainingCourse(
                id="TRAIN-01",
                title="Efficient Excavation & Idle Optimization",
                category="Efficiency",
                durationMinutes=12,
                format="Interactive Sim",
                progressPercentage=100,
                completed=True,
                recommendedReason="Recommended due to +89% idle deviation observed during recent loading cycles.",
                triggeredByAnomaly="Excessive Idle Detection (34%)",
                beforeScore=64,
                afterScore=88,
                keyTakeaways=[
                    "Engage auto-idle mode after 30s of hauler wait.",
                    "Optimize bucket penetration angle to eliminate engine lugging.",
                    "Smooth swing deceleration saves up to 1.8 seconds per cycle."
                ],
                quiz=[
                    {
                        "question": "What is the optimal engine RPM strategy when waiting for haul trucks to reverse?",
                        "options": [
                            "Keep at maximum RPM to keep hydraulics warmed up",
                            "Enable CAT Eco-Idle / drop to low idle (800-900 RPM)",
                            "Constantly rev engine to alert the truck driver",
                            "Turn off machine ignition completely every 60 seconds"
                        ],
                        "correctIndex": 1,
                        "explanation": "Eco-idle reduces fuel consumption by up to 40% and preserves component life while maintaining immediate hydraulic readiness."
                    }
                ]
            ),
            TrainingCourse(
                id="TRAIN-02",
                title="Blind-Zone Dynamics & Dynamic Radar Hazard Mitigation",
                category="Safety",
                durationMinutes=15,
                format="Guided Drill",
                progressPercentage=65,
                completed=False,
                recommendedReason="Mandatory reinforcement for ground-worker proximity zones and swing cone risk.",
                keyTakeaways=[
                    "Always visually confirm rear camera split-view before full 180° swing.",
                    "Acknowledge audio radar warnings with immediate swing braking.",
                    "Maintain 5m minimum standoff from ground surveyors."
                ],
                quiz=[
                    {
                        "question": "If a ground worker is detected at 4.5m in a blind zone while swinging, what deterministic boundary applies?",
                        "options": [
                            "Normal operations continue with no alert",
                            "RL Model can choose whether to alert or mute",
                            "Hard Safety Envelope triggers HIGH/CRITICAL intervention with deterministic visual & audio alert",
                            "Machine shuts down engine permanently"
                        ],
                        "correctIndex": 2,
                        "explanation": "Safety-critical boundaries are deterministic hard constraints that cannot be bypassed by RL policies."
                    }
                ]
            ),
            TrainingCourse(
                id="TRAIN-03",
                title="Hard Rock & Dense Clay Penetration Mastery",
                category="Machine Mastery",
                durationMinutes=18,
                format="Video & Quiz",
                progressPercentage=0,
                completed=False,
                recommendedReason="Helps recover up to 9 minutes of delay in high-hardness soil environments.",
                keyTakeaways=[
                    "Step-cut dense clay in 15cm slices rather than full-depth gouging.",
                    "Keep boom angle under 70° to maximize stick cylinder breakout force.",
                    "Prevent hydraulic relief valve bypass by matching stick speed to material resistance."
                ],
                quiz=[
                    {
                        "question": "How do you prevent hydraulic pressure spikes when encountering hard clay sub-base?",
                        "options": [
                            "Force the bucket through with maximum boom down-pressure",
                            "Slice in controlled thin layers using stick cylinder curling priority",
                            "Increase swing speed to use momentum as an impact tool",
                            "Lower engine RPM to 1000"
                        ],
                        "correctIndex": 1,
                        "explanation": "Curling the bucket in progressive layers optimizes tooth shear physics and avoids relief valve pop-offs."
                    }
                ]
            )
        ]

        self.copilot_history = [
            CopilotMessage(
                id="msg-1",
                sender="copilot",
                timestamp="11:15 AM",
                text="Good morning Raj! You are currently operating CAT-320-01 on Sector 4B Excavation (72% complete). Current ETA is 11:28 AM (18 min delay mainly due to hard clay soil + wet terrain). Proximity radar is clear (nearest worker at 12.4m). How can I assist you?",
                referencedData={
                    "type": "TASK",
                    "title": "Sector 4B Foundation Pit Excavation",
                    "snippet": "Progress: 72% | ETA: 11:28 AM (+18m delay)"
                },
                suggestedActions=[
                    {"label": "Why am I behind schedule?", "actionType": "TRIGGER_SIMULATION", "payload": "explain-eta"},
                    {"label": "What is affecting safety risk?", "actionType": "NAVIGATE", "payload": "/safety"},
                    {"label": "How to recover 9 minutes?", "actionType": "NAVIGATE", "payload": "/simulator"}
                ]
            )
        ]

        self.site_machines = [
            SiteMachineObject(
                id="M-01",
                name="CAT 320 Excavator (You)",
                type="Excavator",
                operatorName="Raj Kumar",
                x=48.0,
                y=52.0,
                heading=125.0,
                speed=0.8,
                status="OPERATING",
                fuelLevel=71,
                zone="Zone 4 North Pit"
            ),
            SiteMachineObject(
                id="M-02",
                name="CAT 950M Wheel Loader",
                type="Wheel Loader",
                operatorName="Elena Rostova",
                x=62.0,
                y=44.0,
                heading=260.0,
                speed=8.2,
                status="TRAVELLING",
                fuelLevel=84,
                zone="Zone 4 Staging Strip"
            ),
            SiteMachineObject(
                id="M-03",
                name="CAT D6T Dozer",
                type="Dozer",
                operatorName="Samir Patel",
                x=22.0,
                y=70.0,
                heading=45.0,
                speed=3.5,
                status="OPERATING",
                fuelLevel=62,
                zone="Zone 1 Berm"
            ),
            SiteMachineObject(
                id="M-04",
                name="CAT 730 Articulated Dump Truck",
                type="Dump Truck",
                operatorName="Carlos Gomez",
                x=56.0,
                y=49.0,
                heading=180.0,
                speed=12.0,
                status="TRAVELLING",
                fuelLevel=79,
                zone="Zone 4 Haul Road"
            )
        ]

        self.site_workers = [
            SiteWorkerObject(
                id="W-01",
                name="Marcus Vance (Surveyor)",
                role="Grade Checker",
                x=44.0,
                y=57.0,
                heading=210.0,
                speed=1.1,
                safetyVestEquipped=True,
                proximityRiskLevel="LOW"
            ),
            SiteWorkerObject(
                id="W-02",
                name="Derek Shaw (Rigging Lead)",
                role="Spotter",
                x=68.0,
                y=38.0,
                heading=90.0,
                speed=0.0,
                safetyVestEquipped=True,
                proximityRiskLevel="NORMAL"
            ),
            SiteWorkerObject(
                id="W-03",
                name="Aisha Tanaka (Site Engineer)",
                role="Inspector",
                x=18.0,
                y=82.0,
                heading=300.0,
                speed=0.8,
                safetyVestEquipped=True,
                proximityRiskLevel="NORMAL"
            )
        ]

        self.site_conflicts = [
            SiteConflictWarning(
                id="CONF-01",
                sourceEntity="CAT 950M Loader",
                targetEntity="CAT 730 Dump Truck",
                projectedCollisionSeconds=18,
                riskLevel="WARNING",
                zone="Zone 4 Haul Confluence",
                description="Loader B and Dump Truck 730 trajectories intersect in 18 seconds at North Access junction."
            )
        ]

    def update_telemetry(self, partial: dict) -> TelemetryData:
        data = self.telemetry.model_dump()
        data.update(partial)
        data["timestamp"] = datetime.now().isoformat()
        self.telemetry = TelemetryData(**data)
        return self.telemetry

    def add_incident(self, incident_data: dict) -> IncidentRecord:
        new_id = f"INC-{int(datetime.now().timestamp()) % 1000000:06d}"
        time_str = datetime.now().strftime("%I:%M %p Today")
        record_dict = {
            "id": new_id,
            "timestamp": time_str,
            "resolutionStatus": "OPEN",
            **incident_data
        }
        record = IncidentRecord(**record_dict)
        self.incidents.insert(0, record)

        # Update digital twin safety score dynamically
        if record.severity == "CRITICAL":
            self.operator.safetyScore = max(70, self.operator.safetyScore - 3)
        elif record.severity == "HIGH":
            self.operator.safetyScore = max(75, self.operator.safetyScore - 1)

        return record

    def resolve_incident(self, incident_id: str, notes: Optional[str] = None) -> Optional[IncidentRecord]:
        for inc in self.incidents:
            if inc.id == incident_id:
                inc.resolutionStatus = "RESOLVED"
                if notes:
                    inc.resolutionNotes = notes
                return inc
        return None

db = DataStore()
