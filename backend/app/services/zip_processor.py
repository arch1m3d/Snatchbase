"""
ZIP file processor - handles extraction and parsing of stealer log archives
Ported from bron-vault's TypeScript implementation
"""
import zipfile
import hashlib
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Set
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class ZipStructureInfo:
    """Information about ZIP file structure"""
    has_pre_directory: bool
    pre_directory_name: Optional[str]
    device_level: int
    structure_type: str  # "direct", "pre-directory", "nested"
    sample_paths: List[str]
    macos_detected: bool
    filtered_directories: List[str]


@dataclass
class DeviceFiles:
    """Files belonging to a device"""
    device_name: str
    files: List[Tuple[str, zipfile.ZipInfo]]  # (path, zip_entry)


class ZipStructureAnalyzer:
    """Analyzes ZIP file structure to detect device organization"""
    
    SYSTEM_DIRECTORIES = {
        "__MACOSX",  # macOS metadata
        ".DS_Store",  # macOS metadata
        "Thumbs.db",  # Windows metadata
        ".Trashes",  # macOS trash
        ".fseventsd",  # macOS file system events
        ".Spotlight-V100",  # macOS Spotlight
        ".TemporaryItems",  # macOS temp
        "System Volume Information",  # Windows system
    }
    
    def analyze_structure(self, zip_file: zipfile.ZipFile) -> ZipStructureInfo:
        """Analyze ZIP structure to determine device organization"""
        all_paths = [name for name in zip_file.namelist() if not zip_file.getinfo(name).is_dir()]
        sample_paths = all_paths[:10]
        
        print(f"🔍 Analyzing structure from {len(all_paths)} files")
        
        # Count depth levels
        depth_counts = defaultdict(int)
        first_level_dirs = set()
        
        for path in all_paths:
            parts = [p for p in path.split("/") if p]
            depth = len(parts)
            depth_counts[depth] += 1
            
            if parts:
                first_level_dirs.add(parts[0])
        
        print(f"📊 Depth analysis: {dict(depth_counts)}")
        print(f"📁 First level directories ({len(first_level_dirs)}): {list(first_level_dirs)[:10]}")
        
        # Filter out system directories and files
        filtered_dirs = self._filter_system_items(first_level_dirs, zip_file)
        macos_detected = "__MACOSX" in first_level_dirs
        
        if macos_detected:
            print("🍎 macOS ZIP detected! Filtering out __MACOSX directory")
        
        print(f"📁 Filtered directories ({len(filtered_dirs)}): {filtered_dirs}")
        
        # Determine structure type based on filtered directories
        if len(filtered_dirs) == 1:
            # Check if this single directory contains multiple subdirectories (devices)
            pre_dir = filtered_dirs[0]
            second_level_dirs = set()
            
            for path in all_paths:
                parts = [p for p in path.split("/") if p]
                if len(parts) >= 2 and parts[0] == pre_dir:
                    second_level_dirs.add(parts[1])
            
            # Filter out system directories at second level
            second_level_filtered = [d for d in second_level_dirs 
                                    if d not in self.SYSTEM_DIRECTORIES and not d.startswith(".")]
            
            print(f"📁 Second level directories inside '{pre_dir}': {len(second_level_filtered)} (total before filter: {len(second_level_dirs)})")
            if len(second_level_filtered) > 0:
                print(f"📁 Sample device names: {list(second_level_filtered)[:10]}")
            
            if len(second_level_filtered) > 1:
                # Multiple subdirectories - this is a PRE-DIRECTORY structure
                print(f"🎯 Detected PRE-DIRECTORY structure with: '{pre_dir}' containing {len(second_level_filtered)} devices (macOS: {macos_detected})")
                
                return ZipStructureInfo(
                    has_pre_directory=True,
                    pre_directory_name=pre_dir,
                    device_level=1,
                    structure_type="pre-directory",
                    sample_paths=sample_paths,
                    macos_detected=macos_detected,
                    filtered_directories=filtered_dirs,
                )
            else:
                # Single directory with no subdirectories - treat as single device
                print(f"🎯 Detected SINGLE DEVICE structure: '{pre_dir}' (macOS: {macos_detected})")
                
                return ZipStructureInfo(
                    has_pre_directory=False,
                    pre_directory_name=None,
                    device_level=0,
                    structure_type="direct",
                    sample_paths=sample_paths,
                    macos_detected=macos_detected,
                    filtered_directories=filtered_dirs,
                )
        elif len(filtered_dirs) > 10:
            # Many directories after filtering - DIRECT DEVICE structure
            print(f"🎯 Detected DIRECT DEVICE structure with {len(filtered_dirs)} devices (macOS: {macos_detected})")
            
            return ZipStructureInfo(
                has_pre_directory=False,
                pre_directory_name=None,
                device_level=0,
                structure_type="direct",
                sample_paths=sample_paths,
                macos_detected=macos_detected,
                filtered_directories=filtered_dirs,
            )
        else:
            # Mixed or nested structure
            print(f"🎯 Detected NESTED/MIXED structure with {len(filtered_dirs)} directories (macOS: {macos_detected})")
            
            return ZipStructureInfo(
                has_pre_directory=False,
                pre_directory_name=None,
                device_level=0,
                structure_type="nested",
                sample_paths=sample_paths,
                macos_detected=macos_detected,
                filtered_directories=filtered_dirs,
            )
    
    def _filter_system_items(self, dirs: Set[str], zip_file: zipfile.ZipFile) -> List[str]:
        """Filter out system directories and files"""
        filtered = []
        
        for dir_name in dirs:
            # Skip system directories and files
            if dir_name in self.SYSTEM_DIRECTORIES:
                print(f"🚫 Filtering out system item: {dir_name}")
                continue
            
            # Skip hidden directories and files (starting with .)
            if dir_name.startswith("."):
                print(f"🚫 Filtering out hidden item: {dir_name}")
                continue
            
            # Check if this is actually a directory by seeing if it has subdirectories/files
            has_contents = any(
                name.startswith(dir_name + "/")
                for name in zip_file.namelist()
            )
            
            if not has_contents:
                print(f"🚫 Filtering out empty/file: {dir_name}")
                continue
            
            filtered.append(dir_name)
        
        return filtered
    
    def extract_device_name(self, path_parts: List[str], structure_info: ZipStructureInfo) -> Optional[str]:
        """Extract device name from file path based on structure"""
        if not path_parts:
            return None
        
        # Skip macOS system files and hidden files at any level
        for part in path_parts:
            if part == "__MACOSX" or part.startswith(".") or part in self.SYSTEM_DIRECTORIES:
                return None
        
        if structure_info.has_pre_directory and structure_info.pre_directory_name:
            # Pre-directory structure: device name is at level 1 (inside the wrapper folder)
            if len(path_parts) < 2:
                return None  # No device level
            if path_parts[0] != structure_info.pre_directory_name:
                return None  # Wrong pre-directory
            
            # Device name is the second-level directory
            return path_parts[1]
        else:
            # Direct structure: device name is at level 0 (top-level folders are devices)
            return path_parts[0]


