from unittest.mock import MagicMock

from main import app
from app.dependencies import get_supabase
from app.middleware.auth import get_current_user, require_owner

MOCK_OWNER = {"sub": "owner-uuid-456", "email": "owner@example.com", "user_metadata": {"role": "owner"}}

MOCK_RESTAURANT = {
    "id": "rest-uuid-001",
    "owner_id": "owner-uuid-456",
    "name": "Test Restaurant",
    "description": "A test restaurant",
    "cuisine_type": "Thai",
    "city": "Bangkok",
    "address": "123 Test St",
    "phone": "0812345678",
    "email": "rest@example.com",
    "image_url": None,
    "capacity": 50,
    "opening_time": "10:00",
    "closing_time": "22:00",
    "open_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "is_active": True,
    "created_at": "2025-01-01T00:00:00+00:00",
    "updated_at": "2025-01-01T00:00:00+00:00",
}


def test_list_restaurants_public(client):
    """Anyone can list restaurants without auth."""
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.range.return_value.execute.return_value.data = [MOCK_RESTAURANT]

    app.dependency_overrides[get_supabase] = lambda: mock_db
    response = client.get("/restaurants/")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_restaurant_not_found(client):
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = None

    app.dependency_overrides[get_supabase] = lambda: mock_db
    response = client.get("/restaurants/nonexistent-id")
    app.dependency_overrides.clear()

    assert response.status_code == 404


def test_create_restaurant_requires_owner(client):
    """Customers cannot create restaurants."""
    customer = {"sub": "user-uuid-123", "email": "user@example.com", "user_metadata": {"role": "customer"}}

    app.dependency_overrides[get_current_user] = lambda: customer
    response = client.post("/restaurants/", json={"name": "New Place"})
    app.dependency_overrides.clear()

    assert response.status_code in (401, 403)


def test_create_restaurant_success(client):
    mock_db = MagicMock()
    mock_db.table.return_value.insert.return_value.execute.return_value.data = [MOCK_RESTAURANT]

    app.dependency_overrides[get_supabase] = lambda: mock_db
    app.dependency_overrides[require_owner] = lambda: MOCK_OWNER
    response = client.post(
        "/restaurants/",
        json={
            "name": "Test Restaurant",
            "description": "A test restaurant",
            "cuisine_type": "Thai",
            "city": "Bangkok",
            "address": "123 Test St",
            "phone": "0812345678",
            "email": "rest@example.com",
            "capacity": 50,
            "opening_time": "10:00",
            "closing_time": "22:00",
        },
    )
    app.dependency_overrides.clear()

    assert response.status_code == 201


def test_update_restaurant_wrong_owner(client):
    """Owner cannot update another owner's restaurant."""
    other_restaurant = {**MOCK_RESTAURANT, "owner_id": "other-owner-uuid"}
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = other_restaurant

    app.dependency_overrides[get_supabase] = lambda: mock_db
    app.dependency_overrides[require_owner] = lambda: MOCK_OWNER
    response = client.patch("/restaurants/rest-uuid-001", json={"name": "Hacked Name"})
    app.dependency_overrides.clear()

    assert response.status_code == 403


def test_delete_restaurant_success(client):
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = MOCK_RESTAURANT
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
        {**MOCK_RESTAURANT, "is_active": False}
    ]

    app.dependency_overrides[get_supabase] = lambda: mock_db
    app.dependency_overrides[require_owner] = lambda: MOCK_OWNER
    response = client.delete("/restaurants/rest-uuid-001")
    app.dependency_overrides.clear()

    assert response.status_code == 204
