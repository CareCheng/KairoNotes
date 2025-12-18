import { useEffect } from 'react';
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
import './styles/App.css';

function App() {
  const { i18n } = useTranslation();
  const { settings, loadSettings, theme } = useStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={`app ${theme}`}>
      <TitleBar />
      <div className="app-content">
        <AnimatePresence>
          {settings.showSidebar && <Sidebar />}
        </AnimatePresence>
        <div className="editor-area">
          <EditorTabs />
          <Editor />
        </div>
        <AnimatePresence>
          <SearchPanel />
        </AnimatePresence>
      </div>
      {settings.showStatusBar && <StatusBar />}
      <SettingsPanel />
      <CommandPalette />
    </div>
  );
}

export default App;
