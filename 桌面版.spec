# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

# 分析主脚本
a = Analysis(
    ['desktop_app.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('templates', 'templates'),
        ('static', 'static'),
    ],
    hiddenimports=[
        'flask',
        'flask_sqlalchemy',
        'flask_cors',
        'sqlalchemy',
        'werkzeug',
        'jinja2',
        'click',
        'itsdangerous',
        'blinker',
        'webview',
        'pyobjc',
        'pyobjc-core',
        'pyobjc-framework-Cocoa',
        'pyobjc-framework-WebKit',
        'pyobjc-framework-Quartz',
        'models',
        'models.note',
        'routes',
        'routes.api',
        'config',
        'pathlib',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# 打包资源
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# 创建可执行文件
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='便签精灵',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # 不显示控制台窗口，纯GUI应用
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='记事本.icns',  # 便签纸图标
)

# macOS应用包
app = BUNDLE(
    exe,
    name='便签精灵.app',
    icon='记事本.icns',
    bundle_identifier='com.notebook.desktop',
    info_plist={
        'NSHighResolutionCapable': 'True',
        'NSRequiresAquaSystemAppearance': 'False',
        'CFBundleName': '便签精灵',
        'CFBundleDisplayName': '便签精灵',
        'CFBundleVersion': '1.0.0',
        'CFBundleShortVersionString': '1.0.0',
    }
) 