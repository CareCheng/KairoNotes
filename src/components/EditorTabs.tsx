import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { X, Circle } from 'lucide-react';
import '../styles/EditorTabs.css';

export function EditorTabs() {
  const { t } = useTranslation();
  const { tabs, activeTabId, setActiveTab, closeTab, createTab } = useStore();

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const tab = tabs.find(t => t.id === id);
    if (tab?.isModified) {
      // TODO: Show save dialog
      if (confirm(t('dialog.saveChanges', { name: tab.name }))) {
        useStore.getState().saveFile(id);
      }
    }
    closeTab(id);
  };

  const handleMiddleClick = (e: React.MouseEvent, id: string) => {
    if (e.button === 1) {
      handleClose(e, id);
    }
  };

  return (
    <div className="editor-tabs">
      <div className="tabs-container">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''} ${tab.isModified ? 'modified' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            onMouseDown={(e) => handleMiddleClick(e, tab.id)}
          >
            <span className="tab-name">{tab.name}</span>
            <button 
              className="tab-close"
              onClick={(e) => handleClose(e, tab.id)}
            >
              {tab.isModified ? (
                <Circle size={8} fill="currentColor" />
              ) : (
                <X size={14} />
              )}
            </button>
          </div>
        ))}
        <button className="new-tab-btn" onClick={createTab} title={t('file.new')}>
          +
        </button>
      </div>
    </div>
  );
}
