from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.dependencies import get_supabase
from app.middleware.auth import get_current_user
from app.models.schemas import ReviewCreate, ReviewResponse, ReviewUpdate

router = APIRouter()


@router.get("/", response_model=list[ReviewResponse])
async def list_reviews(
    restaurant_id: str = Query(...),
    db: Client = Depends(get_supabase),
):
    result = (
        db.table("reviews")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: str, db: Client = Depends(get_supabase)):
    result = db.table("reviews").select("*").eq("id", review_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return result.data


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    # Verify the booking belongs to user and is completed
    booking = (
        db.table("bookings")
        .select("id, customer_id, status")
        .eq("id", payload.booking_id)
        .single()
        .execute()
    )
    if not booking.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.data["customer_id"] != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if booking.data["status"] != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only review completed bookings",
        )

    data = payload.model_dump()
    data["customer_id"] = current_user["sub"]
    result = db.table("reviews").insert(data).execute()
    return result.data[0]


@router.patch("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    payload: ReviewUpdate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    existing = db.table("reviews").select("customer_id").eq("id", review_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if existing.data["customer_id"] != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    result = (
        db.table("reviews")
        .update(payload.model_dump(exclude_none=True))
        .eq("id", review_id)
        .execute()
    )
    return result.data[0]


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    existing = db.table("reviews").select("customer_id").eq("id", review_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if existing.data["customer_id"] != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    db.table("reviews").delete().eq("id", review_id).execute()
