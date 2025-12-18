import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import '../styles/StatusBar.css';

export function StatusBar() {
  const { t } = useTranslation();
  const { tabs, activeTabId, settings, toggleSettings } = useStore();
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);

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
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'markdown': 'Markdown',
      'sql': 'SQL',
      'shell': 'Shell',
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

  return (
    <div className="status-bar">
      <div className="status-left">
        {activeTab && (
          <>
            <span className="status-item">
              {t('statusBar.line')} {activeTab.cursorPosition.line}, {t('statusBar.column')} {activeTab.cursorPosition.column}
            </span>
          </>
        )}
      </div>
      
      <div className="status-right">
        {activeTab && (
          <>
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
          {settings.tabSize === 4 ? 'Spaces: 4' : `Tab: ${settings.tabSize}`}
        </button>
      </div>
    </div>
  );
}
