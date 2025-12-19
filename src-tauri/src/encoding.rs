// Encoding Module
// 完整的编码支持模块

use anyhow::Result;
use encoding_rs::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EncodingInfo {
    pub name: String,
    pub label: String,
    pub category: String,
}

/// 获取所有支持的编码列表
pub fn get_supported_encodings() -> Vec<EncodingInfo> {
    vec![
        // Unicode
        EncodingInfo { name: "UTF-8".to_string(), label: "UTF-8".to_string(), category: "Unicode".to_string() },
        EncodingInfo { name: "UTF-8-BOM".to_string(), label: "UTF-8 with BOM".to_string(), category: "Unicode".to_string() },
        EncodingInfo { name: "UTF-16LE".to_string(), label: "UTF-16 LE".to_string(), category: "Unicode".to_string() },
        EncodingInfo { name: "UTF-16BE".to_string(), label: "UTF-16 BE".to_string(), category: "Unicode".to_string() },
        
        // Chinese
        EncodingInfo { name: "GBK".to_string(), label: "GBK (简体中文)".to_string(), category: "Chinese".to_string() },
        EncodingInfo { name: "GB18030".to_string(), label: "GB18030 (简体中文)".to_string(), category: "Chinese".to_string() },
        EncodingInfo { name: "GB2312".to_string(), label: "GB2312 (简体中文)".to_string(), category: "Chinese".to_string() },
        EncodingInfo { name: "BIG5".to_string(), label: "Big5 (繁体中文)".to_string(), category: "Chinese".to_string() },
        EncodingInfo { name: "BIG5-HKSCS".to_string(), label: "Big5-HKSCS (香港)".to_string(), category: "Chinese".to_string() },
        
        // Japanese
        EncodingInfo { name: "SHIFT_JIS".to_string(), label: "Shift_JIS (日文)".to_string(), category: "Japanese".to_string() },
        EncodingInfo { name: "EUC-JP".to_string(), label: "EUC-JP (日文)".to_string(), category: "Japanese".to_string() },
        EncodingInfo { name: "ISO-2022-JP".to_string(), label: "ISO-2022-JP (日文)".to_string(), category: "Japanese".to_string() },
        
        // Korean
        EncodingInfo { name: "EUC-KR".to_string(), label: "EUC-KR (韩文)".to_string(), category: "Korean".to_string() },
        EncodingInfo { name: "ISO-2022-KR".to_string(), label: "ISO-2022-KR (韩文)".to_string(), category: "Korean".to_string() },
        
        // Western European
        EncodingInfo { name: "ISO-8859-1".to_string(), label: "ISO-8859-1 (Latin-1)".to_string(), category: "Western".to_string() },
        EncodingInfo { name: "ISO-8859-15".to_string(), label: "ISO-8859-15 (Latin-9)".to_string(), category: "Western".to_string() },
        EncodingInfo { name: "WINDOWS-1252".to_string(), label: "Windows-1252".to_string(), category: "Western".to_string() },
        EncodingInfo { name: "MACINTOSH".to_string(), label: "Mac Roman".to_string(), category: "Western".to_string() },
        
        // Central European
        EncodingInfo { name: "ISO-8859-2".to_string(), label: "ISO-8859-2 (Latin-2)".to_string(), category: "Central European".to_string() },
        EncodingInfo { name: "WINDOWS-1250".to_string(), label: "Windows-1250".to_string(), category: "Central European".to_string() },
        
        // Cyrillic
        EncodingInfo { name: "ISO-8859-5".to_string(), label: "ISO-8859-5 (Cyrillic)".to_string(), category: "Cyrillic".to_string() },
        EncodingInfo { name: "WINDOWS-1251".to_string(), label: "Windows-1251 (Cyrillic)".to_string(), category: "Cyrillic".to_string() },
        EncodingInfo { name: "KOI8-R".to_string(), label: "KOI8-R (Russian)".to_string(), category: "Cyrillic".to_string() },
        EncodingInfo { name: "KOI8-U".to_string(), label: "KOI8-U (Ukrainian)".to_string(), category: "Cyrillic".to_string() },
        EncodingInfo { name: "X-MAC-CYRILLIC".to_string(), label: "Mac Cyrillic".to_string(), category: "Cyrillic".to_string() },
        
        // Greek
        EncodingInfo { name: "ISO-8859-7".to_string(), label: "ISO-8859-7 (Greek)".to_string(), category: "Greek".to_string() },
        EncodingInfo { name: "WINDOWS-1253".to_string(), label: "Windows-1253 (Greek)".to_string(), category: "Greek".to_string() },
        
        // Turkish
        EncodingInfo { name: "ISO-8859-9".to_string(), label: "ISO-8859-9 (Turkish)".to_string(), category: "Turkish".to_string() },
        EncodingInfo { name: "WINDOWS-1254".to_string(), label: "Windows-1254 (Turkish)".to_string(), category: "Turkish".to_string() },
        
        // Hebrew
        EncodingInfo { name: "ISO-8859-8".to_string(), label: "ISO-8859-8 (Hebrew)".to_string(), category: "Hebrew".to_string() },
        EncodingInfo { name: "WINDOWS-1255".to_string(), label: "Windows-1255 (Hebrew)".to_string(), category: "Hebrew".to_string() },
        
        // Arabic
        EncodingInfo { name: "ISO-8859-6".to_string(), label: "ISO-8859-6 (Arabic)".to_string(), category: "Arabic".to_string() },
        EncodingInfo { name: "WINDOWS-1256".to_string(), label: "Windows-1256 (Arabic)".to_string(), category: "Arabic".to_string() },
        
        // Thai
        EncodingInfo { name: "TIS-620".to_string(), label: "TIS-620 (Thai)".to_string(), category: "Thai".to_string() },
        EncodingInfo { name: "WINDOWS-874".to_string(), label: "Windows-874 (Thai)".to_string(), category: "Thai".to_string() },
        
        // Vietnamese
        EncodingInfo { name: "WINDOWS-1258".to_string(), label: "Windows-1258 (Vietnamese)".to_string(), category: "Vietnamese".to_string() },
        
        // Baltic
        EncodingInfo { name: "ISO-8859-4".to_string(), label: "ISO-8859-4 (Baltic)".to_string(), category: "Baltic".to_string() },
        EncodingInfo { name: "ISO-8859-13".to_string(), label: "ISO-8859-13 (Baltic)".to_string(), category: "Baltic".to_string() },
        EncodingInfo { name: "WINDOWS-1257".to_string(), label: "Windows-1257 (Baltic)".to_string(), category: "Baltic".to_string() },
    ]
}

