"""Pydantic schemas for API requests and responses"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CredentialBase(BaseModel):
    software: Optional[str] = None
    host: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    domain: Optional[str] = None
    local_part: Optional[str] = None
    email_domain: Optional[str] = None
    filepath: Optional[str] = None
    stealer_name: Optional[str] = None

class CredentialResponse(CredentialBase):
    id: int
    upload_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class SystemBase(BaseModel):
    machine_id: Optional[str] = None
    computer_name: Optional[str] = None
    hardware_id: Optional[str] = None
    machine_user: Optional[str] = None
    ip_address: Optional[str] = None
    country: Optional[str] = None
    log_date: Optional[str] = None

class SystemResponse(SystemBase):
    id: int
    upload_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class StatisticsResponse(BaseModel):
    total_credentials: int
    total_systems: int
    total_uploads: int
    unique_domains: int
    unique_countries: int
    unique_stealers: int

class DomainStatistic(BaseModel):
    domain: str
    count: int

class CountryStatistic(BaseModel):
    country: str
    count: int

class StealerStatistic(BaseModel):
    stealer_name: str
    count: int
