import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

// Types
export interface EditorTab {
  id: string;
  path: string | null;
  name: string;
  content: string;
  originalContent: string;
  language: string;
  encoding: string;
  isModified: boolean;
  cursorPosition: { line: number; column: number };
  selections?: { startLine: number; startCol: number; endLine: number; endCol: number }[];
  scrollPosition?: { top: number; left: number };
  viewState?: any;
}

export interface EditorSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: string;
  minimapEnabled: boolean;
  lineNumbers: string;
  renderWhitespace: string;
  cursorStyle: string;
  cursorBlinking: string;
  theme: string;
  autoTheme: boolean;
  language: string;
  autoSave: boolean;
  autoSaveDelay: number;
  encoding: string;
  eol: string;
  trimTrailingWhitespace: boolean;
  insertFinalNewline: boolean;
  searchCaseSensitive: boolean;
  searchWholeWord: boolean;
  searchRegex: boolean;
  restoreWindows: boolean;
  showStatusBar: boolean;
  showActivityBar: boolean;
  showSidebar: boolean;
  bracketPairColorization: boolean;
  autoClosingBrackets: boolean;
  autoClosingQuotes: boolean;
  formatOnSave: boolean;
  formatOnPaste: boolean;
}

export interface SearchResult {
  line: number;
  column: number;
  length: number;
  text: string;
  context: string;
  filePath?: string;
}

export interface GlobalSearchResult {
  filePath: string;
  fileName: string;
  matches: SearchResult[];
}

export interface TerminalInstance {
  id: string;
  name: string;
  cwd: string;
  isActive: boolean;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  modified: string[];
  untracked: string[];
}

export interface EditorSplit {
  id: string;
  direction: 'horizontal' | 'vertical';
  tabs: string[];
  activeTabId: string | null;
  size: number;
}

export interface Workspace {
  name: string;
  folders: string[];
  settings: Partial<EditorSettings>;
}

export interface Snippet {
  id: string;
  name: string;
  prefix: string;
  body: string;
  language: string;
  description?: string;
}

export interface KeyBinding {
  command: string;
  key: string;
  when?: string;
}

interface AppState {
  // Tabs & Splits
  tabs: EditorTab[];
  activeTabId: string | null;
  splits: EditorSplit[];
  activeSplitId: string | null;
  
  // UI State
  theme: 'light' | 'dark';
  showSearch: boolean;
  showGlobalSearch: boolean;
  showSettings: boolean;
  showCommandPalette: boolean;
  showTerminal: boolean;
  showMarkdownPreview: boolean;
  showDiffView: boolean;
  sidebarWidth: number;
  terminalHeight: number;
  panelPosition: 'bottom' | 'right';
  
  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  globalSearchResults: GlobalSearchResult[];
  replaceQuery: string;
  searchHistory: string[];
  
  // Settings
  settings: EditorSettings;
  customKeyBindings: KeyBinding[];
  snippets: Snippet[];
  
  // Folder & Workspace
  openFolder: string | null;
  workspace: Workspace | null;
  recentFolders: string[];
  recentFiles: string[];
  
  // Terminal
  terminals: TerminalInstance[];
  activeTerminalId: string | null;
  
  // Git
  gitStatus: GitStatus | null;
  gitEnabled: boolean;
  
  // Session
  sessionRestored: boolean;
  
  // Character Stats
  characterCount: { chars: number; words: number; lines: number } | null;

  // Actions - Tabs
  createTab: (content?: string, language?: string, name?: string) => void;
  closeTab: (id: string) => void;
  closeOtherTabs: (id: string) => void;
  closeAllTabs: () => void;
  closeSavedTabs: () => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  updateCursorPosition: (id: string, line: number, column: number) => void;
  updateTabViewState: (id: string, viewState: any) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  duplicateTab: (id: string) => void;
  
  // Actions - Files
  openFile: (path?: string) => Promise<void>;
  openFileInNewTab: (path: string) => Promise<void>;
  saveFile: (id?: string) => Promise<void>;
  saveFileAs: (id?: string) => Promise<void>;
  saveAllFiles: () => Promise<void>;
  reloadFile: (id: string) => Promise<void>;
  
  // Actions - UI
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSearch: () => void;
  toggleGlobalSearch: () => void;
  toggleSettings: () => void;
  toggleCommandPalette: () => void;
  toggleTerminal: () => void;
  toggleMarkdownPreview: () => void;
  toggleDiffView: () => void;
  setSidebarWidth: (width: number) => void;
  setTerminalHeight: (height: number) => void;
  
