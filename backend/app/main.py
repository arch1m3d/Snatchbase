"""
Snatchbase - Stealer Log Aggregator API
A modern stealer log search engine and aggregator

Simplified main application file - routes are modularized
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import logging
import os

from app.database import engine
from app.models import Base
from app.middleware import RateLimitMiddleware

# Import routers
from app.routers import wallets, credentials, devices, statistics, files, credit_cards

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Snatchbase API",
    description="Stealer Log Aggregator and Search Engine",
    version="2.0.0"
)

# CORS middleware - secure configuration
# Allow specific origins from environment variable or default to localhost for development
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Rate limiting middleware (100 requests/minute, 10 requests/second per IP)
app.add_middleware(RateLimitMiddleware, requests_per_minute=100, requests_per_second=10)

# Include routers
app.include_router(credentials.router, prefix="/api", tags=["credentials"])
app.include_router(devices.router, prefix="/api", tags=["devices"])
app.include_router(statistics.router, prefix="/api", tags=["statistics"])
app.include_router(files.router, prefix="/api", tags=["files"])
app.include_router(wallets.router, prefix="/api", tags=["wallets"])
app.include_router(credit_cards.router, prefix="/api", tags=["credit-cards"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Snatchbase API - Stealer Log Aggregator"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "snatchbase-api"}


# File watcher is now handled by separate service
# See: launcher/file_watcher_service.py


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
