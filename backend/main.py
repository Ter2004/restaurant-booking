from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.routers import auth, restaurants, tables, bookings, reviews

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Restaurant Booking API",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,        prefix="/auth",        tags=["auth"])
app.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])
app.include_router(tables.router,      prefix="/tables",      tags=["tables"])
app.include_router(bookings.router,    prefix="/bookings",    tags=["bookings"])
app.include_router(reviews.router,     prefix="/reviews",     tags=["reviews"])


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "version": "1.1.0"}
