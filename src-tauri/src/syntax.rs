// Syntax Highlighting Module

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HighlightToken {
    pub start: usize,
    pub end: usize,
    pub token_type: String,
    pub scope: String,
}

// Language detection based on file extension
pub fn detect_language(path: &str, content: Option<&str>) -> String {
    let path = Path::new(path);
    
    // Check extension first
    if let Some(ext) = path.extension() {
        let ext = ext.to_string_lossy().to_lowercase();
        let lang = match ext.as_str() {
            // Programming Languages
            "rs" => "rust",
            "js" | "mjs" | "cjs" => "javascript",
            "ts" | "mts" | "cts" => "typescript",
            "jsx" => "javascriptreact",
            "tsx" => "typescriptreact",
            "py" | "pyw" | "pyi" => "python",
            "java" => "java",
            "c" | "h" => "c",
            "cpp" | "cc" | "cxx" | "hpp" | "hxx" | "hh" => "cpp",
            "cs" => "csharp",
            "go" => "go",
            "rb" | "rake" | "gemspec" => "ruby",
            "php" | "phtml" => "php",
            "swift" => "swift",
            "kt" | "kts" => "kotlin",
            "scala" | "sc" => "scala",
            "r" | "rmd" => "r",
            "lua" => "lua",
            "pl" | "pm" => "perl",
            "sh" | "bash" | "zsh" => "shell",
            "ps1" | "psm1" | "psd1" => "powershell",
            "bat" | "cmd" => "batch",
            "asm" | "s" => "assembly",
            "dart" => "dart",
            "ex" | "exs" => "elixir",
            "erl" | "hrl" => "erlang",
            "fs" | "fsx" | "fsi" => "fsharp",
            "hs" | "lhs" => "haskell",
            "clj" | "cljs" | "cljc" => "clojure",
            "ml" | "mli" => "ocaml",
            "v" | "vh" => "verilog",
            "vhd" | "vhdl" => "vhdl",
            "zig" => "zig",
            "nim" => "nim",
            "cr" => "crystal",
            "jl" => "julia",
            
            // Web Technologies
            "html" | "htm" | "xhtml" => "html",
            "css" => "css",
            "scss" => "scss",
            "sass" => "sass",
            "less" => "less",
            "vue" => "vue",
            "svelte" => "svelte",
            
            // Data & Config
            "json" | "jsonc" => "json",
            "xml" | "xsl" | "xslt" | "svg" => "xml",
            "yaml" | "yml" => "yaml",
            "toml" => "toml",
            "ini" | "cfg" | "conf" => "ini",
            "env" => "dotenv",
            "properties" => "properties",
            
            // Documentation
            "md" | "markdown" => "markdown",
            "rst" => "restructuredtext",
            "tex" | "latex" => "latex",
            "adoc" | "asciidoc" => "asciidoc",
            
            // Database
            "sql" => "sql",
            "graphql" | "gql" => "graphql",
            
            // Other
            "dockerfile" => "dockerfile",
            "makefile" => "makefile",
            "cmake" => "cmake",
            "gradle" => "gradle",
            "diff" | "patch" => "diff",
            "log" => "log",
            "csv" => "csv",
            "tsv" => "tsv",
            
            _ => "plaintext",
        };
        return lang.to_string();
    }
    
    // Check filename
    if let Some(name) = path.file_name() {
        let name = name.to_string_lossy().to_lowercase();
        let lang = match name.as_str() {
            "dockerfile" => "dockerfile",
            "makefile" | "gnumakefile" => "makefile",
            "cmakelists.txt" => "cmake",
            "gemfile" | "rakefile" => "ruby",
            "vagrantfile" => "ruby",
            ".gitignore" | ".gitattributes" | ".gitmodules" => "gitignore",
            ".editorconfig" => "editorconfig",
            ".env" | ".env.local" | ".env.development" | ".env.production" => "dotenv",
            "package.json" | "tsconfig.json" | "jsconfig.json" => "json",
            "cargo.toml" => "toml",
            _ => "",
        };
        if !lang.is_empty() {
            return lang.to_string();
        }
    }
    
    // Try to detect from content (shebang)
    if let Some(content) = content {
        if let Some(first_line) = content.lines().next() {
            if first_line.starts_with("#!") {
                if first_line.contains("python") {
                    return "python".to_string();
                }
                if first_line.contains("node") || first_line.contains("deno") {
                    return "javascript".to_string();
                }
                if first_line.contains("ruby") {
                    return "ruby".to_string();
                }
                if first_line.contains("bash") || first_line.contains("sh") {
                    return "shell".to_string();
                }
                if first_line.contains("perl") {
                    return "perl".to_string();
                }
            }
        }
    }
    
    "plaintext".to_string()
}

pub fn highlight_content(content: &str, language: &str) -> Result<Vec<HighlightToken>> {
    // Basic tokenization - Monaco Editor handles most highlighting
    // This provides additional semantic tokens if needed
    let tokens = Vec::new();
    
    // For now, return empty - Monaco handles syntax highlighting
    // This can be extended with tree-sitter for more advanced highlighting
    let _ = (content, language);
    
    Ok(tokens)
}

#[allow(dead_code)]
pub fn get_supported_languages() -> Vec<(&'static str, &'static str)> {
    vec![
        ("plaintext", "Plain Text"),
        ("rust", "Rust"),
        ("javascript", "JavaScript"),
        ("typescript", "TypeScript"),
        ("python", "Python"),
        ("java", "Java"),
        ("c", "C"),
        ("cpp", "C++"),
        ("csharp", "C#"),
        ("go", "Go"),
        ("ruby", "Ruby"),
        ("php", "PHP"),
        ("swift", "Swift"),
        ("kotlin", "Kotlin"),
        ("html", "HTML"),
        ("css", "CSS"),
        ("json", "JSON"),
        ("xml", "XML"),
        ("yaml", "YAML"),
        ("markdown", "Markdown"),
        ("sql", "SQL"),
        ("shell", "Shell"),
    ]
}
