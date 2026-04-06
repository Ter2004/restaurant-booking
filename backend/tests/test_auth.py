import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from main import app
from app.middleware.auth import get_current_user


def test_protected_route_without_token(client):
    """Accessing /auth/me without a token should return 403 or 401."""
    response = client.get("/auth/me")
    assert response.status_code in (401, 403)


def test_protected_route_with_invalid_token(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert response.status_code == 401


def test_logout_requires_auth(client):
    response = client.post("/auth/logout")
    assert response.status_code in (401, 403)


def test_get_me_returns_profile(client):
    mock_profile = {
        "id": "user-uuid-123",
        "email": "test@example.com",
        "full_name": "Test User",
        "phone": None,
        "role": "customer",
        "avatar_url": None,
        "created_at": "2024-01-01T00:00:00+00:00",
    }

    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = mock_profile

    with patch("app.routers.auth.get_supabase", return_value=mock_db):
        app.dependency_overrides[get_current_user] = lambda: {
            "sub": "user-uuid-123",
            "email": "test@example.com",
        }
        response = client.get("/auth/me")
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
