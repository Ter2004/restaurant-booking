from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client

from app.dependencies import get_supabase
from app.middleware.auth import require_owner
from app.models.schemas import RestaurantCreate, RestaurantResponse, RestaurantUpdate

router = APIRouter()


@router.get("/", response_model=list[RestaurantResponse])
async def list_restaurants(
    city: str | None = Query(default=None),
    cuisine: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Client = Depends(get_supabase),
):
    query = db.table("restaurants").select("*").eq("is_active", True)
    if city:
        query = query.ilike("city", f"%{city}%")
    if cuisine:
        query = query.ilike("cuisine_type", f"%{cuisine}%")
    result = query.range(skip, skip + limit - 1).execute()
    return result.data


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(restaurant_id: str, db: Client = Depends(get_supabase)):
    result = db.table("restaurants").select("*").eq("id", restaurant_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    return result.data


@router.post("/", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def create_restaurant(
    payload: RestaurantCreate,
    current_user: dict = Depends(require_owner),
    db: Client = Depends(get_supabase),
):
    data = payload.model_dump()
    data["owner_id"] = current_user["sub"]
    result = db.table("restaurants").insert(data).execute()
    return result.data[0]


@router.patch("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: str,
    payload: RestaurantUpdate,
    current_user: dict = Depends(require_owner),
    db: Client = Depends(get_supabase),
):
    existing = db.table("restaurants").select("owner_id").eq("id", restaurant_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    if existing.data["owner_id"] != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your restaurant")

    updates = payload.model_dump(exclude_none=True)
    result = db.table("restaurants").update(updates).eq("id", restaurant_id).execute()
    return result.data[0]


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_restaurant(
    restaurant_id: str,
    current_user: dict = Depends(require_owner),
    db: Client = Depends(get_supabase),
):
    existing = db.table("restaurants").select("owner_id").eq("id", restaurant_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    if existing.data["owner_id"] != current_user["sub"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your restaurant")

    db.table("restaurants").update({"is_active": False}).eq("id", restaurant_id).execute()
