import os
from flask import Flask, render_template
from flask_cors import CORS
from config import Config
from models import db
from models.note import Note
from routes.api import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # 启用CORS
    CORS(app)
    
    # 初始化数据库
    db.init_app(app)
    
    # 注册蓝图
    app.register_blueprint(api)
    
    # 创建数据库目录
    os.makedirs('database', exist_ok=True)
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    @app.route('/')
    def index():
        """主页面"""
        return render_template('index.html')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5005) 