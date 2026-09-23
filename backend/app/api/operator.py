from fastapi import APIRouter
from ..services.digital_twin_service import get_operator_profile, update_operator_profile
from ..models.schemas import OperatorProfile

router = APIRouter(prefix="/api/operator", tags=["operator"])

@router.get("", response_model=OperatorProfile)
def get_operator():
    return get_operator_profile()

@router.post("", response_model=OperatorProfile)
def update_operator(payload: dict):
    return update_operator_profile(payload)
