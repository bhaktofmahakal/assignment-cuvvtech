from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, timezone
from ...core.database import get_db
from ...models.user import User, UserRole
from ...models.project import Project
from ...models.task import Task, TaskComment
from ...schemas.task import (
    Task as TaskSchema, TaskCreate, TaskUpdate, TaskWithDetails,
    TaskComment as TaskCommentSchema, TaskCommentCreate
)
from ...api.dependencies import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[TaskWithDetails])
async def read_tasks(
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[int] = None,
    assignee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        query = db.query(Task)
        
        if project_id:
            query = query.filter(Task.project_id == project_id)
        
        if assignee_id:
            query = query.filter(Task.assignee_id == assignee_id)
        
        # For admin users, show all tasks
        if current_user.role == UserRole.ADMIN:
            pass  # No filtering needed
        elif current_user.role == UserRole.DEVELOPER:
            query = query.filter(
                or_(
                    Task.assignee_id == current_user.id,
                    Task.project.has(Project.members.any(User.id == current_user.id))
                )
            )
        elif current_user.role == UserRole.PROJECT_MANAGER:
            query = query.join(Project).filter(
                Project.manager_id == current_user.id
            )
        
        tasks = query.offset(skip).limit(limit).all()
        
        result = []
        from app.models.task import TaskStatus
        for task in tasks:
            is_overdue = bool(task.due_date and 
                             task.due_date < datetime.now(timezone.utc) and 
                             task.status != TaskStatus.DONE)
            
            task_data = TaskWithDetails(
                id=task.id,
                title=task.title,
                description=task.description,
                status=task.status,
                priority=task.priority,
                project_id=task.project_id,
                assignee_id=task.assignee_id,
                due_date=task.due_date,
                created_at=task.created_at,
                updated_at=task.updated_at,
                is_overdue=is_overdue,
                assignee=task.assignee,
                comments=[]
            )
            result.append(task_data)
        
        return result
    except Exception as e:
        print(f"Error in read_tasks: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=TaskSchema)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    project = db.query(Project).filter(Project.id == task_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if (current_user.role == UserRole.DEVELOPER and 
        current_user not in project.members):
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_task = Task(**task_data.model_dump())
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/{task_id}", response_model=TaskWithDetails)
async def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if (current_user.role == UserRole.DEVELOPER and 
        db_task.assignee_id != current_user.id and
        current_user not in db_task.project.members):
        raise HTTPException(status_code=403, detail="Access denied")
    
    is_overdue = (db_task.due_date and 
                 db_task.due_date < datetime.now(timezone.utc) and 
                 db_task.status.value != "done")
    
    return TaskWithDetails(
        **db_task.__dict__,
        is_overdue=is_overdue
    )


@router.put("/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if (current_user.role == UserRole.DEVELOPER and 
        db_task.assignee_id != current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if (current_user.role == UserRole.DEVELOPER):
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}


@router.post("/{task_id}/comments", response_model=TaskCommentSchema)
async def create_task_comment(
    task_id: int,
    comment_data: TaskCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if (current_user.role == UserRole.DEVELOPER and 
        db_task.assignee_id != current_user.id and
        current_user not in db_task.project.members):
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_comment = TaskComment(
        content=comment_data.content,
        task_id=task_id,
        author_id=current_user.id
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment