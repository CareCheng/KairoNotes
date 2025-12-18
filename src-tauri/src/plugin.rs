// Plugin System Module
// 提供完整的插件管理功能，支持加载、卸载、启用、禁用插件

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::OnceLock;
use tauri::{AppHandle, Manager};
use tokio::sync::RwLock;

static PLUGINS: OnceLock<RwLock<HashMap<String, Plugin>>> = OnceLock::new();
#[allow(dead_code)]
static PLUGINS_DIR: OnceLock<PathBuf> = OnceLock::new();

/// 插件信息结构
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub main: String,
    pub commands: Vec<PluginCommand>,
    pub activation_events: Vec<String>,
    pub contributes: Option<PluginContributes>,
    pub enabled: bool,
    pub path: String,
}

/// 插件命令
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginCommand {
    pub name: String,
    pub title: String,
    pub description: Option<String>,
}

/// 插件贡献点
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginContributes {
    #[serde(default)]
    pub menus: Vec<PluginMenu>,
    #[serde(default)]
    pub keybindings: Vec<PluginKeybinding>,
    #[serde(default)]
    pub themes: Vec<PluginTheme>,
    #[serde(default)]
    pub languages: Vec<PluginLanguage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginMenu {
    pub command: String,
    pub group: Option<String>,
    pub when: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginKeybinding {
    pub command: String,
    pub key: String,
    pub when: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginTheme {
    pub id: String,
    pub label: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginLanguage {
    pub id: String,
    pub extensions: Vec<String>,
    pub aliases: Vec<String>,
}

/// 插件清单文件结构
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub author: String,
    pub main: String,
    #[serde(default)]
    pub commands: Vec<PluginCommand>,
    #[serde(default)]
    pub activation_events: Vec<String>,
    #[serde(default)]
    pub contributes: Option<PluginContributes>,
}

/// 插件实例
#[derive(Debug)]
pub struct Plugin {
    pub info: PluginInfo,
    pub path: PathBuf,
    pub enabled: bool,
}

/// 获取插件目录路径
fn get_plugins_dir(app: &AppHandle) -> Result<PathBuf> {
    // 优先使用程序运行目录下的 Plugins 文件夹
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let plugins_dir = exe_dir.join("Plugins");
            if plugins_dir.exists() {
                return Ok(plugins_dir);
            }
        }
    }
    
    // 回退到应用配置目录
    let app_dir = app.path().app_config_dir()?;
    Ok(app_dir.join("Plugins"))
}

/// 初始化插件系统
#[allow(dead_code)]
pub async fn init_plugins(app: &AppHandle) -> Result<()> {
    let plugins_dir = get_plugins_dir(app)?;
    
    // 创建插件目录
    tokio::fs::create_dir_all(&plugins_dir).await?;
    
    let _ = PLUGINS_DIR.set(plugins_dir.clone());
    let _ = PLUGINS.set(RwLock::new(HashMap::new()));
    
    // 扫描并加载已安装的插件
    if let Ok(mut dir) = tokio::fs::read_dir(&plugins_dir).await {
        while let Ok(Some(entry)) = dir.next_entry().await {
            if entry.file_type().await?.is_dir() {
                let manifest_path = entry.path().join("package.json");
                if manifest_path.exists() {
                    match load_plugin_internal(&entry.path()).await {
                        Ok(plugin_info) => {
                            log::info!("Loaded plugin: {} v{}", plugin_info.name, plugin_info.version);
                        }
                        Err(e) => {
                            log::warn!("Failed to load plugin from {:?}: {}", entry.path(), e);
                        }
                    }
                }
            }
        }
    }
    
    Ok(())
}

/// 内部加载插件函数
async fn load_plugin_internal(plugin_path: &PathBuf) -> Result<PluginInfo> {
    let manifest_path = plugin_path.join("package.json");
    let content = tokio::fs::read_to_string(&manifest_path).await?;
    let manifest: PluginManifest = serde_json::from_str(&content)?;
    
    let info = PluginInfo {
        id: manifest.id.clone(),
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        main: manifest.main,
        commands: manifest.commands,
        activation_events: manifest.activation_events,
        contributes: manifest.contributes,
        enabled: true,
        path: plugin_path.to_string_lossy().to_string(),
    };
    
    let plugin = Plugin {
        info: info.clone(),
        path: plugin_path.clone(),
        enabled: true,
    };
    
    if let Some(plugins) = PLUGINS.get() {
        plugins.write().await.insert(manifest.id, plugin);
    }
    
    Ok(info)
}

/// 加载插件
pub async fn load_plugin(_app: &AppHandle, plugin_path: &str) -> Result<PluginInfo> {
    let path = PathBuf::from(plugin_path);
    load_plugin_internal(&path).await
}

/// 卸载插件
pub async fn unload_plugin(_app: &AppHandle, plugin_id: &str) -> Result<()> {
    if let Some(plugins) = PLUGINS.get() {
        plugins.write().await.remove(plugin_id);
    }
    Ok(())
}

/// 启用插件
pub async fn enable_plugin(_app: &AppHandle, plugin_id: &str) -> Result<()> {
    if let Some(plugins) = PLUGINS.get() {
        let mut plugins = plugins.write().await;
        if let Some(plugin) = plugins.get_mut(plugin_id) {
            plugin.enabled = true;
            plugin.info.enabled = true;
        }
    }
    Ok(())
}

/// 禁用插件
pub async fn disable_plugin(_app: &AppHandle, plugin_id: &str) -> Result<()> {
    if let Some(plugins) = PLUGINS.get() {
        let mut plugins = plugins.write().await;
        if let Some(plugin) = plugins.get_mut(plugin_id) {
            plugin.enabled = false;
            plugin.info.enabled = false;
        }
    }
    Ok(())
}

/// 获取已加载的插件列表
pub async fn get_loaded_plugins(_app: &AppHandle) -> Result<Vec<PluginInfo>> {
    if let Some(plugins) = PLUGINS.get() {
        let plugins = plugins.read().await;
        Ok(plugins.values().map(|p| p.info.clone()).collect())
    } else {
        Ok(Vec::new())
    }
}

/// 获取插件信息
#[allow(dead_code)]
pub async fn get_plugin_info(_app: &AppHandle, plugin_id: &str) -> Result<Option<PluginInfo>> {
    if let Some(plugins) = PLUGINS.get() {
        let plugins = plugins.read().await;
        Ok(plugins.get(plugin_id).map(|p| p.info.clone()))
    } else {
        Ok(None)
    }
}

/// 执行插件命令
pub async fn execute_command(
    _app: &AppHandle,
    plugin_id: &str,
    command: &str,
    args: HashMap<String, serde_json::Value>,
) -> Result<serde_json::Value> {
    if let Some(plugins) = PLUGINS.get() {
        let plugins = plugins.read().await;
        if let Some(plugin) = plugins.get(plugin_id) {
            if !plugin.enabled {
                anyhow::bail!("Plugin is disabled: {}", plugin_id);
            }
            
            // 验证命令是否存在
            let command_exists = plugin.info.commands.iter().any(|c| c.name == command);
            if !command_exists {
                anyhow::bail!("Command not found: {}:{}", plugin_id, command);
            }
            
            // 返回命令执行信息（实际执行由前端处理）
            log::info!("Executing plugin command: {}:{} with args: {:?}", plugin_id, command, args);
            return Ok(serde_json::json!({
                "success": true,
                "plugin": plugin_id,
                "command": command,
                "pluginPath": plugin.path.to_string_lossy(),
                "mainFile": plugin.info.main
            }));
        }
    }
    
    anyhow::bail!("Plugin not found: {}", plugin_id)
}

/// 获取插件目录路径
pub async fn get_plugins_directory(app: &AppHandle) -> Result<String> {
    let dir = get_plugins_dir(app)?;
    Ok(dir.to_string_lossy().to_string())
}

/// 扫描可用插件
pub async fn scan_plugins(app: &AppHandle) -> Result<Vec<PluginInfo>> {
    let plugins_dir = get_plugins_dir(app)?;
    let mut available_plugins = Vec::new();
    
    if let Ok(mut dir) = tokio::fs::read_dir(&plugins_dir).await {
        while let Ok(Some(entry)) = dir.next_entry().await {
            if entry.file_type().await?.is_dir() {
                let manifest_path = entry.path().join("package.json");
                if manifest_path.exists() {
                    if let Ok(content) = tokio::fs::read_to_string(&manifest_path).await {
                        if let Ok(manifest) = serde_json::from_str::<PluginManifest>(&content) {
                            let info = PluginInfo {
                                id: manifest.id,
                                name: manifest.name,
                                version: manifest.version,
                                description: manifest.description,
                                author: manifest.author,
                                main: manifest.main,
                                commands: manifest.commands,
                                activation_events: manifest.activation_events,
                                contributes: manifest.contributes,
                                enabled: false,
                                path: entry.path().to_string_lossy().to_string(),
                            };
                            available_plugins.push(info);
                        }
                    }
                }
            }
        }
    }
    
    Ok(available_plugins)
}
