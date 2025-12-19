// Tauri Commands - API endpoints for frontend

use crate::{editor, encoding, file_ops, fonts, plugin, settings, syntax};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileInfo {
    pub path: String,
    pub name: String,
    pub extension: Option<String>,
    pub size: u64,
    pub is_directory: bool,
    pub is_readonly: bool,
    pub modified: Option<String>,
    pub created: Option<String>,
    pub encoding: String,
    pub language: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub line: usize,
    pub column: usize,
    pub length: usize,
    pub text: String,
    pub context: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DirectoryEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub is_hidden: bool,
    pub size: u64,
    pub modified: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub authors: String,
    pub description: String,
}


// File Operations
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    file_ops::read_file_content(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    file_ops::write_file_content(&path, &content).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_file_info(path: String) -> Result<FileInfo, String> {
    file_ops::get_file_info(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_file(path: String) -> Result<(), String> {
    file_ops::create_file(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_directory(path: String) -> Result<(), String> {
    file_ops::create_directory(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_path(path: String) -> Result<(), String> {
    file_ops::delete_path(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn rename_path(old_path: String, new_path: String) -> Result<(), String> {
    file_ops::rename_path(&old_path, &new_path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_directory(path: String) -> Result<Vec<DirectoryEntry>, String> {
    file_ops::list_directory(&path).await.map_err(|e| e.to_string())
}

// Search Operations
#[tauri::command]
pub async fn search_in_file(
    content: String,
    query: String,
    case_sensitive: bool,
    use_regex: bool,
) -> Result<Vec<SearchResult>, String> {
    editor::search_in_content(&content, &query, case_sensitive, use_regex)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_and_replace(
    content: String,
    search: String,
    replace: String,
    case_sensitive: bool,
    use_regex: bool,
    replace_all: bool,
) -> Result<String, String> {
    editor::search_and_replace(&content, &search, &replace, case_sensitive, use_regex, replace_all)
        .map_err(|e| e.to_string())
}

// Recent Files
#[tauri::command]
pub async fn get_recent_files() -> Result<Vec<String>, String> {
    settings::get_recent_files().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_recent_file(path: String) -> Result<(), String> {
    settings::add_recent_file(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn clear_recent_files() -> Result<(), String> {
    settings::clear_recent_files().await.map_err(|e| e.to_string())
}

// Encoding
#[tauri::command]
pub async fn detect_encoding(path: String) -> Result<String, String> {
    file_ops::detect_encoding(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn convert_encoding(
    content: String,
    from_encoding: String,
    to_encoding: String,
) -> Result<String, String> {
    file_ops::convert_encoding(&content, &from_encoding, &to_encoding)
        .map_err(|e| e.to_string())
}

// Syntax Highlighting
#[tauri::command]
pub async fn get_syntax_highlight(
    content: String,
    language: String,
) -> Result<Vec<syntax::HighlightToken>, String> {
    syntax::highlight_content(&content, &language).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn detect_language(path: String, content: Option<String>) -> String {
    syntax::detect_language(&path, content.as_deref())
}

// Settings
#[tauri::command]
pub async fn get_settings() -> Result<settings::EditorSettings, String> {
    settings::get_settings().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_settings(new_settings: settings::EditorSettings) -> Result<(), String> {
    settings::save_settings(&new_settings).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_config_directory() -> Result<String, String> {
    settings::get_config_directory().map_err(|e| e.to_string())
}

// App Info
#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        name: "KairoNotes".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        authors: "KairoNotes Team".to_string(),
        description: "A modern cross-platform document editor".to_string(),
    }
}

#[tauri::command]
pub async fn open_in_explorer(path: String) -> Result<(), String> {
    file_ops::open_in_explorer(&path).await.map_err(|e| e.to_string())
}

// Plugin System
#[tauri::command]
pub async fn load_plugin(app: AppHandle, plugin_path: String) -> Result<plugin::PluginInfo, String> {
    plugin::load_plugin(&app, &plugin_path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn unload_plugin(app: AppHandle, plugin_id: String) -> Result<(), String> {
    plugin::unload_plugin(&app, &plugin_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_loaded_plugins(app: AppHandle) -> Result<Vec<plugin::PluginInfo>, String> {
    plugin::get_loaded_plugins(&app).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn execute_plugin_command(
    app: AppHandle,
    plugin_id: String,
    command: String,
    args: HashMap<String, serde_json::Value>,
) -> Result<serde_json::Value, String> {
    plugin::execute_command(&app, &plugin_id, &command, args)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn enable_plugin(app: AppHandle, plugin_id: String) -> Result<(), String> {
    plugin::enable_plugin(&app, &plugin_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn disable_plugin(app: AppHandle, plugin_id: String) -> Result<(), String> {
    plugin::disable_plugin(&app, &plugin_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_plugins_directory(app: AppHandle) -> Result<String, String> {
    plugin::get_plugins_directory(&app).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn scan_plugins(app: AppHandle) -> Result<Vec<plugin::PluginInfo>, String> {
    plugin::scan_plugins(&app).await.map_err(|e| e.to_string())
}

// Language System
#[tauri::command]
pub async fn get_language_directory() -> Result<String, String> {
    // 优先使用程序运行目录下的 Language 文件夹
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let lang_dir = exe_dir.join("Language");
            if lang_dir.exists() {
                return Ok(lang_dir.to_string_lossy().to_string());
            }
        }
    }
    Err("Language directory not found".to_string())
}

#[tauri::command]
pub async fn list_available_languages() -> Result<Vec<String>, String> {
    let mut languages = Vec::new();
    
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let lang_dir = exe_dir.join("Language");
            if lang_dir.exists() {
                if let Ok(entries) = std::fs::read_dir(&lang_dir) {
                    for entry in entries.flatten() {
                        if let Some(name) = entry.file_name().to_str() {
                            if name.ends_with(".json") {
                                languages.push(name.trim_end_matches(".json").to_string());
                            }
                        }
                    }
                }
            }
        }
    }
    
    Ok(languages)
}

#[tauri::command]
pub async fn load_language_file(lang_code: String) -> Result<serde_json::Value, String> {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let lang_file = exe_dir.join("Language").join(format!("{}.json", lang_code));
            if lang_file.exists() {
                let content = tokio::fs::read_to_string(&lang_file)
                    .await
                    .map_err(|e| e.to_string())?;
                let json: serde_json::Value = serde_json::from_str(&content)
                    .map_err(|e| e.to_string())?;
                return Ok(json);
            }
        }
    }
    Err(format!("Language file not found: {}", lang_code))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LanguageData {
    pub code: String,
    pub data: serde_json::Value,
}

#[tauri::command]
pub async fn load_languages() -> Result<Vec<LanguageData>, String> {
    let mut languages = Vec::new();
    
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let lang_dir = exe_dir.join("Language");
            if lang_dir.exists() {
                if let Ok(entries) = std::fs::read_dir(&lang_dir) {
                    for entry in entries.flatten() {
                        if let Some(name) = entry.file_name().to_str() {
                            if name.ends_with(".json") {
                                let lang_code = name.trim_end_matches(".json").to_string();
                                let lang_file = entry.path();
                                
                                match tokio::fs::read_to_string(&lang_file).await {
                                    Ok(content) => {
                                        match serde_json::from_str::<serde_json::Value>(&content) {
                                            Ok(json) => {
                                                languages.push(LanguageData {
                                                    code: lang_code,
                                                    data: json,
                                                });
                                            }
                                            Err(e) => {
                                                eprintln!("Failed to parse language file {}: {}", name, e);
                                            }
                                        }
                                    }
                                    Err(e) => {
                                        eprintln!("Failed to read language file {}: {}", name, e);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    if languages.is_empty() {
        Err("No language files found in Language directory".to_string())
    } else {
        Ok(languages)
    }
}

// Font System
#[tauri::command]
pub async fn get_available_fonts() -> Result<Vec<fonts::FontInfo>, String> {
    fonts::get_available_fonts().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_monospace_fonts() -> Result<Vec<fonts::FontInfo>, String> {
    fonts::get_monospace_fonts().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_fonts_directory() -> Result<String, String> {
    fonts::get_fonts_directory().await.map_err(|e| e.to_string())
}

// Encoding System
#[tauri::command]
pub fn get_supported_encodings() -> Vec<encoding::EncodingInfo> {
    encoding::get_supported_encodings()
}

#[tauri::command]
pub async fn detect_file_encoding(path: String) -> Result<String, String> {
    encoding::detect_file_encoding(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn read_file_with_encoding(path: String, encoding_name: String) -> Result<String, String> {
    encoding::read_file_with_encoding(&path, &encoding_name).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn write_file_with_encoding(path: String, content: String, encoding_name: String) -> Result<(), String> {
    encoding::write_file_with_encoding(&path, &content, &encoding_name).await.map_err(|e| e.to_string())
}

// Terminal Commands
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}

#[tauri::command]
pub async fn execute_terminal_command(
    command: String,
    cwd: Option<String>,
    terminal_type: String,
) -> Result<TerminalOutput, String> {
    use std::process::{Command, Stdio};
    
    #[cfg(windows)]
    use std::os::windows::process::CommandExt;
    #[cfg(windows)]
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    
    let (shell, shell_arg) = match terminal_type.as_str() {
        "cmd" => ("cmd", "/C"),
        "pwsh" => ("pwsh", "-Command"),
        "wsl" => ("wsl", "-e"),
        "gitbash" => {
            // Try common Git Bash paths
            let git_bash_paths = [
                "C:\\Program Files\\Git\\bin\\bash.exe",
                "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
            ];
            let bash_path = git_bash_paths.iter()
                .find(|p| std::path::Path::new(p).exists())
                .map(|s| *s)
                .unwrap_or("bash");
            (bash_path, "-c")
        },
        _ => ("powershell", "-Command"), // default to powershell
    };
    
    let mut cmd = Command::new(shell);
    cmd.arg(shell_arg)
        .arg(&command)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    
    if let Some(dir) = &cwd {
        cmd.current_dir(dir);
    }
    
    #[cfg(windows)]
    cmd.creation_flags(CREATE_NO_WINDOW);
    
    let output = cmd.output().map_err(|e| e.to_string())?;
    
    Ok(TerminalOutput {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}

#[tauri::command]
pub fn get_available_terminals() -> Vec<String> {
    let mut terminals = vec!["powershell".to_string()];
    
    #[cfg(windows)]
    {
        // Check for cmd
        terminals.push("cmd".to_string());
        
        // Check for PowerShell Core (pwsh)
        if std::process::Command::new("pwsh")
            .arg("--version")
            .output()
            .is_ok()
        {
            terminals.push("pwsh".to_string());
        }
        
        // Check for WSL
        if std::process::Command::new("wsl")
            .arg("--status")
            .output()
            .is_ok()
        {
            terminals.push("wsl".to_string());
        }
        
        // Check for Git Bash
        let git_bash_paths = [
            "C:\\Program Files\\Git\\bin\\bash.exe",
            "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
        ];
        if git_bash_paths.iter().any(|p| std::path::Path::new(p).exists()) {
            terminals.push("gitbash".to_string());
        }
    }
    
    terminals
}
