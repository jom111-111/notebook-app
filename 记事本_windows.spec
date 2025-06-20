# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['desktop_app.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('templates', 'templates'),
        ('static', 'static'),
        ('models', 'models'),
        ('routes', 'routes'),
        ('config.py', '.'),
        ('记事本.ico', '.'),  # Windows使用.ico图标
    ],
    hiddenimports=[
        'flask',
        'flask_sqlalchemy',
        'sqlalchemy',
        'webview',
        'jinja2',
        'werkzeug',
        'click',
        'itsdangerous',
        'markupsafe',
        'blinker',
        'pywebview',
        'pythonnet',
        'clr',
        'System',
        'System.Windows.Forms',
        'System.Drawing',
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

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='记事本',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Windows GUI应用，不显示控制台
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='记事本.ico',  # Windows图标
    version_file=None,
) 