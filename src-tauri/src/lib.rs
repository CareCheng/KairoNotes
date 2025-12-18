// RustNote Editor - Main Library
// Cross-platform document editor built with Tauri

mod commands;
mod editor;
mod file_ops;
mod plugin;
mod settings;
mod syntax;

#[cfg(debug_assertions)]
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_process::init())
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
        ])
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                let window = _app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            
            // Initialize settings
            let app_handle = _app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = settings::init_settings(&app_handle).await {
                    log::error!("Failed to initialize settings: {}", e);
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
