import os
from pathlib import Path
 
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    
    # 使用用户主目录存储数据库，每个用户独立
    user_home = Path.home()
    app_data_dir = user_home / '.notebook_app'
    app_data_dir.mkdir(exist_ok=True)
    
    database_path = app_data_dir / 'notes.db'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{database_path}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False 