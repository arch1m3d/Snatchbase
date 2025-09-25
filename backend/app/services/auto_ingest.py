"""
Auto-ingestion service for stealer log data
Automatically ingests JSON files from data directory on startup
Prevents duplicates by checking file hashes
"""
import os
import json
import hashlib
from pathlib import Path
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Credential, System, Upload
from app.database import SessionLocal

class AutoIngestService:
    """Service for automatically ingesting stealer log data"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.logger = None
        
    def set_logger(self, logger):
        """Set logger instance"""
        self.logger = logger
        
    def log(self, message: str, level: str = "info"):
        """Log message"""
        if self.logger:
            getattr(self.logger, level)(message)
        else:
            print(f"[{level.upper()}] {message}")
    
    def get_file_hash(self, file_path: Path) -> str:
        """Get SHA256 hash of file for duplicate detection"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def is_file_already_ingested(self, db: Session, file_path: Path) -> bool:
        """Check if file was already ingested by comparing filename and size"""
        filename = file_path.name
        file_size = file_path.stat().st_size
        
        # Check if we have an upload record with this filename
        existing_upload = db.query(Upload).filter(
            Upload.filename == filename,
            Upload.status == "completed"
        ).first()
        
        if existing_upload:
            self.log(f"File {filename} already ingested (Upload ID: {existing_upload.upload_id})")
            return True
            
        return False
    
    def extract_system_info_from_filepath(self, filepath: str) -> dict:
        """Extract system information from filepath patterns"""
        parts = filepath.split('/')
        system_info = {}
        
        for part in parts:
            if 'TELEGRAM-@VALENCIGA-' in part:
                # Extract machine ID from the telegram folder name
                machine_parts = part.split('-')
                if len(machine_parts) >= 3:
                    system_info['machine_id'] = machine_parts[2]
                    
            # Look for date patterns
            if '_2025_' in part or '_2024_' in part:
                try:
                    # Extract date from pattern like "2025_06_08T12_28_64_400355"
                    date_part = part.split('_')
                    if len(date_part) >= 4:
                        year, month, day = date_part[1], date_part[2], date_part[3].split('T')[0]
                        system_info['log_date'] = f"{year}-{month}-{day}"
                except:
                    pass
        
        return system_info
    
    def ingest_json_file(self, file_path: Path, db: Session) -> tuple:
        """Ingest a single JSON file"""
        self.log(f"Processing: {file_path}")
        
        # Check if already ingested
        if self.is_file_already_ingested(db, file_path):
            return 0, 0
        
        # Load JSON data
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        filename = file_path.name
        systems_data = data.get('systems_data', [])
        
        # Create upload record
        task_id = f"auto_ingest_{filename}_{int(datetime.now().timestamp())}"
        upload = Upload(
            upload_id=task_id,
            filename=filename,
            status="processing"
        )
        db.add(upload)
        db.commit()
        
        credentials_count = 0
        systems_count = 0
        
        try:
            for i, system_entry in enumerate(systems_data):
                system_data = system_entry.get('system')
                credentials_data = system_entry.get('credentials', [])
                
                # Create system record
                system_info = {}
                
                # If we have actual system data, use it
                if system_data and isinstance(system_data, dict):
                    system_info = system_data
                else:
                    # Extract what we can from the first credential's filepath
                    if credentials_data:
                        first_cred = credentials_data[0]
                        filepath = first_cred.get('filepath', '')
                        system_info = self.extract_system_info_from_filepath(filepath)
                
                # Create system record
                system = System(
                    machine_id=system_info.get('machine_id'),
                    computer_name=system_info.get('computer_name'),
                    hardware_id=system_info.get('hardware_id'),
                    machine_user=system_info.get('machine_user'),
                    ip_address=system_info.get('ip_address'),
                    country=system_info.get('country'),
                    log_date=system_info.get('log_date'),
                    upload_id=task_id
                )
                db.add(system)
                systems_count += 1
                
                # Process credentials for this system
                for cred_data in credentials_data:
                    credential = Credential(
                        software=cred_data.get('software'),
                        host=cred_data.get('host'),
                        username=cred_data.get('username'),
                        password=cred_data.get('password'),
                        domain=cred_data.get('domain'),
                        local_part=cred_data.get('local_part'),
                        email_domain=cred_data.get('email_domain'),
                        filepath=cred_data.get('filepath'),
                        stealer_name=cred_data.get('stealer_name'),
                        upload_id=task_id
                    )
                    db.add(credential)
                    credentials_count += 1
                
                # Commit in batches for better performance
                if (i + 1) % 100 == 0:
                    db.commit()
            
            # Final commit
            db.commit()
            
            # Update upload record
            upload.status = "completed"
            upload.credentials_count = credentials_count
            upload.systems_count = systems_count
            db.commit()
            
            self.log(f"Successfully ingested {filename}: {credentials_count} credentials, {systems_count} systems")
            return credentials_count, systems_count
            
        except Exception as e:
            # Update upload status with error
            upload.status = "failed"
            upload.error_message = str(e)
            db.commit()
            self.log(f"Failed to ingest {filename}: {e}", "error")
            raise
    
    def auto_ingest_all(self) -> dict:
        """Auto-ingest all JSON files from data directory"""
        if not self.data_dir.exists():
            self.log(f"Data directory {self.data_dir} does not exist")
            return {"files_processed": 0, "total_credentials": 0, "total_systems": 0}
        
        # Find all JSON files
        json_files = list(self.data_dir.glob("*.json"))
        
        if not json_files:
            self.log("No JSON files found in data directory")
            return {"files_processed": 0, "total_credentials": 0, "total_systems": 0}
        
        self.log(f"Found {len(json_files)} JSON files to process")
        
        db = SessionLocal()
        total_credentials = 0
        total_systems = 0
        files_processed = 0
        
        try:
            for json_file in json_files:
                try:
                    creds, systems = self.ingest_json_file(json_file, db)
                    if creds > 0 or systems > 0:
                        total_credentials += creds
                        total_systems += systems
                        files_processed += 1
                except Exception as e:
                    self.log(f"Error processing {json_file}: {e}", "error")
                    continue
            
            self.log(f"Auto-ingestion completed: {files_processed} files, {total_credentials} credentials, {total_systems} systems")
            
            return {
                "files_processed": files_processed,
                "total_credentials": total_credentials,
                "total_systems": total_systems
            }
            
        finally:
            db.close()

# Global instance
auto_ingest_service = AutoIngestService()
