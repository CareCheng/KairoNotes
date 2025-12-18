# RustNote Editor

<p align="center">
  <img src="public/rustnote.svg" width="128" height="128" alt="RustNote Logo">
</p>

<p align="center">
  <strong>现代化跨平台文档编辑器</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#构建">构建</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#贡献">贡献</a>
</p>

---

## 功能特性

### 📝 编辑器功能
- **语法高亮** - 支持 50+ 编程语言
- **智能缩进** - 自动识别语言缩进规则
- **代码折叠** - 折叠代码块提高可读性
- **多光标编辑** - 同时编辑多处内容
- **查找替换** - 支持正则表达式

### 🌍 多语言支持
- 简体中文
- 繁体中文
- English
- Русский

### 🎨 现代化界面
- 深色/浅色主题
- 玻璃特效
- 流畅动画
- 可自定义布局

### 🔌 插件扩展
- 插件 API
- 命令系统
- 自定义主题

### 💻 跨平台
- Windows 10/11
- macOS 10.13+
- Linux (Ubuntu, Fedora, Arch...)

---

## 快速开始

### 系统要求

- Node.js 18+
- Rust 1.77+
- 系统构建工具

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/rustnote/rustnote-editor.git
cd rustnote-editor

# 安装依赖
npm install
```

### 开发模式

```bash
npm run tauri:dev
```

### 构建发布版

```bash
npm run tauri:build
```

---

## 构建

### Windows

```powershell
# 方式一：使用批处理脚本（推荐）
.\build.bat

# 方式二：使用 PowerShell 脚本
.\scripts\build.ps1

# 带参数构建
.\scripts\build.ps1 -Clean        # 清理后构建
.\scripts\build.ps1 -Debug        # 调试版本

# 方式三：手动构建
npm run tauri:build
```

### Linux / macOS

```bash
# 使用构建脚本
chmod +x scripts/build.sh
./scripts/build.sh

# 带参数构建
./scripts/build.sh --clean        # 清理后构建
./scripts/build.sh --debug        # 调试版本

# 手动构建
npm run tauri:build
```

### 构建输出

构建完成后，输出文件位于 `dist-release/` 目录：

```
dist-release/
├── rustnote.exe              # Windows 可执行文件
├── installers/
│   ├── RustNote_x.x.x_x64_en-US.msi    # MSI 安装包
│   └── RustNote_x.x.x_x64-setup.exe    # NSIS 安装包
└── portable/
    └── rustnote.exe          # 便携版
```

---

## 技术栈

### 前端
- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Monaco Editor** - 代码编辑器
- **Zustand** - 状态管理
- **Framer Motion** - 动画
- **i18next** - 国际化

### 后端
- **Rust** - 系统编程语言
- **Tauri 2.0** - 桌面应用框架
- **Tokio** - 异步运行时

---

## 项目结构

```
rustnote-editor/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── store/             # 状态管理
│   ├── styles/            # 样式文件
│   └── i18n/              # 国际化
├── src-tauri/             # Rust 后端
│   ├── src/               # Rust 源码
│   └── Cargo.toml         # Rust 依赖
├── scripts/               # 构建脚本
├── docs/                  # 文档
└── package.json           # 项目配置
```

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+N` | 新建文件 |
| `Ctrl+O` | 打开文件 |
| `Ctrl+S` | 保存文件 |
| `Ctrl+Shift+S` | 另存为 |
| `Ctrl+F` | 查找 |
| `Ctrl+H` | 替换 |
| `Ctrl+Shift+P` | 命令面板 |
| `Ctrl+,` | 设置 |

---

## 贡献

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md)。

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 发起 Pull Request

---

## 许可证

[MIT License](LICENSE)

---

## 致谢

- [Tauri](https://tauri.app/) - 桌面应用框架
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 代码编辑器
- [Lucide](https://lucide.dev/) - 图标库