class ZipFileGrouper:
    """Groups files by device from ZIP archive"""
    
    def __init__(self, analyzer: ZipStructureAnalyzer):
        self.analyzer = analyzer
    
    def group_by_device(self, zip_file: zipfile.ZipFile) -> Tuple[Dict[str, List[Tuple[str, zipfile.ZipInfo]]], ZipStructureInfo]:
        """Group all files in ZIP by device name"""
        structure_info = self.analyzer.analyze_structure(zip_file)
        
        print(f"🔍 Starting to group files by device using {structure_info.structure_type} structure...")
        print(f"🍎 macOS ZIP detected: {structure_info.macos_detected}")
        
        device_map: Dict[str, List[Tuple[str, zipfile.ZipInfo]]] = defaultdict(list)
        entry_count = 0
        
        for name in zip_file.namelist():
            entry_count += 1
            if entry_count % 1000 == 0:
                print(f"📊 Processed {entry_count} entries so far...")
            
            zip_entry = zip_file.getinfo(name)
            path_parts = [p for p in name.split("/") if p]
            
            if not path_parts:
                print(f"⚠️ Skipping entry with empty path: '{name}'")
                continue
            
            # Extract device name
            device_name = self.analyzer.extract_device_name(path_parts, structure_info)
            if not device_name:
                # Skip files that don't belong to any device
                if path_parts[0] == ".DS_Store" or path_parts[0].startswith("."):
                    print(f"🚫 Skipping system file: {name}")
                continue
            
            if device_name not in device_map:
                print(f"📱 New device detected: '{device_name}' (device #{len(device_map) + 1})")
            
            device_map[device_name].append((name, zip_entry))
        
        print(f"✅ Device grouping complete:")
        print(f"   - Total entries processed: {entry_count}")
        print(f"   - Total devices found: {len(device_map)}")
        print(f"   - Structure type: {structure_info.structure_type}")
        print(f"   - macOS ZIP: {structure_info.macos_detected}")
        print(f"   - Device names sample: {list(device_map.keys())[:10]}")
        
        return device_map, structure_info


def compute_device_hash(device_name: str) -> str:
    """Compute SHA256 hash of device name for deduplication"""
    return hashlib.sha256(device_name.lower().encode()).hexdigest()


def is_likely_text_file(filename: str) -> bool:
    """Determine if a file is likely a text file based on extension"""
    text_extensions = {
        ".txt", ".log", ".json", ".xml", ".html", ".htm",
        ".css", ".js", ".csv", ".ini", ".cfg", ".conf",
        ".md", ".readme", ".sql",
    }
    
    lower_filename = filename.lower()
    
    # Check extension
    if any(lower_filename.endswith(ext) for ext in text_extensions):
        return True
    
    # Check filename patterns
    if any(keyword in lower_filename for keyword in ["password", "login", "credential"]):
        return True
    
    # Files without extension are often text
    if "." not in lower_filename:
        return True
    
    return False
