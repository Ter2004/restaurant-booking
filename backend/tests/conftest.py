import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def mock_supabase():
    with patch("app.dependencies.get_supabase") as mock:
        yield mock()


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
