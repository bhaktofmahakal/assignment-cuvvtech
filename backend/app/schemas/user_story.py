from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserStoryBase(BaseModel):
    title: str
    description: str
    acceptance_criteria: Optional[str] = None


class UserStoryCreate(UserStoryBase):
    project_id: int


class UserStoryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    acceptance_criteria: Optional[str] = None


class UserStory(UserStoryBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GenerateUserStoriesRequest(BaseModel):
    project_description: str
    project_id: int


class UserStoriesResponse(BaseModel):
    user_stories: List[UserStory]
    total: int


class GenerateUserStoriesResponse(BaseModel):
    user_stories: List[str]
    generated_stories: List[UserStory]