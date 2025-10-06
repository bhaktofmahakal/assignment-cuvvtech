import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import get_db, Base
from app.models.user import User, UserRole
from app.core.security import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture
def test_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user(test_db):
    user = User(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        hashed_password=get_password_hash("testpass"),
        role=UserRole.DEVELOPER,
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    response = client.post("/api/v1/auth/login", json={
        "username": "testuser",
        "password": "testpass"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_login(test_user):
    response = client.post("/api/v1/auth/login", json={
        "username": "testuser",
        "password": "testpass"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_invalid_credentials():
    response = client.post("/api/v1/auth/login", json={
        "username": "nonexistent",
        "password": "wrongpass"
    })
    assert response.status_code == 401


def test_get_current_user(auth_headers):
    response = client.get("/api/v1/users/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"


def test_get_current_user_unauthorized():
    response = client.get("/api/v1/users/me")
    assert response.status_code == 403


def test_dashboard_stats(auth_headers):
    response = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert response.status_code == 200
    assert "overview" in response.json()
    assert "task_distribution" in response.json()


def test_projects_endpoint(auth_headers):
    response = client.get("/api/v1/projects/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_tasks_endpoint(auth_headers):
    response = client.get("/api/v1/tasks/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)