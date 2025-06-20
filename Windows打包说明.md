# Windows版本打包说明

## 系统要求
- Windows 10/11
- Python 3.8或更高版本

## 打包步骤

### 1. 安装Python依赖
```bash
pip install -r requirements.txt
pip install pyinstaller pillow pywebview
```

### 2. 创建Windows图标
```bash
python create_windows_icon.py
```

### 3. 执行打包命令
```bash
pyinstaller 记事本_windows.spec --clean --noconfirm
```

### 4. 查找生成的exe文件
打包完成后，在 `dist/` 目录下会生成 `记事本.exe` 文件。

## 自动打包脚本

我们提供了一个批处理脚本 `build_windows.bat`，可以一键完成所有打包步骤：

```batch
@echo off
echo 正在安装依赖...
pip install -r requirements.txt
pip install pyinstaller pillow pywebview

echo 正在创建Windows图标...
python create_windows_icon.py

echo 正在打包应用...
pyinstaller 记事本_windows.spec --clean --noconfirm

echo 打包完成！
echo 可执行文件位置: dist\记事本.exe
pause
```

## 使用说明

打包完成后的 `记事本.exe` 具有以下特性：

✅ **独立运行**：无需安装Python环境
✅ **用户隔离**：每个用户独立的数据库文件
✅ **现代界面**：深色主题，响应式设计
✅ **本地存储**：数据存储在用户主目录 `%USERPROFILE%\.notebook_app\`

### 分发说明

1. 将 `dist\记事本.exe` 发送给Windows用户
2. 用户双击即可运行，无需任何安装
3. 首次运行会自动创建用户数据目录
4. 每个用户的笔记数据完全独立

### 故障排除

如果遇到问题：

1. **杀毒软件拦截**：将exe文件添加到杀毒软件白名单
2. **端口占用**：应用会自动寻找可用端口
3. **权限问题**：确保用户有读写主目录的权限

## 技术细节

- **框架**：Flask + PyWebView
- **数据库**：SQLite
- **打包工具**：PyInstaller
- **界面**：Bootstrap + 自定义CSS
- **图标**：自动生成的ICO格式图标 