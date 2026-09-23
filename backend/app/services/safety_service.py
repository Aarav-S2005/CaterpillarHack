from typing import Optional
from ..data.mock_data import db
from ..rl.policy import safety_policy
from ..models.schemas import (
    SafetyState,
    WorkerHazardContext,
    PolicyEngineDecision,
    RiskLevel,
    InterventionAction,
)

def evaluate_safety_state(telemetry_override: Optional[dict] = None) -> SafetyState:
    telemetry = db.telemetry
    if telemetry_override:
        telemetry_dict = telemetry.model_dump()
        telemetry_dict.update(telemetry_override)
        telemetry = type(telemetry)(**telemetry_dict)

    thresholds = db.envelope_thresholds

    worker_dist = telemetry.workerDistance
    worker_angle = telemetry.workerRelativeAngle
    worker_vel = telemetry.workerVelocity
    machine_spd = telemetry.speed
    swing_spd = abs(telemetry.swingSpeed)
    seatbelt_fastened = telemetry.seatbelt

    # Blind zone check
    is_in_blind_zone = (135 <= worker_angle <= 225) or (70 <= worker_angle <= 110)
    seatbelt_violation = machine_spd > 0.2 and not seatbelt_fastened

    # Context-aware dynamic risk calculation (0 - 100)
    dynamic_risk_score = 10
    if worker_dist < 3.0:
        dynamic_risk_score += 70
    elif worker_dist < 5.0:
        dynamic_risk_score += 45
    elif worker_dist < 10.0:
        dynamic_risk_score += 25
    else:
        dynamic_risk_score += 5

    if worker_vel < 0:
        dynamic_risk_score += int(min(25, abs(worker_vel) * 20))
    if swing_spd > 5.0 and abs(worker_angle) < 120:
        dynamic_risk_score += int(min(20, swing_spd * 1.5))
    if is_in_blind_zone:
        dynamic_risk_score += 15
    if seatbelt_violation:
        dynamic_risk_score += 25

    dynamic_risk_score = int(min(100, max(0, dynamic_risk_score)))

    # Hard Safety Envelope deterministic bounds
    if worker_dist < thresholds.critical or (seatbelt_violation and machine_spd > 3.0):
        risk_level: RiskLevel = "CRITICAL"
    elif worker_dist < thresholds.high or dynamic_risk_score >= 70:
        risk_level = "HIGH"
    elif worker_dist < thresholds.warning or dynamic_risk_score >= 40:
        risk_level = "WARNING"
    else:
        risk_level = "NORMAL"

    # Evaluate RL Policy within safe envelope
    state_vector = {
        "minWorkerDist": worker_dist,
        "workerVelocity": worker_vel,
        "speed": machine_spd,
        "swingRate": swing_spd,
        "workerRelativeAngle": worker_angle,
        "seatbeltStatus": "FASTENED" if seatbelt_fastened else "UNFASTENED"
    }

    action, is_override, expected_reward, policy_name = safety_policy.evaluate(state_vector)

    # Explanation and recommendation formulation
    if risk_level == "CRITICAL":
        intervention_reason = f"Deterministic Hard Envelope breach (< {thresholds.critical}m proximity threshold)."
        rec_action = "Engage hydraulic lock and pause all swing/travel immediately."
    elif risk_level == "HIGH":
        intervention_reason = "Worker closing in blind zone during upper-frame rotation."
        rec_action = "Decelerate swing speed and visually confirm right mirror / rear camera."
    elif risk_level == "WARNING":
        if seatbelt_violation:
            intervention_reason = "Machine moving with operator seatbelt unlatched."
            rec_action = "Fasten seatbelt to restore full travel speed mode."
        else:
            intervention_reason = "Worker detected in 10m buffer zone."
            rec_action = "Maintain awareness of ground crew on right quadrant."
    else:
        intervention_reason = "All safety parameters within safe operating envelope."
        rec_action = "Continue standard excavation cycle."

    # Conflict prediction seconds
    trajectory_conflict_sec = None
    closing_vel = max(0.1, (abs(worker_vel) if worker_vel < 0 else 0) + (machine_spd / 3.6))
    if worker_dist < 20 and (worker_vel < 0 or swing_spd > 5):
        trajectory_conflict_sec = max(1, int(round(worker_dist / closing_vel)))

    workers = [
        WorkerHazardContext(
            id="W-01",
            name="Marcus Vance (Surveyor)",
            distance=round(worker_dist, 1),
            relativeAngle=worker_angle,
            isStationary=abs(worker_vel) < 0.1,
            velocity=round(worker_vel, 1),
            isInBlindZone=is_in_blind_zone,
            riskScore=dynamic_risk_score,
            riskLevel=risk_level,
            trajectoryConflictInSeconds=trajectory_conflict_sec,
            explanation=(
                "CRITICAL PROXIMITY: Ground worker is within 3m hard envelope radius. Immediate stop mandated."
                if worker_dist < 3.0
                else f"HIGH RISK: Worker at {worker_dist:.1f}m while upper structure is swinging at {swing_spd:.1f}°/s into right blind quadrant."
                if (worker_dist < 5.0 and swing_spd > 5)
                else f"MONITORED: Worker within 10m warning boundary; relative velocity {worker_vel:.1f} m/s."
                if worker_dist < 10.0
                else "NORMAL: Ground personnel at safe perimeter distance (>10m)."
            )
        ),
        WorkerHazardContext(
            id="W-02",
            name="Derek Shaw (Rigging Lead)",
            distance=24.5,
            relativeAngle=170.0,
            isStationary=True,
            velocity=0.0,
            isInBlindZone=False,
            riskScore=8,
            riskLevel="NORMAL",
            trajectoryConflictInSeconds=None,
            explanation="Stationary at 24.5m distance near staging area. Zero collision risk."
        )
    ]

    # Auto-log incident in datastore if critical breach occurs
    if risk_level == "CRITICAL" and worker_dist < 3.0:
        has_open_proximity = any(i.type == "PROXIMITY_HAZARD" and i.resolutionStatus == "OPEN" for i in db.incidents)
        if not has_open_proximity:
            db.add_incident({
                "operatorId": db.operator.id,
                "operatorName": db.operator.name,
                "machineId": telemetry.machineId,
                "location": "Sector 4B Active Face",
                "type": "PROXIMITY_HAZARD",
                "severity": "CRITICAL",
                "title": "CRITICAL: Hard Safety Envelope Breach (<3m)",
                "description": f"Worker detected at {worker_dist:.1f}m from boom pivot point.",
                "sensorContext": {
                    "rpm": telemetry.rpm,
                    "speed": telemetry.speed,
                    "distance": worker_dist,
                    "seatbelt": telemetry.seatbelt,
                    "hydraulicPressure": telemetry.hydraulicPressure
                },
                "actionTaken": "Autonomous STOP_RECOMMENDATION issued and hydraulic lockout alerted."
            })

    return SafetyState(
        overallRiskLevel=risk_level,
        overallRiskScore=dynamic_risk_score,
        seatbeltViolation=seatbelt_violation,
        proximityBreach=worker_dist < thresholds.high,
        blindZoneActive=is_in_blind_zone,
        activeIntervention=action,
        interventionReason=intervention_reason,
        recommendedOperatorAction=rec_action,
        workers=workers,
        envelopeThresholds=thresholds,
        policyEngineDecision=PolicyEngineDecision(
            stateVector=state_vector,
            selectedPolicy=policy_name,
            action=action,
            expectedReward=expected_reward,
            deterministicOverride=is_override
        )
    )
