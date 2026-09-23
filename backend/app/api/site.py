from typing import Dict, Any
from fastapi import APIRouter
from ..services.site_service import get_site_spatial_data

router = APIRouter(prefix="/api/site", tags=["site"])

@router.get("", response_model=Dict[str, Any])
def get_site():
    return get_site_spatial_data()
