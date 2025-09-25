"""
Snatchbase - Stealer Log Aggregator API
A modern stealer log search engine and aggregator
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db, engine
from app.models import Base
from app.schemas import CredentialResponse, SystemResponse
from app.services.search_service import SearchService
from app.services.auto_ingest import auto_ingest_service

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Snatchbase API",
    description="Stealer Log Aggregator and Search Engine",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=False,  # Must be False when allow_origins is "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

search_service = SearchService()

@app.on_event("startup")
async def startup_event():
    """Startup event - auto-ingest data files"""
    import logging
    
    # Set up logger for auto-ingest service
    logger = logging.getLogger("AutoIngest")
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    auto_ingest_service.set_logger(logger)
    
    # Run auto-ingestion
    logger.info("🚀 Starting auto-ingestion of data files...")
    try:
        result = auto_ingest_service.auto_ingest_all()
        if result["files_processed"] > 0:
            logger.info(f"✅ Auto-ingestion completed: {result['files_processed']} files, {result['total_credentials']} credentials, {result['total_systems']} systems")
        else:
            logger.info("ℹ️ No new files to ingest")
    except Exception as e:
        logger.error(f"❌ Auto-ingestion failed: {e}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Snatchbase API - Stealer Log Aggregator"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "snatchbase-api"}


@app.get("/search/credentials")
async def search_credentials(
    q: Optional[str] = None,
    domain: Optional[str] = None,
    username: Optional[str] = None,
    software: Optional[str] = None,
    stealer_name: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Search credentials with filters"""
    
    results, total = search_service.search_credentials_with_count(
        db=db,
        query=q,
        domain=domain,
        username=username,
        software=software,
        stealer_name=stealer_name,
        limit=limit,
        offset=offset
    )
    
    return {
        "results": results,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@app.get("/search/systems")
async def search_systems(
    q: Optional[str] = None,
    country: Optional[str] = None,
    ip_address: Optional[str] = None,
    computer_name: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Search systems with filters"""
    
    results, total = search_service.search_systems_with_count(
        db=db,
        query=q,
        country=country,
        ip_address=ip_address,
        computer_name=computer_name,
        limit=limit,
        offset=offset
    )
    
    return {
        "results": results,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@app.get("/stats")
async def get_statistics(db: Session = Depends(get_db)):
    """Get database statistics"""
    return search_service.get_statistics(db)

@app.get("/stats/domains")
async def get_domain_stats(limit: int = 20, db: Session = Depends(get_db)):
    """Get top domains statistics"""
    return search_service.get_domain_statistics(db, limit)

@app.get("/stats/countries")
async def get_country_stats(limit: int = 20, db: Session = Depends(get_db)):
    """Get country statistics"""
    return search_service.get_country_statistics(db, limit)

@app.get("/stats/stealers")
async def get_stealer_stats(limit: int = 20, db: Session = Depends(get_db)):
    """Get stealer statistics"""
    return search_service.get_stealer_statistics(db, limit)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
