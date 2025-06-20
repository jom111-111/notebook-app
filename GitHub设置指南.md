# GitHub自动打包设置指南

## 🚀 第一步：创建GitHub仓库

### 1. 访问GitHub
打开 https://github.com 并登录你的账号

### 2. 创建新仓库
- 点击右上角的 "+" 按钮
- 选择 "New repository"
- 仓库名称：`notebook-app` 或 `记事本应用`
- 描述：`现代化的跨平台记事本应用`
- 设置为 **Public** (公开仓库，免费使用Actions)
- **不要**勾选 "Add a README file"
- 点击 "Create repository"

## 📤 第二步：上传代码

### 方法1：使用命令行 (推荐)
在终端中运行以下命令：

```bash
# 添加远程仓库 (替换YOUR_USERNAME为你的GitHub用户名)
git remote add origin https://github.com/YOUR_USERNAME/notebook-app.git

# 推送代码
git branch -M main
git push -u origin main
```

### 方法2：使用GitHub Desktop
1. 下载并安装 GitHub Desktop
2. 点击 "Add an Existing Repository from your Hard Drive"
3. 选择项目文件夹
4. 点击 "Publish repository"

## ⚡ 第三步：触发自动打包

### 自动触发
代码推送后，GitHub Actions会自动开始打包！

### 查看进度
1. 在GitHub仓库页面点击 "Actions" 标签
2. 可以看到 "Build Windows App" 工作流正在运行
3. 等待约5-10分钟完成打包

### 下载exe文件
打包完成后：
1. 在Actions页面点击最新的工作流运行
2. 在 "Artifacts" 部分下载 `notebook-windows-exe`
3. 解压后获得 `记事本.exe` 文件

## 🎯 第四步：自动发布 (可选)

如果推送到main分支，还会自动创建Release：
1. 在仓库页面点击 "Releases"
2. 可以看到自动创建的版本
3. 直接下载附件中的exe文件

## 🔧 故障排除

### 如果Actions失败：
1. 检查 `.github/workflows/build-windows.yml` 文件是否存在
2. 确保仓库是Public（Private仓库Actions有限制）
3. 查看Actions日志了解具体错误

### 如果找不到exe文件：
1. 确认工作流已完成（绿色勾勾）
2. 在Artifacts部分查找下载链接
3. 检查是否有错误日志

## 📋 完整命令示例

```bash
# 在项目目录中运行
git remote add origin https://github.com/YOUR_USERNAME/notebook-app.git
git branch -M main
git push -u origin main
```

**记住替换 `YOUR_USERNAME` 为你的GitHub用户名！**

## 🎉 完成！

设置完成后，每次推送代码都会自动打包Windows版本，非常方便！ 