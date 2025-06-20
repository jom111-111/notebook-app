#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创建应用图标 (支持Windows和macOS)
"""

try:
    from PIL import Image, ImageDraw
    import os
    import sys
    
    def create_icon():
        """创建应用图标"""
        print("🎨 正在创建应用图标...")
        
        # 创建64x64的图标
        size = 64
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # 绘制便签纸
        margin = 8
        paper_color = '#FFD700'  # 金黄色
        shadow_color = '#B8860B'  # 阴影色
        
        # 阴影
        shadow_rect = [margin+2, margin+2, size-margin+2, size-margin+2]
        draw.rounded_rectangle(shadow_rect, radius=4, fill=shadow_color)
        
        # 便签纸主体
        paper_rect = [margin, margin, size-margin, size-margin]
        draw.rounded_rectangle(paper_rect, radius=4, fill=paper_color)
        draw.rounded_rectangle(paper_rect, radius=4, outline='#DAA520', width=2)
        
        # 横线
        line_color = '#CD853F'
        for i in range(3):
            y = margin + 12 + i * 8
            draw.line([margin+6, y, size-margin-6, y], fill=line_color, width=1)
        
        # 文字点
        text_color = '#8B4513'
        for i in range(2):
            y = margin + 16 + i * 8
            for j in range(4):
                x = margin + 8 + j * 6
                draw.ellipse([x, y, x+2, y+2], fill=text_color)
        
        # 保存不同格式的图标
        sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
        images = []
        
        for ico_size in sizes:
            resized = img.resize(ico_size, Image.Resampling.LANCZOS)
            images.append(resized)
        
        # Windows图标 (.ico)
        ico_path = 'notebook.ico'
        images[0].save(ico_path, format='ICO', sizes=[(img.width, img.height) for img in images])
        print(f"✅ Windows图标已创建: {ico_path}")
        
        # 同时创建中文名称的图标（用于本地开发）
        try:
            ico_path_cn = '记事本.ico'
            images[0].save(ico_path_cn, format='ICO', sizes=[(img.width, img.height) for img in images])
            print(f"✅ 中文图标已创建: {ico_path_cn}")
        except:
            pass  # 在某些环境中可能无法创建中文文件名
        
        # macOS图标 (.icns) - 如果系统支持
        try:
            # 保存为PNG然后转换为icns
            png_path = '记事本_temp.png'
            img.save(png_path, format='PNG')
            
            # 尝试使用sips命令转换 (仅macOS)
            if sys.platform == 'darwin':
                os.system(f'sips -s format icns {png_path} --out 记事本.icns')
                os.remove(png_path)
                print("✅ macOS图标已创建: 记事本.icns")
            else:
                os.remove(png_path)
        except:
            pass
        
        print("🎉 图标创建完成！")
        return True
        
    if __name__ == '__main__':
        create_icon()
        
except ImportError:
    print("❌ 错误：需要安装Pillow库")
    print("请运行: pip install Pillow")
    input("按回车键退出...")
except Exception as e:
    print(f"❌ 创建图标时出错: {e}")
    input("按回车键退出...") 