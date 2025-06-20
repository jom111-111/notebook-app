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
    """Create high-quality Windows icon"""
    try:
        from PIL import Image, ImageDraw
        
        print("Creating high-quality application icon...")
        
        # Create high resolution base image (128x128 is good for ICO)
        base_size = 128
        img = Image.new('RGBA', (base_size, base_size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Scale all measurements for higher resolution
        scale = base_size / 64
        margin = int(8 * scale)
        border_width = max(2, int(3 * scale))
        line_width = max(1, int(2 * scale))
        
        # Draw simple sticky note icon with better colors
        paper_color = (255, 235, 59)  # Brighter yellow
        border_color = (255, 152, 0)  # Orange border
        shadow_color = (0, 0, 0, 40)  # Semi-transparent shadow
        
        # Draw shadow
        shadow_offset = int(3 * scale)
        shadow_rect = [margin + shadow_offset, margin + shadow_offset, 
                      base_size - margin + shadow_offset, base_size - margin + shadow_offset]
        shadow_img = Image.new('RGBA', (base_size, base_size), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow_img)
        shadow_draw.rectangle(shadow_rect, fill=shadow_color)
        img = Image.alpha_composite(img, shadow_img)
        
        # Draw sticky note body
        paper_rect = [margin, margin, base_size - margin, base_size - margin]
        draw.rectangle(paper_rect, fill=paper_color)
        draw.rectangle(paper_rect, outline=border_color, width=border_width)
        
        # Draw fold corner
        fold_size = int(16 * scale)
        fold_points = [
            (base_size - margin - fold_size, margin),
            (base_size - margin, margin),
            (base_size - margin, margin + fold_size),
            (base_size - margin - fold_size, margin)
        ]
        draw.polygon(fold_points, fill=(255, 213, 79))
        draw.line([base_size - margin - fold_size, margin, 
                  base_size - margin - fold_size, margin + fold_size], 
                 fill=border_color, width=border_width)
        draw.line([base_size - margin - fold_size, margin + fold_size, 
                  base_size - margin, margin + fold_size], 
                 fill=border_color, width=border_width)
        
        # Draw lines on the note
        line_color = (158, 158, 158)
        line_count = 5
        line_start_y = margin + int(24 * scale)
        line_spacing = int(12 * scale)
        line_margin = int(16 * scale)
        
        for i in range(line_count):
            y = line_start_y + i * line_spacing
            if y < base_size - margin - int(16 * scale):
                draw.line([margin + line_margin, y, base_size - margin - line_margin, y], 
                         fill=line_color, width=line_width)
        
        # Draw text simulation (small rectangles)
        text_color = (97, 97, 97)
        text_height = int(6 * scale)
        text_margin = int(20 * scale)
        
        for i in range(4):
            y = line_start_y + i * line_spacing - int(2 * scale)
            if y < base_size - margin - int(16 * scale):
                # Vary text length
                text_width = int((30 + (i % 3) * 15) * scale)
                draw.rectangle([margin + text_margin, y, 
                              margin + text_margin + text_width, y + text_height], 
                             fill=text_color)
        
        # Save as single high-quality ICO (128x128)
        ico_path = '记事本.ico'
        img.save(ico_path, format='ICO')
        print("High-quality Windows icon created: " + ico_path)
        
        # Verify file creation
        if os.path.exists(ico_path):
            file_size = os.path.getsize(ico_path)
            print("Icon file size: " + str(file_size) + " bytes")
            if file_size > 1000:  # Should be larger now
                return True
            else:
                print("Warning: Icon file seems too small")
                return False
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
        print("High-quality icon creation completed successfully!")
        sys.exit(0)
    else:
        print("Icon creation failed!")
        sys.exit(1) 