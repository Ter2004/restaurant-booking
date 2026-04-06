from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, restaurants, tables, bookings, reviews

app = FastAPI(
    title="Restaurant Booking API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
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
    return {"status": "ok", "version": "1.0.0"}
