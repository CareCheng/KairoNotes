// System Integration Module - 系统集成功能
// 包括：默认编辑器注册、PATH编辑器、右键菜单集成

use anyhow::{anyhow, Result};
use std::path::PathBuf;

#[cfg(target_os = "windows")]
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

/// 获取程序可执行文件路径
pub fn get_exe_path() -> Result<PathBuf> {
    std::env::current_exe().map_err(|e| anyhow!("Failed to get executable path: {}", e))
}

/// 获取程序目录
pub fn get_app_dir() -> Result<PathBuf> {
    let exe_path = get_exe_path()?;
    exe_path.parent()
        .map(|p| p.to_path_buf())
        .ok_or_else(|| anyhow!("Failed to get application directory"))
}

/// 获取配置文件目录 (程序根目录/config)
pub fn get_config_dir() -> Result<PathBuf> {
    // 在开发模式下，使用项目目录
    #[cfg(debug_assertions)]
    {
        // 尝试使用 CARGO_MANIFEST_DIR 或当前工作目录
        if let Ok(manifest_dir) = std::env::var("CARGO_MANIFEST_DIR") {
            let path = PathBuf::from(manifest_dir);
            if let Some(parent) = path.parent() {
                return Ok(parent.join("config"));
            }
        }
        // 回退到当前工作目录
        if let Ok(cwd) = std::env::current_dir() {
            return Ok(cwd.join("config"));
        }
    }
    
    // 生产模式：使用程序目录
    let app_dir = get_app_dir()?;
    Ok(app_dir.join("config"))
}

/// 确保配置目录存在
pub async fn ensure_config_dir() -> Result<PathBuf> {
    let config_dir = get_config_dir()?;
    if !config_dir.exists() {
        tokio::fs::create_dir_all(&config_dir).await?;
    }
    Ok(config_dir)
}

// ============ Windows 系统集成 ============

#[cfg(target_os = "windows")]
mod windows {
    use super::*;
    use std::io::Write;

