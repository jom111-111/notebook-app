#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# 设置Windows环境的UTF-8编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def create_simple_icon():
    """Create simple Windows icon"""
    try:
        from PIL import Image, ImageDraw
        
        print("Creating application icon...")
        
        # Create 64x64 icon
        size = 64
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw simple sticky note icon
        margin = 8
        paper_color = (255, 215, 0)  # Gold color RGB
        shadow_color = (184, 134, 11)  # Shadow color RGB
        
        # Draw shadow (use rectangle for better compatibility)
        shadow_rect = [margin+2, margin+2, size-margin+2, size-margin+2]
        draw.rectangle(shadow_rect, fill=shadow_color)
        
        # Draw sticky note body
        paper_rect = [margin, margin, size-margin, size-margin]
        draw.rectangle(paper_rect, fill=paper_color)
        draw.rectangle(paper_rect, outline=(218, 165, 32), width=2)  # Border
        
        # Draw lines
        line_color = (205, 133, 63)
        for i in range(3):
            y = margin + 12 + i * 8
            draw.line([margin+6, y, size-margin-6, y], fill=line_color, width=1)
        
        # Draw text dots
        text_color = (139, 69, 19)
        for i in range(2):
            y = margin + 16 + i * 8
            for j in range(4):
                x = margin + 8 + j * 6
                draw.ellipse([x, y, x+2, y+2], fill=text_color)
        
        # Create multi-size icons
        sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
        images = []
        
        for ico_size in sizes:
            if hasattr(Image, 'Resampling'):
                resized = img.resize(ico_size, Image.Resampling.LANCZOS)
            else:
                resized = img.resize(ico_size, Image.LANCZOS)
            images.append(resized)
        
        # Save Windows icon
        ico_path = 'notebook.ico'
        images[0].save(ico_path, format='ICO', sizes=[(img.width, img.height) for img in images])
        print("Windows icon created: " + ico_path)
        
        # Verify file creation
        if os.path.exists(ico_path):
            file_size = os.path.getsize(ico_path)
            print("Icon file size: " + str(file_size) + " bytes")
            return True
        else:
            print("Error: Icon file was not created")
            return False
            
    except ImportError as e:
        print("Import error: " + str(e))
        print("Please install Pillow: pip install Pillow")
        return False
    except Exception as e:
        print("Error creating icon: " + str(e))
        return False

if __name__ == '__main__':
    success = create_simple_icon()
    if success:
        print("Icon creation completed successfully!")
        sys.exit(0)
    else:
        print("Icon creation failed!")
        sys.exit(1) 