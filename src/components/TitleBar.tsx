import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { 
  File, FolderOpen, Save, Settings, Search, 
  Undo, Redo, Copy, Scissors, Clipboard 
} from 'lucide-react';
import '../styles/TitleBar.css';

export function TitleBar() {
  const { t } = useTranslation();
  const { 
    openFile, saveFile, toggleSearch, toggleSettings,
    tabs, activeTabId, createTab, openFolderDialog
  } = useStore();

  const activeTab = tabs.find(t => t.id === activeTabId);
  const title = activeTab ? `${activeTab.name}${activeTab.isModified ? ' •' : ''} - RustNote` : 'RustNote';

  return (
    <div className="title-bar">
      <div className="title-bar-drag-region">
        <span className="app-title">{title}</span>
      </div>
      
      <div className="title-bar-menu">
        <div className="menu-group">
          <button className="menu-btn" onClick={createTab} title={t('file.new')}>
            <File size={16} />
          </button>
          <button className="menu-btn" onClick={openFile} title={t('file.open')}>
            <FolderOpen size={16} />
          </button>
          <button className="menu-btn" onClick={() => saveFile()} title={t('file.save')}>
            <Save size={16} />
          </button>
        </div>
        
        <div className="menu-group">
          <button className="menu-btn" title={t('edit.undo')}>
            <Undo size={16} />
          </button>
          <button className="menu-btn" title={t('edit.redo')}>
            <Redo size={16} />
          </button>
        </div>
        
        <div className="menu-group">
          <button className="menu-btn" title={t('edit.cut')}>
            <Scissors size={16} />
          </button>
          <button className="menu-btn" title={t('edit.copy')}>
            <Copy size={16} />
          </button>
          <button className="menu-btn" title={t('edit.paste')}>
            <Clipboard size={16} />
          </button>
        </div>
        
        <div className="menu-group">
          <button className="menu-btn" onClick={toggleSearch} title={t('edit.find')}>
            <Search size={16} />
          </button>
          <button className="menu-btn" onClick={toggleSettings} title={t('settings.title')}>
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
