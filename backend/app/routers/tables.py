from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.dependencies import get_supabase
from app.middleware.auth import get_current_user, require_owner
from app.models.schemas import TableCreate, TableResponse, TableUpdate

router = APIRouter()


def _assert_owns_restaurant(db: Client, restaurant_id: str, owner_id: str) -> None:
    result = db.table("restaurants").select("owner_id").eq("id", restaurant_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    if result.data["owner_id"] != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your restaurant")


@router.get("/", response_model=list[TableResponse])
async def list_tables(
    restaurant_id: str = Query(...),
    db: Client = Depends(get_supabase),
):
    result = (
        db.table("tables").select("*").eq("restaurant_id", restaurant_id).execute()
    )
    return result.data


@router.get("/{table_id}", response_model=TableResponse)
async def get_table(table_id: str, db: Client = Depends(get_supabase)):
    result = db.table("tables").select("*").eq("id", table_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    return result.data


@router.post("/", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
async def create_table(
    payload: TableCreate,
    current_user: dict = Depends(require_owner),
    db: Client = Depends(get_supabase),
):
    _assert_owns_restaurant(db, payload.restaurant_id, current_user["sub"])
    result = db.table("tables").insert(payload.model_dump()).execute()
    return result.data[0]


@router.patch("/{table_id}", response_model=TableResponse)
async def update_table(
    table_id: str,
    payload: TableUpdate,
    current_user: dict = Depends(require_owner),
    db: Client = Depends(get_supabase),
):
    table = db.table("tables").select("restaurant_id").eq("id", table_id).single().execute()
    if not table.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    _assert_owns_restaurant(db, table.data["restaurant_id"], current_user["sub"])

    result = (
        db.table("tables")
        .update(payload.model_dump(exclude_none=True))
        .eq("id", table_id)
        .execute()
    )
    return result.data[0]


@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_table(
    table_id: str,
    current_user: dict = Depends(require_owner),
    db: Client = Depends(get_supabase),
):
    table = db.table("tables").select("restaurant_id").eq("id", table_id).single().execute()
    if not table.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    _assert_owns_restaurant(db, table.data["restaurant_id"], current_user["sub"])
    db.table("tables").delete().eq("id", table_id).execute()
