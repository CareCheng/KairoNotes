// File Operations Module

use crate::commands::{DirectoryEntry, FileInfo};
use crate::syntax;
use anyhow::{Context, Result};
use encoding_rs::*;
use std::path::Path;
use chrono::{DateTime, Local};

pub async fn read_file_content(path: &str) -> Result<String> {
    let bytes = tokio::fs::read(path)
        .await
        .with_context(|| format!("Failed to read file: {}", path))?;
    
    // Try to detect encoding and decode
    let (content, _, _) = UTF_8.decode(&bytes);
    if content.contains('\u{FFFD}') {
        // Try other encodings
        for encoding in &[GBK, GB18030, SHIFT_JIS, EUC_KR, WINDOWS_1252] {
            let (decoded, _, had_errors) = encoding.decode(&bytes);
            if !had_errors {
                return Ok(decoded.into_owned());
            }
        }
    }
    Ok(content.into_owned())
}

pub async fn write_file_content(path: &str, content: &str) -> Result<()> {
    tokio::fs::write(path, content)
        .await
        .with_context(|| format!("Failed to write file: {}", path))?;
    Ok(())
}

pub async fn get_file_info(path: &str) -> Result<FileInfo> {
    let metadata = tokio::fs::metadata(path)
        .await
        .with_context(|| format!("Failed to get metadata: {}", path))?;
    
    let path_obj = Path::new(path);
    let name = path_obj
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    let extension = path_obj
        .extension()
        .map(|e| e.to_string_lossy().to_string());
    
    let modified = metadata.modified().ok().map(|t| {
        let datetime: DateTime<Local> = t.into();
        datetime.format("%Y-%m-%d %H:%M:%S").to_string()
    });
    
    let created = metadata.created().ok().map(|t| {
        let datetime: DateTime<Local> = t.into();
        datetime.format("%Y-%m-%d %H:%M:%S").to_string()
    });
    
    let encoding = detect_encoding(path).await.unwrap_or_else(|_| "UTF-8".to_string());
    let language = syntax::detect_language(path, None);
    
    Ok(FileInfo {
        path: path.to_string(),
        name,
        extension,
        size: metadata.len(),
        is_directory: metadata.is_dir(),
        is_readonly: metadata.permissions().readonly(),
        modified,
        created,
        encoding,
        language,
    })
}


pub async fn create_file(path: &str) -> Result<()> {
    tokio::fs::File::create(path)
        .await
        .with_context(|| format!("Failed to create file: {}", path))?;
    Ok(())
}

pub async fn create_directory(path: &str) -> Result<()> {
    tokio::fs::create_dir_all(path)
        .await
        .with_context(|| format!("Failed to create directory: {}", path))?;
    Ok(())
}

pub async fn delete_path(path: &str) -> Result<()> {
    let metadata = tokio::fs::metadata(path).await?;
    if metadata.is_dir() {
        tokio::fs::remove_dir_all(path)
            .await
            .with_context(|| format!("Failed to delete directory: {}", path))?;
    } else {
        tokio::fs::remove_file(path)
            .await
            .with_context(|| format!("Failed to delete file: {}", path))?;
    }
    Ok(())
}

pub async fn rename_path(old_path: &str, new_path: &str) -> Result<()> {
    tokio::fs::rename(old_path, new_path)
        .await
        .with_context(|| format!("Failed to rename: {} -> {}", old_path, new_path))?;
    Ok(())
}

pub async fn list_directory(path: &str) -> Result<Vec<DirectoryEntry>> {
    let mut entries = Vec::new();
    let mut dir = tokio::fs::read_dir(path)
        .await
        .with_context(|| format!("Failed to read directory: {}", path))?;
    
    while let Some(entry) = dir.next_entry().await? {
        let metadata = entry.metadata().await?;
        let name = entry.file_name().to_string_lossy().to_string();
        let is_hidden = name.starts_with('.');
        
        let modified = metadata.modified().ok().map(|t| {
            let datetime: DateTime<Local> = t.into();
            datetime.format("%Y-%m-%d %H:%M:%S").to_string()
        });
        
        entries.push(DirectoryEntry {
            name,
            path: entry.path().to_string_lossy().to_string(),
            is_directory: metadata.is_dir(),
            is_hidden,
            size: metadata.len(),
            modified,
        });
    }
    
    // Sort: directories first, then by name
    entries.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(entries)
}

pub async fn detect_encoding(path: &str) -> Result<String> {
    let bytes = tokio::fs::read(path).await?;
    
    // Check BOM
    if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        return Ok("UTF-8".to_string());
    }
    if bytes.starts_with(&[0xFF, 0xFE]) {
        return Ok("UTF-16LE".to_string());
    }
    if bytes.starts_with(&[0xFE, 0xFF]) {
        return Ok("UTF-16BE".to_string());
    }
    
    // Try UTF-8 first
    if String::from_utf8(bytes.clone()).is_ok() {
        return Ok("UTF-8".to_string());
    }
    
    // Try other encodings
    for (encoding, name) in &[
        (GBK as &'static Encoding, "GBK"),
        (GB18030, "GB18030"),
        (SHIFT_JIS, "Shift_JIS"),
        (EUC_KR, "EUC-KR"),
        (WINDOWS_1252, "Windows-1252"),
    ] {
        let (_, _, had_errors) = encoding.decode(&bytes);
        if !had_errors {
            return Ok(name.to_string());
        }
    }
    
    Ok("UTF-8".to_string())
}

pub fn convert_encoding(content: &str, _from: &str, to: &str) -> Result<String> {
    let encoding = Encoding::for_label(to.as_bytes())
        .unwrap_or(UTF_8);
    let (encoded, _, _) = encoding.encode(content);
    let (decoded, _, _) = UTF_8.decode(&encoded);
    Ok(decoded.into_owned())
}

pub async fn open_in_explorer(path: &str) -> Result<()> {
    let path = Path::new(path);
    let dir = if path.is_file() {
        path.parent().unwrap_or(path)
    } else {
        path
    };
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(dir)
            .spawn()?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(dir)
            .spawn()?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(dir)
            .spawn()?;
    }
    
    Ok(())
}
