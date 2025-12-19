import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { EditorTabs } from './components/EditorTabs';
import { Editor } from './components/Editor';
import { StatusBar } from './components/StatusBar';
import { SearchPanel } from './components/SearchPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { CommandPalette } from './components/CommandPalette';
import { Terminal } from './components/Terminal';
import { MarkdownPreview } from './components/MarkdownPreview';
import { ToolsPanel } from './components/ToolsPanel';
import './styles/App.css';

function App() {
  const { i18n } = useTranslation();
  const { 
    settings, loadSettings, theme, 
    restoreSession, showTerminal, showMarkdownPreview 
  } = useStore();
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    loadSettings();
    if (settings.restoreWindows) {
      restoreSession();
    }
  }, []);

  useEffect(() => {
    if (settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Save session on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      useStore.getState().saveSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { toggleCommandPalette, toggleSearch, toggleTerminal, toggleSettings } = useStore.getState();
      
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        toggleCommandPalette();
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        toggleSearch();
      } else if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      } else if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        toggleSettings();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`app ${theme}`}>
      <TitleBar />
      <div className="app-content">
        <AnimatePresence>
          {settings.showSidebar && <Sidebar />}
        </AnimatePresence>
        <div className="main-area">
          <div className="editor-area">
            <EditorTabs />
            <div className="editor-container-wrapper">
              <Editor />
              <AnimatePresence>
                {showMarkdownPreview && <MarkdownPreview />}
              </AnimatePresence>
            </div>
          </div>
          <AnimatePresence>
            {showTerminal && <Terminal />}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          <SearchPanel />
        </AnimatePresence>
      </div>
      {settings.showStatusBar && <StatusBar />}
      <SettingsPanel />
      <CommandPalette />
      <ToolsPanel isOpen={showTools} onClose={() => setShowTools(false)} />
    </div>
  );
}

export default App;
