# KairoNotes 项目开发规则

## 项目概述

KairoNotes 是一款基于 Tauri 2.x + React + TypeScript 构建的现代化跨平台文档编辑器。

## 技术栈

- **后端**: Rust + Tauri 2.x
- **前端**: React 18 + TypeScript + Monaco Editor
- **状态管理**: Zustand
- **国际化**: i18next
- **样式**: CSS (非 CSS-in-JS)

## 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── store/              # Zustand 状态管理
│   ├── styles/             # CSS 样式文件
│   └── i18n/               # 国际化配置
├── src-tauri/              # Rust 后端
│   └── src/
│       ├── lib.rs          # 主入口
│       ├── commands.rs     # Tauri 命令
│       ├── settings.rs     # 设置管理
│       └── ...
├── Language/               # 语言文件 (热更新)
├── Plugins/                # 插件目录
├── config/                 # 配置文件目录
└── scripts/                # 构建脚本
```

## 开发规范

### 构建命令

**重要**: 始终使用项目提供的构建脚本，不要直接使用 cargo build：

```powershell
# 构建 release 版本
.\scripts\build.ps1 -release

# 构建 debug 版本
.\scripts\build.ps1 -dbg

# 清理后构建
.\scripts\build.ps1 -clean -release
```

### 前端开发

1. **组件**: 放在 `src/components/` 目录
2. **样式**: 每个组件对应一个 CSS 文件在 `src/styles/`
3. **状态**: 全局状态在 `src/store/index.ts` 中管理
4. **国际化**: 所有用户可见文本必须使用 `t()` 函数

### 后端开发

1. **命令**: 新的 Tauri 命令添加到 `src-tauri/src/commands.rs`
2. **注册**: 命令需要在 `src-tauri/src/lib.rs` 的 `invoke_handler` 中注册
3. **Windows 命令**: 执行系统命令时必须使用 `CREATE_NO_WINDOW` 标志避免控制台闪烁

```rust
#[cfg(windows)]
use std::os::windows::process::CommandExt;
#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[cfg(windows)]
cmd.creation_flags(CREATE_NO_WINDOW);
```

### 配置文件

- 配置保存在 `<程序目录>/config/` 下，支持便携式使用
- 设置更改应实时保存到配置文件
- 使用 `settings.rs` 中的函数管理配置

### 国际化

添加新功能时，必须同时更新所有语言文件：
- `Language/zh-CN.json` - 简体中文
- `Language/zh-TW.json` - 繁体中文
- `Language/en.json` - 英文
- `Language/ru.json` - 俄文

### 文档更新

功能变更后需要更新：
- `docs/TECHNICAL.md` - 技术文档
- `docs/FEATURES.md` - 功能列表
- `README.md` - 说明文档

## 代码风格

### TypeScript/React

- 使用函数组件和 Hooks
- 使用 TypeScript 严格类型
- 组件导出使用命名导出

### Rust

- 使用 `anyhow::Result` 处理错误
- 异步函数使用 `async/await`
- 遵循 Rust 命名规范 (snake_case)

## 常见任务

### 添加新设置项

1. 在 `src/store/index.ts` 的 `EditorSettings` 接口添加字段
2. 在 `src-tauri/src/settings.rs` 的 `EditorSettings` 结构体添加字段
3. 在 `SettingsPanel.tsx` 添加 UI 控件
4. 更新所有语言文件的翻译

### 添加新的 Tauri 命令

1. 在 `commands.rs` 添加命令函数
2. 在 `lib.rs` 的 `invoke_handler` 注册
3. 前端使用 `invoke('command_name', { args })` 调用

### 添加新菜单项

1. 在 `MenuBar.tsx` 的相应菜单数组添加项目
2. 如需新的 action，在 `store/index.ts` 添加
3. 更新语言文件翻译
