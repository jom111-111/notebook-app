from flask import Blueprint, jsonify, request
from models import db
from models.note import Note
from datetime import datetime, timezone, timedelta

# 定义中国时区 (UTC+8)
CHINA_TZ = timezone(timedelta(hours=8))

api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/notes', methods=['GET'])
def get_notes():
    """获取所有笔记"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    
    query = Note.query
    
    # 搜索功能
    if search:
        query = query.filter(
            (Note.title.contains(search)) | 
            (Note.content.contains(search))
        )
    
    # 分页
    notes = query.order_by(Note.updated_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'notes': [note.to_dict() for note in notes.items],
        'total': notes.total,
        'pages': notes.pages,
        'current_page': page
    })

@api.route('/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    """获取单个笔记"""
    note = Note.query.get_or_404(note_id)
    return jsonify(note.to_dict())

@api.route('/notes', methods=['POST'])
def create_note():
    """创建新笔记"""
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': '标题不能为空'}), 400
    
    note = Note(
        title=data['title'],
        content=data.get('content', ''),
        tags=','.join(data.get('tags', [])),
        is_favorite=data.get('is_favorite', False)
    )
    
    db.session.add(note)
    db.session.commit()
    
    return jsonify(note.to_dict()), 201

@api.route('/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    """更新笔记"""
    note = Note.query.get_or_404(note_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': '无效的数据'}), 400
    
    note.title = data.get('title', note.title)
    note.content = data.get('content', note.content)
    note.tags = ','.join(data.get('tags', [])) if 'tags' in data else note.tags
    note.is_favorite = data.get('is_favorite', note.is_favorite)
    note.updated_at = datetime.now(CHINA_TZ).replace(tzinfo=None)
    
    db.session.commit()
    
    return jsonify(note.to_dict())

@api.route('/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """删除笔记"""
    note = Note.query.get_or_404(note_id)
    db.session.delete(note)
    db.session.commit()
    
    return jsonify({'message': '笔记已删除'})

@api.route('/search', methods=['GET'])
def search_notes():
    """搜索笔记"""
    keyword = request.args.get('q', '')
    
    if not keyword:
        return jsonify({'notes': []})
    
    notes = Note.query.filter(
        (Note.title.contains(keyword)) | 
        (Note.content.contains(keyword)) |
        (Note.tags.contains(keyword))
    ).order_by(Note.updated_at.desc()).all()
    
    return jsonify({
        'notes': [note.to_dict() for note in notes],
        'keyword': keyword
    })

@api.route('/notes/tags', methods=['GET'])
def get_tags():
    """获取所有标签"""
    notes = Note.query.all()
    tags = set()
    
    for note in notes:
        if note.tags:
            tags.update(note.tags.split(','))
    
    return jsonify(list(tags))

@api.route('/stats', methods=['GET'])
def get_stats():
    """获取统计信息"""
    total_notes = Note.query.count()
    favorite_notes = Note.query.filter_by(is_favorite=True).count()
    
    return jsonify({
        'total_notes': total_notes,
        'favorite_notes': favorite_notes
    }) 