import { useEffect, useRef, useCallback } from 'react';
import MonacoEditor, { OnMount, OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import '../styles/Editor.css';

// 文件扩展名到 Monaco 语言的映射
const extensionToLanguage: Record<string, string> = {
  'js': 'javascript',
  'mjs': 'javascript',
  'cjs': 'javascript',
  'jsx': 'javascript',
  'ts': 'typescript',
  'mts': 'typescript',
  'cts': 'typescript',
  'tsx': 'typescript',
  'py': 'python',
  'pyw': 'python',
  'rb': 'ruby',
  'rs': 'rust',
  'go': 'go',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'cc': 'cpp',
  'cxx': 'cpp',
  'h': 'c',
  'hpp': 'cpp',
  'hxx': 'cpp',
  'cs': 'csharp',
  'php': 'php',
  'swift': 'swift',
  'kt': 'kotlin',
  'kts': 'kotlin',
  'scala': 'scala',
  'r': 'r',
  'lua': 'lua',
  'pl': 'perl',
  'pm': 'perl',
  'sh': 'shell',
  'bash': 'shell',
  'zsh': 'shell',
  'ps1': 'powershell',
  'psm1': 'powershell',
  'bat': 'bat',
  'cmd': 'bat',
  'html': 'html',
  'htm': 'html',
  'xhtml': 'html',
  'css': 'css',
  'scss': 'scss',
  'sass': 'scss',
  'less': 'less',
  'json': 'json',
  'jsonc': 'json',
  'xml': 'xml',
  'svg': 'xml',
  'xsl': 'xml',
  'yaml': 'yaml',
  'yml': 'yaml',
  'toml': 'ini',
  'ini': 'ini',
  'cfg': 'ini',
  'conf': 'ini',
  'md': 'markdown',
  'markdown': 'markdown',
  'sql': 'sql',
  'graphql': 'graphql',
  'gql': 'graphql',
  'vue': 'html',
  'svelte': 'html',
  'dockerfile': 'dockerfile',
  'makefile': 'makefile',
  'dart': 'dart',
  'ex': 'elixir',
  'exs': 'elixir',
  'clj': 'clojure',
  'cljs': 'clojure',
  'fs': 'fsharp',
  'fsx': 'fsharp',
};

// 后端语言标识符到 Monaco 语言的映射（修正不兼容的标识符）
const backendToMonacoLanguage: Record<string, string> = {
  'shell': 'shell',
  'batch': 'bat',
  'javascriptreact': 'javascript',
  'typescriptreact': 'typescript',
  'dotenv': 'ini',
  'gitignore': 'ini',
  'editorconfig': 'ini',
  'restructuredtext': 'plaintext',
  'asciidoc': 'plaintext',
  'verilog': 'plaintext',
  'vhdl': 'plaintext',
  'zig': 'plaintext',
  'nim': 'plaintext',
  'crystal': 'ruby',
  'julia': 'plaintext',
  'cmake': 'plaintext',
  'gradle': 'plaintext',
  'diff': 'plaintext',
  'log': 'plaintext',
  'csv': 'plaintext',
  'tsv': 'plaintext',
  'properties': 'ini',
  'latex': 'plaintext',
  'assembly': 'plaintext',
  'erlang': 'plaintext',
  'haskell': 'plaintext',
  'ocaml': 'plaintext',
  'vue': 'html',
  'svelte': 'html',
  'toml': 'ini',
  'sass': 'scss',
};

// 根据文件名获取 Monaco 兼容的语言标识符
function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const lowerName = fileName.toLowerCase();
  
  // 特殊文件名
  if (lowerName === 'dockerfile') return 'dockerfile';
  if (lowerName === 'makefile' || lowerName === 'gnumakefile') return 'plaintext';
  if (lowerName.startsWith('.env')) return 'ini';
  if (lowerName === 'cmakelists.txt') return 'plaintext';
  if (lowerName === 'package.json' || lowerName === 'tsconfig.json') return 'json';
  if (lowerName === 'cargo.toml') return 'ini';
  
  return extensionToLanguage[ext] || 'plaintext';
}

// 将后端返回的语言标识符转换为 Monaco 兼容的标识符
function normalizeLanguage(language: string): string {
  if (!language || language === 'plaintext') return 'plaintext';
  
  // 检查是否需要映射
  const mapped = backendToMonacoLanguage[language];
  if (mapped) return mapped;
  
  // 直接返回（大多数语言标识符是兼容的）
  return language;
}

