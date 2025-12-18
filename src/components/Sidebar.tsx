import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { useStore } from '../store';
import { 
  FolderOpen, File, ChevronRight, ChevronDown,
  Search, Puzzle, RefreshCw
} from 'lucide-react';
import '../styles/Sidebar.css';

interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isHidden: boolean;
  size: number;
  modified: string | null;
}

interface TreeNode extends FileEntry {
  children?: TreeNode[];
  isExpanded?: boolean;
}

export function Sidebar() {
  const { t } = useTranslation();
  const { openFolder, sidebarWidth, openFolderDialog } = useStore();
  const [activeView, setActiveView] = useState<'explorer' | 'search' | 'extensions'>('explorer');
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openFolder) {
      loadDirectory(openFolder);
    }
  }, [openFolder]);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    try {
      const entries: FileEntry[] = await invoke('list_directory', { path });
      setTree(entries.map(e => ({ ...e, isExpanded: false })));
    } catch (error) {
      console.error('Failed to load directory:', error);
    }
    setLoading(false);
  };

  const toggleNode = async (node: TreeNode) => {
    if (!node.isDirectory) {
      // Open file
      const { tabs, activeTabId } = useStore.getState();
      const existingTab = tabs.find(t => t.path === node.path);
      if (existingTab) {
        useStore.getState().setActiveTab(existingTab.id);
      } else {
        // Load and open file
        try {
          const content: string = await invoke('read_file', { path: node.path });
          const language: string = await invoke('detect_language', { path: node.path, content: null });
          
          let tabCounter = tabs.length + 1;
          const id = `tab-${tabCounter}`;
          const newTab = {
            id,
            path: node.path,
            name: node.name,
            content,
            originalContent: content,
            language,
            encoding: 'UTF-8',
            isModified: false,
            cursorPosition: { line: 1, column: 1 },
          };
          
          useStore.setState((state) => ({
            tabs: [...state.tabs, newTab],
            activeTabId: id,
          }));
        } catch (error) {
          console.error('Failed to open file:', error);
        }
      }
      return;
    }

    // Toggle directory
    if (node.isExpanded) {
      setTree(prev => updateNode(prev, node.path, { isExpanded: false, children: undefined }));
    } else {
      try {
        const entries: FileEntry[] = await invoke('list_directory', { path: node.path });
        const children = entries.map(e => ({ ...e, isExpanded: false }));
        setTree(prev => updateNode(prev, node.path, { isExpanded: true, children }));
      } catch (error) {
        console.error('Failed to load directory:', error);
      }
    }
  };

  const updateNode = (nodes: TreeNode[], path: string, updates: Partial<TreeNode>): TreeNode[] => {
    return nodes.map(node => {
      if (node.path === path) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children, path, updates) };
      }
      return node;
    });
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.path}>
        <div 
          className={`tree-item ${node.isHidden ? 'hidden-file' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => toggleNode(node)}
        >
          {node.isDirectory ? (
            node.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span style={{ width: 14 }} />
          )}
          {node.isDirectory ? (
            <FolderOpen size={14} className="icon folder" />
          ) : (
            <File size={14} className="icon file" />
          )}
          <span className="name">{node.name}</span>
        </div>
        {node.isExpanded && node.children && renderTree(node.children, depth + 1)}
      </div>
    ));
  };

  return (
    <motion.div 
      className="sidebar"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: sidebarWidth, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="sidebar-tabs">
        <button 
          className={`sidebar-tab ${activeView === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveView('explorer')}
          title={t('sidebar.explorer')}
        >
          <FolderOpen size={20} />
        </button>
        <button 
          className={`sidebar-tab ${activeView === 'search' ? 'active' : ''}`}
          onClick={() => setActiveView('search')}
          title={t('sidebar.search')}
        >
          <Search size={20} />
        </button>
        <button 
          className={`sidebar-tab ${activeView === 'extensions' ? 'active' : ''}`}
          onClick={() => setActiveView('extensions')}
          title={t('sidebar.extensions')}
        >
          <Puzzle size={20} />
        </button>
      </div>
      
      <div className="sidebar-content">
        {activeView === 'explorer' && (
          <div className="explorer">
            <div className="explorer-header">
              <span>{t('sidebar.explorer')}</span>
              <button className="icon-btn" onClick={() => openFolder && loadDirectory(openFolder)}>
                <RefreshCw size={14} />
              </button>
            </div>
            
            {!openFolder ? (
              <div className="empty-state">
                <button className="open-folder-btn" onClick={openFolderDialog}>
                  <FolderOpen size={24} />
                  <span>{t('file.openFolder')}</span>
                </button>
              </div>
            ) : loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="file-tree">
                {renderTree(tree)}
              </div>
            )}
          </div>
        )}
        
        {activeView === 'search' && (
          <div className="search-view">
            <div className="explorer-header">
              <span>{t('sidebar.search')}</span>
            </div>
            <div className="search-input-container">
              <input 
                type="text" 
                placeholder={t('search.placeholder')}
                className="search-input"
              />
            </div>
          </div>
        )}
        
        {activeView === 'extensions' && (
          <div className="extensions-view">
            <div className="explorer-header">
              <span>{t('sidebar.extensions')}</span>
            </div>
            <div className="empty-state">
              <Puzzle size={48} className="muted" />
              <p>{t('sidebar.extensions')}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
