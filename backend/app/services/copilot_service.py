import httpx
from datetime import datetime
from typing import Optional, List
from ..data.mock_data import db
from .safety_service import evaluate_safety_state
from .eta_service import get_eta_prediction
from ..models.schemas import CopilotMessage, CopilotReference, CopilotAction
from ..config import settings

async def query_ollama(prompt: str, context_system_prompt: str) -> Optional[str]:
    """
    Queries local Ollama server running configured LLM model.
    """
    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS) as client:
            res = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "system": context_system_prompt,
                    "stream": False
                }
            )
            if res.status_code == 200:
                data = res.json()
                return data.get("response")
    except Exception:
        # Fallback when Ollama server is offline
        return None

def build_context_prompt() -> str:
    telemetry = db.telemetry
    safety = evaluate_safety_state()
    eta = get_eta_prediction()
    task = db.tasks[0]
    operator = db.operator

    return f"""You are the CAT Operator Copilot, an AI assistant for Caterpillar construction machinery.
Current Telemetry:
- Machine: {telemetry.machineModel} ({telemetry.machineId})
- RPM: {telemetry.rpm}, Hydraulic Pressure: {telemetry.hydraulicPressure} bar
- Speed: {telemetry.speed} km/h, Swing Speed: {telemetry.swingSpeed}°/s
- Seatbelt: {'Buckled' if telemetry.seatbelt else 'UNLATCHED (VIOLATION)'}
- Fuel: {telemetry.fuelLevel}%, Operating Hours: {telemetry.operatingHours}h

Active Task:
- Title: {task.title} ({task.code})
- Progress: {task.progressPercentage}% ({task.completedVolume}/{task.targetVolume} m³)
- Soil: {task.material} (Hardness: {task.soilHardnessIndex}/10)
- Scheduled ETA: {task.originalETA}, Predicted ETA: {eta.predictedETA} (+{eta.delayMinutes} min delay)
- Delay Drivers: Hard clay (+9m), Rain (+6m), Idle wait (+3m), Bucket fill bonus (-4m)

Safety State:
- Overall Risk: {safety.overallRiskLevel} ({safety.overallRiskScore}/100)
- Nearest Worker: {safety.workers[0].name} at {safety.workers[0].distance}m ({safety.workers[0].explanation})
- Active Intervention: {safety.activeIntervention}
- Recommended Action: {safety.recommendedOperatorAction}

Operator Profile:
- Name: {operator.name}, Experience: {operator.experienceYears} yrs
- Safety Score: {operator.safetyScore}, Productivity Score: {operator.productivityScore}
- Idle Deviation: +89% vs 18% baseline.

Always answer accurately using this data. Be concise, professional, and safety-focused. Explain causes clearly."""

