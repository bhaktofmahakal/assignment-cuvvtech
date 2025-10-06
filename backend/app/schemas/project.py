from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.project import ProjectStatus
from .user import User


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PLANNING
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ProjectCreate(ProjectBase):
    manager_id: int
    member_ids: Optional[List[int]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    manager_id: Optional[int] = None
    member_ids: Optional[List[int]] = None


class Project(ProjectBase):
    id: int
    manager_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectWithDetails(Project):
    manager: User
    members: List[User] = []
    task_count: int = 0
    completed_tasks: int = 0
    progress_percentage: float = 0.0

    class Config:
        from_attributes = True