# KairoNotes - Unified Build Script for Windows
# Usage:
#   .\build.ps1 -release    构建标准版到 /dist/release
#   .\build.ps1 -dbg        构建开发版到 /dist/debug
#   .\build.ps1 -packmsi    构建 MSI 安装包到 /dist/packmsi
#   .\build.ps1 -packexe    构建 EXE 安装包到 /dist/packexe
#   .\build.ps1 -clean      清理所有构建文件

# 初始化变量
$release = $false
$dbg = $false
$packmsi = $false
$packexe = $false
$clean = $false
$showhelp = $false

# 手动解析所有参数，支持 -xxx 和 --xxx 格式
foreach ($arg in $args) {
    switch -Regex ($arg) {
        "^(-r|--release|-release)$" { $release = $true }
        "^(-d|--debug|-dbg|-debug)$" { $dbg = $true }
        "^(--packmsi|-packmsi)$" { $packmsi = $true }
        "^(--packexe|-packexe)$" { $packexe = $true }
        "^(-c|--clean|-clean)$" { $clean = $true }
        "^(-h|--help|-help|\?)$" { $showhelp = $true }
    }
}

# 获取项目根目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DistRoot = Join-Path $ProjectRoot "dist"
$BuildDir = Join-Path $DistRoot "build"

# 显示帮助
if ($showhelp -or (-not $release -and -not $dbg -and -not $packmsi -and -not $packexe -and -not $clean)) {
    Write-Host @"
========================================
  KairoNotes Build Script
========================================

Usage:
  .\build.ps1 [options]

Options:
  -release     构建标准版 (Release)，输出到 /dist/release
  -dbg         构建开发版 (Debug)，输出到 /dist/debug
  -packmsi     构建 MSI 安装包，输出到 /dist/packmsi
  -packexe     构建 EXE 安装包 (NSIS)，输出到 /dist/packexe
  -clean       清理所有构建文件 (/dist 目录)
  -showhelp    显示此帮助信息

Also supports: --release, --debug, --packmsi, --packexe, --clean, --help

Examples:
  .\build.ps1 -release          # 构建标准版
  .\build.ps1 -dbg              # 构建开发版
  .\build.ps1 -packmsi          # 构建 MSI 安装包
  .\build.ps1 -clean -release   # 清理后构建标准版

Output Structure:
  /dist/
    +-- release/     # 标准版输出
    |   +-- kaironotes.exe
    |   +-- gui/     # 前端资源
    |   +-- Language/
    |   +-- Plugins/
    |   +-- Fonts/
    +-- debug/       # 开发版输出
    +-- packmsi/     # MSI 安装包
    +-- packexe/     # EXE 安装包
    +-- build/       # 构建中间文件
"@
    exit 0
}

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host "`n[$Step] $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor Gray
}

# 清理构建
if ($clean) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  Cleaning Build Files" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    if (Test-Path $DistRoot) {
        Remove-Item -Recurse -Force $DistRoot
        Write-Success "Cleaned: $DistRoot"
    } else {
        Write-Info "Nothing to clean"
    }
    
    if (-not $release -and -not $dbg -and -not $packmsi -and -not $packexe) {
        exit 0
    }
}

# 确定构建类型
$BuildType = "release"
$IsDebug = $false
$OutputDir = ""
$BundleTarget = ""

if ($dbg) {
    $BuildType = "debug"
    $IsDebug = $true
    $OutputDir = Join-Path $DistRoot "debug"
} elseif ($packmsi) {
    $BuildType = "packmsi"
    $OutputDir = Join-Path $DistRoot "packmsi"
    $BundleTarget = "msi"
} elseif ($packexe) {
    $BuildType = "packexe"
    $OutputDir = Join-Path $DistRoot "packexe"
    $BundleTarget = "nsis"
} else {
    $OutputDir = Join-Path $DistRoot "release"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  KairoNotes Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray
Write-Host "Build Type:   $BuildType" -ForegroundColor Gray
Write-Host "Output Dir:   $OutputDir" -ForegroundColor Gray

# 创建目录
if (-not (Test-Path $BuildDir)) { New-Item -ItemType Directory -Force -Path $BuildDir | Out-Null }
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null }

