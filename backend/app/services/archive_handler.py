"""
Smart Archive Handler - Supports ZIP and RAR with password detection
"""
import zipfile
import re
from pathlib import Path
from typing import Optional, List, Tuple, Union
from dataclasses import dataclass
import logging

try:
    import rarfile
    RARFILE_AVAILABLE = True
except ImportError:
    RARFILE_AVAILABLE = False


@dataclass
class ArchiveInfo:
    """Information about an archive file"""
    path: Path
    archive_type: str  # 'zip' or 'rar'
    is_encrypted: bool
    password: Optional[str] = None


class SmartArchiveHandler:
    """
    Handles both ZIP and RAR archives with smart password detection
    """

    def __init__(self, logger: Optional[logging.Logger] = None, custom_passwords: Optional[List[str]] = None):
        self.logger = logger or logging.getLogger(__name__)
        self.custom_passwords = custom_passwords or []

        if not RARFILE_AVAILABLE:
            self.logger.warning("⚠️  rarfile not installed - RAR support disabled")
            self.logger.warning("   Install with: pip install rarfile")
            self.logger.warning("   Also install unrar: apt install unrar / brew install unrar")

    def detect_archive_type(self, file_path: Path) -> Optional[str]:
        """Detect if file is ZIP or RAR"""
        suffix = file_path.suffix.lower()

        if suffix == '.zip':
            return 'zip'
        elif suffix in ['.rar', '.r00', '.r01']:
            return 'rar' if RARFILE_AVAILABLE else None

        # Try to detect by magic bytes
        try:
            with open(file_path, 'rb') as f:
                header = f.read(8)

                # ZIP magic: PK\x03\x04
                if header[:4] == b'PK\x03\x04':
                    return 'zip'

                # RAR magic: Rar!\x1a\x07
                if header[:6] == b'Rar!\x1a\x07':
                    return 'rar' if RARFILE_AVAILABLE else None
        except Exception:
            pass

        return None

    def extract_password_from_filename(self, filename: str) -> List[str]:
        """
        Extract password from filename using Telegram channel pattern

        Pattern: @ChannelName.zip → https://t.me/ChannelName
        """
        passwords = []

        # If filename starts with @, convert to Telegram URL
        if filename.startswith('@'):
            # Remove @ and .zip/.rar extension
            channel_name = filename[1:]  # Remove @
            channel_name = re.sub(r'\.(zip|rar|7z)$', '', channel_name, flags=re.I)
            telegram_url = f"https://t.me/{channel_name}"
            passwords.append(telegram_url)
            self.logger.info(f"📱 Detected Telegram channel pattern: {telegram_url}")

        return passwords

    def try_passwords(self, archive_path: Path, archive_type: str) -> Optional[str]:
        """
        Try to find the correct password for an encrypted archive

        Strategy:
        1. Try Telegram channel URL from filename (if starts with @)
        2. Try custom passwords from passwords.txt
        """
        # Build password list
        passwords_to_try = []

        # 1. Telegram channel URL from filename (if applicable)
        filename_passwords = self.extract_password_from_filename(archive_path.name)
        passwords_to_try.extend(filename_passwords)

        # 2. Custom passwords from passwords.txt
        passwords_to_try.extend(self.custom_passwords)

        # Remove duplicates while preserving order
        seen = set()
        unique_passwords = []
        for pwd in passwords_to_try:
            if pwd not in seen:
                seen.add(pwd)
                unique_passwords.append(pwd)

        self.logger.info(f"🔐 Trying {len(unique_passwords)} password(s)...")

        # Try each password
        for i, password in enumerate(unique_passwords, 1):
            # Show which password we're trying (truncate if too long)
            pwd_display = password if len(password) < 50 else password[:47] + "..."
            self.logger.info(f"   Attempt {i}/{len(unique_passwords)}: {pwd_display}")

            try:
                if archive_type == 'zip':
                    with zipfile.ZipFile(archive_path, 'r') as zf:
                        # Try to read just a small chunk to verify password (don't read entire file!)
                        first_file = zf.namelist()[0]
                        with zf.open(first_file, pwd=password.encode()) as f:
                            # Just read 1KB to verify password works
                            f.read(1024)
                        self.logger.info(f"✅ Password correct: '{pwd_display}'")
                        return password

                elif archive_type == 'rar':
                    with rarfile.RarFile(archive_path) as rf:
                        rf.setpassword(password)
                        first_file = rf.namelist()[0]
                        # Just read 1KB to verify
                        with rf.open(first_file) as f:
                            f.read(1024)
                        self.logger.info(f"✅ Password correct: '{pwd_display}'")
                        return password

            except (RuntimeError, rarfile.BadRarFile, rarfile.PasswordRequired):
                self.logger.info(f"   ❌ Wrong password")
                continue
            except Exception as e:
                self.logger.info(f"   ❌ Error: {e}")
                continue

        self.logger.error(f"❌ Could not find password after {len(unique_passwords)} attempts")
        return None

    def open_archive(self, archive_path: Path, password: Optional[str] = None) -> Tuple[Union[zipfile.ZipFile, 'rarfile.RarFile'], str]:
        """
        Open archive with automatic type detection and password handling

        Returns: (archive_object, password_used)
        """
        archive_type = self.detect_archive_type(archive_path)

        if not archive_type:
            raise ValueError(f"Unsupported archive type: {archive_path.suffix}")

        self.logger.info(f"📦 Opening {archive_type.upper()} archive: {archive_path.name}")

        # Try to open archive
        try:
            if archive_type == 'zip':
                zf = zipfile.ZipFile(archive_path, 'r')

                # Check if encrypted
                if any(info.flag_bits & 0x1 for info in zf.filelist):
                    self.logger.info("🔒 Archive is password-protected")

                    if not password:
                        password = self.try_passwords(archive_path, 'zip')
                        if not password:
                            raise ValueError("Could not find password")

                    # Verify password works
                    try:
                        first_file = zf.namelist()[0]
                        zf.read(first_file, pwd=password.encode())
                    except RuntimeError:
                        raise ValueError(f"Password '{password}' is incorrect")

                return zf, password

            elif archive_type == 'rar':
                rf = rarfile.RarFile(archive_path)

                # Check if encrypted
                if rf.needs_password():
                    self.logger.info("🔒 Archive is password-protected")

                    if not password:
                        password = self.try_passwords(archive_path, 'rar')
                        if not password:
                            raise ValueError("Could not find password")

                    rf.setpassword(password)

                    # Verify password works
                    try:
                        first_file = rf.namelist()[0]
                        rf.read(first_file)
                    except rarfile.PasswordRequired:
                        raise ValueError(f"Password '{password}' is incorrect")

                return rf, password

        except Exception as e:
            self.logger.error(f"❌ Failed to open archive: {e}")
            raise

    def get_archive_info(self, archive_path: Path) -> ArchiveInfo:
        """Get information about an archive"""
        archive_type = self.detect_archive_type(archive_path)

        if not archive_type:
            raise ValueError(f"Unsupported archive type: {archive_path.suffix}")

        is_encrypted = False
        password = None

        try:
            if archive_type == 'zip':
                with zipfile.ZipFile(archive_path, 'r') as zf:
                    is_encrypted = any(info.flag_bits & 0x1 for info in zf.filelist)

            elif archive_type == 'rar':
                with rarfile.RarFile(archive_path) as rf:
                    is_encrypted = rf.needs_password()

            if is_encrypted:
                password = self.try_passwords(archive_path, archive_type)

        except Exception as e:
            self.logger.warning(f"Could not analyze archive: {e}")

        return ArchiveInfo(
            path=archive_path,
            archive_type=archive_type,
            is_encrypted=is_encrypted,
            password=password
        )
