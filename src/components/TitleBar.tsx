import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useStore } from '../store';
import { Minus, Square, X, Copy, Sun, Moon } from 'lucide-react';
import { MenuBar } from './MenuBar';
import '../styles/TitleBar.css';

export function TitleBar() {
  const { t } = useTranslation();
  const { tabs, activeTabId, theme, setTheme } = useStore();
  const [isMaximized, setIsMaximized] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const title = activeTab ? `${activeTab.name}${activeTab.isModified ? ' •' : ''} - KairoNotes` : 'KairoNotes';

  const handleToggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // 监听窗口最大化状态
  useEffect(() => {
    const win = getCurrentWindow();
    
    const checkMaximized = async () => {
      setIsMaximized(await win.isMaximized());
    };
    
    checkMaximized();
    
    // 监听窗口大小变化
    const unlistenPromise = win.onResized(async () => {
      setIsMaximized(await win.isMaximized());
    });
    
    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, []);

  const handleMinimize = useCallback(async () => {
    const win = getCurrentWindow();
    await win.minimize();
  }, []);

  const handleMaximize = useCallback(async () => {
    const win = getCurrentWindow();
    if (await win.isMaximized()) {
      await win.unmaximize();
    } else {
      await win.maximize();
    }
  }, []);

  const handleClose = useCallback(async () => {
    const win = getCurrentWindow();
    await win.close();
  }, []);

  // 处理标题栏拖拽
  const handleMouseDown = useCallback(async (e: React.MouseEvent) => {
    // 只有左键点击才触发拖拽
    if (e.button !== 0) return;
    // 如果点击的是按钮或菜单，不触发拖拽
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.menu-bar')) return;
    
    const win = getCurrentWindow();
    await win.startDragging();
  }, []);

  // 双击最大化/还原
  const handleDoubleClick = useCallback(async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.menu-bar')) return;
    await handleMaximize();
  }, [handleMaximize]);

  return (
    <div 
      className="title-bar" 
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="title-bar-left">
        <div className="app-icon">
          <img src="/kaironotes.svg" alt="KairoNotes" width="16" height="16" />
        </div>
        <MenuBar />
      </div>
      
      <div className="title-bar-center">
        <span className="app-title">{title}</span>
      </div>
      
      <div className="title-bar-right">
        <button 
          className="window-btn theme-toggle-btn" 
          onClick={handleToggleTheme} 
          title={theme === 'dark' ? (t('theme.light') || '浅色') : (t('theme.dark') || '深色')}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button className="window-btn" onClick={handleMinimize} title={t('window.minimize') || '最小化'}>
          <Minus size={14} />
        </button>
        <button className="window-btn" onClick={handleMaximize} title={isMaximized ? (t('window.restore') || '还原') : (t('window.maximize') || '最大化')}>
          {isMaximized ? <Copy size={12} /> : <Square size={12} />}
        </button>
        <button className="window-btn close-btn" onClick={handleClose} title={t('window.close') || '关闭'}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
