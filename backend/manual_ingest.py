#!/usr/bin/env python3
"""
Manual ingestion script - process all ZIPs in uploads directory
"""
import sys
from pathlib import Path
from sqlalchemy.orm import Session

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.services.zip_ingestion import ZipIngestionService
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Manually ingest all ZIP and RAR files in uploads directory"""
    uploads_dir = Path(__file__).parent / "data" / "incoming" / "uploads"

    if not uploads_dir.exists():
        logger.error(f"❌ Uploads directory not found: {uploads_dir}")
        sys.exit(1)

    # Find all ZIP and RAR files
    zip_files = list(uploads_dir.glob("*.zip"))
    rar_files = list(uploads_dir.glob("*.rar"))
    archive_files = zip_files + rar_files

    if not archive_files:
        logger.info("ℹ️  No archive files found in uploads directory")
        return

    logger.info(f"📦 Found {len(archive_files)} archive file(s) to process ({len(zip_files)} ZIP, {len(rar_files)} RAR)")

    # Create ingestion service
    ingestion_service = ZipIngestionService(logger=logger)

    # Process each archive
    for zip_path in archive_files:
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing: {zip_path.name}")
        logger.info(f"{'='*60}")

        db = SessionLocal()
        try:
            result = ingestion_service.process_zip_file(zip_path, db)
            logger.info(f"✅ Successfully processed {zip_path.name}")
            logger.info(f"   Devices: {result.get('devices_added', 0)}")
            logger.info(f"   Credentials: {result.get('credentials_added', 0)}")

            # Optionally move processed file
            processed_dir = uploads_dir.parent / "processed"
            processed_dir.mkdir(exist_ok=True)
            new_path = processed_dir / zip_path.name
            zip_path.rename(new_path)
            logger.info(f"   Moved to: {new_path}")

        except Exception as e:
            logger.error(f"❌ Error processing {zip_path.name}: {e}", exc_info=True)
        finally:
            db.close()

    logger.info(f"\n{'='*60}")
    logger.info("✨ Ingestion complete!")
    logger.info(f"{'='*60}")

if __name__ == "__main__":
    main()