  // Actions - Search
  setSearchQuery: (query: string) => void;
  setReplaceQuery: (query: string) => void;
  performSearch: () => Promise<void>;
  performGlobalSearch: (query: string, folder: string) => Promise<void>;
  performReplace: (all: boolean) => Promise<void>;
  addToSearchHistory: (query: string) => void;

  // Actions - Settings
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<EditorSettings>) => Promise<void>;
  addSnippet: (snippet: Snippet) => void;
  removeSnippet: (id: string) => void;
  updateKeyBinding: (command: string, key: string) => void;
  
  // Actions - Folder & Workspace
  openFolderDialog: () => Promise<void>;
  closeFolder: () => void;
  loadWorkspace: (path: string) => Promise<void>;
  saveWorkspace: () => Promise<void>;
  addRecentFile: (path: string) => void;
  addRecentFolder: (path: string) => void;
  clearRecentFiles: () => void;
  
  // Actions - Terminal
  createTerminal: (cwd?: string) => void;
  closeTerminal: (id: string) => void;
  setActiveTerminal: (id: string) => void;
  
  // Actions - Git
  refreshGitStatus: () => Promise<void>;
  
  // Actions - Splits
  splitEditor: (direction: 'horizontal' | 'vertical') => void;
  closeSplit: (id: string) => void;
  
  // Actions - Session
  saveSession: () => Promise<void>;
  restoreSession: () => Promise<void>;
  
  // Actions - Utilities
  formatDocument: () => Promise<void>;
  updateCharacterCount: () => void;
}

const defaultSettings: EditorSettings = {
  fontFamily: "Consolas, 'Courier New', monospace",
  fontSize: 14,
  lineHeight: 1.5,
  tabSize: 4,
  insertSpaces: true,
  wordWrap: 'off',
  minimapEnabled: true,
  lineNumbers: 'on',
  renderWhitespace: 'selection',
  cursorStyle: 'line',
  cursorBlinking: 'blink',
  theme: 'vs-dark',
  autoTheme: false,
  language: 'zh-CN',
  autoSave: false,
  autoSaveDelay: 1000,
  encoding: 'UTF-8',
  eol: 'auto',
  trimTrailingWhitespace: false,
  insertFinalNewline: false,
  searchCaseSensitive: false,
  searchWholeWord: false,
  searchRegex: false,
  restoreWindows: true,
  showStatusBar: true,
  showActivityBar: true,
  showSidebar: true,
  bracketPairColorization: true,
  autoClosingBrackets: true,
  autoClosingQuotes: true,
  formatOnSave: false,
  formatOnPaste: false,
};

