# tests/conftest.py — shared pytest fixtures for Fleet Manager backend tests
#
# Uses an in-memory SQLite database (each test gets a clean slate).
# TestClient from httpx wraps the FastAPI app for synchronous integration tests.

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.database import get_db
from app.main import app
from app.rate_limit import limiter  # disable during tests to avoid 429 errors

# ─── In-memory SQLite (isolated per test session) ─────────────────────────────
TEST_DATABASE_URL = "sqlite://"   # :memory:

engine_test = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine_test
)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    """Create all tables once for the entire test session."""
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture(autouse=True)
def disable_rate_limiting():
    """Disable slowapi rate limiting for all tests to prevent 429 cross-test pollution."""
    original = limiter.enabled
    limiter.enabled = False
    yield
    limiter.enabled = original


@pytest.fixture
def db_session():
    """Return a clean DB session; roll back after every test."""
    connection = engine_test.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    """Return an httpx TestClient that uses the test DB session."""
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_admin_token(client) -> str:
    """Login as admin and return 'Bearer <token>' header value."""
    resp = client.post("/api/auth/login", json={"username": "admin", "password": "fleet2024"})
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return f"Bearer {resp.json()['access_token']}"


def get_viewer_token(client) -> str:
    """Login as viewer and return 'Bearer <token>' header value."""
    resp = client.post("/api/auth/login", json={"username": "viewer", "password": "viewer123"})
    assert resp.status_code == 200, f"Viewer login failed: {resp.text}"
    return f"Bearer {resp.json()['access_token']}"


def create_test_vehicle(client, auth_header: str, overrides: dict = None) -> dict:
    """Helper: POST a vehicle and return the created object."""
    payload = {
        "name": "Test Truck",
        "license_plate": "TEST-001",
        "model": "Ford Transit",
        "status": "active",
    }
    if overrides:
        payload.update(overrides)
    resp = client.post("/api/vehicles/", json=payload, headers={"Authorization": auth_header})
    assert resp.status_code == 201, f"create_test_vehicle failed: {resp.text}"
    return resp.json()
