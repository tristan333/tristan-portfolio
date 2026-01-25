#!/usr/bin/env python3
"""
Photo Optimizer for Gallery
===========================
Creates optimized versions of your photos for fast web loading.

Creates two versions of each image:
  - thumbnails/ (400px) - for the grid view
  - optimized/ (1600px) - for the lightbox view

Usage:
    pip install Pillow
    python optimize_photos.py

Then the gallery will automatically use the faster versions.
"""

import os
import json
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow not installed. Run: pip install Pillow")
    exit(1)

# Configuration
PHOTOS_FOLDER = "photos"
THUMB_FOLDER = "photos/thumbnails"
OPTIMIZED_FOLDER = "photos/optimized"
JSON_FILE = "photos.json"

THUMB_SIZE = 600      # px - for grid squares (was 400)
OPTIMIZED_SIZE = 2000 # px - for lightbox (was 1600)
JPEG_QUALITY = 92     # 1-100 (was 85)

SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}


def ensure_folders():
    """Create output folders if they don't exist."""
    os.makedirs(THUMB_FOLDER, exist_ok=True)
    os.makedirs(OPTIMIZED_FOLDER, exist_ok=True)


def optimize_image(input_path, output_path, max_size):
    """Resize and compress an image."""
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (handles PNG with transparency)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Calculate new size maintaining aspect ratio
            ratio = min(max_size / img.width, max_size / img.height)
            if ratio < 1:  # Only resize if larger than target
                new_size = (int(img.width * ratio), int(img.height * ratio))
                img = img.resize(new_size, Image.LANCZOS)
            
            # Save with compression
            img.save(output_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)
            return True
    except Exception as e:
        print(f"  ⚠️  Error processing {input_path}: {e}")
        return False


def get_output_filename(filename):
    """Convert any image filename to .jpg"""
    return Path(filename).stem + '.jpg'


def process_photos():
    """Process all photos and create optimized versions."""
    ensure_folders()
    
    # Get list of photos
    if not os.path.exists(PHOTOS_FOLDER):
        print(f"❌ No '{PHOTOS_FOLDER}/' folder found")
        return
    
    photos = []
    for f in os.listdir(PHOTOS_FOLDER):
        filepath = os.path.join(PHOTOS_FOLDER, f)
        if os.path.isfile(filepath):
            ext = Path(f).suffix.lower()
            if ext in SUPPORTED_EXTENSIONS:
                photos.append(f)
    
    if not photos:
        print(f"❌ No images found in '{PHOTOS_FOLDER}/'")
        return
    
    print(f"🖼️  Processing {len(photos)} photos...\n")
    
    processed = []
    for i, filename in enumerate(photos, 1):
        input_path = os.path.join(PHOTOS_FOLDER, filename)
        output_name = get_output_filename(filename)
        
        thumb_path = os.path.join(THUMB_FOLDER, output_name)
        opt_path = os.path.join(OPTIMIZED_FOLDER, output_name)
        
        print(f"[{i}/{len(photos)}] {filename}")
        
        # Get original file size
        original_size = os.path.getsize(input_path) / 1024  # KB
        
        # Create thumbnail
        thumb_ok = optimize_image(input_path, thumb_path, THUMB_SIZE)
        
        # Create optimized version
        opt_ok = optimize_image(input_path, opt_path, OPTIMIZED_SIZE)
        
        if thumb_ok and opt_ok:
            thumb_size = os.path.getsize(thumb_path) / 1024
            opt_size = os.path.getsize(opt_path) / 1024
            print(f"    Original: {original_size:.0f}KB → Thumb: {thumb_size:.0f}KB, Optimized: {opt_size:.0f}KB")
            
            processed.append({
                "src": f"{OPTIMIZED_FOLDER}/{output_name}",
                "thumb": f"{THUMB_FOLDER}/{output_name}"
            })
    
    # Update JSON
    with open(JSON_FILE, 'w') as f:
        json.dump(processed, f, indent=4)
    
    print(f"\n✅ Done! Processed {len(processed)} photos")
    print(f"✅ Updated {JSON_FILE}")
    
    # Calculate savings
    original_total = sum(os.path.getsize(os.path.join(PHOTOS_FOLDER, f)) for f in photos if os.path.isfile(os.path.join(PHOTOS_FOLDER, f)))
    thumb_total = sum(os.path.getsize(os.path.join(THUMB_FOLDER, get_output_filename(f))) for f in photos if os.path.exists(os.path.join(THUMB_FOLDER, get_output_filename(f))))
    
    print(f"\n📊 Grid will now load {thumb_total/1024:.1f}MB instead of {original_total/1024/1024:.1f}MB")
    print(f"   That's {((original_total - thumb_total) / original_total * 100):.0f}% smaller!")


if __name__ == "__main__":
    process_photos()