/// 根据名称获取编码器
fn get_encoding_by_name(name: &str) -> &'static Encoding {
    let upper = name.to_uppercase();
    match upper.as_str() {
        "UTF-8" | "UTF8" => UTF_8,
        "UTF-8-BOM" => UTF_8,
        "UTF-16LE" | "UTF-16" => UTF_16LE,
        "UTF-16BE" => UTF_16BE,
        "GBK" | "CP936" => GBK,
        "GB18030" => GB18030,
        "GB2312" => GBK, // GB2312 is subset of GBK
        "BIG5" | "BIG-5" => BIG5,
        "BIG5-HKSCS" => BIG5,
        "SHIFT_JIS" | "SHIFT-JIS" | "SJIS" | "CP932" => SHIFT_JIS,
        "EUC-JP" | "EUCJP" => EUC_JP,
        "ISO-2022-JP" => ISO_2022_JP,
        "EUC-KR" | "EUCKR" | "CP949" => EUC_KR,
        "ISO-2022-KR" => ISO_2022_JP, // Fallback
        "ISO-8859-1" | "LATIN1" | "LATIN-1" => WINDOWS_1252, // Close enough
        "ISO-8859-2" | "LATIN2" => ISO_8859_2,
        "ISO-8859-3" => ISO_8859_3,
        "ISO-8859-4" => ISO_8859_4,
        "ISO-8859-5" => ISO_8859_5,
        "ISO-8859-6" => ISO_8859_6,
        "ISO-8859-7" => ISO_8859_7,
        "ISO-8859-8" => ISO_8859_8,
        "ISO-8859-9" | "LATIN5" => WINDOWS_1254,
        "ISO-8859-10" => ISO_8859_10,
        "ISO-8859-13" => ISO_8859_13,
        "ISO-8859-14" => ISO_8859_14,
        "ISO-8859-15" | "LATIN9" => ISO_8859_15,
        "ISO-8859-16" => ISO_8859_16,
        "WINDOWS-1250" | "CP1250" => WINDOWS_1250,
        "WINDOWS-1251" | "CP1251" => WINDOWS_1251,
        "WINDOWS-1252" | "CP1252" => WINDOWS_1252,
        "WINDOWS-1253" | "CP1253" => WINDOWS_1253,
        "WINDOWS-1254" | "CP1254" => WINDOWS_1254,
        "WINDOWS-1255" | "CP1255" => WINDOWS_1255,
        "WINDOWS-1256" | "CP1256" => WINDOWS_1256,
        "WINDOWS-1257" | "CP1257" => WINDOWS_1257,
        "WINDOWS-1258" | "CP1258" => WINDOWS_1258,
        "KOI8-R" | "KOI8R" => KOI8_R,
        "KOI8-U" | "KOI8U" => KOI8_U,
        "MACINTOSH" | "MAC-ROMAN" => MACINTOSH,
        "X-MAC-CYRILLIC" | "MAC-CYRILLIC" => X_MAC_CYRILLIC,
        "TIS-620" | "TIS620" => WINDOWS_874,
        "WINDOWS-874" | "CP874" => WINDOWS_874,
        _ => UTF_8,
    }
}

