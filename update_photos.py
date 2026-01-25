#!/usr/bin/env python3
"""
Photo Gallery Updater
=====================
Scans the photos/ folder and updates photos.json automatically.

Usage:
    python update_photos.py

Just drop your images in the photos/ folder and run this script.
The gallery will pick up the changes automatically.

Supported formats: .jpg, .jpeg, .png, .webp, .gif
"""

import os
import json
from pathlib import Path
from datetime import datetime

# Configuration
PHOTOS_FOLDER = "photos"
OUTPUT_FILE = "photos.json"
SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}

def get_caption_from_filename(filename):
    """
    Converts filename to a readable caption.
    'berlin-sunset-2023.jpg' → 'Berlin sunset 2023'
    """
    name = Path(filename).stem  # Remove extension
    # Replace dashes and underscores with spaces, then title case
    caption = name.replace('-', ' ').replace('_', ' ')
    return caption.title()

def scan_photos():
    """Scan the photos folder and return list of photo objects."""
    photos = []
    
    if not os.path.exists(PHOTOS_FOLDER):
        print(f"📁 Creating '{PHOTOS_FOLDER}/' folder...")
        os.makedirs(PHOTOS_FOLDER)
        return photos
    
    # Get all image files
    files = []
    for f in os.listdir(PHOTOS_FOLDER):
        ext = Path(f).suffix.lower()
        if ext in SUPPORTED_EXTENSIONS:
            filepath = os.path.join(PHOTOS_FOLDER, f)
            # Get modification time for sorting
            mtime = os.path.getmtime(filepath)
            files.append((f, mtime))
    
    # Sort by modification time (newest first)
    files.sort(key=lambda x: x[1], reverse=True)
    
    for filename, mtime in files:
        photos.append({
            "src": f"{PHOTOS_FOLDER}/{filename}",
            "alt": get_caption_from_filename(filename)
        })
    
    return photos

def update_json(photos):
    """Write photos to JSON file, preserving any manual caption edits."""
    
    # Load existing JSON to preserve manual edits
    existing = {}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r') as f:
                existing_list = json.load(f)
                # Index by src for easy lookup
                existing = {p['src']: p for p in existing_list}
        except (json.JSONDecodeError, KeyError):
            pass
    
    # Merge: keep manual captions if they exist
    final_photos = []
    for photo in photos:
        if photo['src'] in existing:
            # Keep the existing entry (preserves manual caption edits)
            final_photos.append(existing[photo['src']])
        else:
            final_photos.append(photo)
    
    # Write JSON
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(final_photos, f, indent=4)
    
    return final_photos

def main():
    print("🖼️  Scanning photos folder...\n")
    
    photos = scan_photos()
    
    if not photos:
        print(f"No images found in '{PHOTOS_FOLDER}/'")
        print(f"\nAdd some images and run this script again!")
        print(f"Supported formats: {', '.join(SUPPORTED_EXTENSIONS)}")
        return
    
    final = update_json(photos)
    
    print(f"✓ Found {len(final)} photos:\n")
    for i, p in enumerate(final, 1):
        print(f"  {i}. {p['src']}")
        print(f"     Caption: {p['alt']}\n")
    
    print(f"✓ Updated {OUTPUT_FILE}")
    print("\n💡 Tip: Edit photos.json directly to customize captions!")

if __name__ == "__main__":
    main()