from datetime import datetime
from typing import Optional
from ..data.mock_data import db
from ..models.schemas import OperatorProfile

def get_operator_profile() -> OperatorProfile:
    return db.operator

def update_operator_profile(partial_data: dict) -> OperatorProfile:
    current = db.operator.model_dump()
    current.update(partial_data)
    db.operator = OperatorProfile(**current)
    return db.operator

def record_training_impact_on_twin(course_id: str, score: int):
    operator = db.operator

    # Boost safety and productivity based on quiz performance
    operator.safetyScore = min(99, operator.safetyScore + 2)
    operator.productivityScore = min(98, operator.productivityScore + 3)

    # Find course to identify category
    course = next((c for c in db.training_courses if c.id == course_id), None)
    if course:
        category_target = "Safety & Compliance" if course.category == "Safety" else "Excavation"
        for skill in operator.skillGraph:
            if skill.category == category_target or category_target in skill.category:
                skill.score = min(100, skill.score + 6)

        operator.evolutionHistory.append({
            "date": datetime.now().strftime("%Y-%m-%d"),
            "safetyScore": operator.safetyScore,
            "productivityScore": operator.productivityScore,
            "notes": f"Completed training module: {course.title} with score {score}%."
        })

    completed_count = sum(1 for c in db.training_courses if c.completed)
    operator.trainingProgressPercentage = int(round((completed_count / len(db.training_courses)) * 100))
    return operator
