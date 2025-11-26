"""Database configuration and session management"""
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

# Database URL - PostgreSQL only
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/snatchbase"
)

# PostgreSQL engine with connection pooling (with monitoring and timeout)
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_timeout=30,  # Timeout for getting connection from pool
    echo_pool=False,  # Set to True to debug pool issues
)

# Connection pool event listeners for monitoring
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Log when a new connection is created"""
    logger.debug("Database connection created")

@event.listens_for(engine, "close")
def receive_close(dbapi_conn, connection_record):
    """Log when a connection is closed"""
    logger.debug("Database connection closed")

@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    """Log when connection is returned to pool"""
    logger.debug("Connection returned to pool")

@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    """Log when connection is retrieved from pool"""
    pool = engine.pool
    logger.debug(
        f"Connection checked out from pool. "
        f"Pool size: {pool.size()}, Connections in pool: {pool.checkedin()}, "
        f"Current overflow: {pool.overflow()}, Current checked out: {pool.checkedout()}"
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
