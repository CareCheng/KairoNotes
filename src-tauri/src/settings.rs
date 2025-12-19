// Settings Module

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::sync::RwLock;
use std::sync::OnceLock;

use crate::system_integration;

static SETTINGS: OnceLock<RwLock<EditorSettings>> = OnceLock::new();
static RECENT_FILES: OnceLock<RwLock<Vec<String>>> = OnceLock::new();

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditorSettings {
    // Editor
    pub font_family: String,
    pub font_size: u32,
    pub line_height: f32,
    pub tab_size: u32,
    pub insert_spaces: bool,
    pub word_wrap: String,
    pub minimap_enabled: bool,
    pub line_numbers: String,
    pub render_whitespace: String,
    pub cursor_style: String,
    pub cursor_blinking: String,
    
    // Theme
    pub theme: String,
    pub auto_theme: bool,
    
    // Language
    pub language: String,
    
    // Files
    pub auto_save: bool,
    pub auto_save_delay: u32,
    pub encoding: String,
    pub eol: String,
    pub trim_trailing_whitespace: bool,
    pub insert_final_newline: bool,
    
    // Search
    pub search_case_sensitive: bool,
    pub search_whole_word: bool,
    pub search_regex: bool,
    
    // Window
    pub restore_windows: bool,
    pub show_status_bar: bool,
    pub show_activity_bar: bool,
    pub show_sidebar: bool,
    
    // Advanced
    pub bracket_pair_colorization: bool,
    pub auto_closing_brackets: bool,
    pub auto_closing_quotes: bool,
    pub format_on_save: bool,
    pub format_on_paste: bool,
    pub extreme_mode: bool,
    
    // System Integration
    pub register_as_default_editor: bool,
    pub register_as_path_editor: bool,
    pub add_to_context_menu: bool,
    
    // Terminal
    pub terminal_type: String,
}

impl Default for EditorSettings {
    fn default() -> Self {
        Self {
            font_family: "Consolas, 'Courier New', monospace".to_string(),
            font_size: 14,
            line_height: 1.5,
            tab_size: 4,
            insert_spaces: true,
            word_wrap: "off".to_string(),
            minimap_enabled: true,
            line_numbers: "on".to_string(),
            render_whitespace: "selection".to_string(),
            cursor_style: "line".to_string(),
            cursor_blinking: "blink".to_string(),
            theme: "vs-dark".to_string(),
            auto_theme: false,
            language: "zh-CN".to_string(),
            auto_save: false,
            auto_save_delay: 1000,
            encoding: "UTF-8".to_string(),
            eol: "auto".to_string(),
            trim_trailing_whitespace: false,
            insert_final_newline: false,
            search_case_sensitive: false,
            search_whole_word: false,
            search_regex: false,
            restore_windows: true,
            show_status_bar: true,
            show_activity_bar: true,
            show_sidebar: true,
            bracket_pair_colorization: true,
            auto_closing_brackets: true,
            auto_closing_quotes: true,
            format_on_save: false,
            format_on_paste: false,
            extreme_mode: false,
            register_as_default_editor: false,
            register_as_path_editor: false,
            add_to_context_menu: false,
            terminal_type: "powershell".to_string(),
        }
    }
}

fn get_settings_path() -> Result<PathBuf> {
    let config_dir = system_integration::get_config_dir()?;
    Ok(config_dir.join("settings.json"))
}

fn get_recent_files_path() -> Result<PathBuf> {
    let config_dir = system_integration::get_config_dir()?;
    Ok(config_dir.join("recent_files.json"))
}

pub async fn init_settings() -> Result<()> {
    // Ensure config directory exists
    system_integration::ensure_config_dir().await?;
    
    let settings_path = get_settings_path()?;
    
    // Load or create settings
    let settings: EditorSettings = if settings_path.exists() {
        let content = tokio::fs::read_to_string(&settings_path).await?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        let default_settings = EditorSettings::default();
        let content = serde_json::to_string_pretty(&default_settings)?;
        tokio::fs::write(&settings_path, content).await?;
        default_settings
    };
    
    // 不在启动时检查系统集成状态，避免控制台窗口闪烁
    // 系统集成状态会在用户打开设置面板时按需检查
    
    let _ = SETTINGS.set(RwLock::new(settings));
    
    // Load recent files
    let recent_path = get_recent_files_path()?;
    let recent_files = if recent_path.exists() {
        let content = tokio::fs::read_to_string(&recent_path).await?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Vec::new()
    };
    
    let _ = RECENT_FILES.set(RwLock::new(recent_files));
    
    Ok(())
}

pub async fn get_settings() -> Result<EditorSettings> {
    if let Some(settings) = SETTINGS.get() {
        Ok(settings.read().await.clone())
    } else {
        init_settings().await?;
        Ok(SETTINGS.get().unwrap().read().await.clone())
    }
}

pub async fn save_settings(new_settings: &EditorSettings) -> Result<()> {
    // Handle system integration changes
    if let Some(settings) = SETTINGS.get() {
        let old_settings = settings.read().await.clone();
        
        // Handle default editor registration
        if new_settings.register_as_default_editor != old_settings.register_as_default_editor {
            if new_settings.register_as_default_editor {
                system_integration::register_as_default_editor()?;
            } else {
                system_integration::unregister_default_editor()?;
            }
        }
        
        // Handle PATH registration
        if new_settings.register_as_path_editor != old_settings.register_as_path_editor {
            if new_settings.register_as_path_editor {
                system_integration::add_to_path()?;
            } else {
                system_integration::remove_from_path()?;
            }
        }
        
        // Handle context menu registration
        if new_settings.add_to_context_menu != old_settings.add_to_context_menu {
            if new_settings.add_to_context_menu {
                system_integration::add_to_context_menu()?;
            } else {
                system_integration::remove_from_context_menu()?;
            }
        }
    }
    
    let settings_path = get_settings_path()?;
    let content = serde_json::to_string_pretty(new_settings)?;
    tokio::fs::write(&settings_path, content).await?;
    
    if let Some(settings) = SETTINGS.get() {
        *settings.write().await = new_settings.clone();
    }
    
    Ok(())
}

pub async fn get_recent_files() -> Result<Vec<String>> {
    if let Some(recent) = RECENT_FILES.get() {
        Ok(recent.read().await.clone())
    } else {
        init_settings().await?;
        Ok(RECENT_FILES.get().unwrap().read().await.clone())
    }
}

pub async fn add_recent_file(path: &str) -> Result<()> {
    if RECENT_FILES.get().is_none() {
        init_settings().await?;
    }
    
    if let Some(recent) = RECENT_FILES.get() {
        let mut files = recent.write().await;
        
        // Remove if already exists
        files.retain(|f| f != path);
        
        // Add to front
        files.insert(0, path.to_string());
        
        // Keep only last 20
        files.truncate(20);
        
        // Save to file
        let recent_path = get_recent_files_path()?;
        let content = serde_json::to_string_pretty(&*files)?;
        tokio::fs::write(&recent_path, content).await?;
    }
    
    Ok(())
}

pub async fn clear_recent_files() -> Result<()> {
    if let Some(recent) = RECENT_FILES.get() {
        recent.write().await.clear();
        
        let recent_path = get_recent_files_path()?;
        tokio::fs::write(&recent_path, "[]").await?;
    }
    
    Ok(())
}

/// 获取配置文件目录路径
pub fn get_config_directory() -> Result<String> {
    let config_dir = system_integration::get_config_dir()?;
    Ok(config_dir.to_string_lossy().to_string())
}
