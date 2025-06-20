from datetime import datetime, timezone, timedelta
from models import db

# 定义中国时区 (UTC+8)
CHINA_TZ = timezone(timedelta(hours=8))

class Note(db.Model):
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    tags = db.Column(db.String(500))  # 用逗号分隔的标签字符串
    is_favorite = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(CHINA_TZ).replace(tzinfo=None))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(CHINA_TZ).replace(tzinfo=None), onupdate=lambda: datetime.now(CHINA_TZ).replace(tzinfo=None))
    
    def to_dict(self):
        """将笔记对象转换为字典格式"""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'tags': self.tags.split(',') if self.tags else [],
            'is_favorite': self.is_favorite,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Note {self.title}>' 