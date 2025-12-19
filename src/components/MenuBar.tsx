// MenuBar Component - 带二级菜单的菜单栏
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { ChevronRight } from 'lucide-react';
import '../styles/MenuBar.css';

interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
  submenu?: MenuItem[];
  checked?: boolean;
}

interface MenuProps {
  label: string;
  items: MenuItem[];
}

function Menu({ label, items }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    if (item.action && !item.disabled && !item.submenu) {
      item.action();
      setIsOpen(false);
      setActiveSubmenu(null);
    }
  };

  const handleSubmenuEnter = (itemId: string) => {
    if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);
    setActiveSubmenu(itemId);
  };

  const handleSubmenuLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => setActiveSubmenu(null), 150);
  };

  return (
    <div className="menu" ref={menuRef}>
      <button className={`menu-trigger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {label}
      </button>
      {isOpen && (
        <div className="menu-dropdown">
          {items.map((item, index) => (
            item.separator ? (
              <div key={index} className="menu-separator" />
            ) : (
              <div
                key={item.id}
                className={`menu-item ${item.disabled ? 'disabled' : ''} ${item.submenu ? 'has-submenu' : ''}`}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => item.submenu && handleSubmenuEnter(item.id)}
                onMouseLeave={handleSubmenuLeave}
              >
                {item.checked !== undefined && (
                  <span className="menu-item-check">{item.checked ? '✓' : ''}</span>
                )}
                <span className="menu-item-label">{item.label}</span>
                {item.shortcut && <span className="menu-item-shortcut">{item.shortcut}</span>}
                {item.submenu && (
                  <>
                    <ChevronRight size={14} className="menu-item-arrow" />
                    {activeSubmenu === item.id && (
                      <div className="menu-submenu" onMouseEnter={() => handleSubmenuEnter(item.id)} onMouseLeave={handleSubmenuLeave}>
                        {item.submenu.map((subItem, subIndex) => (
                          subItem.separator ? (
                            <div key={subIndex} className="menu-separator" />
                          ) : (
                            <div
                              key={subItem.id}
                              className={`menu-item ${subItem.disabled ? 'disabled' : ''}`}
                              onClick={(e) => { e.stopPropagation(); handleItemClick(subItem); }}
                            >
                              {subItem.checked !== undefined && (
                                <span className="menu-item-check">{subItem.checked ? '✓' : ''}</span>
                              )}
                              <span className="menu-item-label">{subItem.label}</span>
                              {subItem.shortcut && <span className="menu-item-shortcut">{subItem.shortcut}</span>}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export function MenuBar() {
  const { t } = useTranslation();
  const {
    createTab, openFile, saveFile, saveFileAs, saveAllFiles, closeTab, closeAllTabs, closeSavedTabs,
    activeTabId, toggleSearch, toggleGlobalSearch, toggleSettings, toggleCommandPalette,
    toggleTerminal, toggleMarkdownPreview, toggleDiffView,
    setTheme, theme, settings, updateSettings, openFolderDialog, closeFolder,
    splitEditor, formatDocument, recentFiles, clearRecentFiles
  } = useStore();

  const fileMenu: MenuItem[] = [
    { id: 'new', label: t('file.new'), shortcut: 'Ctrl+N', action: () => createTab() },
    { id: 'newWindow', label: t('file.newWindow'), shortcut: 'Ctrl+Shift+N' },
    { id: 'separator1', label: '', separator: true },
    { id: 'open', label: t('file.open'), shortcut: 'Ctrl+O', action: () => openFile() },
    { id: 'openFolder', label: t('file.openFolder'), shortcut: 'Ctrl+K Ctrl+O', action: openFolderDialog },
    {
      id: 'openRecent', label: t('file.openRecent'),
      submenu: [
        ...recentFiles.slice(0, 10).map((path, i) => ({
          id: `recent-${i}`, label: path.split(/[/\\]/).pop() || path, action: () => openFile(path)
        })),
        { id: 'sep', label: '', separator: true },
        { id: 'clearRecent', label: t('file.clearRecent'), action: clearRecentFiles },
      ],
    },
    { id: 'separator2', label: '', separator: true },
    { id: 'save', label: t('file.save'), shortcut: 'Ctrl+S', action: () => saveFile() },
    { id: 'saveAs', label: t('file.saveAs'), shortcut: 'Ctrl+Shift+S', action: () => saveFileAs() },
    { id: 'saveAll', label: t('file.saveAll'), shortcut: 'Ctrl+K S', action: saveAllFiles },
    { id: 'separator3', label: '', separator: true },
    {
      id: 'preferences', label: t('file.preferences'),
      submenu: [
        { id: 'settings', label: t('settings.title'), shortcut: 'Ctrl+,', action: toggleSettings },
        { id: 'keyboardShortcuts', label: t('settings.keyboardShortcuts'), shortcut: 'Ctrl+K Ctrl+S' },
        { id: 'sep', label: '', separator: true },
        { id: 'colorTheme', label: t('settings.colorTheme'), action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
      ],
    },
    { id: 'separator4', label: '', separator: true },
    { id: 'closeFolder', label: t('file.closeFolder'), action: closeFolder },
    { id: 'close', label: t('file.close'), shortcut: 'Ctrl+W', action: () => activeTabId && closeTab(activeTabId) },
    { id: 'closeAll', label: t('file.closeAll'), action: closeAllTabs },
    { id: 'closeSaved', label: t('file.closeSaved'), action: closeSavedTabs },
    { id: 'separator5', label: '', separator: true },
    { id: 'exit', label: t('file.exit'), shortcut: 'Alt+F4' },
  ];

  const editMenu: MenuItem[] = [
    { id: 'undo', label: t('edit.undo'), shortcut: 'Ctrl+Z' },
    { id: 'redo', label: t('edit.redo'), shortcut: 'Ctrl+Y' },
    { id: 'separator1', label: '', separator: true },
    { id: 'cut', label: t('edit.cut'), shortcut: 'Ctrl+X' },
    { id: 'copy', label: t('edit.copy'), shortcut: 'Ctrl+C' },
    { id: 'paste', label: t('edit.paste'), shortcut: 'Ctrl+V' },
    { id: 'separator2', label: '', separator: true },
    { id: 'find', label: t('edit.find'), shortcut: 'Ctrl+F', action: toggleSearch },
    { id: 'replace', label: t('edit.replace'), shortcut: 'Ctrl+H', action: toggleSearch },
    { id: 'findInFiles', label: t('edit.findInFiles'), shortcut: 'Ctrl+Shift+F', action: toggleGlobalSearch },
    { id: 'separator3', label: '', separator: true },
    { id: 'selectAll', label: t('edit.selectAll'), shortcut: 'Ctrl+A' },
    {
      id: 'selection', label: t('edit.selection'),
      submenu: [
        { id: 'expandSelection', label: t('edit.expandSelection'), shortcut: 'Shift+Alt+→' },
        { id: 'shrinkSelection', label: t('edit.shrinkSelection'), shortcut: 'Shift+Alt+←' },
        { id: 'sep', label: '', separator: true },
        { id: 'copyLineUp', label: t('edit.copyLineUp'), shortcut: 'Shift+Alt+↑' },
        { id: 'copyLineDown', label: t('edit.copyLineDown'), shortcut: 'Shift+Alt+↓' },
        { id: 'moveLineUp', label: t('edit.moveLineUp'), shortcut: 'Alt+↑' },
        { id: 'moveLineDown', label: t('edit.moveLineDown'), shortcut: 'Alt+↓' },
        { id: 'sep2', label: '', separator: true },
        { id: 'addCursorAbove', label: t('selection.addCursorAbove'), shortcut: 'Ctrl+Alt+↑' },
        { id: 'addCursorBelow', label: t('selection.addCursorBelow'), shortcut: 'Ctrl+Alt+↓' },
      ],
    },
    { id: 'separator4', label: '', separator: true },
    {
      id: 'format', label: t('edit.format'),
      submenu: [
        { id: 'formatDocument', label: t('edit.formatDocument'), shortcut: 'Shift+Alt+F', action: formatDocument },
        { id: 'formatSelection', label: t('edit.formatSelection'), shortcut: 'Ctrl+K Ctrl+F' },
      ],
    },
    {
      id: 'lineOperations', label: t('edit.lineOperations'),
      submenu: [
        { id: 'deleteLine', label: t('edit.deleteLine'), shortcut: 'Ctrl+Shift+K' },
        { id: 'duplicateLine', label: t('edit.duplicateLine'), shortcut: 'Ctrl+Shift+D' },
        { id: 'sep', label: '', separator: true },
        { id: 'sortLinesAsc', label: t('edit.sortLinesAsc') },
        { id: 'sortLinesDesc', label: t('edit.sortLinesDesc') },
        { id: 'removeDuplicateLines', label: t('edit.removeDuplicateLines') },
      ],
    },
  ];

  const viewMenu: MenuItem[] = [
    { id: 'commandPalette', label: t('view.commandPalette'), shortcut: 'Ctrl+Shift+P', action: toggleCommandPalette },
    { id: 'separator1', label: '', separator: true },
    {
      id: 'appearance', label: t('view.appearance'),
      submenu: [
        { id: 'fullscreen', label: t('view.fullscreen'), shortcut: 'F11' },
        { id: 'sep', label: '', separator: true },
        { id: 'zoomIn', label: t('view.zoomIn'), shortcut: 'Ctrl+=' },
        { id: 'zoomOut', label: t('view.zoomOut'), shortcut: 'Ctrl+-' },
        { id: 'resetZoom', label: t('view.resetZoom'), shortcut: 'Ctrl+0' },
      ],
    },
    {
      id: 'editorLayout', label: t('view.editorLayout'),
      submenu: [
        { id: 'splitRight', label: t('view.splitRight'), action: () => splitEditor('horizontal') },
        { id: 'splitDown', label: t('view.splitDown'), action: () => splitEditor('vertical') },
        { id: 'sep', label: '', separator: true },
        { id: 'singleColumn', label: t('view.singleColumn') },
        { id: 'twoColumns', label: t('view.twoColumns') },
        { id: 'threeColumns', label: t('view.threeColumns') },
      ],
    },
    { id: 'separator2', label: '', separator: true },
    { id: 'explorer', label: t('view.explorer'), shortcut: 'Ctrl+Shift+E', checked: settings.showSidebar, action: () => updateSettings({ showSidebar: !settings.showSidebar }) },
    { id: 'search', label: t('view.search'), shortcut: 'Ctrl+Shift+F', action: toggleGlobalSearch },
    { id: 'extensions', label: t('view.extensions'), shortcut: 'Ctrl+Shift+X' },
    { id: 'separator3', label: '', separator: true },
    { id: 'terminal', label: t('view.terminal'), shortcut: 'Ctrl+`', action: toggleTerminal },
    { id: 'markdownPreview', label: t('view.markdownPreview'), shortcut: 'Ctrl+Shift+V', action: toggleMarkdownPreview },
    { id: 'diffView', label: t('view.diffView'), action: toggleDiffView },
    { id: 'separator4', label: '', separator: true },
    { id: 'wordWrap', label: t('view.wordWrap'), shortcut: 'Alt+Z', checked: settings.wordWrap === 'on', action: () => updateSettings({ wordWrap: settings.wordWrap === 'on' ? 'off' : 'on' }) },
    { id: 'minimap', label: t('view.minimap'), checked: settings.minimapEnabled, action: () => updateSettings({ minimapEnabled: !settings.minimapEnabled }) },
    { id: 'statusBar', label: t('view.statusBar'), checked: settings.showStatusBar, action: () => updateSettings({ showStatusBar: !settings.showStatusBar }) },
  ];

  const goMenu: MenuItem[] = [
    { id: 'back', label: t('go.back'), shortcut: 'Alt+←' },
    { id: 'forward', label: t('go.forward'), shortcut: 'Alt+→' },
    { id: 'separator1', label: '', separator: true },
    { id: 'goToFile', label: t('go.goToFile'), shortcut: 'Ctrl+P', action: toggleCommandPalette },
    { id: 'goToSymbol', label: t('go.goToSymbol'), shortcut: 'Ctrl+Shift+O' },
    { id: 'goToLine', label: t('go.goToLine'), shortcut: 'Ctrl+G' },
    { id: 'separator2', label: '', separator: true },
    { id: 'goToDefinition', label: t('go.goToDefinition'), shortcut: 'F12' },
    { id: 'goToDeclaration', label: t('go.goToDeclaration') },
    { id: 'goToReferences', label: t('go.goToReferences'), shortcut: 'Shift+F12' },
    { id: 'separator3', label: '', separator: true },
    {
      id: 'goToBracket', label: t('go.goToBracket'),
      submenu: [
        { id: 'goToMatchingBracket', label: t('go.goToMatchingBracket'), shortcut: 'Ctrl+Shift+\\' },
        { id: 'selectToBracket', label: t('go.selectToBracket') },
      ],
    },
  ];

  const toolsMenu: MenuItem[] = [
    {
      id: 'codeTools', label: t('tools.codeTools'),
      submenu: [
        { id: 'formatJson', label: t('tools.formatJson'), action: formatDocument },
        { id: 'minifyJson', label: t('tools.minifyJson') },
        { id: 'sep', label: '', separator: true },
        { id: 'sortLines', label: t('tools.sortLines') },
        { id: 'removeDuplicates', label: t('tools.removeDuplicates') },
      ],
    },
    {
      id: 'textTools', label: t('tools.textTools'),
      submenu: [
        { id: 'toUpperCase', label: t('tools.toUpperCase') },
        { id: 'toLowerCase', label: t('tools.toLowerCase') },
        { id: 'toTitleCase', label: t('tools.toTitleCase') },
        { id: 'sep', label: '', separator: true },
        { id: 'trimWhitespace', label: t('tools.trimWhitespace') },
        { id: 'removeEmptyLines', label: t('tools.removeEmptyLines') },
      ],
    },
    {
      id: 'encoding', label: t('tools.encoding'),
      submenu: [
        { id: 'base64Encode', label: t('tools.base64Encode') },
        { id: 'base64Decode', label: t('tools.base64Decode') },
        { id: 'sep', label: '', separator: true },
        { id: 'urlEncode', label: t('tools.urlEncode') },
        { id: 'urlDecode', label: t('tools.urlDecode') },
        { id: 'sep2', label: '', separator: true },
        { id: 'htmlEncode', label: t('tools.htmlEncode') },
        { id: 'htmlDecode', label: t('tools.htmlDecode') },
      ],
    },
    { id: 'separator1', label: '', separator: true },
    { id: 'colorPicker', label: t('tools.colorPicker') },
    { id: 'characterCount', label: t('tools.characterCount') },
    { id: 'separator2', label: '', separator: true },
    { id: 'compareFiles', label: t('tools.compareFiles'), action: toggleDiffView },
  ];

  const helpMenu: MenuItem[] = [
    { id: 'welcome', label: t('help.welcome') },
    { id: 'documentation', label: t('help.documentation') },
    { id: 'separator1', label: '', separator: true },
    { id: 'keyboardShortcuts', label: t('help.keyboardShortcuts'), shortcut: 'Ctrl+K Ctrl+S' },
    { id: 'separator2', label: '', separator: true },
    { id: 'reportIssue', label: t('help.reportIssue') },
    { id: 'separator3', label: '', separator: true },
    { id: 'checkUpdates', label: t('help.checkUpdates') },
    { id: 'separator4', label: '', separator: true },
    { id: 'about', label: t('help.about'), action: toggleSettings },
  ];

  return (
    <div className="menu-bar">
      <Menu label={t('menu.file')} items={fileMenu} />
      <Menu label={t('menu.edit')} items={editMenu} />
      <Menu label={t('menu.view')} items={viewMenu} />
      <Menu label={t('menu.go')} items={goMenu} />
      <Menu label={t('menu.tools')} items={toolsMenu} />
      <Menu label={t('menu.help')} items={helpMenu} />
    </div>
  );
}
