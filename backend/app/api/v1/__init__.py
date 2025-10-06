from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .projects import router as projects_router
from .tasks import router as tasks_router
from .ai import router as ai_router
from .dashboard import router as dashboard_router
from .user_stories import router as user_stories_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_router.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
api_router.include_router(ai_router, prefix="/ai", tags=["ai"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(user_stories_router, prefix="/user-stories", tags=["user-stories"])