async def process_copilot_query(user_query: str) -> CopilotMessage:
    q = user_query.lower()
    system_prompt = build_context_prompt()
    telemetry = db.telemetry
    safety = evaluate_safety_state()
    eta = get_eta_prediction()
    task = db.tasks[0]
    operator = db.operator

    # Try local Ollama model first
    ollama_response = await query_ollama(user_query, system_prompt)

    referenced_data: Optional[CopilotReference] = None
    suggested_actions: List[CopilotAction] = []

    if ollama_response:
        response_text = ollama_response.strip()
    else:
        # Grounded contextual reasoning fallback
        if "next task" in q or "upcoming" in q:
            next_task = db.tasks[1]
            response_text = f"Your next scheduled assignment is **{next_task.title}** ({next_task.code}) at {next_task.location}. Scheduled to start at **{next_task.scheduledStart}** (target volume: {next_task.targetVolume} m³ in {next_task.material})."
            referenced_data = CopilotReference(
                type="TASK",
                title=next_task.title,
                snippet=f"Code: {next_task.code} | Depth: {next_task.targetDepth}m | Start: {next_task.scheduledStart}"
            )
            suggested_actions = [
                CopilotAction(label="View Tasks Board", actionType="NAVIGATE", payload="/tasks"),
                CopilotAction(label="Check Machine Diagnostics", actionType="NAVIGATE", payload="/machine")
            ]
        elif any(k in q for k in ["behind", "delay", "eta", "schedule", "why am i"]):
            response_text = f"""You are currently **{eta.delayMinutes} minutes behind** the original {task.originalETA} schedule (current predicted completion: **{eta.predictedETA}**).

**Primary Delay Drivers:**
• **Hard Clay Sub-base (+9m)**: High material resistance (hardness index {task.soilHardnessIndex}/10).
• **Wet Ground / Rain (+6m)**: Reduced traction on 12% slope adding +1.2s per cycle.
• **Idle Time (+3m)**: 34% idle ratio while awaiting hauler truck swapping.

💡 **Recommendation**: Engaging CAT Eco-Idle and stepping clay cuts in 15cm progressive passes can recover approximately **~9 minutes**."""
            referenced_data = CopilotReference(
                type="ETA",
                title="ETA Prediction & Factor Decomposition",
                snippet=f"Original: {task.originalETA} | Current: {eta.predictedETA} | Net Delay: +{eta.delayMinutes} min"
            )
            suggested_actions = [
                CopilotAction(label="Launch What-If Simulator", actionType="NAVIGATE", payload="/simulator"),
                CopilotAction(label="View Delay Analytics", actionType="NAVIGATE", payload="/predictions")
            ]
        elif any(k in q for k in ["warning", "safety", "incident", "proximity", "seatbelt"]):
            nearest_worker = safety.workers[0]
            response_text = f"""**Current Safety Status: {safety.overallRiskLevel}** (Risk Index: {safety.overallRiskScore}/100).

• **Worker Proximity**: Closest personnel is {nearest_worker.name} at **{nearest_worker.distance}m** ({nearest_worker.explanation}).
• **Seatbelt Status**: {'✅ Buckled & Compliant' if telemetry.seatbelt else '⚠ UNLATCHED — Warning active!'}.
• **Intervention Active**: `{safety.activeIntervention}` — *{safety.recommendedOperatorAction}*
• **Today's Logged Incidents**: {len(db.incidents)} recorded events ({sum(1 for i in db.incidents if i.resolutionStatus == 'OPEN')} active open)."""
            referenced_data = CopilotReference(
                type="SAFETY",
                title="Live Safety Envelope & Proximity Radar",
                snippet=f"Risk: {safety.overallRiskLevel} | Worker: {nearest_worker.distance}m | Intervention: {safety.activeIntervention}"
            )
            suggested_actions = [
                CopilotAction(label="Open Live Radar", actionType="NAVIGATE", payload="/safety"),
                CopilotAction(label="View Incident Log", actionType="NAVIGATE", payload="/safety/incidents")
            ]
        elif any(k in q for k in ["improve", "training", "score", "skill", "digital twin"]):
            response_text = f"""Raj, your current **Safety Score is {operator.safetyScore}/100** and **Productivity Score is {operator.productivityScore}/100**.

**Key Growth Opportunities Identified by Telemetry:**
1. **Idle Time Management**: Your idle time is currently at 34% vs your personal 18% baseline (+89% deviation).
2. **Swing Arc Optimization**: We recommend the **"Efficient Excavation & Idle Optimization"** interactive simulation.

Completing this drill is projected to recover +3.5 productivity points and ~9 minutes per shift."""
            referenced_data = CopilotReference(
                type="TRAINING",
                title="Operator Digital Twin & Recommended Drill",
                snippet=f"Safety: {operator.safetyScore} | Prod: {operator.productivityScore} | Idle Dev: +89%"
            )
            suggested_actions = [
                CopilotAction(label="Start Idle Drill", actionType="NAVIGATE", payload="/training"),
                CopilotAction(label="View Skill Graph", actionType="NAVIGATE", payload="/operator")
            ]
        else:
            response_text = f"I have analyzed your live system state. You are operating **{telemetry.machineId}** on **{task.title}** ({task.progressPercentage}% complete). Safety envelope is **{safety.overallRiskLevel}**, predicted ETA is **{eta.predictedETA}** (+{eta.delayMinutes}m delay), and nearest ground personnel is at **{telemetry.workerDistance}m**. How can I assist you?"
            suggested_actions = [
                CopilotAction(label="Why am I behind schedule?", actionType="TRIGGER_SIMULATION", payload="explain-eta"),
                CopilotAction(label="Check Proximity Safety", actionType="NAVIGATE", payload="/safety"),
                CopilotAction(label="What-If Idle Drop", actionType="NAVIGATE", payload="/simulator")
            ]

    # Save to history
    time_str = datetime.now().strftime("%I:%M %p")
    user_msg = CopilotMessage(
        id=f"msg-user-{int(datetime.now().timestamp() * 1000)}",
        sender="operator",
        timestamp=time_str,
        text=user_query
    )
    bot_msg = CopilotMessage(
        id=f"msg-bot-{int(datetime.now().timestamp() * 1000)}",
        sender="copilot",
        timestamp=time_str,
        text=response_text,
        referencedData=referenced_data,
        suggestedActions=suggested_actions
    )

    db.copilot_history.append(user_msg)
    db.copilot_history.append(bot_msg)

    return bot_msg
