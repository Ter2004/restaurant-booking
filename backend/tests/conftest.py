import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from main import app
from app.dependencies import get_supabase


@pytest.fixture
def client():
    mock_db = MagicMock()
    app.dependency_overrides[get_supabase] = lambda: mock_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def mock_supabase():
    mock_db = MagicMock()
    app.dependency_overrides[get_supabase] = lambda: mock_db
    yield mock_db
    app.dependency_overrides.pop(get_supabase, None)


SAMPLE_JWT_PAYLOAD = {
    "sub": "user-uuid-123",
    "email": "test@example.com",
    "user_metadata": {"role": "customer"},
    "exp": 9999999999,
}

OWNER_JWT_PAYLOAD = {
    "sub": "owner-uuid-456",
    "email": "owner@example.com",
    "user_metadata": {"role": "owner"},
    "exp": 9999999999,
}
