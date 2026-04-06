from unittest.mock import MagicMock

from main import app
from app.dependencies import get_supabase
from app.middleware.auth import get_current_user


MOCK_USER = {"sub": "user-uuid-123", "email": "test@example.com", "user_metadata": {"role": "customer"}}

MOCK_BOOKING = {
    "id": "booking-uuid-001",
    "customer_id": "user-uuid-123",
    "restaurant_id": "rest-uuid-001",
    "table_id": "table-uuid-001",
    "booking_date": "2025-06-15",
    "start_time": "19:00",
    "end_time": "21:00",
    "party_size": 2,
    "status": "pending",
    "special_requests": None,
    "created_at": "2025-01-01T00:00:00+00:00",
    "updated_at": "2025-01-01T00:00:00+00:00",
}


def test_create_booking_requires_auth(client):
    response = client.post("/bookings/", json={})
    assert response.status_code in (401, 403)


def test_list_bookings_requires_auth(client):
    response = client.get("/bookings/")
    assert response.status_code in (401, 403)


def test_create_booking_success(client):
    mock_db = MagicMock()
    # No conflict
    mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value.not_.in_.return_value.lt.return_value.gt.return_value.execute.return_value.data = []
    # Insert returns booking
    mock_db.table.return_value.insert.return_value.execute.return_value.data = [MOCK_BOOKING]

    app.dependency_overrides[get_supabase] = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER
    response = client.post(
        "/bookings/",
        json={
            "restaurant_id": "rest-uuid-001",
            "table_id": "table-uuid-001",
            "booking_date": "2025-06-15",
            "start_time": "19:00",
            "end_time": "21:00",
            "party_size": 2,
        },
    )
    app.dependency_overrides.clear()

    assert response.status_code == 201


def test_cancel_booking_success(client):
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = MOCK_BOOKING
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
        {**MOCK_BOOKING, "status": "cancelled"}
    ]

    app.dependency_overrides[get_supabase] = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER
    response = client.delete("/bookings/booking-uuid-001")
    app.dependency_overrides.clear()

    assert response.status_code == 204


def test_cancel_booking_wrong_user(client):
    other_user_booking = {**MOCK_BOOKING, "customer_id": "other-user-uuid"}
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = other_user_booking

    app.dependency_overrides[get_supabase] = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER
    response = client.delete("/bookings/booking-uuid-001")
    app.dependency_overrides.clear()

    assert response.status_code == 403
