from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import groq
from ...core.database import get_db
from ...core.config import settings
from ...models.user import User
from ...models.user_story import UserStory
from ...schemas.user_story import GenerateUserStoriesRequest, GenerateUserStoriesResponse
from ...api.dependencies import get_current_active_user, require_manager_or_admin

router = APIRouter()


async def generate_user_stories_with_groq(project_description: str) -> List[str]:
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=400, 
            detail="GROQ API key not configured"
        )
    
    client = groq.Groq(api_key=settings.groq_api_key)
    
    prompt = f"""
    Generate detailed user stories for the following project description. 
    Each user story should follow the format: "As a [role], I want to [action], so that [benefit]."
    
    Project Description: {project_description}
    
    Please provide 5-10 user stories that cover the main functionality and user types for this project.
    Return only the user stories, one per line, without numbering or additional formatting.
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=1000,
        )
        
        response_text = completion.choices[0].message.content.strip()
        user_stories = [story.strip() for story in response_text.split('\n') if story.strip()]
        
        return user_stories
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating user stories: {str(e)}"
        )


@router.post("/generate-user-stories", response_model=GenerateUserStoriesResponse)
async def generate_user_stories(
    request: GenerateUserStoriesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin())
):
    user_stories = await generate_user_stories_with_groq(request.project_description)
    
    generated_stories = []
    for story_text in user_stories:
        if len(story_text) > 20:
            parts = story_text.split(", so that ")
            title = parts[0] if len(parts) > 0 else story_text[:100]
            description = story_text
            acceptance_criteria = parts[1] if len(parts) > 1 else None
            
            db_story = UserStory(
                title=title[:200],
                description=description,
                acceptance_criteria=acceptance_criteria,
                project_id=request.project_id
            )
            
            db.add(db_story)
            generated_stories.append(db_story)
    
    db.commit()
    
    for story in generated_stories:
        db.refresh(story)
    
    return GenerateUserStoriesResponse(
        user_stories=user_stories,
        generated_stories=generated_stories
    )