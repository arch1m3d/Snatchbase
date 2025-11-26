"""
Devices Router
Handles device listing, details, and related data endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.services.search_service import SearchService
from app.schemas import CredentialResponse
from app.models import Device, Credential, File, Software

router = APIRouter()
search_service = SearchService()


@router.get("/devices")
async def list_devices(
    q: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=1000, description="Number of results to return (max 1000)"),
    offset: int = Query(default=0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db)
):
    """List all devices with optional search"""
    devices, total = search_service.search_devices(db, query=q, limit=limit, offset=offset)
    
    return {
        "results": [
            {
                "id": d.id,
                "device_id": d.device_id,
                "device_name": d.device_name,
                "hostname": d.hostname,
                "ip_address": d.ip_address,
                "country": d.country,
                "antivirus": d.antivirus,
                "infection_date": d.infection_date,
                "upload_batch": d.upload_batch,
                "total_files": d.total_files,
                "total_credentials": d.total_credentials,
                "total_domains": d.total_domains,
                "total_urls": d.total_urls,
                "created_at": d.created_at,
            }
            for d in devices
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/devices/{device_id}")
async def get_device(device_id: int, db: Session = Depends(get_db)):
    """Get device details by numeric ID"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return {
        "id": device.id,
        "device_id": device.device_id,
        "device_name": device.device_name,
        "hostname": device.hostname,
        "ip_address": device.ip_address,
        "country": device.country,
        "language": device.language,
        "os_version": device.os_version,
        "username": device.username,
        "infection_date": device.infection_date,
        "antivirus": device.antivirus,
        "hwid": device.hwid,
        "upload_batch": device.upload_batch,
        "total_files": device.total_files,
        "total_credentials": device.total_credentials,
        "total_domains": device.total_domains,
        "total_urls": device.total_urls,
        "upload_date": device.upload_date,
        "created_at": device.created_at,
    }


@router.get("/devices/{device_id}/credentials")
async def get_device_credentials(
    device_id: int,
    limit: int = Query(default=100, ge=1, le=1000, description="Number of results to return (max 1000)"),
    offset: int = Query(default=0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db)
):
    """Get credentials for a specific device by numeric ID"""
    # Check if device exists and get its device_id string
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Use cached count from device model (MUCH faster than query.count())
    total = device.total_credentials

    # Get credentials using the device_id string
    credentials = db.query(Credential).filter(
        Credential.device_id == device.device_id
    ).order_by(Credential.created_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "results": [CredentialResponse.from_orm(c) for c in credentials],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/devices/{device_id}/files")
async def get_device_files(
    device_id: int,
    limit: int = Query(default=100, ge=1, le=10000, description="Number of results to return (max 10000)"),
    offset: int = Query(default=0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db)
):
    """Get file tree for a specific device by numeric ID"""
    # Check if device exists and get its device_id string
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Use cached count from device model (MUCH faster than query.count())
    total = device.total_files

    # Get files using the device_id string
    files = db.query(File).filter(
        File.device_id == device.device_id
    ).offset(offset).limit(limit).all()
    
    return {
        "results": [
            {
                "id": f.id,
                "file_path": f.file_path,
                "file_name": f.file_name,
                "parent_path": f.parent_path,
                "is_directory": f.is_directory,
                "file_size": f.file_size,
                "has_content": f.content is not None,
            }
            for f in files
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/devices/{device_id}/software")
async def get_device_software(
    device_id: int,
    limit: int = Query(default=100, ge=1, le=1000, description="Number of results to return (max 1000)"),
    offset: int = Query(default=0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db)
):
    """Get installed software for a specific device by numeric ID"""
    # Check if device exists and get its device_id string
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Get software count
    total = db.query(Software).filter(Software.device_id == device.device_id).count()

    # Get software (limit results)
    software = db.query(Software).filter(
        Software.device_id == device.device_id
    ).offset(offset).limit(limit).all()

    return {
        "results": [
            {
                "id": s.id,
                "software_name": s.software_name,
                "version": s.version,
                "source_file": s.source_file,
            }
            for s in software
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/devices/{device_id}/password-stats")
async def get_device_password_stats(
    device_id: int,
    limit: int = Query(default=20, ge=1, le=100, description="Number of top passwords to return"),
    db: Session = Depends(get_db)
):
    """Get password statistics for a specific device by numeric ID"""
    from app.models import PasswordStat
    from sqlalchemy import desc

    # Check if device exists and get its device_id string
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Get top passwords for this device
    password_stats = db.query(PasswordStat).filter(
        PasswordStat.device_id == device.device_id
    ).order_by(desc(PasswordStat.count)).limit(limit).all()

    # Calculate totals
    total_passwords = sum(ps.count for ps in password_stats)
    unique_passwords = len(password_stats)

    return {
        "total_passwords": total_passwords,
        "unique_passwords": unique_passwords,
        "top_passwords": [
            {
                "password": ps.password,
                "count": ps.count
            }
            for ps in password_stats
        ]
    }
