from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List
import json


class Settings(BaseSettings):
    project_name: str = "Project Management Tool"
    version: str = "1.0.0"
    description: str = "Enterprise Project Management API"
    
    # All sensitive values must be set via environment variables
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"
    
    groq_api_key: Optional[str] = None
    
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse CORS_ORIGINS if it's a string
        if isinstance(self.cors_origins, str):
            try:
                self.cors_origins = json.loads(self.cors_origins)
            except json.JSONDecodeError:
                # Fallback to default
                self.cors_origins = ["http://localhost:3000", "http://localhost:8000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()