/// 检测文件编码
pub async fn detect_file_encoding(path: &str) -> Result<String> {
    let bytes = tokio::fs::read(path).await?;
    Ok(detect_encoding_from_bytes(&bytes))
}

/// 从字节检测编码
pub fn detect_encoding_from_bytes(bytes: &[u8]) -> String {
    // 检查 BOM
    if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        return "UTF-8-BOM".to_string();
    }
    if bytes.starts_with(&[0xFF, 0xFE, 0x00, 0x00]) {
        return "UTF-32LE".to_string();
    }
    if bytes.starts_with(&[0x00, 0x00, 0xFE, 0xFF]) {
        return "UTF-32BE".to_string();
    }
    if bytes.starts_with(&[0xFF, 0xFE]) {
        return "UTF-16LE".to_string();
    }
    if bytes.starts_with(&[0xFE, 0xFF]) {
        return "UTF-16BE".to_string();
    }
    
    // 尝试 UTF-8
    if String::from_utf8(bytes.to_vec()).is_ok() {
        return "UTF-8".to_string();
    }
    
    // 尝试其他编码
    let encodings_to_try = [
        (GBK, "GBK"),
        (GB18030, "GB18030"),
        (BIG5, "BIG5"),
        (SHIFT_JIS, "SHIFT_JIS"),
        (EUC_JP, "EUC-JP"),
        (EUC_KR, "EUC-KR"),
        (WINDOWS_1251, "WINDOWS-1251"),
        (WINDOWS_1252, "WINDOWS-1252"),
        (WINDOWS_1252, "ISO-8859-1"),
    ];
    
    for (encoding, name) in &encodings_to_try {
        let (_, _, had_errors) = encoding.decode(bytes);
        if !had_errors {
            return name.to_string();
        }
    }
    
    "UTF-8".to_string()
}

/// 读取文件并使用指定编码解码
pub async fn read_file_with_encoding(path: &str, encoding_name: &str) -> Result<String> {
    let bytes = tokio::fs::read(path).await?;
    decode_bytes(&bytes, encoding_name)
}

/// 解码字节
pub fn decode_bytes(bytes: &[u8], encoding_name: &str) -> Result<String> {
    // 处理 BOM
    let (bytes_to_decode, actual_encoding) = if encoding_name == "UTF-8-BOM" {
        if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
            (&bytes[3..], "UTF-8")
        } else {
            (bytes, "UTF-8")
        }
    } else if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) && encoding_name == "UTF-8" {
        (&bytes[3..], encoding_name)
    } else if bytes.starts_with(&[0xFF, 0xFE]) && encoding_name.contains("UTF-16") {
        (&bytes[2..], encoding_name)
    } else if bytes.starts_with(&[0xFE, 0xFF]) && encoding_name.contains("UTF-16") {
        (&bytes[2..], encoding_name)
    } else {
        (bytes, encoding_name)
    };
    
    let encoding = get_encoding_by_name(actual_encoding);
    let (decoded, _, _) = encoding.decode(bytes_to_decode);
    Ok(decoded.into_owned())
}

/// 使用指定编码写入文件
pub async fn write_file_with_encoding(path: &str, content: &str, encoding_name: &str) -> Result<()> {
    let bytes = encode_string(content, encoding_name)?;
    tokio::fs::write(path, bytes).await?;
    Ok(())
}

/// 编码字符串
pub fn encode_string(content: &str, encoding_name: &str) -> Result<Vec<u8>> {
    let mut result = Vec::new();
    
    // 添加 BOM（如果需要）
    if encoding_name == "UTF-8-BOM" {
        result.extend_from_slice(&[0xEF, 0xBB, 0xBF]);
        result.extend_from_slice(content.as_bytes());
        return Ok(result);
    }
    
    if encoding_name == "UTF-16LE" {
        result.extend_from_slice(&[0xFF, 0xFE]);
        for c in content.encode_utf16() {
            result.extend_from_slice(&c.to_le_bytes());
        }
        return Ok(result);
    }
    
    if encoding_name == "UTF-16BE" {
        result.extend_from_slice(&[0xFE, 0xFF]);
        for c in content.encode_utf16() {
            result.extend_from_slice(&c.to_be_bytes());
        }
        return Ok(result);
    }
    
    let encoding = get_encoding_by_name(encoding_name);
    let (encoded, _, _) = encoding.encode(content);
    Ok(encoded.into_owned())
}

/// 转换编码
#[allow(dead_code)]
pub fn convert_encoding(content: &str, _from: &str, to: &str) -> Result<String> {
    // 先编码为目标格式的字节
    let bytes = encode_string(content, to)?;
    // 再解码回字符串
    decode_bytes(&bytes, to)
}
