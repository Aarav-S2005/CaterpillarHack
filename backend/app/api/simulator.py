from fastapi import APIRouter
from ..services.what_if_service import run_what_if_simulation
from ..models.schemas import WhatIfScenarioInput, WhatIfScenarioResult

router = APIRouter(prefix="/api/simulator", tags=["simulator"])

@router.post("", response_model=WhatIfScenarioResult)
def simulate_scenario(payload: WhatIfScenarioInput):
    return run_what_if_simulation(payload)
