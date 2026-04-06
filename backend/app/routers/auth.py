from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client

from app.dependencies import get_supabase
from app.middleware.auth import get_current_user
from app.models.schemas import AuthResponse, LoginRequest, ProfileResponse, RegisterRequest

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(request: Request, payload: RegisterRequest, db: Client = Depends(get_supabase)):
    try:
        result = db.auth.sign_up(
            {
                "email": payload.email,
                "password": payload.password,
                "options": {
                    "data": {"full_name": payload.full_name, "role": payload.role}
                },
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if result.user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed")

    return AuthResponse(
        access_token=result.session.access_token if result.session else "",
        user_id=result.user.id,
        email=result.user.email,
        role=payload.role,
    )


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
async def login(request: Request, payload: LoginRequest, db: Client = Depends(get_supabase)):
    try:
        result = db.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        ) from exc

    role = result.user.user_metadata.get("role", "customer") if result.user else "customer"

    return AuthResponse(
        access_token=result.session.access_token,
        user_id=result.user.id,
        email=result.user.email,
        role=role,
    )


@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    db.auth.sign_out()
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=ProfileResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    user_id = current_user.get("sub")
    result = db.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return result.data
