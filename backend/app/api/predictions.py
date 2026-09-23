from typing import Optional
from fastapi import APIRouter
from ..services.eta_service import get_eta_prediction
from ..models.schemas import ETAPrediction

router = APIRouter(prefix="/api/predictions", tags=["predictions"])

@router.get("", response_model=ETAPrediction)
def get_predictions(taskId: Optional[str] = "TASK-402"):
    return get_eta_prediction(taskId)
