from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from ...core.database import get_db
from ...models.user import User, UserRole
from ...models.project import Project
from ...models.task import Task, TaskStatus
from ...schemas.project import Project as ProjectSchema, ProjectCreate, ProjectUpdate, ProjectWithDetails
from ...api.dependencies import get_current_active_user, require_manager_or_admin

router = APIRouter()


@router.get("/", response_model=List[ProjectWithDetails])
async def read_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        query = db.query(Project)
        
        # For admin users, return all projects
        if current_user.role == UserRole.ADMIN:
            pass  # No filtering needed
        elif current_user.role == UserRole.DEVELOPER:
            query = query.join(Project.members).filter(User.id == current_user.id)
        elif current_user.role == UserRole.PROJECT_MANAGER:
            query = query.filter(
                (Project.manager_id == current_user.id) |
                (Project.members.any(User.id == current_user.id))
            )
        
        projects = query.offset(skip).limit(limit).all()
        
        result = []
        for project in projects:
            task_count = db.query(Task).filter(Task.project_id == project.id).count()
            completed_tasks = db.query(Task).filter(
                and_(Task.project_id == project.id, Task.status == TaskStatus.DONE)
            ).count()
            
            progress_percentage = (completed_tasks / task_count * 100) if task_count > 0 else 0
            
            project_data = ProjectWithDetails(
                id=project.id,
                name=project.name,
                description=project.description,
                status=project.status,
                start_date=project.start_date,
                end_date=project.end_date,
                manager_id=project.manager_id,
                created_at=project.created_at,
                updated_at=project.updated_at,
                task_count=task_count,
                completed_tasks=completed_tasks,
                progress_percentage=progress_percentage,
                manager=project.manager,
                members=project.members
            )
            result.append(project_data)
        
        return result
    except Exception as e:
        print(f"Error in read_projects: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=ProjectSchema)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin())
):
    db_project = Project(**project_data.model_dump(exclude={"member_ids"}))
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    if project_data.member_ids:
        members = db.query(User).filter(User.id.in_(project_data.member_ids)).all()
        db_project.members.extend(members)
        db.commit()
    
    return db_project


@router.get("/{project_id}", response_model=ProjectWithDetails)
async def read_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if (current_user.role == UserRole.DEVELOPER and 
        current_user not in db_project.members):
        raise HTTPException(status_code=403, detail="Access denied")
    
    task_count = db.query(Task).filter(Task.project_id == project_id).count()
    completed_tasks = db.query(Task).filter(
        and_(Task.project_id == project_id, Task.status == TaskStatus.DONE)
    ).count()
    
    progress_percentage = (completed_tasks / task_count * 100) if task_count > 0 else 0
    
    return ProjectWithDetails(
        id=db_project.id,
        name=db_project.name,
        description=db_project.description,
        status=db_project.status,
        start_date=db_project.start_date,
        end_date=db_project.end_date,
        manager_id=db_project.manager_id,
        created_at=db_project.created_at,
        updated_at=db_project.updated_at,
        task_count=task_count,
        completed_tasks=completed_tasks,
        progress_percentage=progress_percentage,
        manager=db_project.manager,
        members=db_project.members
    )


@router.put("/{project_id}", response_model=ProjectSchema)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin())
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if (current_user.role == UserRole.PROJECT_MANAGER and 
        db_project.manager_id != current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = project_data.model_dump(exclude_unset=True, exclude={"member_ids"})
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    if project_data.member_ids is not None:
        members = db.query(User).filter(User.id.in_(project_data.member_ids)).all()
        db_project.members = members
    
    db.commit()
    db.refresh(db_project)
    return db_project


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin())
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if (current_user.role == UserRole.PROJECT_MANAGER and 
        db_project.manager_id != current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}