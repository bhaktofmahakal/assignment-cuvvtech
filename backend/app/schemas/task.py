from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.task import TaskStatus, TaskPriority
from .user import User


class TaskCommentBase(BaseModel):
    content: str


class TaskCommentCreate(TaskCommentBase):
    task_id: int


class TaskComment(TaskCommentBase):
    id: int
    task_id: int
    author_id: int
    author: User
    created_at: datetime

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    project_id: int
    assignee_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None


class Task(TaskBase):
    id: int
    project_id: int
    assignee_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TaskWithDetails(Task):
    assignee: Optional[User] = None
    comments: List[TaskComment] = []
    is_overdue: bool = False

    class Config:
        from_attributes = True