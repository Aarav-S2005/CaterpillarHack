from fastapi import APIRouter
from ..services.anomaly_service import get_behavior_analytics
from ..models.schemas import BehaviorAnalytics

router = APIRouter(prefix="/api/behavior", tags=["behavior"])

@router.get("", response_model=BehaviorAnalytics)
def get_behavior():
    return get_behavior_analytics()
