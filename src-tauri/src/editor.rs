// Editor Operations Module

use crate::commands::SearchResult;
use anyhow::Result;
use regex::RegexBuilder;

pub fn search_in_content(
    content: &str,
    query: &str,
    case_sensitive: bool,
    use_regex: bool,
) -> Result<Vec<SearchResult>> {
    let mut results = Vec::new();
    
    if query.is_empty() {
        return Ok(results);
    }
    
    let lines: Vec<&str> = content.lines().collect();
    
    if use_regex {
        let regex = RegexBuilder::new(query)
            .case_insensitive(!case_sensitive)
            .build()?;
        
        for (line_idx, line) in lines.iter().enumerate() {
            for mat in regex.find_iter(line) {
                results.push(SearchResult {
                    line: line_idx + 1,
                    column: mat.start() + 1,
                    length: mat.len(),
                    text: mat.as_str().to_string(),
                    context: line.to_string(),
                });
            }
        }
    } else {
        let search_query = if case_sensitive {
            query.to_string()
        } else {
            query.to_lowercase()
        };
        
        for (line_idx, line) in lines.iter().enumerate() {
            let search_line = if case_sensitive {
                line.to_string()
            } else {
                line.to_lowercase()
            };
            
            let mut start = 0;
            while let Some(pos) = search_line[start..].find(&search_query) {
                let actual_pos = start + pos;
                results.push(SearchResult {
                    line: line_idx + 1,
                    column: actual_pos + 1,
                    length: query.len(),
                    text: line[actual_pos..actual_pos + query.len()].to_string(),
                    context: line.to_string(),
                });
                start = actual_pos + 1;
            }
        }
    }
    
    Ok(results)
}

pub fn search_and_replace(
    content: &str,
    search: &str,
    replace: &str,
    case_sensitive: bool,
    use_regex: bool,
    replace_all: bool,
) -> Result<String> {
    if search.is_empty() {
        return Ok(content.to_string());
    }
    
    if use_regex {
        let regex = RegexBuilder::new(search)
            .case_insensitive(!case_sensitive)
            .build()?;
        
        if replace_all {
            Ok(regex.replace_all(content, replace).to_string())
        } else {
            Ok(regex.replace(content, replace).to_string())
        }
    } else {
        if replace_all {
            if case_sensitive {
                Ok(content.replace(search, replace))
            } else {
                let regex = RegexBuilder::new(&regex::escape(search))
                    .case_insensitive(true)
                    .build()?;
                Ok(regex.replace_all(content, replace).to_string())
            }
        } else {
            if case_sensitive {
                Ok(content.replacen(search, replace, 1))
            } else {
                let regex = RegexBuilder::new(&regex::escape(search))
                    .case_insensitive(true)
                    .build()?;
                Ok(regex.replace(content, replace).to_string())
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_search_basic() {
        let content = "Hello World\nHello Rust\nGoodbye World";
        let results = search_in_content(content, "Hello", true, false).unwrap();
        assert_eq!(results.len(), 2);
        assert_eq!(results[0].line, 1);
        assert_eq!(results[1].line, 2);
    }
    
    #[test]
    fn test_search_case_insensitive() {
        let content = "Hello World\nhello rust";
        let results = search_in_content(content, "hello", false, false).unwrap();
        assert_eq!(results.len(), 2);
    }
    
    #[test]
    fn test_replace_all() {
        let content = "foo bar foo baz foo";
        let result = search_and_replace(content, "foo", "qux", true, false, true).unwrap();
        assert_eq!(result, "qux bar qux baz qux");
    }
}
