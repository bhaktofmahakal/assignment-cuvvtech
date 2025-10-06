import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.project import Project, ProjectStatus
from app.models.task import Task, TaskStatus, TaskPriority
from app.core.database import Base


def create_initial_data():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        admin_user = User(
            username="admin",
            email="admin@projectmgmt.com",
            full_name="System Administrator",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        
        manager_user = User(
            username="john_manager",
            email="john@projectmgmt.com",
            full_name="John Smith",
            hashed_password=get_password_hash("manager123"),
            role=UserRole.PROJECT_MANAGER,
            is_active=True
        )
        db.add(manager_user)
        
        dev_user1 = User(
            username="alice_dev",
            email="alice@projectmgmt.com",
            full_name="Alice Johnson",
            hashed_password=get_password_hash("dev123"),
            role=UserRole.DEVELOPER,
            is_active=True
        )
        db.add(dev_user1)
        
        dev_user2 = User(
            username="bob_dev",
            email="bob@projectmgmt.com",
            full_name="Bob Wilson",
            hashed_password=get_password_hash("dev123"),
            role=UserRole.DEVELOPER,
            is_active=True
        )
        db.add(dev_user2)
        
        db.commit()
        
        sample_project = Project(
            name="E-commerce Platform",
            description="A modern e-commerce platform with advanced features",
            status=ProjectStatus.IN_PROGRESS,
            manager_id=manager_user.id
        )
        db.add(sample_project)
        db.commit()
        
        sample_project.members.extend([dev_user1, dev_user2])
        db.commit()
        
        task1 = Task(
            title="Design user authentication system",
            description="Implement secure login and registration functionality",
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.HIGH,
            project_id=sample_project.id,
            assignee_id=dev_user1.id
        )
        db.add(task1)
        
        task2 = Task(
            title="Create product catalog API",
            description="Build RESTful API for product management",
            status=TaskStatus.TODO,
            priority=TaskPriority.MEDIUM,
            project_id=sample_project.id,
            assignee_id=dev_user2.id
        )
        db.add(task2)
        
        task3 = Task(
            title="Setup CI/CD pipeline",
            description="Configure automated testing and deployment",
            status=TaskStatus.DONE,
            priority=TaskPriority.HIGH,
            project_id=sample_project.id,
            assignee_id=dev_user1.id
        )
        db.add(task3)
        
        db.commit()
        
        print("Initial data created successfully!")
        print("\nLogin credentials:")
        print("Admin: admin / admin123")
        print("Manager: john_manager / manager123")
        print("Developer 1: alice_dev / dev123")
        print("Developer 2: bob_dev / dev123")
        
    except Exception as e:
        print(f"Error creating initial data: {e}")
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    create_initial_data()