Push-Location $ProjectRoot
try {
    # Step 1: 安装依赖到 dist/build/node_modules
    Write-Step "1/5" "Installing dependencies..."
    $NodeModulesDir = Join-Path $BuildDir "node_modules"
    
    # 如果 dist/build/node_modules 不存在，从项目根目录移动或安装
    if (-not (Test-Path $NodeModulesDir)) {
        $RootNodeModules = Join-Path $ProjectRoot "node_modules"
        if (Test-Path $RootNodeModules) {
            # 移动现有的 node_modules 到 build 目录
            Write-Info "Moving node_modules to build directory..."
            Move-Item $RootNodeModules $NodeModulesDir -Force
        }
    }
    
    # 创建符号链接让 npm 可以正常工作
    $RootNodeModules = Join-Path $ProjectRoot "node_modules"
    if (-not (Test-Path $RootNodeModules)) {
        # 创建目录连接 (junction)
        cmd /c mklink /J "$RootNodeModules" "$NodeModulesDir" 2>&1 | Out-Null
    }
    
    & npm install --prefer-offline 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    Write-Success "Dependencies installed"

    # Step 2: 构建前端
    Write-Step "2/5" "Building frontend..."
    $GuiDir = Join-Path $OutputDir "gui"
    $env:BUILD_TYPE = $BuildType
    
    # 直接构建到输出目录
    & npx vite build --outDir $GuiDir 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
    Write-Success "Frontend built to: gui/"

    # Step 3: 构建 Rust 后端
    Write-Step "3/5" "Building Rust backend..."
    
    $CargoTargetDir = Join-Path $BuildDir "cargo"
    $env:CARGO_TARGET_DIR = $CargoTargetDir
    
    Push-Location (Join-Path $ProjectRoot "src-tauri")
    try {
        $CargoArgs = @("build")
        if (-not $IsDebug) { $CargoArgs += "--release" }
        
        & cargo @CargoArgs 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Cargo build failed" }
    } finally {
        Pop-Location
    }
    Write-Success "Rust backend built"

    # Step 4: 复制文件到输出目录
    Write-Step "4/5" "Copying files to output..."
    
    # 复制可执行文件
    $BinaryPath = if ($IsDebug) { Join-Path $CargoTargetDir "debug" } else { Join-Path $CargoTargetDir "release" }
    $ExePath = Join-Path $BinaryPath "kaironotes.exe"
    if (Test-Path $ExePath) {
        Copy-Item $ExePath $OutputDir -Force
        Write-Info "Copied: kaironotes.exe"
    }

    # 复制 WebView2Loader.dll (如果存在)
    $WebView2 = Join-Path $BinaryPath "WebView2Loader.dll"
    if (Test-Path $WebView2) {
        Copy-Item $WebView2 $OutputDir -Force
        Write-Info "Copied: WebView2Loader.dll"
    }

    # 复制 Language 目录
    $LangSrc = Join-Path $ProjectRoot "Language"
    $LangDst = Join-Path $OutputDir "Language"
    if (Test-Path $LangSrc) {
        if (Test-Path $LangDst) { Remove-Item -Recurse -Force $LangDst }
        Copy-Item -Recurse $LangSrc $LangDst
        Write-Info "Copied: Language/"
    }

    # 复制 Plugins 目录
    $PluginsSrc = Join-Path $ProjectRoot "Plugins"
    $PluginsDst = Join-Path $OutputDir "Plugins"
    if (Test-Path $PluginsSrc) {
        if (Test-Path $PluginsDst) { Remove-Item -Recurse -Force $PluginsDst }
        Copy-Item -Recurse $PluginsSrc $PluginsDst
        Write-Info "Copied: Plugins/"
    }

    # 创建 Fonts 目录
    $FontsDir = Join-Path $OutputDir "Fonts"
    if (-not (Test-Path $FontsDir)) {
        New-Item -ItemType Directory -Force -Path $FontsDir | Out-Null
        Write-Info "Created: Fonts/"
    }

    # 复制或创建 config 目录
    $ConfigSrc = Join-Path $ProjectRoot "config"
    $ConfigDst = Join-Path $OutputDir "config"
    if (Test-Path $ConfigSrc) {
        if (Test-Path $ConfigDst) { Remove-Item -Recurse -Force $ConfigDst }
        Copy-Item -Recurse $ConfigSrc $ConfigDst
        Write-Info "Copied: config/"
    } else {
        # 创建默认配置目录和文件
        if (-not (Test-Path $ConfigDst)) {
            New-Item -ItemType Directory -Force -Path $ConfigDst | Out-Null
        }
        Write-Info "Created: config/"
    }

    # Step 5: 构建安装包 (如果需要)
    if ($BundleTarget) {
        Write-Step "5/5" "Building installer ($BundleTarget)..."
        
        # 需要使用 tauri build 来生成安装包
        Push-Location (Join-Path $ProjectRoot "src-tauri")
        try {
            # 临时修改 frontendDist 指向已构建的 gui 目录
            $TauriConfPath = Join-Path $ProjectRoot "src-tauri\tauri.conf.json"
            $TauriConf = Get-Content $TauriConfPath -Raw | ConvertFrom-Json
            $OriginalFrontendDist = $TauriConf.build.frontendDist
            $TauriConf.build.frontendDist = $GuiDir
            $TauriConf | ConvertTo-Json -Depth 10 | Set-Content $TauriConfPath
            
            try {
                $TauriArgs = @("tauri", "build", "--bundles", $BundleTarget)
                & npx @TauriArgs 2>&1
                if ($LASTEXITCODE -ne 0) { throw "Tauri bundle failed" }
                
                # 复制安装包
                $BundlePath = Join-Path $CargoTargetDir "release\bundle\$BundleTarget"
                if (Test-Path $BundlePath) {
                    Get-ChildItem $BundlePath -File | ForEach-Object {
                        Copy-Item $_.FullName $OutputDir -Force
                        Write-Info "Copied: $($_.Name)"
                    }
                }
            } finally {
                # 恢复原始配置
                $TauriConf.build.frontendDist = $OriginalFrontendDist
                $TauriConf | ConvertTo-Json -Depth 10 | Set-Content $TauriConfPath
            }
        } finally {
            Pop-Location
        }
        Write-Success "Installer built"
    } else {
        Write-Step "5/5" "Skipping installer (not requested)"
    }

    # 完成
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  Build Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`nOutput: $OutputDir" -ForegroundColor White
    Write-Host "`nDirectory structure:" -ForegroundColor Gray
    Write-Host "  $OutputDir\" -ForegroundColor Gray
    Write-Host "  +-- kaironotes.exe" -ForegroundColor Gray
    Write-Host "  +-- config/        # Configuration files" -ForegroundColor Gray
    Write-Host "  +-- gui/           # Frontend resources" -ForegroundColor Gray
    Write-Host "  +-- Language/      # Language files (hot-update)" -ForegroundColor Gray
    Write-Host "  +-- Plugins/       # Plugin directory (hot-update)" -ForegroundColor Gray
    Write-Host "  +-- Fonts/         # Font directory (hot-update)" -ForegroundColor Gray
    Write-Host "`nRun: $OutputDir\kaironotes.exe" -ForegroundColor Yellow

} catch {
    Write-Host "`nBuild failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
    $env:CARGO_TARGET_DIR = $null
    $env:BUILD_TYPE = $null
}
