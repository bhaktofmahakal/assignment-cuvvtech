from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from ..core.database import Base


class ProjectStatus(str, Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


project_members = Table(
    'project_members',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    status = Column(SQLEnum(ProjectStatus), nullable=False, default=ProjectStatus.PLANNING)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    manager = relationship("User", back_populates="managed_projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    user_stories = relationship("UserStory", back_populates="project", cascade="all, delete-orphan")
    members = relationship("User", secondary=project_members, backref="member_projects")