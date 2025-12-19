// StatusBar Component - 状态栏
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { GitBranch, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/StatusBar.css';

export function StatusBar() {
  const { t } = useTranslation();
  const { 
    tabs, activeTabId, settings, toggleSettings, 
    characterCount, updateCharacterCount, gitStatus 
  } = useStore();
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    updateCharacterCount();
  }, [activeTabId, activeTab?.content]);

  const getLanguageDisplay = (lang: string) => {
    const langMap: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'javascriptreact': 'JavaScript React',
      'typescriptreact': 'TypeScript React',
      'python': 'Python',
      'rust': 'Rust',
      'go': 'Go',
      'java': 'Java',
      'c': 'C',
      'cpp': 'C++',
      'csharp': 'C#',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'less': 'Less',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'markdown': 'Markdown',
      'sql': 'SQL',
      'shell': 'Shell',
      'powershell': 'PowerShell',
      'dockerfile': 'Dockerfile',
      'plaintext': 'Plain Text',
    };
    return langMap[lang] || lang;
  };

  const getEolDisplay = (eol: string) => {
    switch (eol) {
      case 'lf': return 'LF';
      case 'crlf': return 'CRLF';
      default: return 'Auto';
    }
  };

  const modifiedCount = tabs.filter(t => t.isModified).length;

  return (
    <div className="status-bar">
      <div className="status-left">
        {gitStatus && (
          <div className="status-item git-status">
            <GitBranch size={14} />
            <span>{gitStatus.branch}</span>
            {(gitStatus.modified.length > 0 || gitStatus.staged.length > 0) && (
              <span className="git-changes">
                {gitStatus.staged.length > 0 && <span className="staged">+{gitStatus.staged.length}</span>}
                {gitStatus.modified.length > 0 && <span className="modified">~{gitStatus.modified.length}</span>}
              </span>
            )}
          </div>
        )}
        
        {modifiedCount > 0 && (
          <div className="status-item warning">
            <AlertCircle size={14} />
            <span>{modifiedCount} {t('statusBar.unsaved')}</span>
          </div>
        )}
        
        {modifiedCount === 0 && tabs.length > 0 && (
          <div className="status-item success">
            <CheckCircle size={14} />
            <span>{t('statusBar.allSaved')}</span>
          </div>
        )}
      </div>
      
      <div className="status-right">
        {activeTab && (
          <>
            <span className="status-item">
              {t('statusBar.line')} {activeTab.cursorPosition.line}, {t('statusBar.column')} {activeTab.cursorPosition.column}
            </span>
            
            {characterCount && (
              <span className="status-item">
                {characterCount.lines} {t('statusBar.lines')} · {characterCount.words} {t('statusBar.words')} · {characterCount.chars} {t('statusBar.chars')}
              </span>
            )}
            
            <button className="status-item clickable" onClick={toggleSettings}>
              {activeTab.encoding}
            </button>
            
            <button className="status-item clickable" onClick={toggleSettings}>
              {getEolDisplay(settings.eol)}
            </button>
            
            <button className="status-item clickable" onClick={toggleSettings}>
              {getLanguageDisplay(activeTab.language)}
            </button>
          </>
        )}
        
        <button className="status-item clickable" onClick={toggleSettings}>
          {settings.insertSpaces ? `Spaces: ${settings.tabSize}` : `Tab: ${settings.tabSize}`}
        </button>
      </div>
    </div>
  );
}
