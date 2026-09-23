from typing import List
from fastapi import APIRouter
from ..data.mock_data import db
from ..services.copilot_service import process_copilot_query
from ..models.schemas import CopilotMessage

router = APIRouter(prefix="/api/copilot", tags=["copilot"])

@router.get("", response_model=List[CopilotMessage])
def get_copilot_history():
    return db.copilot_history

@router.post("", response_model=CopilotMessage)
async def query_copilot(payload: dict):
    query = payload.get("query", "")
    return await process_copilot_query(query)
