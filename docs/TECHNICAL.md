# KairoNotes 技术文档

## 项目概述

KairoNotes 是一款现代化的跨平台文档编辑器，使用 Tauri 2.x + React + TypeScript 构建。它提供了类似 VS Code 的编辑体验，支持语法高亮、多语言界面、插件系统等功能。

## 技术栈

### 后端 (Rust/Tauri)
- **Tauri 2.x** - 跨平台桌面应用框架
- **tokio** - 异步运行时
- **encoding_rs** - 多编码支持
- **syntect** - 语法高亮
- **serde** - 序列化/反序列化
- **walkdir** - 目录遍历
- **urlencoding** - URL 编解码

### 前端 (React/TypeScript)
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Monaco Editor** - 代码编辑器（CDN 加载）
- **Zustand** - 状态管理
- **Framer Motion** - 动画
- **i18next** - 国际化
- **Lucide React** - 图标库

## 项目结构

```
rustnote-editor/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   │   ├── App.tsx         # 主应用组件
│   │   ├── TitleBar.tsx    # 标题栏（无边框窗口）
│   │   ├── MenuBar.tsx     # 菜单栏（二级菜单）
│   │   ├── Sidebar.tsx     # 侧边栏（文件树）
│   │   ├── Editor.tsx      # Monaco 编辑器
│   │   ├── EditorTabs.tsx  # 标签页
│   │   ├── StatusBar.tsx   # 状态栏
│   │   ├── SearchPanel.tsx # 搜索面板
│   │   ├── SettingsPanel.tsx # 设置面板
│   │   ├── CommandPalette.tsx # 命令面板
│   │   ├── Terminal.tsx    # 内置终端
│   │   ├── MarkdownPreview.tsx # Markdown 预览
│   │   ├── ToolsPanel.tsx  # 工具面板
│   │   ├── Dialog.tsx      # 对话框
│   │   └── FileIcon.tsx    # 文件图标
│   ├── store/              # Zustand 状态管理
│   │   └── index.ts        # 全局状态
│   ├── styles/             # CSS 样式
│   └── i18n/               # 国际化配置
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── lib.rs          # 主入口（自定义协议）
│   │   ├── main.rs         # 程序入口
│   │   ├── commands.rs     # Tauri 命令
│   │   ├── file_ops.rs     # 文件操作
│   │   ├── editor.rs       # 编辑器功能
│   │   ├── settings.rs     # 设置管理（含终端类型配置）
│   │   ├── system_integration.rs # 系统集成（注册表、PATH、右键菜单）
│   │   ├── syntax.rs       # 语法检测
│   │   ├── terminal.rs     # 终端命令执行
│   │   ├── plugin.rs       # 插件系统
│   │   ├── fonts.rs        # 字体管理
│   │   └── encoding.rs     # 编码支持
│   ├── Cargo.toml          # Rust 依赖
│   └── tauri.conf.json     # Tauri 配置
├── Language/               # 语言文件（热更新）
│   ├── zh-CN.json          # 简体中文
│   ├── zh-TW.json          # 繁体中文
│   ├── en.json             # 英文
│   └── ru.json             # 俄文
├── Plugins/                # 插件目录（热更新）
├── Fonts/                  # 自定义字体目录
├── scripts/                # 构建脚本
│   ├── build.ps1           # Windows PowerShell
│   ├── build.sh            # Linux/macOS
│   └── build.bat           # Windows CMD
└── dist/                   # 构建输出
    ├── release/            # 标准版
    ├── debug/              # 开发版
    ├── packmsi/            # MSI 安装包
    ├── packexe/            # EXE 安装包
    └── build/              # 构建中间文件
```

## 核心功能

### 1. 无边框窗口
- 自定义标题栏，支持拖拽移动
- 窗口控制按钮（最小化、最大化、关闭）
- 菜单栏集成在标题栏
- 窗口状态保存（位置、大小、最大化状态）

### 2. 文件管理
- 文件树浏览（打开文件夹后显示）
- 多标签页编辑
- 文件类型图标
- 最近文件记录
- 会话恢复

### 3. 编辑器功能
- Monaco Editor 集成
- 语法高亮（100+ 语言）
- 代码折叠
- 括号匹配
- 小地图
- 多光标编辑

### 4. 极限模式
- 只保留最基础的编辑功能
- 隐藏侧边栏、终端等高级功能
- 保留代码语法高亮
- 适合作为简单文本编辑器使用

### 5. 编码支持
支持 40+ 种编码格式：
- Unicode: UTF-8, UTF-8 BOM, UTF-16 LE/BE
- 中文: GBK, GB18030, GB2312, Big5
- 日文: Shift_JIS, EUC-JP, ISO-2022-JP
- 韩文: EUC-KR
- 西欧: ISO-8859-1, Windows-1252
- 俄文: Windows-1251, KOI8-R

### 6. 字体管理
- 扫描系统字体
- 支持自定义字体（Fonts/ 目录）
- 等宽字体优先显示
- 字体预览

### 7. 国际化
- 支持 4 种语言
- 语言文件热更新
- 可扩展的语言包

### 8. 插件系统
- 基于 package.json 的插件清单
- 支持命令注册
- 支持菜单扩展
- 支持快捷键绑定

### 9. 系统集成
- 可注册为默认文本编辑器（关联 .txt, .md, .json 等文件类型）
- 可注册为 PATH 编辑器（在命令行中使用 `kaironotes` 命令）
- 支持添加到系统右键菜单（文件、文件夹、文件夹背景）
- 支持文件关联

