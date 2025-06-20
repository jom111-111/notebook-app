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

# Safe print function for Windows compatibility
def safe_print(message):
    """Print function that handles encoding issues on Windows"""
    try:
        print(message)
    except UnicodeEncodeError:
        # Fallback: print ASCII-safe version
        print(message.encode('ascii', 'ignore').decode('ascii'))

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
        
        safe_print("Flask server starting on port " + str(self.port))
        
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
        try:
            # Try with full parameters first
            window = webview.create_window(
                title='Notebook App',
                url=url,
                width=1200,
                height=800,
                min_size=(800, 600),
                resizable=True
            )
        except TypeError as e:
            safe_print("Window creation with full params failed: " + str(e))
            # Fallback to basic parameters
            window = webview.create_window(
                title='Notebook App',
                url=url,
                width=1200,
                height=800
            )
        
        return window

def main():
    """Main function"""
    # Create log file for debugging
    log_file = None
    try:
        import tempfile
        log_file = open(os.path.join(tempfile.gettempdir(), 'notebook_app_debug.log'), 'w', encoding='utf-8')
        
        def debug_log(message):
            try:
                safe_print(message)
                if log_file:
                    log_file.write(message + '\n')
                    log_file.flush()
            except:
                pass
        
        debug_log("=== Notebook Desktop Application Debug Log ===")
        debug_log("Python version: " + sys.version)
        debug_log("Platform: " + sys.platform)
        debug_log("Current directory: " + os.getcwd())
        
        debug_log("Notebook desktop application starting...")
        
        # Check user data directory
        user_data_dir = Path.home() / '.notebook_app'
        debug_log("User data directory: " + str(user_data_dir))
        
        # Ensure user data directory exists
        user_data_dir.mkdir(exist_ok=True)
        debug_log("User data directory created/verified")
        
        # Test imports
        debug_log("Testing imports...")
        try:
            import flask
            debug_log("Flask import: OK")
        except Exception as e:
            debug_log("Flask import failed: " + str(e))
            
        try:
            import webview
            debug_log("PyWebView import: OK")
        except Exception as e:
            debug_log("PyWebView import failed: " + str(e))
            
        try:
            from models import db
            debug_log("Database models import: OK")
        except Exception as e:
            debug_log("Database models import failed: " + str(e))
        
        # Create application instance
        debug_log("Creating application instance...")
        app = NotebookApp()
        debug_log("Application instance created")
        
        # Create window
        debug_log("Creating desktop window...")
        window = app.create_window()
        debug_log("Desktop window created successfully")
        
        debug_log("Starting GUI event loop...")
        # Start GUI event loop
        webview.start(debug=False)
        debug_log("GUI event loop ended")
        
    except Exception as e:
        error_msg = "Startup failed: " + str(e)
        safe_print(error_msg)
        if log_file:
            log_file.write(error_msg + '\n')
            log_file.write("Exception type: " + str(type(e)) + '\n')
            import traceback
            log_file.write("Traceback:\n" + traceback.format_exc() + '\n')
            log_file.flush()
        
        # Show error dialog on Windows
        if sys.platform == 'win32':
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(0, 
                    "Application failed to start. Check debug log at: " + 
                    os.path.join(tempfile.gettempdir(), 'notebook_app_debug.log'), 
                    "Notebook App Error", 1)
            except:
                pass
        
        try:
            input("Press Enter to exit...")
        except:
            pass
        sys.exit(1)
    finally:
        if log_file:
            log_file.close()

if __name__ == '__main__':
    main() 