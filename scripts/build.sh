#!/bin/bash
# KairoNotes - Unified Build Script for Linux/macOS
# Usage:
#   ./build.sh --release    构建标准版到 /dist/release
#   ./build.sh --debug      构建开发版到 /dist/debug
#   ./build.sh --packmsi    构建 MSI 安装包到 /dist/packmsi (仅 Windows)
#   ./build.sh --packexe    构建 EXE 安装包到 /dist/packexe (仅 Windows)
#   ./build.sh --packdmg    构建 DMG 安装包到 /dist/packdmg (仅 macOS)
#   ./build.sh --packdeb    构建 DEB 安装包到 /dist/packdeb (仅 Linux)
#   ./build.sh --packapp    构建 AppImage 到 /dist/packapp (仅 Linux)
#   ./build.sh --clean      清理所有构建文件

set -e

# 获取脚本目录和项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DIST_ROOT="$PROJECT_ROOT/dist"
BUILD_DIR="$DIST_ROOT/build"

# 默认值
BUILD_TYPE=""
IS_DEBUG=false
OUTPUT_DIR=""
BUNDLE_TARGET=""
CLEAN=false

# 显示帮助
show_help() {
    cat << EOF
========================================
  KairoNotes Build Script
========================================

Usage:
  ./build.sh [options]

Options:
  --release    构建标准版 (Release)，输出到 /dist/release
  --debug      构建开发版 (Debug)，输出到 /dist/debug
  --packmsi    构建 MSI 安装包 (仅 Windows)
  --packexe    构建 EXE 安装包 (仅 Windows)
  --packdmg    构建 DMG 安装包 (仅 macOS)
  --packdeb    构建 DEB 安装包 (仅 Linux)
  --packapp    构建 AppImage (仅 Linux)
  --clean      清理所有构建文件 (/dist 目录)
  --help       显示此帮助信息

Examples:
  ./build.sh --release          # 构建标准版
  ./build.sh --debug            # 构建开发版
  ./build.sh --clean --release  # 清理后构建标准版

Output Structure:
  /dist/
    ├── release/     # 标准版输出
    │   ├── kaironotes (或 KairoNotes.app)
    │   ├── gui/     # 前端资源
    │   ├── Language/
    │   ├── Plugins/
    │   └── Fonts/
    ├── debug/       # 开发版输出
    └── build/       # 构建中间文件
EOF
    exit 0
}

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --release)
            BUILD_TYPE="release"
            OUTPUT_DIR="$DIST_ROOT/release"
            shift
            ;;
        --debug)
            BUILD_TYPE="debug"
            IS_DEBUG=true
            OUTPUT_DIR="$DIST_ROOT/debug"
            shift
            ;;
        --packmsi)
            BUILD_TYPE="packmsi"
            OUTPUT_DIR="$DIST_ROOT/packmsi"
            BUNDLE_TARGET="msi"
            shift
            ;;
        --packexe)
            BUILD_TYPE="packexe"
            OUTPUT_DIR="$DIST_ROOT/packexe"
            BUNDLE_TARGET="nsis"
            shift
            ;;
        --packdmg)
            BUILD_TYPE="packdmg"
            OUTPUT_DIR="$DIST_ROOT/packdmg"
            BUNDLE_TARGET="dmg"
            shift
            ;;
        --packdeb)
            BUILD_TYPE="packdeb"
            OUTPUT_DIR="$DIST_ROOT/packdeb"
            BUNDLE_TARGET="deb"
            shift
            ;;
        --packapp)
            BUILD_TYPE="packapp"
            OUTPUT_DIR="$DIST_ROOT/packapp"
            BUNDLE_TARGET="appimage"
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --help|-h)
            show_help
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# 如果没有指定构建类型，显示帮助
if [ -z "$BUILD_TYPE" ] && [ "$CLEAN" = false ]; then
    show_help
fi

# 清理
if [ "$CLEAN" = true ]; then
    echo ""
    echo "========================================"
    echo "  Cleaning Build Files"
    echo "========================================"
    
    if [ -d "$DIST_ROOT" ]; then
        rm -rf "$DIST_ROOT"
        echo "  Cleaned: $DIST_ROOT"
    else
        echo "  Nothing to clean"
    fi
    
    if [ -z "$BUILD_TYPE" ]; then
        exit 0
    fi
fi

echo ""
echo "========================================"
echo "  KairoNotes Build Script"
echo "========================================"
echo "Project Root: $PROJECT_ROOT"
echo "Build Type:   $BUILD_TYPE"
echo "Output Dir:   $OUTPUT_DIR"

# 创建目录
mkdir -p "$BUILD_DIR"
mkdir -p "$OUTPUT_DIR"

cd "$PROJECT_ROOT"

# Step 1: 安装依赖
echo ""
echo "[1/5] Installing dependencies..."
npm install --prefer-offline > /dev/null 2>&1
echo "  Dependencies installed"

