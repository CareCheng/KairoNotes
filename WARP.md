# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

KairoNotes is a cross-platform document editor built with **Tauri 2.x** (Rust backend) + **React 19** + **TypeScript** frontend. It features a VS Code-like interface with Monaco Editor, multi-language support, plugin system, and built-in terminal.

## Development Commands

```powershell
# Install dependencies
npm install

# Start development server (frontend + Tauri)
npm run tauri dev

# Build frontend only (outputs to dist/)
npm run build

# Lint TypeScript
npm run lint

# Format code with Prettier
npm run format
```

### Production Build (Windows)

```powershell
# Build release version → dist/release/
.\scripts\build.ps1 -release

# Build debug version → dist/debug/
.\scripts\build.ps1 -dbg

# Build MSI installer → dist/packmsi/
.\scripts\build.ps1 -packmsi

# Build EXE installer (NSIS) → dist/packexe/
.\scripts\build.ps1 -packexe

# Clean all build artifacts
.\scripts\build.ps1 -clean

# Clean then build release
.\scripts\build.ps1 -clean -release
```

### Rust Backend

```powershell
# Build Rust only (from src-tauri/)
cargo build --release

# Check Rust code
cargo check

# Run Rust tests
cargo test
```

## Architecture

### Frontend-Backend Communication

The frontend communicates with Rust via Tauri's `invoke` API. All Tauri commands are defined in `src-tauri/src/commands.rs` and registered in `src-tauri/src/lib.rs`.

```typescript
// Example: invoke a Rust command from frontend
import { invoke } from '@tauri-apps/api/core';
const content = await invoke('read_file', { path: '/some/path.txt' });
```

### State Management

Global state is managed with **Zustand** in `src/store/index.ts`. Key state includes:
- `tabs: EditorTab[]` - Open editor tabs
- `settings: EditorSettings` - User preferences
- `openFolder: string | null` - Currently opened folder

The store uses `persist` middleware to save `recentFiles`, `recentFolders`, `searchHistory`, `customKeyBindings`, and `snippets` to localStorage.

### Custom Protocol for Frontend Resources

In production, frontend assets are loaded via `kairogui://` custom protocol from the `gui/` directory adjacent to the executable. This enables hot-updating frontend resources without rebuilding the binary.

### Key Rust Modules

| Module | Purpose |
|--------|---------|
| `lib.rs` | App entry, custom protocol registration, plugin initialization |
| `commands.rs` | Tauri command handlers (API surface) |
| `file_ops.rs` | File I/O operations |
| `settings.rs` | Settings persistence to `config/settings.json` |
| `encoding.rs` | Character encoding support (40+ encodings) |
| `syntax.rs` | Language detection for Monaco |
| `plugin.rs` | Plugin system management |
| `fonts.rs` | System font scanning |
| `system_integration.rs` | Windows registry, PATH, context menu integration |

### Frontend Components

The main app layout is in `src/App.tsx`. Key components:
- `TitleBar.tsx` - Custom frameless window title bar with window controls
- `MenuBar.tsx` - Application menu (File, Edit, View, etc.)
- `Editor.tsx` - Monaco Editor wrapper
- `Sidebar.tsx` - File tree when a folder is open
- `Terminal.tsx` - Built-in terminal (PowerShell/CMD/WSL/Git Bash)
- `SettingsPanel.tsx` - User settings UI

### Internationalization

Language files are in `Language/` directory (e.g., `zh-CN.json`, `en.json`). These are loaded at runtime and can be hot-updated. Frontend uses `i18next` + `react-i18next`.

## Configuration

Settings are stored as JSON files in the `config/` directory next to the executable (portable mode):
- `config/settings.json` - User preferences
- `config/recent_files.json` - Recent file history

## Plugin System

Plugins reside in `Plugins/` directory. Each plugin is a folder containing:
- `package.json` - Plugin manifest (id, name, version, commands, activationEvents)
- `main.js` - Plugin entry point

## Important Patterns

1. **Async Operations**: All file I/O and heavy operations in Rust use `async` functions with `tokio`.

2. **Error Handling**: Rust commands return `Result<T, String>`. Frontend handles errors via try/catch on invoke calls.

3. **Window State**: Window position/size is persisted via `tauri-plugin-window-state`. The window starts hidden and shows after frontend loads (see `show_main_window` command).

4. **Monaco Editor**: Loaded from CDN (not bundled). Uses `@monaco-editor/react` wrapper.

5. **Tab Management**: Each tab has `originalContent` to track modifications. `isModified` is computed by comparing `content !== originalContent`.

## Build Output Structure

```
dist/release/
├── kaironotes.exe      # Main executable
├── gui/                # Frontend assets (hot-updatable)
├── config/             # User configuration
├── Language/           # Language files (hot-updatable)
├── Plugins/            # Plugin directory (hot-updatable)
└── Fonts/              # Custom fonts directory
```
