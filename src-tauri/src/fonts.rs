// Font Management Module
// 字体管理模块 - 扫描系统字体和自定义字体

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FontInfo {
    pub name: String,
    pub family: String,
    pub path: Option<String>,
    pub is_system: bool,
    pub is_monospace: bool,
}

/// 获取系统字体目录
fn get_system_font_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    
    #[cfg(target_os = "windows")]
    {
        if let Ok(windir) = std::env::var("WINDIR") {
            dirs.push(PathBuf::from(windir).join("Fonts"));
        }
        if let Ok(localappdata) = std::env::var("LOCALAPPDATA") {
            dirs.push(PathBuf::from(localappdata).join("Microsoft\\Windows\\Fonts"));
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        dirs.push(PathBuf::from("/System/Library/Fonts"));
        dirs.push(PathBuf::from("/Library/Fonts"));
        if let Ok(home) = std::env::var("HOME") {
            dirs.push(PathBuf::from(home).join("Library/Fonts"));
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        dirs.push(PathBuf::from("/usr/share/fonts"));
        dirs.push(PathBuf::from("/usr/local/share/fonts"));
        if let Ok(home) = std::env::var("HOME") {
            dirs.push(PathBuf::from(home).join(".fonts"));
            dirs.push(PathBuf::from(home).join(".local/share/fonts"));
        }
    }
    
    dirs
}

/// 获取程序自定义字体目录
fn get_custom_font_dir() -> Option<PathBuf> {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let fonts_dir = exe_dir.join("Fonts");
            if fonts_dir.exists() {
                return Some(fonts_dir);
            }
        }
    }
    None
}

/// 从字体文件名提取字体名称（保留原始名称格式）
fn extract_font_name(filename: &str) -> String {
    let name = filename
        .trim_end_matches(".ttf")
        .trim_end_matches(".TTF")
        .trim_end_matches(".otf")
        .trim_end_matches(".OTF")
        .trim_end_matches(".ttc")
        .trim_end_matches(".TTC")
        .trim_end_matches(".woff")
        .trim_end_matches(".woff2");
    
    // 保留原始名称，只做基本清理
    name.to_string()
}

/// 格式化字体显示名称
fn format_display_name(name: &str) -> String {
    // 将连字符和下划线替换为空格，但保留原始大小写
    let formatted = name
        .replace("-", " ")
        .replace("_", " ");
    
    // 清理多余空格
    formatted.split_whitespace().collect::<Vec<_>>().join(" ")
}

/// 判断是否为等宽字体（基于名称启发式判断）
fn is_likely_monospace(name: &str) -> bool {
    let lower = name.to_lowercase();
    lower.contains("mono") ||
    lower.contains("code") ||
    lower.contains("consol") ||
    lower.contains("courier") ||
    lower.contains("fixed") ||
    lower.contains("terminal") ||
    lower.contains("source code") ||
    lower.contains("fira code") ||
    lower.contains("jetbrains") ||
    lower.contains("cascadia") ||
    lower.contains("hack") ||
    lower.contains("inconsolata") ||
    lower.contains("menlo") ||
    lower.contains("monaco") ||
    lower.contains("roboto mono") ||
    lower.contains("ubuntu mono") ||
    lower.contains("droid sans mono") ||
    lower.contains("dejavu sans mono") ||
    lower.contains("liberation mono") ||
    lower.contains("noto mono") ||
    lower.contains("sf mono") ||
    lower.contains("iosevka") ||
    lower.contains("sarasa") ||
    lower.contains("更纱") ||
    lower.contains("等宽")
}

/// 扫描目录中的字体文件
fn scan_font_directory(dir: &PathBuf, is_system: bool) -> Vec<FontInfo> {
    let mut fonts = Vec::new();
    let extensions = ["ttf", "otf", "ttc", "woff", "woff2"];
    
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            
            if path.is_dir() {
                // 递归扫描子目录
                fonts.extend(scan_font_directory(&path, is_system));
            } else if let Some(ext) = path.extension() {
                if extensions.contains(&ext.to_string_lossy().to_lowercase().as_str()) {
                    if let Some(filename) = path.file_name() {
                        let filename_str = filename.to_string_lossy().to_string();
                        let font_name = extract_font_name(&filename_str);
                        let display_name = format_display_name(&font_name);
                        
                        if !display_name.is_empty() {
                            fonts.push(FontInfo {
                                name: display_name.clone(),
                                family: font_name, // 保留原始名称用于 CSS
                                path: Some(path.to_string_lossy().to_string()),
                                is_system,
                                is_monospace: is_likely_monospace(&display_name),
                            });
                        }
                    }
                }
            }
        }
    }
    
    fonts
}