# Step 2: 构建前端
echo ""
echo "[2/5] Building frontend..."
GUI_DIR="$OUTPUT_DIR/gui"
export BUILD_TYPE="$BUILD_TYPE"

npx vite build --outDir "$GUI_DIR" > /dev/null 2>&1
echo "  Frontend built to: gui/"

# Step 3: 构建 Rust 后端
echo ""
echo "[3/5] Building Rust backend..."

CARGO_TARGET_DIR="$BUILD_DIR/cargo"
export CARGO_TARGET_DIR

cd "$PROJECT_ROOT/src-tauri"

CARGO_ARGS="build"
if [ "$IS_DEBUG" = false ]; then
    CARGO_ARGS="$CARGO_ARGS --release"
fi

cargo $CARGO_ARGS > /dev/null 2>&1
echo "  Rust backend built"

cd "$PROJECT_ROOT"

# Step 4: 复制文件到输出目录
echo ""
echo "[4/5] Copying files to output..."

# 确定二进制文件路径
if [ "$IS_DEBUG" = true ]; then
    BINARY_PATH="$CARGO_TARGET_DIR/debug"
else
    BINARY_PATH="$CARGO_TARGET_DIR/release"
fi

# 复制可执行文件
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if [ -f "$BINARY_PATH/kaironotes" ]; then
        cp "$BINARY_PATH/kaironotes" "$OUTPUT_DIR/"
        echo "  Copied: kaironotes"
    fi
else
    # Linux
    if [ -f "$BINARY_PATH/kaironotes" ]; then
        cp "$BINARY_PATH/kaironotes" "$OUTPUT_DIR/"
        chmod +x "$OUTPUT_DIR/kaironotes"
        echo "  Copied: kaironotes"
    fi
fi

# 复制 Language 目录
if [ -d "$PROJECT_ROOT/Language" ]; then
    rm -rf "$OUTPUT_DIR/Language"
    cp -r "$PROJECT_ROOT/Language" "$OUTPUT_DIR/Language"
    echo "  Copied: Language/"
fi

# 复制 Plugins 目录
if [ -d "$PROJECT_ROOT/Plugins" ]; then
    rm -rf "$OUTPUT_DIR/Plugins"
    cp -r "$PROJECT_ROOT/Plugins" "$OUTPUT_DIR/Plugins"
    echo "  Copied: Plugins/"
fi

# 创建 Fonts 目录
mkdir -p "$OUTPUT_DIR/Fonts"
echo "  Created: Fonts/"

# Step 5: 构建安装包 (如果需要)
if [ -n "$BUNDLE_TARGET" ]; then
    echo ""
    echo "[5/5] Building installer ($BUNDLE_TARGET)..."
    
    cd "$PROJECT_ROOT/src-tauri"
    
    # 备份并修改配置
    TAURI_CONF="$PROJECT_ROOT/src-tauri/tauri.conf.json"
    cp "$TAURI_CONF" "$TAURI_CONF.bak"
    
    # 使用 sed 修改 frontendDist
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|\"frontendDist\": \"gui\"|\"frontendDist\": \"$GUI_DIR\"|g" "$TAURI_CONF"
    else
        sed -i "s|\"frontendDist\": \"gui\"|\"frontendDist\": \"$GUI_DIR\"|g" "$TAURI_CONF"
    fi
    
    npx tauri build --bundles "$BUNDLE_TARGET" > /dev/null 2>&1 || true
    
    # 恢复配置
    mv "$TAURI_CONF.bak" "$TAURI_CONF"
    
    # 复制安装包
    BUNDLE_PATH="$CARGO_TARGET_DIR/release/bundle"
    if [ -d "$BUNDLE_PATH/$BUNDLE_TARGET" ]; then
        find "$BUNDLE_PATH/$BUNDLE_TARGET" -type f | while read -r file; do
            cp "$file" "$OUTPUT_DIR/"
            echo "  Copied: $(basename "$file")"
        done
    fi
    
    cd "$PROJECT_ROOT"
    echo "  Installer built"
else
    echo ""
    echo "[5/5] Skipping installer (not requested)"
fi

# 完成
echo ""
echo "========================================"
echo "  Build Complete!"
echo "========================================"
echo ""
echo "Output: $OUTPUT_DIR"
echo ""
echo "Directory structure:"
echo "  $OUTPUT_DIR/"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  ├── kaironotes      # 可执行文件"
else
    echo "  ├── kaironotes      # 可执行文件"
fi
echo "  ├── gui/            # 前端资源"
echo "  ├── Language/       # 语言文件 (可热更新)"
echo "  ├── Plugins/        # 插件目录 (可热更新)"
echo "  └── Fonts/          # 字体目录 (可热更新)"
echo ""
echo "Run: $OUTPUT_DIR/kaironotes"
