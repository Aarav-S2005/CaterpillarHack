from typing import List, Optional
from ..data.mock_data import db
from ..models.schemas import TrainingCourse
from .digital_twin_service import record_training_impact_on_twin

def get_training_courses() -> List[TrainingCourse]:
    return db.training_courses

def complete_course(course_id: str, score: int = 85) -> Optional[TrainingCourse]:
    for course in db.training_courses:
        if course.id == course_id:
            course.completed = True
            course.progressPercentage = 100
            course.afterScore = score

            # Update Digital Twin dynamically
            record_training_impact_on_twin(course_id, score)
            return course
    return None
