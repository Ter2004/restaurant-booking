from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.dependencies import get_supabase
from app.middleware.auth import get_current_user
from app.models.schemas import BookingCreate, BookingResponse, BookingUpdate

router = APIRouter()


def _check_conflict(
    db: Client,
    table_id: str,
    booking_date: str,
    start_time: str,
    end_time: str,
    exclude_id: str | None = None,
) -> None:
    """Raise 409 if another active booking overlaps the requested slot."""
    query = (
        db.table("bookings")
        .select("id")
        .eq("table_id", table_id)
        .eq("booking_date", booking_date)
        .not_.in_("status", ["cancelled"])
        # overlap: existing.start < new.end AND existing.end > new.start
        .lt("start_time", end_time)
        .gt("end_time", start_time)
    )
    if exclude_id:
        query = query.neq("id", exclude_id)

    result = query.execute()
    if result.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Table is already booked for the requested time slot",
        )


@router.get("/", response_model=list[BookingResponse])
async def list_bookings(
    restaurant_id: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    query = db.table("bookings").select("*").eq("customer_id", current_user["sub"])
    if restaurant_id:
        query = query.eq("restaurant_id", restaurant_id)
    if status_filter:
        query = query.eq("status", status_filter)
    result = query.order("booking_date", desc=True).execute()
    return result.data


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    result = db.table("bookings").select("*").eq("id", booking_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking = result.data
    if booking["customer_id"] != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return booking


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    _check_conflict(
        db,
        payload.table_id,
        str(payload.booking_date),
        payload.start_time,
        payload.end_time,
    )

    data = payload.model_dump()
    data["customer_id"] = current_user["sub"]
    data["booking_date"] = str(data["booking_date"])
    result = db.table("bookings").insert(data).execute()
    return result.data[0]


@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: str,
    payload: BookingUpdate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    existing = db.table("bookings").select("*").eq("id", booking_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking = existing.data
    if booking["customer_id"] != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if booking["status"] in ("completed", "cancelled"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot modify a {booking['status']} booking",
        )

    updates = payload.model_dump(exclude_none=True)

    # Re-check conflict if time/date is changing
    new_date = str(updates.get("booking_date", booking["booking_date"]))
    new_start = updates.get("start_time", booking["start_time"])
    new_end = updates.get("end_time", booking["end_time"])
    if any(k in updates for k in ("booking_date", "start_time", "end_time", "table_id")):
        _check_conflict(
            db,
            updates.get("table_id", booking["table_id"]),
            new_date,
            new_start,
            new_end,
            exclude_id=booking_id,
        )

    if "booking_date" in updates:
        updates["booking_date"] = str(updates["booking_date"])

    result = db.table("bookings").update(updates).eq("id", booking_id).execute()
    return result.data[0]


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    existing = db.table("bookings").select("*").eq("id", booking_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if existing.data["customer_id"] != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    db.table("bookings").update({"status": "cancelled"}).eq("id", booking_id).execute()
