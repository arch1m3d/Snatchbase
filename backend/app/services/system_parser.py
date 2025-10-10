"""Parser for System.txt files to extract stealer information"""
import re
from typing import Optional, Dict, Set
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class SystemFileParser:
    
    def __init__(self):
        """Initialize parser and load stealer names"""
        self.stealer_names = self._load_stealer_names()
    
    def _load_stealer_names(self) -> Set[str]:
        """Load known stealer names from file"""
        stealer_file = Path(__file__).parent.parent / "data" / "stealer_names.txt"
        try:
            with open(stealer_file, 'r', encoding='utf-8') as f:
                # Load and normalize names (case-insensitive)
                return {line.strip().lower() for line in f if line.strip()}
        except Exception as e:
            print(f"Warning: Could not load stealer names: {e}")
            return set()
    
    def parse(self, content: str) -> Dict[str, Optional[str]]:
        """Parse System.txt content and extract system information"""
        stealer_name = self._extract_stealer_name(content)
        hostname = self._extract_field(content, ['Hostname', 'Computer', 'NetBIOS'])
        computer_name = self._extract_field(content, ['Computer'])
        username = self._extract_field(content, ['User'])
        os_version = self._extract_field(content, ['OS Version'])
        ip_address = self._extract_field(content, ['IP Address'])
        country = self._extract_field(content, ['Country'])
        language = self._extract_field(content, ['Language'])
        local_date = self._extract_field(content, ['Local Date'])
        infection_time = self._extract_field(content, ['Time'])  # This is the actual infection timestamp
        antivirus = self._extract_field(content, ['Anti Virus'])
        hwid = self._extract_field(content, ['HWID'])
        
        # Clean infection_time - remove signature part
        if infection_time:
            # Remove (sig:...) part using regex
            import re
            infection_time = re.sub(r'\s*\(sig:.*?\)\s*', '', infection_time).strip()
        
        return {
            "stealer_name": stealer_name,
            "hostname": hostname or computer_name,
            "computer_name": computer_name,
            "username": username,
            "os_version": os_version,
            "ip_address": ip_address,
            "country": country,
            "language": language,
            "local_date": local_date,
            "infection_time": infection_time,  # The actual infection timestamp from "Time:" field
            "antivirus": antivirus,
            "hwid": hwid,
        }
    
    def _extract_field(self, content: str, field_names: list) -> Optional[str]:
        """Extract a field value from System.txt content"""
        lines = content.split('\n')
        
        for line in lines:
            original_line = line
            line = line.strip()
            if not line:
                continue
            
            for field_name in field_names:
                # Check for "- FieldName:" or "FieldName:" pattern
                if f'{field_name}:' in line:
                    # Extract value after the colon
                    parts = line.split(':', 1)
                    if len(parts) == 2:
                        value = parts[1].strip()
                        # Clean up the value
                        if value and value.lower() not in ['', 'n/a', 'none', 'null', '-']:
                            return value
        
        return None
    
    def _extract_stealer_name(self, content: str) -> str:
        """Extract stealer name by checking against known stealer names"""
        content_lower = content.lower()
        
        # Remove special characters and extra spaces for better matching
        content_normalized = re.sub(r'[^a-z0-9\s]', '', content_lower)
        content_normalized = re.sub(r'\s+', ' ', content_normalized)
        
        # Check if any known stealer name appears in the content
        # Sort by length (longest first) to match more specific names first
        sorted_stealers = sorted(self.stealer_names, key=len, reverse=True)
        
        for stealer_name in sorted_stealers:
            # Normalize the stealer name too
            stealer_normalized = re.sub(r'[^a-z0-9\s]', '', stealer_name)
            stealer_normalized = re.sub(r'\s+', ' ', stealer_normalized)
            
            # Check both original and normalized versions
            if stealer_name in content_lower or stealer_normalized in content_normalized:
                # Return the original case from the file
                stealer_file = Path(__file__).parent.parent / "data" / "stealer_names.txt"
                try:
                    with open(stealer_file, 'r', encoding='utf-8') as f:
                        for line in f:
                            if line.strip().lower() == stealer_name:
                                logger.debug(f"✅ Detected stealer: {line.strip()}")
                                return line.strip()
                except:
                    pass
                logger.debug(f"✅ Detected stealer: {stealer_name.title()}")
                return stealer_name.title()
        
        # Log first 500 chars of content when Unknown
        logger.debug(f"⚠️ Unknown stealer - Content preview: {content[:500]}")
        return "Unknown"
    
