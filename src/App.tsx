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
import { AboutPanel } from './components/AboutPanel';
import { ContextMenu, ContextMenuItem } from './components/ContextMenu';
import { Settings, Info, FolderOpen, FilePlus } from 'lucide-react';
import './styles/App.css';

function App() {
  const { t, i18n } = useTranslation();
  const { 
    settings, loadSettings, theme, openFolder,
    restoreSession, showTerminal, showMarkdownPreview,
    toggleSettings, createTab, openFolderDialog
  } = useStore();
  const [showTools, setShowTools] = useState(false);
  const [globalContextMenu, setGlobalContextMenu] = useState<{ x: number; y: number } | null>(null);

  // 极限模式下的简化界面
  const isExtremeMode = settings.extremeMode;
  
  // 只有打开文件夹后才显示侧边栏
  const shouldShowSidebar = settings.showSidebar && openFolder && !isExtremeMode;

  useEffect(() => {
    const init = async () => {
      await loadSettings();
      if (settings.restoreWindows) {
        restoreSession();
      }
    };
    init();
  }, []);

  // 当设置加载完成后，切换到用户设置的语言
  useEffect(() => {
    if (settings.language && settings.language !== i18n.language) {
      console.log('Changing language to:', settings.language);
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // 极限模式下添加特殊类
    if (isExtremeMode) {
      document.documentElement.classList.add('extreme-mode');
    } else {
      document.documentElement.classList.remove('extreme-mode');
    }
  }, [theme, isExtremeMode]);

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
        if (!isExtremeMode) toggleTerminal();
      } else if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        toggleSettings();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExtremeMode]);

  // 禁用浏览器默认右键菜单（编辑器区域除外）
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // 如果是 Monaco 编辑器内部，允许默认行为
      if (target.closest('.monaco-editor')) {
        return;
      }
      // 如果是侧边栏，由侧边栏自己处理
      if (target.closest('.sidebar')) {
        return;
      }
      // 其他区域显示全局右键菜单
      e.preventDefault();
      setGlobalContextMenu({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // 全局右键菜单项
  const getGlobalContextMenuItems = (): ContextMenuItem[] => [
    {
      id: 'newFile',
      label: t('file.new'),
      icon: <FilePlus size={14} />,
      shortcut: 'Ctrl+N',
      onClick: () => createTab(),
    },
    {
      id: 'openFolder',
      label: t('file.openFolder'),
      icon: <FolderOpen size={14} />,
      onClick: openFolderDialog,
    },
    { id: 'sep1', label: '', separator: true },
    {
      id: 'settings',
      label: t('contextMenu.settings'),
      icon: <Settings size={14} />,
      shortcut: 'Ctrl+,',
      onClick: toggleSettings,
    },
    { id: 'sep2', label: '', separator: true },
    {
      id: 'about',
      label: t('contextMenu.about'),
      icon: <Info size={14} />,
      onClick: () => {
        toggleSettings();
        // 可以在这里设置打开关于标签
      },
    },
  ];

  // 极限模式：只显示标题栏、编辑器和状态栏
  if (isExtremeMode) {
    return (
      <div className={`app ${theme} extreme-mode`}>
        <TitleBar />
        <div className="app-content">
          <div className="main-area">
            <div className="editor-area">
              <EditorTabs />
              <div className="editor-container-wrapper">
                <Editor />
              </div>
            </div>
          </div>
          <AnimatePresence>
            <SearchPanel />
          </AnimatePresence>
        </div>
        {settings.showStatusBar && <StatusBar />}
        <SettingsPanel />
        <CommandPalette />
        
        {/* 全局右键菜单 */}
        <ContextMenu
          items={getGlobalContextMenuItems()}
          position={globalContextMenu}
          onClose={() => setGlobalContextMenu(null)}
        />
        <AboutPanel />
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <TitleBar />
      <div className="app-content">
        <AnimatePresence>
          {shouldShowSidebar && <Sidebar />}
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
      
      {/* 全局右键菜单 */}
      <ContextMenu
        items={getGlobalContextMenuItems()}
        position={globalContextMenu}
        onClose={() => setGlobalContextMenu(null)}
      />
      <AboutPanel />
    </div>
  );
}

export default App;
