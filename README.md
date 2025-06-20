# 记事本工具

一个基于Flask+HTML/CSS/JavaScript的现代化记事本Web应用。

## 功能特性

- ✨ **现代化界面**: 基于Bootstrap 5的响应式设计
- 📝 **笔记管理**: 创建、编辑、删除笔记
- 🔍 **搜索功能**: 全文搜索，快速找到需要的笔记
- 🏷️ **标签系统**: 为笔记添加标签，便于分类管理
- ⭐ **收藏功能**: 标记重要笔记
- 🌙 **深色主题**: 支持暗主题
- 💾 **自动保存**: 每30秒自动保存编辑内容
- ⌨️ **快捷键**: 支持Ctrl+S保存、Ctrl+N新建等快捷键
- 📱 **响应式**: 完美支持PC和移动端

## 快速开始

### 1. 安装依赖

```bash
# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 运行应用

```bash
python app.py
```

### 3. 访问应用

打开浏览器访问: http://localhost:8080

## 项目结构

```
记事本/
├── app.py                 # Flask应用主文件
├── config.py              # 配置文件
├── requirements.txt       # Python依赖
├── models/
│   ├── __init__.py
│   └── note.py           # 笔记数据模型
├── routes/
│   ├── __init__.py
│   └── api.py            # API路由
├── static/
│   ├── css/
│   │   └── style.css     # 自定义样式
│   └── js/
│       └── app.js        # 主要JavaScript逻辑
├── templates/
│   ├── base.html         # 基础模板
│   └── index.html        # 主页面
├── database/
│   └── notes.db          # SQLite数据库文件（自动创建）
└── README.md
```

## API 接口

### 笔记相关
- `GET /api/notes` - 获取笔记列表
- `GET /api/notes/<id>` - 获取单个笔记
- `POST /api/notes` - 创建新笔记
- `PUT /api/notes/<id>` - 更新笔记
- `DELETE /api/notes/<id>` - 删除笔记

### 搜索和统计
- `GET /api/search?q=<keyword>` - 搜索笔记
- `GET /api/notes/tags` - 获取所有标签
- `GET /api/stats` - 获取统计信息

## 使用说明

### 基本操作
1. **新建笔记**: 点击"新建笔记"按钮或使用Ctrl+N
2. **编辑笔记**: 点击笔记列表中的任意笔记开始编辑
3. **保存笔记**: 点击保存按钮或使用Ctrl+S（也支持自动保存）
4. **删除笔记**: 点击删除按钮并确认

### 高级功能
1. **添加标签**: 在标签输入框中输入标签，用逗号分隔
2. **搜索笔记**: 在搜索框中输入关键词
3. **筛选笔记**: 使用左侧的筛选选项（全部/收藏）
4. **标签筛选**: 点击标签快速筛选相关笔记

### 快捷键
- `Ctrl + S`: 保存当前笔记
- `Ctrl + N`: 创建新笔记

## 技术栈

### 后端
- **Flask**: Python Web框架
- **SQLAlchemy**: ORM工具
- **SQLite**: 轻量级数据库

### 前端
- **HTML5/CSS3**: 现代Web标准
- **JavaScript ES6+**: 原生JavaScript
- **Bootstrap 5**: UI框架
- **Font Awesome**: 图标库

## 数据存储

数据存储在SQLite数据库中，位置：`database/notes.db`

数据库会在首次运行时自动创建，包含以下字段：
- id: 笔记唯一标识
- title: 笔记标题
- content: 笔记内容
- tags: 标签（逗号分隔）
- is_favorite: 是否收藏
- created_at: 创建时间
- updated_at: 更新时间

## 自定义配置

可以通过环境变量或修改`config.py`来自定义配置：

```python
# config.py
SECRET_KEY = 'your-secret-key'  # Flask密钥
SQLALCHEMY_DATABASE_URI = 'sqlite:///database/notes.db'  # 数据库路径
```

## 部署建议

### 本地开发
直接运行`python app.py`即可，默认运行在`http://localhost:8080`

### 生产环境
建议使用Gunicorn等WSGI服务器：

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 后续扩展计划

- [ ] 数据导出功能（PDF、Word、Markdown）
- [ ] 多用户支持和权限管理
- [ ] 云端同步功能
- [ ] 图片和文件附件支持
- [ ] Markdown预览功能
- [ ] 协作编辑功能

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！ 