### 10. 内置终端
- 支持多种终端类型：PowerShell、CMD、PowerShell Core (pwsh)、WSL、Git Bash
- 可在设置中切换终端类型
- 支持命令历史记录
- 支持工作目录切换
- 隐藏控制台窗口，无闪烁

### 11. 编辑器菜单功能
- 撤销/重做操作
- 剪切/复制/粘贴
- 全选
- 查找/替换
- 转到行
- 格式化文档

## 前端资源加载

KairoNotes 使用自定义协议 `kairogui://` 从本地 `gui` 文件夹加载前端资源，而不是将资源嵌入到可执行文件中。这样做的好处：

1. **热更新支持** - 可以直接替换 gui 文件夹中的文件
2. **减小可执行文件体积** - 前端资源独立存放
3. **便于调试** - 可以直接修改前端文件

## API 参考

### Tauri 命令

#### 文件操作
```typescript
// 读取文件
invoke('read_file', { path: string }): Promise<string>

// 写入文件
invoke('write_file', { path: string, content: string }): Promise<void>

// 获取文件信息
invoke('get_file_info', { path: string }): Promise<FileInfo>

// 列出目录
invoke('list_directory', { path: string }): Promise<DirectoryEntry[]>
```

#### 编码操作
```typescript
// 获取支持的编码列表
invoke('get_supported_encodings'): Promise<EncodingInfo[]>

// 检测文件编码
invoke('detect_file_encoding', { path: string }): Promise<string>

// 使用指定编码读取文件
invoke('read_file_with_encoding', { path: string, encodingName: string }): Promise<string>

// 使用指定编码写入文件
invoke('write_file_with_encoding', { path: string, content: string, encodingName: string }): Promise<void>
```

#### 字体操作
```typescript
// 获取所有可用字体
invoke('get_available_fonts'): Promise<FontInfo[]>

// 获取等宽字体
invoke('get_monospace_fonts'): Promise<FontInfo[]>

// 获取字体目录
invoke('get_fonts_directory'): Promise<string>
```

#### 设置操作
```typescript
// 获取设置
invoke('get_settings'): Promise<EditorSettings>

// 保存设置
invoke('save_settings', { newSettings: EditorSettings }): Promise<void>

// 获取配置文件目录
invoke('get_config_directory'): Promise<string>
```

#### 终端操作
```typescript
// 执行终端命令
invoke('execute_terminal_command', { 
  command: string, 
  cwd: string | null, 
  terminalType: string 
}): Promise<TerminalOutput>

// 获取可用终端列表
invoke('get_available_terminals'): Promise<string[]>

interface TerminalOutput {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}
```

#### 系统集成设置
```typescript
interface EditorSettings {
  // ... 其他设置
  registerAsDefaultEditor: boolean;  // 注册为默认编辑器
  registerAsPathEditor: boolean;     // 添加到 PATH
  addToContextMenu: boolean;         // 添加到右键菜单
  terminalType: string;              // 终端类型 (powershell/cmd/pwsh/wsl/gitbash)
}
```

当这些设置改变时，后端会自动执行相应的系统注册/注销操作。

## 构建指南

### 开发环境
```bash
# 安装依赖
cd rustnote-editor
npm install

# 启动开发服务器
npm run tauri dev
```

### 生产构建
```powershell
# 构建标准版
.\scripts\build.ps1 -release
# 或
.\scripts\build.ps1 --release

# 构建开发版
.\scripts\build.ps1 -dbg

# 构建 MSI 安装包
.\scripts\build.ps1 -packmsi

# 构建 EXE 安装包
.\scripts\build.ps1 -packexe

# 清理后构建
.\scripts\build.ps1 -clean -release
```

### 输出结构
```
dist/
├── release/              # 标准版输出
│   ├── kaironotes.exe    # 主程序
│   ├── config/           # 配置文件目录
│   │   ├── settings.json # 用户设置
│   │   └── recent_files.json
│   ├── gui/              # 前端资源
│   ├── Language/         # 语言文件（热更新）
│   ├── Plugins/          # 插件目录（热更新）
│   └── Fonts/            # 自定义字体
├── debug/                # 开发版输出
├── packmsi/              # MSI 安装包
├── packexe/              # EXE 安装包
└── build/                # 构建中间文件
    ├── cargo/            # Rust 编译缓存
    └── node_modules/     # npm 依赖
```

## 配置文件

### tauri.conf.json
```json
{
  "productName": "KairoNotes",
  "version": "1.0.0",
  "build": {
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "npm run dev"
  },
  "app": {
    "windows": [],
    "security": {
      "csp": "..."
    }
  }
}
```

### 配置文件位置
配置文件保存在程序根目录下的 `config` 文件夹中：
```
<程序目录>/
├── kaironotes.exe
├── config/
│   ├── settings.json      # 用户设置
│   └── recent_files.json  # 最近文件记录
├── gui/
├── Language/
├── Plugins/
└── Fonts/
```

这种设计使得程序可以作为便携版使用，所有配置跟随程序目录。

## 性能优化

1. **Monaco Editor CDN 加载** - 减少打包体积
2. **Zustand 持久化** - 仅持久化必要状态
3. **虚拟滚动** - 大文件列表优化
4. **异步文件操作** - 不阻塞 UI
5. **Release 构建优化** - LTO、strip、codegen-units=1
6. **自定义协议** - 前端资源不嵌入可执行文件

## 安全考虑

1. **CSP 策略** - 限制资源加载来源
2. **文件访问** - 通过 Tauri 权限系统控制
3. **插件沙箱** - 插件在受限环境运行

## 已知问题

1. Monaco Editor 需要网络加载（首次启动）
2. 某些系统字体可能无法正确识别
3. 大文件（>10MB）可能影响性能

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT License
