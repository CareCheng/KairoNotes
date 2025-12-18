import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { 
  File, FolderOpen, Save, Settings, Search, 
  Moon, Sun, X
} from 'lucide-react';
import '../styles/CommandPalette.css';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const { t } = useTranslation();
  const {
    showCommandPalette, toggleCommandPalette,
    createTab, openFile, saveFile, toggleSearch, toggleSettings,
    theme, setTheme
  } = useStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'new-file',
      label: t('file.new'),
      icon: <File size={16} />,
      action: createTab,
      shortcut: 'Ctrl+N',
    },
    {
      id: 'open-file',
      label: t('file.open'),
      icon: <FolderOpen size={16} />,
      action: openFile,
      shortcut: 'Ctrl+O',
    },
    {
      id: 'save-file',
      label: t('file.save'),
      icon: <Save size={16} />,
      action: () => saveFile(),
      shortcut: 'Ctrl+S',
    },
    {
      id: 'find',
      label: t('edit.find'),
      icon: <Search size={16} />,
      action: toggleSearch,
      shortcut: 'Ctrl+F',
    },
    {
      id: 'settings',
      label: t('settings.title'),
      icon: <Settings size={16} />,
      action: toggleSettings,
      shortcut: 'Ctrl+,',
    },
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? t('theme.light') : t('theme.dark'),
      icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (showCommandPalette && inputRef.current) {
      inputRef.current.focus();
    }
    setQuery('');
    setSelectedIndex(0);
  }, [showCommandPalette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      toggleCommandPalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        toggleCommandPalette();
      }
    }
  };

  const executeCommand = (cmd: Command) => {
    cmd.action();
    toggleCommandPalette();
  };

  return (
    <AnimatePresence>
      {showCommandPalette && (
        <motion.div
          className="command-palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleCommandPalette}
        >
          <motion.div
            className="command-palette"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="command-input-container">
              <Search size={16} className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                className="command-input"
                placeholder={t('view.commandPalette')}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
              />
              <button className="close-btn" onClick={toggleCommandPalette}>
                <X size={16} />
              </button>
            </div>
            
            <div className="command-list">
              {filteredCommands.map((cmd, index) => (
                <div
                  key={cmd.id}
                  className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="command-icon">{cmd.icon}</span>
                  <span className="command-label">{cmd.label}</span>
                  {cmd.shortcut && (
                    <span className="command-shortcut">{cmd.shortcut}</span>
                  )}
                </div>
              ))}
              
              {filteredCommands.length === 0 && (
                <div className="no-results">{t('search.noResults')}</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
