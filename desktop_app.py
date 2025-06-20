#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import threading
import time
import socket
from pathlib import Path
import webview
from flask import Flask

# Fix Windows encoding issues
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

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
        """Find an available port"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', 0))
            s.listen(1)
            port = s.getsockname()[1]
        return port

    def create_flask_app(self):
        """Create Flask application"""
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
            """Main page"""
            from flask import render_template
            return render_template('index.html')
        
        return app

    def start_flask_server(self):
        """Start Flask server"""
        self.port = self.find_free_port()
        self.app = self.create_flask_app()
        
        print("Flask server starting on port " + str(self.port))
        
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
        
        # Wait for server to start
        time.sleep(2)
        return 'http://127.0.0.1:' + str(self.port)

    def create_window(self):
        """Create desktop window"""
        url = self.start_flask_server()
        
        # Create desktop window
        window = webview.create_window(
            title='Notebook App',
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
    """Main function"""
    print("Notebook desktop application starting...")
    
    # Check user data directory
    user_data_dir = Path.home() / '.notebook_app'
    print("User data directory: " + str(user_data_dir))
    
    try:
        # Create application instance
        app = NotebookApp()
        
        # Create window
        window = app.create_window()
        
        print("Desktop window created successfully")
        print("If window doesn't open automatically, please check firewall settings")
        
        # Start GUI event loop
        webview.start(debug=False)
        
    except Exception as e:
        print("Startup failed: " + str(e))
        input("Press Enter to exit...")
        sys.exit(1)

if __name__ == '__main__':
    main() 