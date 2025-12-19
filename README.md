# KairoNotes

<p align="center">
  <img src="public/kaironotes.svg" alt="KairoNotes Logo" width="128" height="128">
</p>

<p align="center">
  <strong>现代化跨平台文档编辑器</strong>
</p>

<p align="center">
  基于 Tauri + React + Monaco Editor 构建
</p>

---

## ✨ 特性

- 🎨 **现代化界面** - 无边框窗口，类 VS Code 设计
- 📝 **强大编辑** - Monaco Editor 提供专业级编辑体验
- 🌍 **多语言支持** - 简体中文、繁体中文、英文、俄文
- 📁 **文件管理** - 文件树、多标签页、文件类型图标
- 🔍 **搜索替换** - 支持正则表达式
- 🎯 **语法高亮** - 支持 100+ 编程语言
- 📦 **编码支持** - 40+ 种文件编码格式
- 🔤 **字体管理** - 系统字体扫描、自定义字体支持
- 🔌 **插件系统** - 可扩展的插件架构
- 💾 **会话恢复** - 自动保存和恢复工作状态
- 🖥️ **跨平台** - Windows、macOS、Linux

## 📸 截图

![KairoNotes Screenshot](docs/screenshot.png)

## 🚀 快速开始

### 下载安装

从 [Releases](https://github.com/kaironotes/kaironotes/releases) 页面下载最新版本。

### 从源码构建

#### 前置要求

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/) 1.77+
- [Tauri CLI](https://tauri.app/)

#### 开发模式

```bash
# 克隆项目
git clone https://github.com/kaironotes/kaironotes.git
cd kaironotes/rustnote-editor

# 安装依赖
npm install

# 启动开发服务器
npm run tauri dev
```

#### 生产构建

```powershell
# Windows
.\scripts\build.ps1

# 包含安装程序
.\scripts\build.ps1 -Installer
```

```bash
# macOS / Linux
./scripts/build.sh
```

## 📂 目录结构

```
dist-release/
├── kaironotes.exe    # 主程序
├── dist/             # 前端资源（可热更新）
├── Language/         # 语言文件（可热更新）
│   ├── zh-CN.json    # 简体中文
│   ├── zh-TW.json    # 繁体中文
│   ├── en.json       # 英文
│   └── ru.json       # 俄文
├── Plugins/          # 插件目录
└── Fonts/            # 自定义字体
```

## ⌨️ 快捷键

| 功能 | 快捷键 |
|------|--------|
| 新建文件 | `Ctrl+N` |
| 打开文件 | `Ctrl+O` |
| 保存 | `Ctrl+S` |
| 另存为 | `Ctrl+Shift+S` |
| 查找 | `Ctrl+F` |
| 替换 | `Ctrl+H` |
| 命令面板 | `Ctrl+Shift+P` |
| 转到行 | `Ctrl+G` |
| 切换终端 | `Ctrl+\`` |
| 设置 | `Ctrl+,` |

## 🔌 插件开发

参见 [插件开发文档](docs/PLUGIN_DEVELOPMENT.md)

## 🛠️ 技术文档

参见 [技术文档](docs/TECHNICAL.md)

## 🌐 添加新语言

1. 在 `Language/` 目录创建新的 JSON 文件（如 `ja.json`）
2. 复制 `en.json` 的内容并翻译
3. 重启应用即可在设置中选择新语言

## 🎨 自定义字体

1. 将字体文件（.ttf, .otf）放入 `Fonts/` 目录
2. 重启应用
3. 在设置中选择新字体

## 📝 支持的编码

- **Unicode**: UTF-8, UTF-8 BOM, UTF-16 LE/BE
- **中文**: GBK, GB18030, GB2312, Big5, Big5-HKSCS
- **日文**: Shift_JIS, EUC-JP, ISO-2022-JP
- **韩文**: EUC-KR, ISO-2022-KR
- **西欧**: ISO-8859-1/15, Windows-1252
- **中欧**: ISO-8859-2, Windows-1250
- **俄文**: Windows-1251, KOI8-R/U, ISO-8859-5
- **更多**: 希腊文、土耳其文、希伯来文、阿拉伯文、泰文、越南文、波罗的海语系

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台框架
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 代码编辑器
- [React](https://react.dev/) - UI 框架
- [Lucide](https://lucide.dev/) - 图标库
