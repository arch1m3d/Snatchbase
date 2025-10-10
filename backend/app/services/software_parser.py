"""
Software file parser - extracts installed software from stealer logs
Ported from bron-vault's TypeScript implementation
"""
import re
from typing import List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class SoftwareEntry:
    """Parsed software entry"""
    software_name: str
    version: Optional[str]


class SoftwareFileParser:
    """Parser for software list files from stealer logs"""
    
    # Common software file names
    SOFTWARE_FILE_NAMES = {
        "software.txt",
        "installedsoftware.txt",
        "installedprograms.txt",
        "programslist.txt",
    }
    
    def is_software_file(self, filename: str) -> bool:
        """Check if filename is a software file"""
        return filename.lower() in self.SOFTWARE_FILE_NAMES
    
    def parse_software_file(self, content: str) -> List[SoftwareEntry]:
        """Parse software file content and extract software entries"""
        if not content or not content.strip():
            return []
        
        lines = content.split("\n")
        software_list = []
        
        for line in lines:
            trimmed_line = line.strip()
            if not trimmed_line:
                continue
            
            # Apply filters to skip noise
            if not self._should_process_line(trimmed_line):
                continue
            
            # Parse software name and version
            software_name, version = self._parse_software_line(trimmed_line)
            
            if software_name:
                software_list.append(SoftwareEntry(
                    software_name=software_name,
                    version=version
                ))
        
        return software_list
    
    def _should_process_line(self, line: str) -> bool:
        """Apply filters to determine if line should be processed"""
        # Skip if there are 3 consecutive spaces
        if "   " in line:
            return False
        
        # Skip if contains URL
        if re.search(r"https?://", line, re.IGNORECASE):
            return False
        if re.search(r"www\.", line, re.IGNORECASE):
            return False
        if re.search(r"\.(com|me|org|net|io|gov|edu)\b", line, re.IGNORECASE):
            return False
        
        # Skip if there are 3 consecutive special characters
        if re.search(r"(___|===|\*\*\*|&&&|###|\$\$\$)", line):
            return False
        
        # Skip if length > 120
        if len(line) > 120:
            return False
        
        # Skip if same digit repeated 4 times consecutively
        if re.search(r"(\d)\1{3,}", line):
            return False
        
        return True
    
    def _parse_software_line(self, line: str) -> Tuple[str, Optional[str]]:
        """Parse a line to extract software name and version"""
        # Remove common prefixes/suffixes
        clean_line = line.strip()
        clean_line = re.sub(r"^[-_\s]+", "", clean_line)
        clean_line = re.sub(r"[-_\s]+$", "", clean_line)
        
        if not clean_line:
            return "", None
        
        # Remove numbering patterns like "1) ", "2) ", etc.
        clean_line = re.sub(r"^\d+\)\s*", "", clean_line)
        
        # Pattern 1: Software with version in format "Software Name - Version"
        match = re.match(r"^(.+?)\s*-\s*(.+)$", clean_line)
        if match:
            software_name = match.group(1).strip()
            version_part = match.group(2).strip()
            extracted_version = self._extract_version_from_string(version_part)
            if extracted_version:
                return software_name, extracted_version
        
        # Pattern 2: Software with version in parentheses "Software Name (Version)"
        match = re.match(r"^(.+?)\s*\(([^)]+)\)$", clean_line)
        if match:
            software_name = match.group(1).strip()
            version_part = match.group(2).strip()
            extracted_version = self._extract_version_from_string(version_part)
            if extracted_version:
                return software_name, extracted_version
        
        # Pattern 3: Software with version at the end "Software Name v1.2.3"
        match = re.match(r"^(.+?)\s+(v?\d+\.\d+(?:\.\d+)?(?:[-\w]+)?)$", clean_line, re.IGNORECASE)
        if match:
            software_name = match.group(1).strip()
            version = match.group(2).strip()
            return software_name, version
        
        # Pattern 4: Software with version in format "Software Name Version X.X.X"
        match = re.match(r"^(.+?)\s+(?:version\s+)?(\d+\.\d+(?:\.\d+)?(?:[-\w]+)?)$", clean_line, re.IGNORECASE)
        if match:
            software_name = match.group(1).strip()
            version = match.group(2).strip()
            return software_name, version
        
        # Pattern 5: Software with version in brackets "Software Name [Version]"
        match = re.match(r"^(.+?)\s*\[([^\]]+)\]$", clean_line)
        if match:
            software_name = match.group(1).strip()
            version_part = match.group(2).strip()
            extracted_version = self._extract_version_from_string(version_part)
            if extracted_version:
                return software_name, extracted_version
        
        # If no version pattern found, treat entire line as software name
        return clean_line, None
    
    def _extract_version_from_string(self, string: str) -> Optional[str]:
        """Extract version number from a string"""
        # Look for version patterns in the string
        version_patterns = [
            r"\d+\.\d+\.\d+\.\d+",  # Version like "1.0.0.0"
            r"\d+\.\d+\.\d+",       # Version like "1.0.0"
            r"\d+\.\d+",            # Version like "1.0"
            r"v\d+\.\d+\.\d+",      # Version like "v1.0.0"
            r"v\d+\.\d+",           # Version like "v1.0"
            r"\d{4}",               # Year like "2021"
        ]
        
        for pattern in version_patterns:
            match = re.search(pattern, string)
            if match:
                return match.group(0)
        
        return None
