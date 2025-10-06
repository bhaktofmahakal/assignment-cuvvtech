from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...models.user_story import UserStory
from ...schemas.user_story import UserStoriesResponse, UserStory as UserStorySchema
from ...api.dependencies import get_current_active_user

router = APIRouter()


@router.get("/project/{project_id}", response_model=UserStoriesResponse)
def get_user_stories_by_project(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    user_stories = db.query(UserStory).filter(UserStory.project_id == project_id).offset(skip).limit(limit).all()
    total = db.query(UserStory).filter(UserStory.project_id == project_id).count()
    
    return UserStoriesResponse(user_stories=user_stories, total=total)


@router.get("/{user_story_id}", response_model=UserStorySchema)
def get_user_story(
    user_story_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    user_story = db.query(UserStory).filter(UserStory.id == user_story_id).first()
    if user_story is None:
        raise HTTPException(status_code=404, detail="User story not found")
    return user_story