from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime
from ...core.database import get_db
from ...models.user import User, UserRole
from ...models.project import Project, ProjectStatus
from ...models.task import Task, TaskStatus
from ...api.dependencies import get_current_active_user

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    base_project_query = db.query(Project)
    base_task_query = db.query(Task)
    
    if current_user.role == UserRole.DEVELOPER:
        user_projects = base_project_query.join(Project.members).filter(
            User.id == current_user.id
        ).subquery()
        
        project_ids = db.query(user_projects.c.id).all()
        project_ids = [pid[0] for pid in project_ids]
        
        base_task_query = base_task_query.filter(Task.project_id.in_(project_ids))
    elif current_user.role == UserRole.PROJECT_MANAGER:
        managed_projects = base_project_query.filter(
            Project.manager_id == current_user.id
        ).subquery()
        
        project_ids = db.query(managed_projects.c.id).all()
        project_ids = [pid[0] for pid in project_ids]
        
        base_task_query = base_task_query.filter(Task.project_id.in_(project_ids))
    
    total_projects = base_project_query.count()
    active_projects = base_project_query.filter(
        Project.status == ProjectStatus.IN_PROGRESS
    ).count()
    
    total_tasks = base_task_query.count()
    todo_tasks = base_task_query.filter(Task.status == TaskStatus.TODO).count()
    in_progress_tasks = base_task_query.filter(Task.status == TaskStatus.IN_PROGRESS).count()
    completed_tasks = base_task_query.filter(Task.status == TaskStatus.DONE).count()
    
    overdue_tasks = base_task_query.filter(
        and_(
            Task.due_date < datetime.now(),
            Task.status != TaskStatus.DONE
        )
    ).count()
    
    if current_user.role == UserRole.DEVELOPER:
        my_tasks = base_task_query.filter(Task.assignee_id == current_user.id).count()
        my_completed_tasks = base_task_query.filter(
            and_(
                Task.assignee_id == current_user.id,
                Task.status == TaskStatus.DONE
            )
        ).count()
    else:
        my_tasks = total_tasks
        my_completed_tasks = completed_tasks
    
    project_progress = []
    projects = base_project_query.limit(5).all()
    
    for project in projects:
        project_tasks = db.query(Task).filter(Task.project_id == project.id).count()
        project_completed = db.query(Task).filter(
            and_(Task.project_id == project.id, Task.status == TaskStatus.DONE)
        ).count()
        
        progress = (project_completed / project_tasks * 100) if project_tasks > 0 else 0
        
        project_progress.append({
            "id": project.id,
            "name": project.name,
            "progress": round(progress, 2),
            "total_tasks": project_tasks,
            "completed_tasks": project_completed
        })
    
    return {
        "overview": {
            "total_projects": total_projects,
            "active_projects": active_projects,
            "total_tasks": total_tasks,
            "my_tasks": my_tasks,
            "my_completed_tasks": my_completed_tasks
        },
        "task_distribution": {
            "todo": todo_tasks,
            "in_progress": in_progress_tasks,
            "completed": completed_tasks,
            "overdue": overdue_tasks
        },
        "project_progress": project_progress
    }


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    base_task_query = db.query(Task)
    
    if current_user.role == UserRole.DEVELOPER:
        base_task_query = base_task_query.filter(
            Task.assignee_id == current_user.id
        )
    elif current_user.role == UserRole.PROJECT_MANAGER:
        base_task_query = base_task_query.join(Project).filter(
            Project.manager_id == current_user.id
        )
    
    recent_tasks = base_task_query.order_by(
        Task.updated_at.desc()
    ).limit(limit).all()
    
    activity = []
    for task in recent_tasks:
        activity.append({
            "id": task.id,
            "title": task.title,
            "status": task.status.value,
            "project_name": task.project.name,
            "assignee_name": task.assignee.full_name if task.assignee else None,
            "updated_at": task.updated_at
        })
    
    return {"recent_activity": activity}