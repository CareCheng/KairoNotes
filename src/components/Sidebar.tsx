// Sidebar Component - 侧边栏
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { useStore } from '../store';
import { 
  FolderOpen, ChevronRight, ChevronDown,
  Search, Puzzle, RefreshCw, GitBranch, Plus, Minus
} from 'lucide-react';
import { FileIcon, getFileIconColor } from './FileIcon';
import '../styles/Sidebar.css';
import '../styles/FileIcon.css';

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
  isLoading?: boolean;
}

type SidebarView = 'explorer' | 'search' | 'git' | 'extensions';

export function Sidebar() {
  const { t } = useTranslation();
  const { openFolder, sidebarWidth, openFolderDialog, gitStatus, openFile } = useStore();
  const [activeView, setActiveView] = useState<SidebarView>('explorer');
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileEntry[]>([]);

  useEffect(() => {
    if (openFolder) {
      loadDirectory(openFolder);
    } else {
      setTree([]);
    }
  }, [openFolder]);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    try {
      const rawEntries = await invoke('list_directory', { path });
      console.log('Raw entries from backend:', rawEntries);
      const entries = rawEntries as FileEntry[];
      console.log('Parsed entries:', entries);
      setTree(entries.map(e => ({ ...e, isExpanded: false, isLoading: false })));
    } catch (error) {
      console.error('Failed to load directory:', error);
    }
    setLoading(false);
  };

  // 递归更新节点的函数
  const updateNodeInTree = useCallback((
    nodes: TreeNode[], 
    targetPath: string, 
    updates: Partial<TreeNode>
  ): TreeNode[] => {
    return nodes.map(node => {
      if (node.path === targetPath) {
        // 找到目标节点，应用更新
        return { ...node, ...updates };
      }
      // 即使当前节点没有 children，也要检查是否需要递归
      // 因为子节点可能在更深层
      if (node.children) {
        const updatedChildren = updateNodeInTree(node.children, targetPath, updates);
        // 只有当 children 真的改变了才返回新对象
        if (updatedChildren !== node.children) {
          return { ...node, children: updatedChildren };
        }
      }
      return node;
    });
  }, []);

  const toggleNode = async (node: TreeNode, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!node.isDirectory) {
      await openFile(node.path);
      return;
    }

    if (node.isExpanded) {
      // 折叠节点
      setTree(prev => updateNodeInTree(prev, node.path, { 
        isExpanded: false 
      }));
    } else {
      // 展开节点 - 先设置加载状态
      setTree(prev => updateNodeInTree(prev, node.path, { 
        isLoading: true 
      }));
      
      try {
        const entries: FileEntry[] = await invoke('list_directory', { path: node.path });
        const children: TreeNode[] = entries.map(e => ({ 
          ...e, 
          isExpanded: false, 
          isLoading: false 
        }));
        
        setTree(prev => updateNodeInTree(prev, node.path, { 
          isExpanded: true, 
          isLoading: false,
          children 
        }));
      } catch (error) {
        console.error('Failed to load directory:', error);
        setTree(prev => updateNodeInTree(prev, node.path, { 
          isLoading: false 
        }));
      }
    }
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    // 过滤隐藏文件（除非在根目录）
    const visibleNodes = nodes.filter(n => !n.isHidden);
    
    return visibleNodes.map(node => (
      <div key={node.path}>
        <div 
          className={`tree-item ${getFileIconColor(node.name, node.isDirectory)}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={(e) => toggleNode(node, e)}
        >
          <span className="tree-arrow">
            {node.isDirectory ? (
              node.isLoading ? (
                <RefreshCw size={14} className="spinning" />
              ) : node.isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )
            ) : (
              <span style={{ width: 14, display: 'inline-block' }} />
            )}
          </span>
          <FileIcon 
            name={node.name} 
            isDirectory={node.isDirectory} 
            isExpanded={node.isExpanded}
            size={16}
          />
          <span className="name" title={node.path}>{node.name}</span>
        </div>
        {node.isExpanded && node.children && node.children.length > 0 && (
          <div className="tree-children">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
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
          className={`sidebar-tab ${activeView === 'git' ? 'active' : ''}`}
          onClick={() => setActiveView('git')}
          title={t('sidebar.git')}
        >
          <GitBranch size={20} />
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
              <button 
                className="icon-btn" 
                onClick={() => openFolder && loadDirectory(openFolder)} 
                title={t('sidebar.refresh') || '刷新'}
              >
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
              <div className="loading">
                <RefreshCw size={16} className="spinning" />
                <span>{t('common.loading') || 'Loading...'}</span>
              </div>
            ) : (
              <div className="file-tree">
                <div className="tree-root" onClick={() => openFolder && loadDirectory(openFolder)}>
                  <ChevronDown size={14} />
                  <FolderOpen size={16} className="file-icon folder" />
                  <span className="root-name">{openFolder.split(/[/\\]/).pop()}</span>
                </div>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result, i) => (
                  <div key={i} className="search-result-item" onClick={() => openFile(result.path)}>
                    <FileIcon name={result.name} size={14} />
                    <span>{result.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeView === 'git' && (
          <div className="git-view">
            <div className="explorer-header">
              <span>{t('sidebar.git')}</span>
              <button className="icon-btn" title={t('sidebar.refresh') || '刷新'}>
                <RefreshCw size={14} />
              </button>
            </div>
            {gitStatus ? (
              <div className="git-content">
                <div className="git-branch">
                  <GitBranch size={14} />
                  <span>{gitStatus.branch}</span>
                </div>
                {gitStatus.staged.length > 0 && (
                  <div className="git-section">
                    <div className="git-section-header">
                      <span>{t('git.staged')} ({gitStatus.staged.length})</span>
                    </div>
                    {gitStatus.staged.map((file, i) => (
                      <div key={i} className="git-file staged">
                        <Plus size={12} />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                )}
                {gitStatus.modified.length > 0 && (
                  <div className="git-section">
                    <div className="git-section-header">
                      <span>{t('git.changes')} ({gitStatus.modified.length})</span>
                    </div>
                    {gitStatus.modified.map((file, i) => (
                      <div key={i} className="git-file modified">
                        <Minus size={12} />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <GitBranch size={48} className="muted" />
                <p>{t('sidebar.noFolderOpened')}</p>
              </div>
            )}
          </div>
        )}
        
        {activeView === 'extensions' && (
          <div className="extensions-view">
            <div className="explorer-header">
              <span>{t('sidebar.extensions')}</span>
            </div>
            <div className="empty-state">
              <Puzzle size={48} className="muted" />
              <p>{t('plugins.noPlugins')}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
