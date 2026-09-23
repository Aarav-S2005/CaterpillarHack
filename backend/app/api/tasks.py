from typing import List, Optional
from fastapi import APIRouter, HTTPException
from ..data.mock_data import db
from ..models.schemas import TaskItem

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("", response_model=List[TaskItem])
def get_tasks(id: Optional[str] = None):
    if id:
        task = next((t for t in db.tasks if t.id == id), None)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return [task]
    return db.tasks

@router.post("", response_model=TaskItem)
def update_task(payload: dict):
    task_id = payload.get("id")
    for idx, t in enumerate(db.tasks):
        if t.id == task_id:
            updated_dict = t.model_dump()
            updated_dict.update(payload)
            updated_task = TaskItem(**updated_dict)
            db.tasks[idx] = updated_task
            return updated_task
    raise HTTPException(status_code=404, detail="Task not found")
