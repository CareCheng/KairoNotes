// KairoNotes - Main Library
// Cross-platform document editor built with Tauri

mod commands;
mod editor;
mod encoding;
mod file_ops;
mod fonts;
mod plugin;
mod settings;
mod syntax;
mod system_integration;

use std::path::PathBuf;
use tauri::Manager;
use tauri_plugin_window_state::StateFlags;

/// 获取前端资源目录路径
/// 在生产环境中从可执行文件所在目录的 gui 文件夹加载
fn get_gui_path() -> PathBuf {
    let exe_path = std::env::current_exe().expect("Failed to get executable path");
    let exe_dir = exe_path.parent().expect("Failed to get executable directory");
    exe_dir.join("gui")
}

/// 根据文件扩展名获取 MIME 类型
fn get_mime_type(path: &std::path::Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()) {
        Some("html") => "text/html; charset=utf-8",
        Some("js") => "application/javascript; charset=utf-8",
        Some("mjs") => "application/javascript; charset=utf-8",
        Some("css") => "text/css; charset=utf-8",
        Some("json") => "application/json; charset=utf-8",
        Some("svg") => "image/svg+xml",
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("gif") => "image/gif",
        Some("ico") => "image/x-icon",
        Some("woff") => "font/woff",
        Some("woff2") => "font/woff2",
        Some("ttf") => "font/ttf",
        Some("otf") => "font/otf",
        Some("eot") => "application/vnd.ms-fontobject",
        _ => "application/octet-stream",
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let gui_path = get_gui_path();
    let gui_path_clone = gui_path.clone();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        // 配置 window-state 插件，只保存位置和大小，不保存 decorations
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(StateFlags::POSITION | StateFlags::SIZE | StateFlags::MAXIMIZED)
                .build()
        )
        .plugin(tauri_plugin_process::init())
        // 注册自定义协议从本地 gui 文件夹加载前端资源
        .register_uri_scheme_protocol("kairogui", move |_ctx, request| {
            let uri = request.uri();
            let mut path = uri.path().to_string();
            
            // URL 解码路径
            if let Ok(decoded) = urlencoding::decode(&path) {
                path = decoded.into_owned();
            }
            
            // 移除开头的斜杠并处理路径
            let file_path = if path == "/" || path.is_empty() {
                gui_path_clone.join("index.html")
            } else {
                let clean_path = path.trim_start_matches('/');
                gui_path_clone.join(clean_path)
            };
            
            match std::fs::read(&file_path) {
                Ok(content) => {
                    tauri::http::Response::builder()
                        .status(200)
                        .header("Content-Type", get_mime_type(&file_path))
                        .header("Access-Control-Allow-Origin", "*")
                        .body(content)
                        .unwrap()
                }
                Err(_) => {
                    tauri::http::Response::builder()
                        .status(404)
                        .header("Content-Type", "text/plain")
                        .body(format!("File not found: {:?}", file_path).into_bytes())
                        .unwrap()
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::read_file,
            commands::write_file,
            commands::get_file_info,
            commands::search_in_file,
            commands::search_and_replace,
            commands::get_recent_files,
            commands::add_recent_file,
            commands::clear_recent_files,
            commands::detect_encoding,
            commands::convert_encoding,
            commands::get_syntax_highlight,
            commands::detect_language,
            commands::get_settings,
            commands::save_settings,
            commands::list_directory,
            commands::create_file,
            commands::create_directory,
            commands::delete_path,
            commands::rename_path,
            commands::get_app_info,
            commands::open_in_explorer,
            // Plugin commands
            commands::load_plugin,
            commands::unload_plugin,
            commands::get_loaded_plugins,
            commands::execute_plugin_command,
            commands::enable_plugin,
            commands::disable_plugin,
            commands::get_plugins_directory,
            commands::scan_plugins,
            // Language commands
            commands::get_language_directory,
            commands::list_available_languages,
            commands::load_language_file,
            commands::load_languages,
            // Font commands
            commands::get_available_fonts,
            commands::get_monospace_fonts,
            commands::get_fonts_directory,
            // Encoding commands
            commands::get_supported_encodings,
            commands::detect_file_encoding,
            commands::read_file_with_encoding,
            commands::write_file_with_encoding,
            commands::get_config_directory,
            // Terminal commands
            commands::execute_terminal_command,
            commands::get_available_terminals,
        ])
        .setup(move |app| {
            use tauri::{WebviewUrl, WebviewWindowBuilder};
            
            // 关闭默认窗口（如果存在）
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.close();
            }
            
            // 创建新窗口，使用自定义协议加载前端
            let url = if gui_path.exists() {
                WebviewUrl::CustomProtocol("kairogui://localhost/".parse().unwrap())
            } else {
                // 开发模式下使用 devUrl
                WebviewUrl::External("http://localhost:5173".parse().unwrap())
            };
            
            let _window = WebviewWindowBuilder::new(app, "main", url)
                .title("KairoNotes")
                .inner_size(1400.0, 900.0)
                .min_inner_size(800.0, 600.0)
                .decorations(false)
                .center()
                .visible(true)
                .build()?;
            
            #[cfg(debug_assertions)]
            _window.open_devtools();
            
            // Log GUI path for debugging
            log::info!("GUI path: {:?}, exists: {}", gui_path, gui_path.exists());
            
            // Initialize settings
            tauri::async_runtime::spawn(async move {
                if let Err(e) = settings::init_settings().await {
                    log::error!("Failed to initialize settings: {}", e);
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
