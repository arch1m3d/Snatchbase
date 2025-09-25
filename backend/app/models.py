"""Database models for stealer log data"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Credential(Base):
    """Credential model based on stealer parser output"""
    __tablename__ = "credentials"
    
    id = Column(Integer, primary_key=True, index=True)
    software = Column(String(255), index=True)
    host = Column(Text)
    username = Column(String(500), index=True)
    password = Column(Text)
    domain = Column(String(255), index=True)
    local_part = Column(String(255), index=True)
    email_domain = Column(String(255), index=True)
    filepath = Column(Text)
    stealer_name = Column(String(100), index=True)
    upload_id = Column(String(255), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes for better search performance
    __table_args__ = (
        Index('idx_credential_search', 'domain', 'username', 'software'),
        Index('idx_credential_email', 'email_domain', 'local_part'),
        Index('idx_credential_stealer', 'stealer_name', 'created_at'),
    )

class System(Base):
    """System model based on stealer parser output"""
    __tablename__ = "systems"
    
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String(255), index=True)
    computer_name = Column(String(255), index=True)
    hardware_id = Column(String(255), index=True)
    machine_user = Column(String(255), index=True)
    ip_address = Column(String(45), index=True)  # IPv6 max length
    country = Column(String(10), index=True)
    log_date = Column(String(50))
    upload_id = Column(String(255), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes for better search performance
    __table_args__ = (
        Index('idx_system_search', 'country', 'ip_address', 'computer_name'),
        Index('idx_system_machine', 'machine_id', 'hardware_id'),
        Index('idx_system_location', 'country', 'created_at'),
    )

class Upload(Base):
    """Upload tracking model"""
    __tablename__ = "uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(String(255), unique=True, index=True)
    filename = Column(String(500))
    status = Column(String(50), default="processing")  # processing, completed, failed
    credentials_count = Column(Integer, default=0)
    systems_count = Column(Integer, default=0)
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
