from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ── Auth ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)
    role: str = Field(default="customer", pattern="^(customer|owner)$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str


# ── Profile ───────────────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    role: str
    avatar_url: Optional[str]
    created_at: datetime


# ── Restaurant ────────────────────────────────────────────────────────────────

class RestaurantCreate(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = None
    cuisine_type: str
    address: str
    city: str
    phone: Optional[str] = None
    email: Optional[str] = None
    image_url: Optional[str] = None
    capacity: int = Field(ge=1)
    opening_time: str = "09:00"
    closing_time: str = "22:00"
    open_days: list[str] = Field(
        default=["monday", "tuesday", "wednesday", "thursday", "friday"]
    )


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cuisine_type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    image_url: Optional[str] = None
    capacity: Optional[int] = Field(default=None, ge=1)
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    open_days: Optional[list[str]] = None
    is_active: Optional[bool] = None


class RestaurantResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    description: Optional[str]
    cuisine_type: str
    address: str
    city: str
    phone: Optional[str]
    email: Optional[str]
    image_url: Optional[str]
    capacity: int
    opening_time: str
    closing_time: str
    open_days: list[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ── Table ─────────────────────────────────────────────────────────────────────

class TableCreate(BaseModel):
    restaurant_id: str
    table_number: int = Field(ge=1)
    seats: int = Field(ge=1)
    zone: str = Field(default="main", pattern="^(main|outdoor|private|bar)$")


class TableUpdate(BaseModel):
    table_number: Optional[int] = Field(default=None, ge=1)
    seats: Optional[int] = Field(default=None, ge=1)
    zone: Optional[str] = Field(default=None, pattern="^(main|outdoor|private|bar)$")
    is_available: Optional[bool] = None


class TableResponse(BaseModel):
    id: str
    restaurant_id: str
    table_number: int
    seats: int
    zone: str
    is_available: bool
    created_at: datetime
    updated_at: datetime


# ── Booking ───────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    restaurant_id: str
    table_id: str
    booking_date: date
    start_time: str  # "HH:MM"
    end_time: str    # "HH:MM"
    party_size: int = Field(ge=1)
    special_requests: Optional[str] = None


class BookingUpdate(BaseModel):
    booking_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    party_size: Optional[int] = Field(default=None, ge=1)
    special_requests: Optional[str] = None
    status: Optional[str] = Field(
        default=None,
        pattern="^(pending|confirmed|completed|cancelled)$"
    )


class BookingResponse(BaseModel):
    id: str
    customer_id: str
    restaurant_id: str
    table_id: str
    booking_date: date
    start_time: str
    end_time: str
    party_size: int
    status: str
    special_requests: Optional[str]
    created_at: datetime
    updated_at: datetime


# ── Review ────────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    booking_id: str
    restaurant_id: str
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    body: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    title: Optional[str] = None
    body: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    booking_id: str
    customer_id: str
    restaurant_id: str
    rating: int
    title: Optional[str]
    body: Optional[str]
    created_at: datetime
    updated_at: datetime
