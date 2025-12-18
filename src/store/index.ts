import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

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
}

export interface SearchResult {
  line: number;
  column: number;
  length: number;
  text: string;
  context: string;
}

interface AppState {
  // Tabs
  tabs: EditorTab[];
  activeTabId: string | null;
  
  // UI State
  theme: 'light' | 'dark';
  showSearch: boolean;
  showSettings: boolean;
  showCommandPalette: boolean;
  sidebarWidth: number;
  
  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  replaceQuery: string;
  
  // Settings
  settings: EditorSettings;
  
  // Folder
  openFolder: string | null;
  
  // Actions
  createTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  updateCursorPosition: (id: string, line: number, column: number) => void;
  
  openFile: () => Promise<void>;
  saveFile: (id?: string) => Promise<void>;
  saveFileAs: (id?: string) => Promise<void>;
  
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSearch: () => void;
  toggleSettings: () => void;
  toggleCommandPalette: () => void;
  setSidebarWidth: (width: number) => void;
  
  setSearchQuery: (query: string) => void;
  setReplaceQuery: (query: string) => void;
  performSearch: () => Promise<void>;
  performReplace: (all: boolean) => Promise<void>;
  
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<EditorSettings>) => Promise<void>;
  
  openFolderDialog: () => Promise<void>;
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
};

let tabCounter = 0;

export const useStore = create<AppState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  theme: 'dark',
  showSearch: false,
  showSettings: false,
  showCommandPalette: false,
  sidebarWidth: 250,
  searchQuery: '',
  searchResults: [],
  replaceQuery: '',
  settings: defaultSettings,
  openFolder: null,

  createTab: () => {
    const id = `tab-${++tabCounter}`;
    const newTab: EditorTab = {
      id,
      path: null,
      name: `Untitled-${tabCounter}`,
      content: '',
      originalContent: '',
      language: 'plaintext',
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

  setActiveTab: (id: string) => set({ activeTabId: id }),

  updateTabContent: (id: string, content: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id
          ? { ...t, content, isModified: content !== t.originalContent }
          : t
      ),
    }));
  },

  updateCursorPosition: (id: string, line: number, column: number) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, cursorPosition: { line, column } } : t
      ),
    }));
  },

  openFile: async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'Text Files', extensions: ['txt', 'md', 'json', 'xml', 'yaml', 'yml'] },
          { name: 'Source Code', extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'h', 'hpp'] },
        ],
      });
      
      if (selected) {
        const path = selected as string;
        const content = await readTextFile(path);
        const name = path.split(/[/\\]/).pop() || 'Untitled';
        const language: string = await invoke('detect_language', { path, content: null });
        
        const id = `tab-${++tabCounter}`;
        const newTab: EditorTab = {
          id,
          path,
          name,
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
        
        await invoke('add_recent_file', { path });
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
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
      await writeTextFile(tab.path, tab.content);
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === tabId
            ? { ...t, originalContent: t.content, isModified: false }
            : t
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
      const path = await save({
        defaultPath: tab.name,
        filters: [
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      
      if (path) {
        await writeTextFile(path, tab.content);
        const name = path.split(/[/\\]/).pop() || 'Untitled';
        const language: string = await invoke('detect_language', { path, content: null });
        
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === tabId
              ? { ...t, path, name, language, originalContent: t.content, isModified: false }
              : t
          ),
        }));
        
        await invoke('add_recent_file', { path });
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  },

  setTheme: (theme) => set({ theme }),
  toggleSearch: () => set((state) => ({ showSearch: !state.showSearch })),
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  toggleCommandPalette: () => set((state) => ({ showCommandPalette: !state.showCommandPalette })),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),

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
    } catch (error) {
      console.error('Search failed:', error);
      set({ searchResults: [] });
    }
  },

  performReplace: async (all: boolean) => {
    const state = get();
    const tab = state.tabs.find((t) => t.id === state.activeTabId);
    if (!tab || !state.searchQuery) return;
    
    try {
      const newContent: string = await invoke('search_and_replace', {
        content: tab.content,
        search: state.searchQuery,
        replace: state.replaceQuery,
        caseSensitive: state.settings.searchCaseSensitive,
        useRegex: state.settings.searchRegex,
        replaceAll: all,
      });
      
      get().updateTabContent(tab.id, newContent);
      get().performSearch();
    } catch (error) {
      console.error('Replace failed:', error);
    }
  },

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

  openFolderDialog: async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      
      if (selected) {
        set({ openFolder: selected as string | null });
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  },
}));
