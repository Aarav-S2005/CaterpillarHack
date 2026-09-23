from fastapi import APIRouter
from ..data.mock_data import db
from ..services.safety_service import evaluate_safety_state
from ..models.schemas import SafetyState, EnvelopeThresholds

router = APIRouter(prefix="/api/safety", tags=["safety"])

@router.get("", response_model=SafetyState)
def get_safety_state():
    return evaluate_safety_state()

@router.post("", response_model=SafetyState)
def update_safety_state(payload: dict):
    if "thresholds" in payload:
        thresh = payload["thresholds"]
        db.envelope_thresholds = EnvelopeThresholds(**thresh)
    return evaluate_safety_state(payload.get("telemetryOverride"))
