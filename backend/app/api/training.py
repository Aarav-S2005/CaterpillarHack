from typing import List
from fastapi import APIRouter, HTTPException
from ..services.training_service import get_training_courses, complete_course
from ..models.schemas import TrainingCourse

router = APIRouter(prefix="/api/training", tags=["training"])

@router.get("", response_model=List[TrainingCourse])
def get_courses():
    return get_training_courses()

@router.post("", response_model=TrainingCourse)
def submit_training(payload: dict):
    course_id = payload.get("courseId")
    score = payload.get("score", 85)
    updated = complete_course(course_id, score)
    if not updated:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated
