# 记事本桌面应用

一个现代化的跨平台桌面记事本应用，基于Flask + PyWebView开发，提供原生桌面体验。

## 🚀 快速下载

### 📥 直接下载使用

前往 [GitHub Releases](https://github.com/jom111-111/notebook-app/releases/latest) 下载最新版本：

#### Windows 用户
- 下载 `notebook.exe` (约20MB)
- 双击即可运行，无需安装Python环境

#### macOS 用户
- 下载 `notebook-macos.app.tar.gz` (约17MB) - 完整应用包
- 或下载 `notebook-macos-executable` (约17MB) - 直接可执行文件
- 解压后即可使用

## ✨ 功能特性

- 🖥️ **原生桌面应用**: 基于PyWebView的真正桌面应用体验
- 🌍 **跨平台支持**: Windows和macOS原生支持
- 🔌 **无需联网**: 完全离线运行，数据本地存储
- 📝 **笔记管理**: 创建、编辑、删除笔记
- 🔍 **全文搜索**: 快速找到需要的笔记内容
- 🏷️ **标签系统**: 为笔记添加标签，便于分类管理
- ⭐ **收藏功能**: 标记重要笔记
- 🌙 **深色主题**: 现代化的深色界面设计
- 💾 **自动保存**: 每30秒自动保存编辑内容
- ⌨️ **快捷键**: 支持Ctrl+S保存、Ctrl+N新建等快捷键
- 📱 **响应式**: 界面自适应不同窗口尺寸
- 🔒 **数据隔离**: 每个用户的数据独立存储
- 🚀 **即开即用**: 绿色软件，无需安装

## 📦 数据存储

### Windows
```
%USERPROFILE%\.notebook_app\notes.db
```

### macOS/Linux
```
~/.notebook_app/notes.db
```

用户数据安全地存储在用户主目录中，**完全离线运行，无需联网**。多用户环境下数据完全隔离，保护隐私安全。

## 🛠️ 开发环境

如果你想从源代码运行或进行开发：

### 1. 克隆项目
```bash
git clone https://github.com/jom111-111/notebook-app.git
cd notebook-app
```

### 2. 安装依赖
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

### 3. 运行应用
```bash
# 桌面应用模式
python desktop_app.py

# 或Web模式（仅开发用）
python app.py
```

## 📁 项目结构

```
notebook-app/
├── desktop_app.py          # 桌面应用主文件
├── app.py                  # Flask Web应用
├── config.py               # 配置文件
├── requirements.txt        # Python依赖
├── notebook_windows.spec   # Windows构建配置
├── create_icon.py          # 图标生成脚本
├── models/
│   ├── __init__.py
│   └── note.py            # 笔记数据模型
├── routes/
│   ├── __init__.py
│   └── api.py             # API路由
├── static/
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   └── style.css      # 自定义样式
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   └── app.js         # 主要JavaScript逻辑
│   └── fonts/             # Font Awesome字体
├── templates/
│   ├── base.html          # 基础模板
│   └── index.html         # 主页面
├── .github/
│   └── workflows/
│       └── build-cross-platform.yml  # 自动构建配置
├── 记事本.ico              # Windows图标
├── 记事本.icns             # macOS图标
└── README.md
```

## 🔨 本地构建

### Windows
```bash
python create_icon.py
pyinstaller notebook_windows.spec --clean --noconfirm
```

### macOS
```bash
pyinstaller desktop_app.py --onefile --windowed --icon=记事本.icns --name=记事本桌面版
```

构建产物将输出到 `dist/` 目录。

## 🤖 自动化构建

项目使用GitHub Actions自动构建，支持：
- ✅ Windows可执行文件 (.exe)
- ✅ macOS应用包 (.app)
- ✅ 跨平台自动发布
- ✅ 自动创建GitHub Release

每次推送到main分支都会自动触发构建和发布流程。

## 📡 API 接口

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

## 📖 使用说明

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

## 🔧 技术栈

### 桌面应用
- **PyWebView**: Python桌面应用框架
- **PyInstaller**: 应用打包工具

### 后端
- **Flask**: Python Web框架
- **SQLAlchemy**: ORM工具
- **SQLite**: 轻量级数据库

### 前端
- **HTML5/CSS3**: 现代Web标准
- **JavaScript ES6+**: 原生JavaScript
- **Bootstrap 5**: UI框架
- **Font Awesome**: 图标库

### 构建和部署
- **GitHub Actions**: 自动化CI/CD
- **Cross-platform Build**: 跨平台自动构建

## 🗄️ 数据库结构

SQLite数据库包含以下字段：
- `id`: 笔记唯一标识
- `title`: 笔记标题
- `content`: 笔记内容
- `tags`: 标签（逗号分隔）
- `is_favorite`: 是否收藏
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 🚀 系统要求

### Windows
- Windows 7 或更高版本
- 无需额外安装Python环境

### macOS
- macOS 10.12 或更高版本
- 无需额外安装Python环境

## 🛣️ 发展规划

- [ ] 多标签页支持
- [ ] 数据导出功能（PDF、Word、Markdown）
- [ ] 图片和文件附件支持
- [ ] Markdown预览功能
- [ ] 主题自定义
- [ ] 多语言支持
- [ ] 云端同步功能

## 📜 许可证

MIT License

## 🤝 参与贡献

欢迎提交Issue和Pull Request！ 

### 开发流程
1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📞 支持

如果遇到问题或有建议，请：
- 提交 [GitHub Issue](https://github.com/jom111-111/notebook-app/issues)
- 查看 [Release页面](https://github.com/jom111-111/notebook-app/releases) 获取最新版本

---

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！** 