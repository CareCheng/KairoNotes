// Settings Module

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use tokio::sync::RwLock;
use std::sync::OnceLock;

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
        }
    }
}

fn get_settings_path(app: &AppHandle) -> Result<PathBuf> {
    let app_dir = app.path().app_config_dir()?;
    Ok(app_dir.join("settings.json"))
}

fn get_recent_files_path(app: &AppHandle) -> Result<PathBuf> {
    let app_dir = app.path().app_config_dir()?;
    Ok(app_dir.join("recent_files.json"))
}

pub async fn init_settings(app: &AppHandle) -> Result<()> {
    let settings_path = get_settings_path(app)?;
    
    // Ensure config directory exists
    if let Some(parent) = settings_path.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }
    
    // Load or create settings
    let settings = if settings_path.exists() {
        let content = tokio::fs::read_to_string(&settings_path).await?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        let default_settings = EditorSettings::default();
        let content = serde_json::to_string_pretty(&default_settings)?;
        tokio::fs::write(&settings_path, content).await?;
        default_settings
    };
    
    let _ = SETTINGS.set(RwLock::new(settings));
    
    // Load recent files
    let recent_path = get_recent_files_path(app)?;
    let recent_files = if recent_path.exists() {
        let content = tokio::fs::read_to_string(&recent_path).await?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Vec::new()
    };
    
    let _ = RECENT_FILES.set(RwLock::new(recent_files));
    
    Ok(())
}

pub async fn get_settings(app: &AppHandle) -> Result<EditorSettings> {
    if let Some(settings) = SETTINGS.get() {
        Ok(settings.read().await.clone())
    } else {
        init_settings(app).await?;
        Ok(SETTINGS.get().unwrap().read().await.clone())
    }
}

pub async fn save_settings(app: &AppHandle, new_settings: &EditorSettings) -> Result<()> {
    let settings_path = get_settings_path(app)?;
    let content = serde_json::to_string_pretty(new_settings)?;
    tokio::fs::write(&settings_path, content).await?;
    
    if let Some(settings) = SETTINGS.get() {
        *settings.write().await = new_settings.clone();
    }
    
    Ok(())
}

pub async fn get_recent_files(app: &AppHandle) -> Result<Vec<String>> {
    if let Some(recent) = RECENT_FILES.get() {
        Ok(recent.read().await.clone())
    } else {
        init_settings(app).await?;
        Ok(RECENT_FILES.get().unwrap().read().await.clone())
    }
}

pub async fn add_recent_file(app: &AppHandle, path: &str) -> Result<()> {
    if RECENT_FILES.get().is_none() {
        init_settings(app).await?;
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
        let recent_path = get_recent_files_path(app)?;
        let content = serde_json::to_string_pretty(&*files)?;
        tokio::fs::write(&recent_path, content).await?;
    }
    
    Ok(())
}

pub async fn clear_recent_files(app: &AppHandle) -> Result<()> {
    if let Some(recent) = RECENT_FILES.get() {
        recent.write().await.clear();
        
        let recent_path = get_recent_files_path(app)?;
        tokio::fs::write(&recent_path, "[]").await?;
    }
    
    Ok(())
}