let tabCounter = 0;
let terminalCounter = 0;
let splitCounter = 0;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      tabs: [],
      activeTabId: null,
      splits: [],
      activeSplitId: null,
      theme: 'dark',
      showSearch: false,
      showGlobalSearch: false,
      showSettings: false,
      showCommandPalette: false,
      showTerminal: false,
      showMarkdownPreview: false,
      showDiffView: false,
      sidebarWidth: 250,
      terminalHeight: 200,
      panelPosition: 'bottom',
      searchQuery: '',
      searchResults: [],
      globalSearchResults: [],
      replaceQuery: '',
      searchHistory: [],
      settings: defaultSettings,
      customKeyBindings: [],
      snippets: [],
      openFolder: null,
      workspace: null,
      recentFolders: [],
      recentFiles: [],
      terminals: [],
      activeTerminalId: null,
      gitStatus: null,
      gitEnabled: true,
      sessionRestored: false,
      characterCount: null,

      // Tab Actions
      createTab: (content = '', language = 'plaintext', name?: string) => {
        const id = `tab-${++tabCounter}`;
        const newTab: EditorTab = {
          id,
          path: null,
          name: name || `Untitled-${tabCounter}`,
          content,
          originalContent: content,
          language,
          encoding: 'UTF-8',
          isModified: false,
          cursorPosition: { line: 1, column: 1 },
        };
        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: id,
        }));
      },

      closeTab: (id: string) => {
        set((state) => {
          const tabs = state.tabs.filter((t) => t.id !== id);
          let activeTabId = state.activeTabId;
          if (activeTabId === id) {
            const idx = state.tabs.findIndex((t) => t.id === id);
            activeTabId = tabs[Math.min(idx, tabs.length - 1)]?.id || null;
          }
          return { tabs, activeTabId };
        });
      },

      closeOtherTabs: (id: string) => {
        set((state) => ({
          tabs: state.tabs.filter((t) => t.id === id),
          activeTabId: id,
        }));
      },

      closeAllTabs: () => set({ tabs: [], activeTabId: null }),

      closeSavedTabs: () => {
        set((state) => {
          const tabs = state.tabs.filter((t) => t.isModified);
          const activeTabId = tabs.find((t) => t.id === state.activeTabId)?.id || tabs[0]?.id || null;
          return { tabs, activeTabId };
        });
      },

      setActiveTab: (id: string) => set({ activeTabId: id }),

      updateTabContent: (id: string, content: string) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === id ? { ...t, content, isModified: content !== t.originalContent } : t
          ),
        }));
        get().updateCharacterCount();
      },

      updateCursorPosition: (id: string, line: number, column: number) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === id ? { ...t, cursorPosition: { line, column } } : t
          ),
        }));
      },

      updateTabViewState: (id: string, viewState: any) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, viewState } : t)),
        }));
      },

      moveTab: (fromIndex: number, toIndex: number) => {
        set((state) => {
          const tabs = [...state.tabs];
          const [removed] = tabs.splice(fromIndex, 1);
          tabs.splice(toIndex, 0, removed);
          return { tabs };
        });
      },

      duplicateTab: (id: string) => {
        const tab = get().tabs.find((t) => t.id === id);
        if (tab) {
          get().createTab(tab.content, tab.language, `${tab.name} (copy)`);
        }
      },

      // File Actions
      openFile: async (filePath?: string) => {
        try {
          let path = filePath;
          if (!path) {
            const selected = await open({
              multiple: false,
              filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'Text Files', extensions: ['txt', 'md', 'json', 'xml', 'yaml', 'yml'] },
                { name: 'Source Code', extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'h', 'hpp'] },
              ],
            });
            if (!selected) return;
            path = selected as string;
          }
          
          // Check if already open
          const existingTab = get().tabs.find((t) => t.path === path);
          if (existingTab) {
            set({ activeTabId: existingTab.id });
            return;
          }
          
          const content = await readTextFile(path);
          const name = path.split(/[/\\]/).pop() || 'Untitled';
          const language: string = await invoke('detect_language', { path, content: null });
          
          const id = `tab-${++tabCounter}`;
          const newTab: EditorTab = {
            id, path, name, content, originalContent: content, language,
            encoding: 'UTF-8', isModified: false, cursorPosition: { line: 1, column: 1 },
          };
          
          set((state) => ({ tabs: [...state.tabs, newTab], activeTabId: id }));
          get().addRecentFile(path);
        } catch (error) {
          console.error('Failed to open file:', error);
        }
      },

      openFileInNewTab: async (path: string) => {
        await get().openFile(path);
      },

      saveFile: async (id?: string) => {
        const state = get();
        const tabId = id || state.activeTabId;
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;
        
        if (!tab.path) {
          return get().saveFileAs(tabId ?? undefined);
        }
        
        try {
          let content = tab.content;
          if (state.settings.trimTrailingWhitespace) {
            content = content.split('\n').map(line => line.trimEnd()).join('\n');
          }
          if (state.settings.insertFinalNewline && !content.endsWith('\n')) {
            content += '\n';
          }
          
          await writeTextFile(tab.path, content);
          set((state) => ({
            tabs: state.tabs.map((t) =>
              t.id === tabId ? { ...t, content, originalContent: content, isModified: false } : t
            ),
          }));
        } catch (error) {
          console.error('Failed to save file:', error);
        }
      },

      saveFileAs: async (id?: string) => {
        const state = get();
        const tabId = id || state.activeTabId;
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;
        
        try {
          const path = await save({ defaultPath: tab.name, filters: [{ name: 'All Files', extensions: ['*'] }] });
          if (path) {
            await writeTextFile(path, tab.content);
            const name = path.split(/[/\\]/).pop() || 'Untitled';
            const language: string = await invoke('detect_language', { path, content: null });
            
            set((state) => ({
              tabs: state.tabs.map((t) =>
                t.id === tabId ? { ...t, path, name, language, originalContent: t.content, isModified: false } : t
              ),
            }));
            get().addRecentFile(path);
          }
        } catch (error) {
          console.error('Failed to save file:', error);
        }
      },

      saveAllFiles: async () => {
        const tabs = get().tabs.filter((t) => t.isModified);
        for (const tab of tabs) {
          await get().saveFile(tab.id);
        }
      },

      reloadFile: async (id: string) => {
        const tab = get().tabs.find((t) => t.id === id);
        if (!tab?.path) return;
        try {
          const content = await readTextFile(tab.path);
          set((state) => ({
            tabs: state.tabs.map((t) =>
              t.id === id ? { ...t, content, originalContent: content, isModified: false } : t
            ),
          }));
        } catch (error) {
          console.error('Failed to reload file:', error);
        }
      },

      // UI Actions
      setTheme: (theme) => set({ theme }),
      toggleSearch: () => set((state) => ({ showSearch: !state.showSearch, showGlobalSearch: false })),
      toggleGlobalSearch: () => set((state) => ({ showGlobalSearch: !state.showGlobalSearch, showSearch: false })),
      toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
      toggleCommandPalette: () => set((state) => ({ showCommandPalette: !state.showCommandPalette })),
      toggleTerminal: () => set((state) => ({ showTerminal: !state.showTerminal })),
      toggleMarkdownPreview: () => set((state) => ({ showMarkdownPreview: !state.showMarkdownPreview })),
      toggleDiffView: () => set((state) => ({ showDiffView: !state.showDiffView })),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setTerminalHeight: (height) => set({ terminalHeight: height }),

      // Search Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setReplaceQuery: (query) => set({ replaceQuery: query }),

      performSearch: async () => {
        const state = get();
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab || !state.searchQuery) {
          set({ searchResults: [] });
          return;
        }
        try {
          const results: SearchResult[] = await invoke('search_in_file', {
            content: tab.content,
            query: state.searchQuery,
            caseSensitive: state.settings.searchCaseSensitive,
            useRegex: state.settings.searchRegex,
          });
          set({ searchResults: results });
          get().addToSearchHistory(state.searchQuery);
        } catch (error) {
          console.error('Search failed:', error);
          set({ searchResults: [] });
        }
      },

      performGlobalSearch: async (query: string, folder: string) => {
        // This would need backend implementation
        set({ globalSearchResults: [] });
        get().addToSearchHistory(query);
      },

      performReplace: async (all: boolean) => {
        const state = get();
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab || !state.searchQuery) return;
        try {
          const newContent: string = await invoke('search_and_replace', {
            content: tab.content, search: state.searchQuery, replace: state.replaceQuery,
            caseSensitive: state.settings.searchCaseSensitive, useRegex: state.settings.searchRegex, replaceAll: all,
          });
          get().updateTabContent(tab.id, newContent);
          get().performSearch();
        } catch (error) {
          console.error('Replace failed:', error);
        }
      },

      addToSearchHistory: (query: string) => {
        set((state) => ({
          searchHistory: [query, ...state.searchHistory.filter((q) => q !== query)].slice(0, 20),
        }));
      },

      // Settings Actions
      loadSettings: async () => {
        try {
          const settings: EditorSettings = await invoke('get_settings');
          const theme = settings.theme === 'vs-dark' ? 'dark' : 'light';
          set({ settings, theme });
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      },

      updateSettings: async (newSettings: Partial<EditorSettings>) => {
        const state = get();
        const settings = { ...state.settings, ...newSettings };
        try {
          await invoke('save_settings', { newSettings: settings });
          const theme = settings.theme === 'vs-dark' ? 'dark' : 'light';
          set({ settings, theme });
        } catch (error) {
          console.error('Failed to save settings:', error);
        }
      },

      addSnippet: (snippet: Snippet) => {
        set((state) => ({ snippets: [...state.snippets, snippet] }));
      },

      removeSnippet: (id: string) => {
        set((state) => ({ snippets: state.snippets.filter((s) => s.id !== id) }));
      },

      updateKeyBinding: (command: string, key: string) => {
        set((state) => ({
          customKeyBindings: [
            ...state.customKeyBindings.filter((k) => k.command !== command),
            { command, key },
          ],
        }));
      },

      // Folder & Workspace Actions
      openFolderDialog: async () => {
        try {
          const selected = await open({ directory: true, multiple: false });
          if (selected) {
            set({ openFolder: selected as string });
            get().addRecentFolder(selected as string);
            get().refreshGitStatus();
          }
        } catch (error) {
          console.error('Failed to open folder:', error);
        }
      },

      closeFolder: () => set({ openFolder: null, gitStatus: null }),

      loadWorkspace: async (path: string) => {
        // Load workspace from file
      },

      saveWorkspace: async () => {
        // Save workspace to file
      },

      addRecentFile: (path: string) => {
        set((state) => ({
          recentFiles: [path, ...state.recentFiles.filter((p) => p !== path)].slice(0, 20),
        }));
      },

      addRecentFolder: (path: string) => {
        set((state) => ({
          recentFolders: [path, ...state.recentFolders.filter((p) => p !== path)].slice(0, 10),
        }));
      },

      clearRecentFiles: () => set({ recentFiles: [] }),

      // Terminal Actions
      createTerminal: (cwd?: string) => {
        const id = `terminal-${++terminalCounter}`;
        const terminal: TerminalInstance = {
          id,
          name: `Terminal ${terminalCounter}`,
          cwd: cwd || get().openFolder || '~',
          isActive: true,
        };
        set((state) => ({
          terminals: [...state.terminals.map((t) => ({ ...t, isActive: false })), terminal],
          activeTerminalId: id,
          showTerminal: true,
        }));
      },

      closeTerminal: (id: string) => {
        set((state) => {
          const terminals = state.terminals.filter((t) => t.id !== id);
          const activeTerminalId = state.activeTerminalId === id
            ? terminals[terminals.length - 1]?.id || null
            : state.activeTerminalId;
          return { terminals, activeTerminalId, showTerminal: terminals.length > 0 };
        });
      },

      setActiveTerminal: (id: string) => {
        set((state) => ({
          terminals: state.terminals.map((t) => ({ ...t, isActive: t.id === id })),
          activeTerminalId: id,
        }));
      },

      // Git Actions
      refreshGitStatus: async () => {
        const folder = get().openFolder;
        if (!folder || !get().gitEnabled) {
          set({ gitStatus: null });
          return;
        }
        try {
          // This would need backend implementation
          // const status: GitStatus = await invoke('get_git_status', { path: folder });
          // set({ gitStatus: status });
        } catch (error) {
          set({ gitStatus: null });
        }
      },

      // Split Actions
      splitEditor: (direction: 'horizontal' | 'vertical') => {
        const activeTab = get().activeTabId;
        if (!activeTab) return;
        const id = `split-${++splitCounter}`;
        const split: EditorSplit = {
          id, direction, tabs: [activeTab], activeTabId: activeTab, size: 50,
        };
        set((state) => ({
          splits: [...state.splits, split],
          activeSplitId: id,
        }));
      },

      closeSplit: (id: string) => {
        set((state) => ({
          splits: state.splits.filter((s) => s.id !== id),
          activeSplitId: state.activeSplitId === id ? null : state.activeSplitId,
        }));
      },

      // Session Actions
      saveSession: async () => {
        const state = get();
        const session = {
          tabs: state.tabs.map((t) => ({
            path: t.path,
            cursorPosition: t.cursorPosition,
            viewState: t.viewState,
          })),
          activeTabId: state.activeTabId,
          openFolder: state.openFolder,
          sidebarWidth: state.sidebarWidth,
        };
        localStorage.setItem('kaironotes-session', JSON.stringify(session));
      },

      restoreSession: async () => {
        if (get().sessionRestored) return;
        try {
          const sessionStr = localStorage.getItem('kaironotes-session');
          if (!sessionStr) return;
          const session = JSON.parse(sessionStr);
          
          if (session.openFolder) {
            set({ openFolder: session.openFolder });
          }
          
          for (const tabData of session.tabs || []) {
            if (tabData.path) {
              await get().openFile(tabData.path);
            }
          }
          
          set({ sessionRestored: true, sidebarWidth: session.sidebarWidth || 250 });
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      },

      // Utility Actions
      formatDocument: async () => {
        const tab = get().tabs.find((t) => t.id === get().activeTabId);
        if (!tab) return;
        
        try {
          // Format based on language
          let formatted = tab.content;
          if (tab.language === 'json') {
            formatted = JSON.stringify(JSON.parse(tab.content), null, 2);
          }
          get().updateTabContent(tab.id, formatted);
        } catch (error) {
          console.error('Format failed:', error);
        }
      },

      updateCharacterCount: () => {
        const tab = get().tabs.find((t) => t.id === get().activeTabId);
        if (!tab) {
          set({ characterCount: null });
          return;
        }
        const content = tab.content;
        const chars = content.length;
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const lines = content.split('\n').length;
        set({ characterCount: { chars, words, lines } });
      },
    }),
    {
      name: 'kaironotes-storage',
      partialize: (state) => ({
        recentFiles: state.recentFiles,
        recentFolders: state.recentFolders,
        searchHistory: state.searchHistory,
        customKeyBindings: state.customKeyBindings,
        snippets: state.snippets,
      }),
    }
  )
);
