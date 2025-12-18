import { useEffect, useRef, useState } from 'react';
import MonacoEditor, { OnMount, OnChange, loader } from '@monaco-editor/react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import '../styles/Editor.css';

// 配置 Monaco Editor 从 CDN 加载
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
});

export function Editor() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { 
    tabs, activeTabId, updateTabContent, updateCursorPosition,
    settings, theme, createTab, openFile, saveFile, toggleSearch
  } = useStore();
  
  const editorRef = useRef<any>(null);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // 预加载 Monaco Editor
  useEffect(() => {
    loader.init()
      .then(() => {
        setIsLoading(false);
        setLoadError(null);
      })
      .catch((error) => {
        console.error('Failed to load Monaco Editor:', error);
        setLoadError('编辑器加载失败，请检查网络连接');
        setIsLoading(false);
      });
  }, []);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
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
    editor.onDidChangeCursorPosition((e: any) => {
      if (activeTabId) {
        updateCursorPosition(activeTabId, e.position.lineNumber, e.position.column);
      }
    });
  };

  const handleChange: OnChange = (value) => {
    if (activeTabId && value !== undefined) {
      updateTabContent(activeTabId, value);
    }
  };

  useEffect(() => {
    if (editorRef.current && activeTab) {
      editorRef.current.focus();
    }
  }, [activeTabId, activeTab]);

  // 显示加载错误
  if (loadError) {
    return (
      <div className="editor-empty">
        <div className="welcome error">
          <h2>⚠️ {loadError}</h2>
          <p>请检查网络连接后刷新页面</p>
          <button onClick={() => window.location.reload()}>刷新页面</button>
        </div>
      </div>
    );
  }

  // 没有打开的标签页时显示欢迎界面
  if (!activeTab) {
    return (
      <div className="editor-empty">
        <div className="welcome">
          <h1>RustNote</h1>
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
        height="100%"
        language={activeTab.language}
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
          minimap: { enabled: settings.minimapEnabled },
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
        }}
      />
    </div>
  );
}
