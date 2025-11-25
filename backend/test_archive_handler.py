#!/usr/bin/env python3
"""
Test the smart archive handler
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.services.archive_handler import SmartArchiveHandler
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')

def test_archive(archive_path: str):
    """Test opening an archive"""
    path = Path(archive_path)

    if not path.exists():
        print(f"❌ File not found: {archive_path}")
        return

    handler = SmartArchiveHandler()

    print(f"\n{'='*60}")
    print(f"Testing: {path.name}")
    print(f"{'='*60}\n")

    # Get info
    info = handler.get_archive_info(path)
    print(f"Type: {info.archive_type.upper()}")
    print(f"Encrypted: {info.is_encrypted}")
    if info.password:
        print(f"Password: {info.password}")

    # Try to open
    try:
        archive, password = handler.open_archive(path)
        print(f"\n✅ Successfully opened!")
        print(f"Files in archive: {len(archive.namelist())}")
        print(f"\nFirst 10 files:")
        for fname in archive.namelist()[:10]:
            print(f"  - {fname}")
        archive.close()
    except Exception as e:
        print(f"\n❌ Failed: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_archive_handler.py <archive_file>")
        print("\nExample:")
        print("  python test_archive_handler.py data/incoming/uploads/stealer_infected.rar")
        sys.exit(1)

    test_archive(sys.argv[1])
