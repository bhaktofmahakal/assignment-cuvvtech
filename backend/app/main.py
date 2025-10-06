from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.v1 import api_router

app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description=settings.description,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Project Management Tool API",
        "version": settings.version,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}