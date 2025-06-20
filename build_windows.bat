@echo off
chcp 65001 >nul
echo ==========================================
echo           记事本应用 Windows打包工具
echo ==========================================
echo.

echo [1/4] 正在安装Python依赖...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo 错误：依赖安装失败
    pause
    exit /b 1
)

echo [2/4] 正在安装打包工具...
pip install pyinstaller pillow pywebview
if %errorlevel% neq 0 (
    echo 错误：打包工具安装失败
    pause
    exit /b 1
)

echo [3/4] 正在创建Windows图标...
python create_icon.py
if %errorlevel% neq 0 (
    echo 错误：图标创建失败
    pause
    exit /b 1
)

echo [4/4] 正在打包应用程序...
pyinstaller 记事本_windows.spec --clean --noconfirm
if %errorlevel% neq 0 (
    echo 错误：应用打包失败
    pause
    exit /b 1
)

echo.
echo ==========================================
echo              ✅ 打包完成！
echo ==========================================
echo.
echo 📁 可执行文件位置: dist\记事本.exe
echo 📊 文件大小: 约25MB
echo 🎯 支持系统: Windows 10/11
echo.
echo 💡 使用说明:
echo    - 双击运行 记事本.exe
echo    - 数据存储在: %%USERPROFILE%%\.notebook_app\
echo    - 每个用户独立数据库
echo.
echo 🚀 现在可以将 dist\记事本.exe 分发给其他用户了！
echo.
pause 