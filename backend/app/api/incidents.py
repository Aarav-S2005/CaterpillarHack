from typing import List
from fastapi import APIRouter, HTTPException
from ..data.mock_data import db
from ..models.schemas import IncidentRecord

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

@router.get("", response_model=List[IncidentRecord])
def get_incidents():
    return db.incidents

@router.post("", response_model=IncidentRecord, status_code=201)
def create_incident(payload: dict):
    return db.add_incident(payload)

@router.patch("", response_model=IncidentRecord)
def resolve_incident(payload: dict):
    incident_id = payload.get("id")
    notes = payload.get("notes")
    resolved = db.resolve_incident(incident_id, notes)
    if not resolved:
        raise HTTPException(status_code=404, detail="Incident not found")
    return resolved