    /// 注册为默认文本编辑器
    pub fn register_as_default_editor() -> Result<()> {
        let exe_path = get_exe_path()?;
        let exe_str = exe_path.to_string_lossy();
        
        // 创建注册表脚本
        let reg_content = format!(r#"Windows Registry Editor Version 5.00

; 注册 KairoNotes 应用程序
[HKEY_CURRENT_USER\Software\Classes\KairoNotes.Document]
@="KairoNotes Document"

[HKEY_CURRENT_USER\Software\Classes\KairoNotes.Document\DefaultIcon]
@="{exe},0"

[HKEY_CURRENT_USER\Software\Classes\KairoNotes.Document\shell\open\command]
@="\"{exe}\" \"%1\""

; 关联常见文本文件扩展名
[HKEY_CURRENT_USER\Software\Classes\.txt]
@="KairoNotes.Document"

[HKEY_CURRENT_USER\Software\Classes\.md]
@="KairoNotes.Document"

[HKEY_CURRENT_USER\Software\Classes\.json]
@="KairoNotes.Document"

[HKEY_CURRENT_USER\Software\Classes\.xml]
@="KairoNotes.Document"

[HKEY_CURRENT_USER\Software\Classes\.yaml]
@="KairoNotes.Document"

[HKEY_CURRENT_USER\Software\Classes\.yml]
@="KairoNotes.Document"

[HKEY_CURRENT_USER\Software\Classes\.ini]
@="KairoNotes.Document"

[HKEY_CURRENT_USER\Software\Classes\.cfg]
@="KairoNotes.Document"

[HKEY_CURRENT_USER\Software\Classes\.conf]
@="KairoNotes.Document"

[HKEY_CURRENT_USER\Software\Classes\.log]
@="KairoNotes.Document"
"#, exe = exe_str.replace("\\", "\\\\"));

        // 写入临时文件并执行
        let temp_dir = std::env::temp_dir();
        let reg_file = temp_dir.join("kaironotes_register.reg");
        
        let mut file = std::fs::File::create(&reg_file)?;
        // 写入 UTF-16 LE BOM 和内容
        file.write_all(&[0xFF, 0xFE])?;
        for c in reg_content.encode_utf16() {
            file.write_all(&c.to_le_bytes())?;
        }
        drop(file);
        
        // 执行注册表导入（隐藏控制台窗口）
        let status = Command::new("reg")
            .args(["import", &reg_file.to_string_lossy()])
            .creation_flags(CREATE_NO_WINDOW)
            .status()?;
        
        // 清理临时文件
        let _ = std::fs::remove_file(&reg_file);
        
        if status.success() {
            Ok(())
        } else {
            Err(anyhow!("Failed to import registry file"))
        }
    }

    /// 取消注册默认编辑器
    pub fn unregister_default_editor() -> Result<()> {
        let reg_content = r#"Windows Registry Editor Version 5.00

[-HKEY_CURRENT_USER\Software\Classes\KairoNotes.Document]

[HKEY_CURRENT_USER\Software\Classes\.txt]
@="txtfile"

[HKEY_CURRENT_USER\Software\Classes\.md]
@=-

[HKEY_CURRENT_USER\Software\Classes\.json]
@=-

[HKEY_CURRENT_USER\Software\Classes\.xml]
@="xmlfile"

[HKEY_CURRENT_USER\Software\Classes\.yaml]
@=-

[HKEY_CURRENT_USER\Software\Classes\.yml]
@=-

[HKEY_CURRENT_USER\Software\Classes\.ini]
@="inifile"

[HKEY_CURRENT_USER\Software\Classes\.cfg]
@=-

[HKEY_CURRENT_USER\Software\Classes\.conf]
@=-

[HKEY_CURRENT_USER\Software\Classes\.log]
@="txtfile"
"#;

        let temp_dir = std::env::temp_dir();
        let reg_file = temp_dir.join("kaironotes_unregister.reg");
        
        let mut file = std::fs::File::create(&reg_file)?;
        file.write_all(&[0xFF, 0xFE])?;
        for c in reg_content.encode_utf16() {
            file.write_all(&c.to_le_bytes())?;
        }
        drop(file);
        
        let status = Command::new("reg")
            .args(["import", &reg_file.to_string_lossy()])
            .creation_flags(CREATE_NO_WINDOW)
            .status()?;
        
        let _ = std::fs::remove_file(&reg_file);
        
        if status.success() {
            Ok(())
        } else {
            Err(anyhow!("Failed to unregister"))
        }
    }

    /// 添加到 PATH 环境变量
    pub fn add_to_path() -> Result<()> {
        let app_dir = get_app_dir()?;
        let app_dir_str = app_dir.to_string_lossy();
        
        // 使用 PowerShell 添加到用户 PATH
        let script = format!(
            r#"$path = [Environment]::GetEnvironmentVariable('Path', 'User'); if ($path -notlike '*{}*') {{ [Environment]::SetEnvironmentVariable('Path', $path + ';{}', 'User') }}"#,
            app_dir_str, app_dir_str
        );
        
        let status = Command::new("powershell")
            .args(["-WindowStyle", "Hidden", "-Command", &script])
            .creation_flags(CREATE_NO_WINDOW)
            .status()?;
        
        if status.success() {
            Ok(())
        } else {
            Err(anyhow!("Failed to add to PATH"))
        }
    }

    /// 从 PATH 环境变量移除
    pub fn remove_from_path() -> Result<()> {
        let app_dir = get_app_dir()?;
        let app_dir_str = app_dir.to_string_lossy();
        
        let script = format!(
            r#"$path = [Environment]::GetEnvironmentVariable('Path', 'User'); $newPath = ($path -split ';' | Where-Object {{ $_ -ne '{}' }}) -join ';'; [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')"#,
            app_dir_str
        );
        
        let status = Command::new("powershell")
            .args(["-WindowStyle", "Hidden", "-Command", &script])
            .creation_flags(CREATE_NO_WINDOW)
            .status()?;
        
        if status.success() {
            Ok(())
        } else {
            Err(anyhow!("Failed to remove from PATH"))
        }
    }

    /// 添加到右键菜单
    pub fn add_to_context_menu() -> Result<()> {
        let exe_path = get_exe_path()?;
        let exe_str = exe_path.to_string_lossy();
        
        let reg_content = format!(r#"Windows Registry Editor Version 5.00

; 文件右键菜单 - 用 KairoNotes 打开
[HKEY_CURRENT_USER\Software\Classes\*\shell\KairoNotes]
@="用 KairoNotes 打开"
"Icon"="{exe},0"

[HKEY_CURRENT_USER\Software\Classes\*\shell\KairoNotes\command]
@="\"{exe}\" \"%1\""

; 文件夹右键菜单 - 用 KairoNotes 打开文件夹
[HKEY_CURRENT_USER\Software\Classes\Directory\shell\KairoNotes]
@="用 KairoNotes 打开文件夹"
"Icon"="{exe},0"

[HKEY_CURRENT_USER\Software\Classes\Directory\shell\KairoNotes\command]
@="\"{exe}\" \"%V\""

; 文件夹背景右键菜单
[HKEY_CURRENT_USER\Software\Classes\Directory\Background\shell\KairoNotes]
@="用 KairoNotes 打开此文件夹"
"Icon"="{exe},0"

[HKEY_CURRENT_USER\Software\Classes\Directory\Background\shell\KairoNotes\command]
@="\"{exe}\" \"%V\""
"#, exe = exe_str.replace("\\", "\\\\"));

        let temp_dir = std::env::temp_dir();
        let reg_file = temp_dir.join("kaironotes_context_menu.reg");
        
        let mut file = std::fs::File::create(&reg_file)?;
        file.write_all(&[0xFF, 0xFE])?;
        for c in reg_content.encode_utf16() {
            file.write_all(&c.to_le_bytes())?;
        }
        drop(file);
        
        let status = Command::new("reg")
            .args(["import", &reg_file.to_string_lossy()])
            .creation_flags(CREATE_NO_WINDOW)
            .status()?;
        
        let _ = std::fs::remove_file(&reg_file);
        
        if status.success() {
            Ok(())
        } else {
            Err(anyhow!("Failed to add context menu"))
        }
    }

    /// 从右键菜单移除
    pub fn remove_from_context_menu() -> Result<()> {
        let reg_content = r#"Windows Registry Editor Version 5.00

[-HKEY_CURRENT_USER\Software\Classes\*\shell\KairoNotes]
[-HKEY_CURRENT_USER\Software\Classes\Directory\shell\KairoNotes]
[-HKEY_CURRENT_USER\Software\Classes\Directory\Background\shell\KairoNotes]
"#;

        let temp_dir = std::env::temp_dir();
        let reg_file = temp_dir.join("kaironotes_remove_context_menu.reg");
        
        let mut file = std::fs::File::create(&reg_file)?;
        file.write_all(&[0xFF, 0xFE])?;
        for c in reg_content.encode_utf16() {
            file.write_all(&c.to_le_bytes())?;
        }
        drop(file);
        
        let status = Command::new("reg")
            .args(["import", &reg_file.to_string_lossy()])
            .creation_flags(CREATE_NO_WINDOW)
            .status()?;
        
        let _ = std::fs::remove_file(&reg_file);
        
        if status.success() {
            Ok(())
        } else {
            Err(anyhow!("Failed to remove context menu"))
        }
    }

    /// 检查是否已注册为默认编辑器
    pub fn is_default_editor() -> bool {
        let output = Command::new("reg")
            .args(["query", r"HKEY_CURRENT_USER\Software\Classes\KairoNotes.Document"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
        
        matches!(output, Ok(o) if o.status.success())
    }

    /// 检查是否已添加到 PATH
    pub fn is_in_path() -> bool {
        if let Ok(app_dir) = get_app_dir() {
            if let Ok(path) = std::env::var("PATH") {
                return path.contains(&app_dir.to_string_lossy().to_string());
            }
        }
        false
    }

    /// 检查是否已添加到右键菜单
    pub fn is_in_context_menu() -> bool {
        let output = Command::new("reg")
            .args(["query", r"HKEY_CURRENT_USER\Software\Classes\*\shell\KairoNotes"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
        
        matches!(output, Ok(o) if o.status.success())
    }
}

// ============ 跨平台接口 ============

#[cfg(target_os = "windows")]
pub use windows::*;

// 导出检查函数供外部使用
#[allow(dead_code)]
pub fn check_default_editor() -> bool {
    #[cfg(target_os = "windows")]
    { is_default_editor() }
    #[cfg(not(target_os = "windows"))]
    { false }
}

#[allow(dead_code)]
pub fn check_in_path() -> bool {
    #[cfg(target_os = "windows")]
    { is_in_path() }
    #[cfg(not(target_os = "windows"))]
    { false }
}

#[allow(dead_code)]
pub fn check_in_context_menu() -> bool {
    #[cfg(target_os = "windows")]
    { is_in_context_menu() }
    #[cfg(not(target_os = "windows"))]
    { false }
}

#[cfg(not(target_os = "windows"))]
pub fn register_as_default_editor() -> Result<()> {
    Err(anyhow!("Not implemented for this platform"))
}

#[cfg(not(target_os = "windows"))]
pub fn unregister_default_editor() -> Result<()> {
    Err(anyhow!("Not implemented for this platform"))
}

#[cfg(not(target_os = "windows"))]
pub fn add_to_path() -> Result<()> {
    Err(anyhow!("Not implemented for this platform"))
}

#[cfg(not(target_os = "windows"))]
pub fn remove_from_path() -> Result<()> {
    Err(anyhow!("Not implemented for this platform"))
}

#[cfg(not(target_os = "windows"))]
pub fn add_to_context_menu() -> Result<()> {
    Err(anyhow!("Not implemented for this platform"))
}

#[cfg(not(target_os = "windows"))]
pub fn remove_from_context_menu() -> Result<()> {
    Err(anyhow!("Not implemented for this platform"))
}

#[cfg(not(target_os = "windows"))]
pub fn is_default_editor() -> bool {
    false
}

#[cfg(not(target_os = "windows"))]
pub fn is_in_path() -> bool {
    false
}

#[cfg(not(target_os = "windows"))]
pub fn is_in_context_menu() -> bool {
    false
}