/// 获取所有可用字体
pub async fn get_available_fonts() -> Result<Vec<FontInfo>> {
    let mut all_fonts = Vec::new();
    let mut seen_names: HashSet<String> = HashSet::new();
    
    // 添加常用的编程字体（优先显示）
    let programming_fonts = vec![
        ("Consolas", "Consolas", true),
        ("Cascadia Code", "Cascadia Code", true),
        ("Cascadia Mono", "Cascadia Mono", true),
        ("Fira Code", "Fira Code", true),
        ("JetBrains Mono", "JetBrains Mono", true),
        ("Source Code Pro", "Source Code Pro", true),
        ("Monaco", "Monaco", true),
        ("Menlo", "Menlo", true),
        ("SF Mono", "SF Mono", true),
        ("Hack", "Hack", true),
        ("Inconsolata", "Inconsolata", true),
        ("Ubuntu Mono", "Ubuntu Mono", true),
        ("Roboto Mono", "Roboto Mono", true),
        ("Droid Sans Mono", "Droid Sans Mono", true),
        ("DejaVu Sans Mono", "DejaVu Sans Mono", true),
        ("Liberation Mono", "Liberation Mono", true),
        ("Noto Mono", "Noto Mono", true),
        ("Iosevka", "Iosevka", true),
        ("Courier New", "Courier New", true),
        ("Lucida Console", "Lucida Console", true),
        // 中文等宽字体
        ("Sarasa Mono SC", "Sarasa Mono SC", true),
        ("Sarasa Mono TC", "Sarasa Mono TC", true),
        ("更纱黑体 Mono", "Sarasa Mono SC", true),
        ("Source Han Mono", "Source Han Mono", true),
        ("Noto Sans Mono CJK SC", "Noto Sans Mono CJK SC", true),
    ];
    
    for (name, family, is_mono) in programming_fonts {
        let lower_name = name.to_lowercase();
        if !seen_names.contains(&lower_name) {
            seen_names.insert(lower_name);
            all_fonts.push(FontInfo {
                name: name.to_string(),
                family: family.to_string(),
                path: None,
                is_system: true,
                is_monospace: is_mono,
            });
        }
    }
    
    // 扫描自定义字体目录
    if let Some(custom_dir) = get_custom_font_dir() {
        for font in scan_font_directory(&custom_dir, false) {
            if seen_names.insert(font.name.to_lowercase()) {
                all_fonts.push(font);
            }
        }
    }
    
    // 扫描系统字体目录
    for dir in get_system_font_dirs() {
        if dir.exists() {
            for font in scan_font_directory(&dir, true) {
                if seen_names.insert(font.name.to_lowercase()) {
                    all_fonts.push(font);
                }
            }
        }
    }
    
    // 添加常用的 UI 字体
    let ui_fonts = vec![
        ("Microsoft YaHei", "Microsoft YaHei", false),
        ("微软雅黑", "Microsoft YaHei", false),
        ("SimHei", "SimHei", false),
        ("黑体", "SimHei", false),
        ("SimSun", "SimSun", false),
        ("宋体", "SimSun", false),
        ("PingFang SC", "PingFang SC", false),
        ("苹方", "PingFang SC", false),
        ("Hiragino Sans GB", "Hiragino Sans GB", false),
        ("Arial", "Arial", false),
        ("Helvetica", "Helvetica", false),
        ("Helvetica Neue", "Helvetica Neue", false),
        ("Times New Roman", "Times New Roman", false),
        ("Georgia", "Georgia", false),
        ("Verdana", "Verdana", false),
        ("Tahoma", "Tahoma", false),
        ("Trebuchet MS", "Trebuchet MS", false),
        ("Segoe UI", "Segoe UI", false),
        ("San Francisco", "San Francisco", false),
    ];
    
    for (name, family, is_mono) in ui_fonts {
        let lower_name = name.to_lowercase();
        if !seen_names.contains(&lower_name) {
            seen_names.insert(lower_name);
            all_fonts.push(FontInfo {
                name: name.to_string(),
                family: family.to_string(),
                path: None,
                is_system: true,
                is_monospace: is_mono,
            });
        }
    }
    
    // 按名称排序，等宽字体优先
    all_fonts.sort_by(|a, b| {
        match (a.is_monospace, b.is_monospace) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(all_fonts)
}

/// 获取字体目录路径
pub async fn get_fonts_directory() -> Result<String> {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let fonts_dir = exe_dir.join("Fonts");
            // 如果目录不存在，创建它
            if !fonts_dir.exists() {
                tokio::fs::create_dir_all(&fonts_dir).await?;
            }
            return Ok(fonts_dir.to_string_lossy().to_string());
        }
    }
    anyhow::bail!("Cannot determine fonts directory")
}

/// 获取等宽字体列表（用于编辑器）
pub async fn get_monospace_fonts() -> Result<Vec<FontInfo>> {
    let all_fonts = get_available_fonts().await?;
    let monospace_fonts: Vec<FontInfo> = all_fonts.into_iter().filter(|f| f.is_monospace).collect();
    
    // 如果没有找到等宽字体，返回默认列表
    if monospace_fonts.is_empty() {
        return Ok(vec![
            FontInfo {
                name: "Consolas".to_string(),
                family: "Consolas".to_string(),
                path: None,
                is_system: true,
                is_monospace: true,
            },
            FontInfo {
                name: "Cascadia Code".to_string(),
                family: "Cascadia Code".to_string(),
                path: None,
                is_system: true,
                is_monospace: true,
            },
            FontInfo {
                name: "Fira Code".to_string(),
                family: "Fira Code".to_string(),
                path: None,
                is_system: true,
                is_monospace: true,
            },
            FontInfo {
                name: "JetBrains Mono".to_string(),
                family: "JetBrains Mono".to_string(),
                path: None,
                is_system: true,
                is_monospace: true,
            },
            FontInfo {
                name: "Source Code Pro".to_string(),
                family: "Source Code Pro".to_string(),
                path: None,
                is_system: true,
                is_monospace: true,
            },
            FontInfo {
                name: "Monaco".to_string(),
                family: "Monaco".to_string(),
                path: None,
                is_system: true,
                is_monospace: true,
            },
            FontInfo {
                name: "Courier New".to_string(),
                family: "Courier New".to_string(),
                path: None,
                is_system: true,
                is_monospace: true,
            },
        ]);
    }
    
    Ok(monospace_fonts)
}
