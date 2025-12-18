# RustNote Editor 技术文档

## 目录

1. [架构概述](#架构概述)
2. [目录结构](#目录结构)
3. [技术栈](#技术栈)
4. [模块说明](#模块说明)
5. [API 参考](#api-参考)
6. [构建与部署](#构建与部署)
7. [热更新机制](#热更新机制)

---

## 架构概述

RustNote Editor 采用 Tauri 框架构建，实现了前后端分离的架构：

```
┌─────────────────────────────────────────────────────────┐
│                    RustNote Editor                       │
├─────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                          │
│  ├── Monaco Editor (代码编辑)                            │
│  ├── Zustand (状态管理)                                  │
│  ├── i18next (国际化)                                    │
│  └── Framer Motion (动画)                                │
├─────────────────────────────────────────────────────────┤
│  Tauri IPC Bridge (进程间通信)                           │
├─────────────────────────────────────────────────────────┤
│  Backend (Rust)                                          │
│  ├── File Operations (文件操作)                          │
│  ├── Syntax Highlighting (语法高亮)                      │
│  ├── Plugin System (插件系统)                            │
│  ├── Settings Manager (设置管理)                         │
│  └── Editor Core (编辑器核心)                            │
└─────────────────────────────────────────────────────────┘
```

### 设计原则

1. **模块化设计** - 功能拆分为独立模块，便于维护和更新
2. **热更新支持** - 语言文件、插件、前端资源均可热更新
3. **跨平台兼容** - 支持 Windows、macOS、Linux
4. **可扩展性** - 完善的插件系统支持功能扩展

---

## 目录结构

```
rustnote-editor/
├── dist/                    # 前端构建输出
├── dist-release/            # 发布版本输出
│   ├── rustnote.exe         # 主程序
│   ├── dist/                # 前端资源
│   ├── Language/            # 语言文件
│   ├── Plugins/             # 插件目录
│   └── portable/            # 便携版
├── Language/                # 语言文件源目录
│   ├── zh-CN.json
│   ├── zh-TW.json
│   ├── en.json
│   └── ru.json
├── Plugins/                 # 插件源目录
│   ├── README.md
│   └── example-plugin/
├── src/                     # 前端源码
│   ├── components/          # React 组件
│   ├── i18n/                # 国际化
│   ├── store/               # 状态管理
│   └── styles/              # 样式文件
├── src-tauri/               # 后端源码
│   ├── src/
│   │   ├── commands.rs      # Tauri 命令
│   │   ├── editor.rs        # 编辑器核心
│   │   ├── file_ops.rs      # 文件操作
│   │   ├── lib.rs           # 库入口
│   │   ├── main.rs          # 程序入口
│   │   ├── plugin.rs        # 插件系统
│   │   ├── settings.rs      # 设置管理
│   │   └── syntax.rs        # 语法高亮
│   ├── capabilities/        # 权限配置
│   ├── icons/               # 应用图标
│   ├── Cargo.toml           # Rust 依赖
│   └── tauri.conf.json      # Tauri 配置
├── docs/                    # 文档
├── scripts/                 # 构建脚本
└── package.json             # Node.js 依赖
```

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Monaco Editor | 0.45.x | 代码编辑器 |
| Zustand | 4.x | 状态管理 |
| i18next | 23.x | 国际化 |
| Framer Motion | 11.x | 动画效果 |
| Vite | 5.x | 构建工具 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Rust | 1.77+ | 系统编程 |
| Tauri | 2.x | 桌面应用框架 |
| Tokio | 1.x | 异步运行时 |
| Syntect | 5.x | 语法高亮 |
| Serde | 1.x | 序列化 |

---

## 模块说明

### 后端模块

#### commands.rs - Tauri 命令

提供前端调用的所有 API 接口：

```rust
// 文件操作
read_file(path: String) -> Result<String>
write_file(path: String, content: String) -> Result<()>
get_file_info(path: String) -> Result<FileInfo>

// 搜索替换
search_in_file(content, query, case_sensitive, use_regex) -> Result<Vec<SearchResult>>
search_and_replace(content, search, replace, ...) -> Result<String>

// 设置管理
get_settings() -> Result<EditorSettings>
save_settings(settings: EditorSettings) -> Result<()>

// 插件系统
load_plugin(plugin_path: String) -> Result<PluginInfo>
unload_plugin(plugin_id: String) -> Result<()>
get_loaded_plugins() -> Result<Vec<PluginInfo>>
execute_plugin_command(plugin_id, command, args) -> Result<Value>

// 语言系统
list_available_languages() -> Result<Vec<String>>
load_language_file(lang_code: String) -> Result<Value>
```

#### plugin.rs - 插件系统

管理插件的加载、卸载、启用、禁用：

```rust
pub struct PluginInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub main: String,
    pub commands: Vec<PluginCommand>,
    pub activation_events: Vec<String>,
    pub contributes: Option<PluginContributes>,
    pub enabled: bool,
    pub path: String,
}
```

#### settings.rs - 设置管理

管理编辑器设置的持久化：

```rust
pub struct EditorSettings {
    // 编辑器设置
    pub font_family: String,
    pub font_size: u32,
    pub tab_size: u32,
    pub word_wrap: String,
    // 主题设置
    pub theme: String,
    // 语言设置
    pub language: String,
    // ... 更多设置
}
```

### 前端模块

#### store/index.ts - 状态管理

使用 Zustand 管理全局状态：

```typescript
interface AppState {
  // 标签页
  tabs: EditorTab[];
  activeTabId: string | null;
  
  // UI 状态
  theme: 'light' | 'dark';
  showSearch: boolean;
  showSettings: boolean;
  
  // 设置
  settings: EditorSettings;
  
  // 操作方法
  createTab: () => void;
  openFile: () => Promise<void>;
  saveFile: () => Promise<void>;
  // ...
}
```

#### i18n/index.ts - 国际化

支持动态加载外部语言文件：

```typescript
// 加载外部语言
await loadExternalLanguage('ja', japaneseData);

// 切换语言
await changeLanguage('zh-CN');
```

---

## API 参考

### 文件操作 API

#### read_file

读取文件内容。

```typescript
const content = await invoke<string>('read_file', { path: '/path/to/file.txt' });
```

#### write_file

写入文件内容。

```typescript
await invoke('write_file', { path: '/path/to/file.txt', content: 'Hello World' });
```

### 插件 API

#### get_loaded_plugins

获取已加载的插件列表。

```typescript
const plugins = await invoke<PluginInfo[]>('get_loaded_plugins');
```

#### execute_plugin_command

执行插件命令。

```typescript
const result = await invoke('execute_plugin_command', {
  pluginId: 'example-plugin',
  command: 'helloWorld',
  args: {}
});
```

### 语言 API

#### list_available_languages

列出可用的语言文件。

```typescript
const languages = await invoke<string[]>('list_available_languages');
// ['zh-CN', 'zh-TW', 'en', 'ru']
```

#### load_language_file

加载语言文件内容。

```typescript
const langData = await invoke<object>('load_language_file', { langCode: 'ja' });
```

---

## 构建与部署

### 开发模式

```bash
cd rustnote-editor
npm install
npm run tauri dev
```

### 生产构建

```powershell
# 快速构建（仅可执行文件）
.\scripts\build.ps1

# 生成安装包
.\scripts\build.ps1 -Installer

# 清理后重新构建
.\scripts\build.ps1 -Clean

# Debug 模式
.\scripts\build.ps1 -Debug
```

### 输出结构

```
dist-release/
├── rustnote.exe              # 主程序
├── dist/                     # 前端资源（可热更新）
│   ├── index.html
│   └── assets/
├── Language/                 # 语言文件（可热更新）
│   ├── zh-CN.json
│   ├── en.json
│   └── ...
├── Plugins/                  # 插件目录（可热更新）
│   └── example-plugin/
└── portable/                 # 便携版（包含所有文件）
```

---

## 热更新机制

RustNote 支持以下资源的热更新，无需重新编译：

### 1. 语言文件热更新

将新的语言文件放入 `Language/` 目录：

```json
// Language/ja.json
{
  "app": {
    "name": "RustNote エディタ"
  }
}
```

程序启动时会自动扫描并加载。

### 2. 插件热更新

将插件文件夹放入 `Plugins/` 目录：

```
Plugins/
└── my-plugin/
    ├── package.json
    └── main.js
```

### 3. 前端资源热更新

替换 `dist/` 目录中的文件即可更新前端界面。

### 热更新注意事项

- 语言文件和插件在程序启动时加载
- 前端资源更新后需要刷新页面
- 某些核心功能更新仍需重新编译后端

---

## 下一步

- 查看 [插件开发指南](./PLUGIN_DEVELOPMENT.md) 了解如何开发插件
- 查看 [贡献指南](../CONTRIBUTING.md) 了解如何参与开发