export function Editor() {
  const { t } = useTranslation();
  const { 
    tabs, activeTabId, updateTabContent, updateCursorPosition,
    settings, theme, createTab, openFile, saveFile, toggleSearch
  } = useStore();
  
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const activeTab = tabs.find(tab => tab.id === activeTabId);



  // 获取当前文件的语言（确保与 Monaco Editor 兼容）
  // 优先使用文件名检测，因为更准确
  const getEditorLanguage = (): string => {
    if (!activeTab) return 'plaintext';
    
    // 先从文件名获取语言
    const langFromName = getLanguageFromFileName(activeTab.name);
    if (langFromName !== 'plaintext') {
      return langFromName;
    }
    
    // 如果文件名无法确定，使用后端检测的语言并转换
    if (activeTab.language && activeTab.language !== 'plaintext') {
      return normalizeLanguage(activeTab.language);
    }
    
    return 'plaintext';
  };
  
  const currentLanguage = getEditorLanguage();
  
  // 调试日志
  console.log('Editor language:', currentLanguage, 'for file:', activeTab?.name, 'backend:', activeTab?.language);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // 确保语法高亮正确设置
    const model = editor.getModel();
    if (model) {
      const lang = getLanguageFromFileName(activeTab?.name || '');
      if (lang !== 'plaintext') {
        monaco.editor.setModelLanguage(model, lang);
      }
      console.log('Editor mounted with language:', lang);
    }
    
    // 强制布局更新
    setTimeout(() => {
      editor.layout();
    }, 100);
    
    // Register keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFile();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO, () => {
      openFile();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN, () => {
      createTab();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      toggleSearch();
    });
    
    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      if (activeTabId) {
        updateCursorPosition(activeTabId, e.position.lineNumber, e.position.column);
      }
    });
  }, [activeTab?.name, activeTabId, saveFile, openFile, createTab, toggleSearch, updateCursorPosition]);

  const handleChange: OnChange = (value) => {
    if (activeTabId && value !== undefined) {
      updateTabContent(activeTabId, value);
    }
  };

  // 当切换标签页或语言变化时，更新编辑器语言和布局
  useEffect(() => {
    if (editorRef.current && monacoRef.current && activeTab) {
      const model = editorRef.current.getModel();
      if (model) {
        const newLang = getEditorLanguage();
        const currentModelLang = model.getLanguageId();
        if (newLang !== currentModelLang) {
          monacoRef.current.editor.setModelLanguage(model, newLang);
          console.log('Updated model language from', currentModelLang, 'to', newLang);
        }
      }
      // 强制布局更新，解决文字挤在一行的问题
      editorRef.current.layout();
      editorRef.current.focus();
    }
  }, [activeTabId, activeTab, activeTab?.language]);

  // 监听窗口大小变化，强制更新布局
  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 没有打开的标签页时显示欢迎界面
  if (!activeTab) {
    return (
      <div className="editor-empty">
        <div className="welcome">
          <h1>KairoNotes</h1>
          <p>{t('app.description')}</p>
          <div className="shortcuts">
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>N</kbd>
              <span>{t('file.new')}</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>O</kbd>
              <span>{t('file.open')}</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>S</kbd>
              <span>{t('file.save')}</span>
            </div>
            <div className="shortcut">
              <kbd>Ctrl</kbd> + <kbd>F</kbd>
              <span>{t('edit.find')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <MonacoEditor
        key={activeTabId} // 强制重新渲染以确保语言正确
        height="100%"
        language={currentLanguage}
        value={activeTab.content}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        onChange={handleChange}
        onMount={handleEditorMount}
        loading={
          <div className="editor-loading">
            <div className="loading-spinner"></div>
            <p>正在加载编辑器...</p>
          </div>
        }
        options={{
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          lineHeight: settings.lineHeight,
          tabSize: settings.tabSize,
          insertSpaces: settings.insertSpaces,
          wordWrap: settings.wordWrap as 'off' | 'on' | 'wordWrapColumn' | 'bounded',
          minimap: { 
            enabled: settings.minimapEnabled,
            renderCharacters: true,
            maxColumn: 120,
          },
          lineNumbers: settings.lineNumbers as 'on' | 'off' | 'relative' | 'interval',
          renderWhitespace: settings.renderWhitespace as 'none' | 'boundary' | 'selection' | 'trailing' | 'all',
          cursorStyle: settings.cursorStyle as 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin',
          cursorBlinking: settings.cursorBlinking as 'blink' | 'smooth' | 'phase' | 'expand' | 'solid',
          smoothScrolling: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 10 },
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          // 确保语法高亮启用
          colorDecorators: true,
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'mouseover',
          matchBrackets: 'always',
          renderLineHighlight: 'all',
          selectOnLineNumbers: true,
          roundedSelection: true,
          readOnly: false,
          domReadOnly: false,
        }}
      />
    </div>
  );
}
