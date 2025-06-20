#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
便签精灵桌面应用
使用pywebview创建独立窗口
"""

import os
import sys
import threading
import time
import socket
from pathlib import Path
import webview
from flask import Flask

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# 如果是打包后的环境，设置正确的路径
if hasattr(sys, '_MEIPASS'):
    base_path = sys._MEIPASS
    os.chdir(base_path)
else:
    base_path = current_dir

from config import Config
from models import db
from models.note import Note
from routes.api import api

class NotebookApp:
    def __init__(self):
        self.app = None
        self.port = None
        
    def find_free_port(self):
        """找到一个可用的端口"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', 0))
            s.listen(1)
            port = s.getsockname()[1]
        return port

    def create_flask_app(self):
        """创建Flask应用"""
        app = Flask(__name__)
        app.config.from_object(Config)
        
        # 初始化数据库
        db.init_app(app)
        
        # 注册蓝图
        app.register_blueprint(api)
        
        # 创建数据库表
        with app.app_context():
            db.create_all()
        
        @app.route('/')
        def index():
            """主页面"""
            from flask import render_template
            return render_template('index.html')
        
        return app

    def start_flask_server(self):
        """启动Flask服务器"""
        self.port = self.find_free_port()
        self.app = self.create_flask_app()
        
        print(f"🚀 Flask服务器启动在端口 {self.port}")
        
        # 在新线程中启动Flask
        flask_thread = threading.Thread(
            target=lambda: self.app.run(
                host='127.0.0.1', 
                port=self.port, 
                debug=False, 
                use_reloader=False,
                threaded=True
            )
        )
        flask_thread.daemon = True
        flask_thread.start()
        
        # 等待服务器启动
        time.sleep(2)
        return f'http://127.0.0.1:{self.port}'

    def create_window(self):
        """创建桌面窗口"""
        url = self.start_flask_server()
        
        # 创建桌面窗口
        window = webview.create_window(
            title='✨ 便签精灵',
            url=url,
            width=1200,
            height=800,
            min_size=(800, 600),
            resizable=True,
            maximized=False,
            on_top=False,
            shadow=True
        )
        
        return window

def main():
    """主函数"""
    print("🚀 便签精灵桌面应用启动中...")
    
    # 检查用户数据目录
    user_data_dir = Path.home() / '.notebook_app'
    print(f"📁 用户数据目录: {user_data_dir}")
    
    try:
        # 创建应用实例
        app = NotebookApp()
        
        # 创建窗口
        window = app.create_window()
        
        print("✅ 桌面窗口已创建")
        print("💡 如果窗口没有自动打开，请检查防火墙或安全设置")
        
        # 启动GUI事件循环
        webview.start(debug=False)
        
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        input("按回车键退出...")
        sys.exit(1)

if __name__ == '__main__':
    main() 