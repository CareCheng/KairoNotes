# KairoNotes 技术文档

## 项目概述

KairoNotes 是一款现代化的跨平台文档编辑器，使用 Tauri + React + TypeScript 构建。它提供了类似 VS Code 的编辑体验，支持语法高亮、多语言界面、插件系统等功能。

## 技术栈

### 后端 (Rust/Tauri)
- **Tauri 2.x** - 跨平台桌面应用框架
- **tokio** - 异步运行时
- **encoding_rs** - 多编码支持
- **syntect** - 语法高亮
- **serde** - 序列化/反序列化
- **walkdir** - 目录遍历

### 前端 (React/TypeScript)
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Monaco Editor** - 代码编辑器
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
│   │   ├── lib.rs          # 主入口
│   │   ├── main.rs         # 程序入口
│   │   ├── commands.rs     # Tauri 命令
│   │   ├── file_ops.rs     # 文件操作
│   │   ├── editor.rs       # 编辑器功能
│   │   ├── settings.rs     # 设置管理
│   │   ├── syntax.rs       # 语法检测
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
└── Fonts/                  # 自定义字体目录
```

## 核心功能

### 1. 无边框窗口
- 自定义标题栏，支持拖拽移动
- 窗口控制按钮（最小化、最大化、关闭）
- 菜单栏集成在标题栏

### 2. 文件管理
- 文件树浏览
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

### 4. 编码支持
支持 40+ 种编码格式：
- Unicode: UTF-8, UTF-8 BOM, UTF-16 LE/BE
- 中文: GBK, GB18030, GB2312, Big5
- 日文: Shift_JIS, EUC-JP, ISO-2022-JP
- 韩文: EUC-KR
- 西欧: ISO-8859-1, Windows-1252
- 俄文: Windows-1251, KOI8-R

### 5. 字体管理
- 扫描系统字体
- 支持自定义字体（Fonts/ 目录）
- 等宽字体优先显示
- 字体预览

### 6. 国际化
- 支持 4 种语言
- 语言文件热更新
- 可扩展的语言包

### 7. 插件系统
- 基于 package.json 的插件清单
- 支持命令注册
- 支持菜单扩展
- 支持快捷键绑定

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
```

## 构建指南

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run tauri dev
```

### 生产构建
```powershell
# 快速构建（仅 exe + 资源）
.\scripts\build.ps1

# 包含安装程序
.\scripts\build.ps1 -Installer

# 清理构建
.\scripts\build.ps1 -Clean
```

### 输出结构
```
dist-release/
├── kaironotes.exe    # 主程序
├── dist/             # 前端资源
├── Language/         # 语言文件
├── Plugins/          # 插件目录
└── Fonts/            # 自定义字体
```

## 配置文件

### tauri.conf.json
```json
{
  "productName": "KairoNotes",
  "version": "1.0.0",
  "app": {
    "windows": [{
      "decorations": false,  // 无边框窗口
      "width": 1400,
      "height": 900
    }]
  }
}
```

### 设置文件位置
- Windows: `%APPDATA%\com.kaironotes.editor\settings.json`
- macOS: `~/Library/Application Support/com.kaironotes.editor/settings.json`
- Linux: `~/.config/com.kaironotes.editor/settings.json`

## 性能优化

1. **Monaco Editor CDN 加载** - 减少打包体积
2. **Zustand 持久化** - 仅持久化必要状态
3. **虚拟滚动** - 大文件列表优化
4. **异步文件操作** - 不阻塞 UI
5. **Release 构建优化** - LTO、strip、codegen-units=1

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
