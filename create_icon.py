#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# 设置Windows环境的UTF-8编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def create_icon_image(size):
    """Create icon image at specified size"""
    try:
        from PIL import Image, ImageDraw
        
        # Create high resolution image
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Scale all measurements based on size
        scale = size / 64
        margin = max(4, int(6 * scale))
        border_width = max(1, int(2 * scale))
        line_width = max(1, int(1.5 * scale))
        
        # Modern flat design colors
        paper_color = (255, 193, 7)     # Golden yellow
        border_color = (255, 152, 0)    # Deep orange
        shadow_color = (0, 0, 0, 30)    # Light shadow
        fold_color = (255, 213, 79)     # Lighter yellow
        line_color = (158, 158, 158)    # Gray lines
        text_color = (97, 97, 97)       # Dark gray text
        
        # Draw subtle shadow first
        shadow_offset = max(1, int(2 * scale))
        shadow_rect = [margin + shadow_offset, margin + shadow_offset, 
                      size - margin + shadow_offset, size - margin + shadow_offset]
        shadow_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow_img)
        shadow_draw.rectangle(shadow_rect, fill=shadow_color)
        img = Image.alpha_composite(img, shadow_img)
        
        # Draw main sticky note body
        paper_rect = [margin, margin, size - margin, size - margin]
        draw.rectangle(paper_rect, fill=paper_color)
        
        # Draw fold corner (top-right)
        fold_size = max(8, int(12 * scale))
        fold_points = [
            (size - margin - fold_size, margin),
            (size - margin, margin),
            (size - margin, margin + fold_size),
            (size - margin - fold_size, margin)
        ]
        draw.polygon(fold_points, fill=fold_color)
        
        # Draw border
        draw.rectangle(paper_rect, outline=border_color, width=border_width)
        
        # Draw fold lines
        draw.line([size - margin - fold_size, margin, 
                  size - margin - fold_size, margin + fold_size], 
                 fill=border_color, width=border_width)
        draw.line([size - margin - fold_size, margin + fold_size, 
                  size - margin, margin + fold_size], 
                 fill=border_color, width=border_width)
        
        # Draw horizontal lines on the note
        line_count = max(3, int(4 * scale / 2))
        line_start_y = margin + max(12, int(18 * scale))
        line_spacing = max(6, int(10 * scale))
        line_margin = max(8, int(12 * scale))
        
        for i in range(line_count):
            y = line_start_y + i * line_spacing
            if y < size - margin - max(8, int(12 * scale)):
                draw.line([margin + line_margin, y, size - margin - line_margin, y], 
                         fill=line_color, width=line_width)
        
        # Draw text simulation (small rectangles for different line lengths)
        text_height = max(2, int(4 * scale))
        text_margin = max(12, int(16 * scale))
        
        for i in range(min(line_count, 4)):
            y = line_start_y + i * line_spacing - max(1, int(2 * scale))
            if y < size - margin - max(8, int(12 * scale)):
                # Vary text length to make it look more realistic
                if i == 0:
                    text_width = max(20, int(35 * scale))
                elif i == 1:
                    text_width = max(25, int(42 * scale))
                elif i == 2:
                    text_width = max(15, int(28 * scale))
                else:
                    text_width = max(30, int(38 * scale))
                
                draw.rectangle([margin + text_margin, y, 
                              margin + text_margin + text_width, y + text_height], 
                             fill=text_color)
        
        return img
        
    except Exception as e:
        print(f"Error creating icon image: {e}")
        return None

def create_macos_icon():
    """Create high-quality macOS ICNS icon with multiple resolutions"""
    try:
        from PIL import Image
        import tempfile
        import subprocess
        
        print("Creating ultra high-quality macOS icon...")
        
        # macOS ICNS requires multiple sizes for optimal display
        # Including Retina versions for crisp display
        sizes = [16, 32, 64, 128, 256, 512, 1024]
        
        # Create temporary directory for iconset
        temp_dir = tempfile.mkdtemp()
        iconset_dir = os.path.join(temp_dir, 'AppIcon.iconset')
        os.makedirs(iconset_dir)
        
        # Size mapping for iconset files
        size_mapping = {
            16: ['icon_16x16.png'],
            32: ['icon_16x16@2x.png', 'icon_32x32.png'],
            64: ['icon_32x32@2x.png'],  
            128: ['icon_128x128.png'],
            256: ['icon_128x128@2x.png', 'icon_256x256.png'],
            512: ['icon_256x256@2x.png', 'icon_512x512.png'],
            1024: ['icon_512x512@2x.png']
        }
        
        # Create PNG files for each required size
        for size in sizes:
            print(f"Generating {size}x{size} icon...")
            img = create_icon_image(size)
            if img is None:
                continue
            
            # Save all required variants for this size
            for filename in size_mapping.get(size, []):
                png_path = os.path.join(iconset_dir, filename)
                img.save(png_path, format='PNG', optimize=True)
                print(f"  Saved: {filename}")
        
        # Convert iconset to ICNS using macOS iconutil
        icns_path = '记事本.icns'
        result = subprocess.run([
            'iconutil', '-c', 'icns', '-o', icns_path, iconset_dir
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            # Clean up temp directory
            import shutil
            shutil.rmtree(temp_dir)
            
            # Verify file creation
            if os.path.exists(icns_path):
                file_size = os.path.getsize(icns_path)
                print(f"High-quality macOS icon created: {icns_path}")
                print(f"Icon file size: {file_size} bytes")
                return True
            else:
                print("Error: ICNS file was not created")
                return False
        else:
            print(f"iconutil error: {result.stderr}")
            return False
            
    except ImportError as e:
        print(f"Import error: {e}")
        print("Please install Pillow: pip install Pillow")
        return False
    except Exception as e:
        print(f"Error creating macOS icon: {e}")
        return False

def create_windows_icon():
    """Create high-quality Windows ICO icon"""
    try:
        from PIL import Image
        
        print("Creating high-quality Windows icon...")
        
        # Create multiple sizes for ICO file (Windows supports embedding multiple sizes)
        sizes = [16, 24, 32, 48, 64, 128, 256]
        images = []
        
        for size in sizes:
            print(f"Generating {size}x{size} icon...")
            img = create_icon_image(size)
            if img:
                images.append(img)
        
        if not images:
            print("Error: No icon images created")
            return False
        
        # Save as multi-resolution ICO
        ico_path = '记事本.ico'
        images[0].save(ico_path, format='ICO', sizes=[(img.size[0], img.size[1]) for img in images])
        
        # Verify file creation
        if os.path.exists(ico_path):
            file_size = os.path.getsize(ico_path)
            print(f"High-quality Windows icon created: {ico_path}")
            print(f"Icon file size: {file_size} bytes")
            return True
        else:
            print("Error: ICO file was not created")
            return False
            
    except Exception as e:
        print(f"Error creating Windows icon: {e}")
        return False

if __name__ == '__main__':
    success = False
    
    if sys.platform == 'darwin':  # macOS
        print("Detected macOS platform - creating ICNS icon")
        success = create_macos_icon()
    else:  # Windows or other platforms
        print("Creating Windows ICO icon")
        success = create_windows_icon()
    
    if success:
        print("Ultra high-quality icon creation completed successfully!")
        sys.exit(0)
    else:
        print("Icon creation failed!")
        sys.exit(1) 