import random
from fastapi import APIRouter
from ..data.mock_data import db
from ..models.schemas import TelemetryData

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])

@router.get("", response_model=TelemetryData)
def get_telemetry():
    # Return current telemetry state with micro-jitter only if within nominal operating band
    current = db.telemetry
    return current

@router.post("", response_model=TelemetryData)
def update_telemetry(payload: dict):
    return db.update_telemetry(payload)
