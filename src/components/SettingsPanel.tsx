// Settings Panel - 设置面板
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { useStore } from '../store';
import { X, Type, FileText, Palette, Keyboard } from 'lucide-react';
import '../styles/SettingsPanel.css';

interface FontInfo {
  name: string;
  family: string;
  path: string | null;
  isSystem: boolean;
  isMonospace: boolean;
}

interface EncodingInfo {
  name: string;
  label: string;
  category: string;
}

type SettingsTab = 'appearance' | 'editor' | 'files' | 'keyboard';

export function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const { showSettings, toggleSettings, settings, updateSettings } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  const [encodings, setEncodings] = useState<EncodingInfo[]>([]);
  const [uiScale, setUiScale] = useState(100);

  // 加载字体列表
  useEffect(() => {
    if (showSettings) {
      console.log('Loading fonts...');
      invoke<FontInfo[]>('get_monospace_fonts')
        .then((fontList) => {
          console.log('Loaded fonts:', fontList.length);
          setFonts(fontList);
        })
        .catch((err) => {
          console.error('Failed to load fonts:', err);
          // 设置默认字体列表作为后备
          setFonts([
            { name: 'Consolas', family: 'Consolas', path: null, isSystem: true, isMonospace: true },
            { name: 'Cascadia Code', family: 'Cascadia Code', path: null, isSystem: true, isMonospace: true },
            { name: 'Fira Code', family: 'Fira Code', path: null, isSystem: true, isMonospace: true },
            { name: 'JetBrains Mono', family: 'JetBrains Mono', path: null, isSystem: true, isMonospace: true },
            { name: 'Source Code Pro', family: 'Source Code Pro', path: null, isSystem: true, isMonospace: true },
            { name: 'Monaco', family: 'Monaco', path: null, isSystem: true, isMonospace: true },
            { name: 'Courier New', family: 'Courier New', path: null, isSystem: true, isMonospace: true },
          ]);
        });
      
      invoke<EncodingInfo[]>('get_supported_encodings')
        .then(setEncodings)
        .catch(console.error);
    }
  }, [showSettings]);

  // 应用 UI 缩放
  useEffect(() => {
    document.documentElement.style.fontSize = `${uiScale}%`;
  }, [uiScale]);

  const languages = [
    { value: 'zh-CN', label: t('language.zhCN') },
    { value: 'zh-TW', label: t('language.zhTW') },
    { value: 'en', label: t('language.en') },
    { value: 'ru', label: t('language.ru') },
  ];

  const themes = [
    { value: 'vs-dark', label: t('theme.dark') },
    { value: 'vs', label: t('theme.light') },
  ];

  const tabs = [
    { id: 'appearance' as SettingsTab, label: t('settings.appearance'), icon: Palette },
    { id: 'editor' as SettingsTab, label: t('settings.editor'), icon: Type },
    { id: 'files' as SettingsTab, label: t('settings.files'), icon: FileText },
    { id: 'keyboard' as SettingsTab, label: t('settings.keyboard'), icon: Keyboard },
  ];

  // 按类别分组编码
  const encodingsByCategory = encodings.reduce((acc, enc) => {
    if (!acc[enc.category]) {
      acc[enc.category] = [];
    }
    acc[enc.category].push(enc);
    return acc;
  }, {} as Record<string, EncodingInfo[]>);

  const handleLanguageChange = (lang: string) => {
    updateSettings({ language: lang });
    i18n.changeLanguage(lang);
  };

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          className="settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSettings}
        >
          <motion.div
            className="settings-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-header">
              <h2>{t('settings.title')}</h2>
              <button className="close-btn" onClick={toggleSettings}>
                <X size={20} />
              </button>
            </div>
            
            <div className="settings-body">
              <div className="settings-sidebar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="settings-content">
                {activeTab === 'appearance' && (
                  <div className="settings-section">
                    <h3>{t('settings.appearance')}</h3>
                    
                    <div className="setting-item">
                      <label>{t('settings.theme')}</label>
                      <select
                        value={settings.theme}
                        onChange={(e) => updateSettings({ theme: e.target.value })}
                      >
                        {themes.map(theme => (
                          <option key={theme.value} value={theme.value}>
                            {theme.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="setting-item">
                      <label>{t('settings.language')}</label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                      >
                        {languages.map(lang => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="setting-item">
                      <label>{t('settings.uiScale')}</label>
                      <div className="scale-control">
                        <input
                          type="range"
                          min="75"
                          max="150"
                          step="5"
                          value={uiScale}
                          onChange={(e) => setUiScale(parseInt(e.target.value))}
                        />
                        <span className="scale-value">{uiScale}%</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'editor' && (
                  <div className="settings-section">
                    <h3>{t('settings.editor')}</h3>
                    
                    <div className="setting-item">
                      <label>{t('settings.fontFamily')}</label>
                      <select
                        value={settings.fontFamily}
                        onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                        style={{ fontFamily: settings.fontFamily }}
                      >
                        {fonts.length > 0 ? (
                          fonts.map(font => (
                            <option 
                              key={font.name} 
                              value={`'${font.family}', monospace`}
                              style={{ fontFamily: font.family }}
                            >
                              {font.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Consolas, 'Courier New', monospace">Consolas</option>
                            <option value="'Cascadia Code', 'Fira Code', monospace">Cascadia Code</option>
                            <option value="'Fira Code', monospace">Fira Code</option>
                            <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                            <option value="'Source Code Pro', monospace">Source Code Pro</option>
                            <option value="Monaco, monospace">Monaco</option>
                            <option value="'Microsoft YaHei Mono', Consolas, monospace">微软雅黑 Mono</option>
                          </>
                        )}
                      </select>
                    </div>
                    
                    <div className="setting-item">
                      <label>{t('settings.fontSize')}</label>
                      <div className="number-input">
                        <input
                          type="number"
                          min="8"
                          max="32"
                          value={settings.fontSize}
                          onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                        />
                        <span className="unit">px</span>
                      </div>
                    </div>
                    
                    <div className="setting-item">
                      <label>{t('settings.lineHeight')}</label>
                      <div className="number-input">
                        <input
                          type="number"
                          min="1"
                          max="3"
                          step="0.1"
                          value={settings.lineHeight}
                          onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    <div className="setting-item">
                      <label>{t('settings.tabSize')}</label>
                      <select
                        value={settings.tabSize}
                        onChange={(e) => updateSettings({ tabSize: parseInt(e.target.value) })}
                      >
                        <option value="2">2</option>
                        <option value="4">4</option>
                        <option value="8">8</option>
                      </select>
                    </div>
                    
                    <div className="setting-item toggle">
                      <label>{t('settings.insertSpaces')}</label>
                      <div 
                        className={`toggle-switch ${settings.insertSpaces ? 'active' : ''}`}
                        onClick={() => updateSettings({ insertSpaces: !settings.insertSpaces })}
                      >
                        <div className="toggle-slider" />
                      </div>
                    </div>
                    
                    <div className="setting-item">
                      <label>{t('settings.wordWrap')}</label>
                      <select
                        value={settings.wordWrap}
                        onChange={(e) => updateSettings({ wordWrap: e.target.value })}
                      >
                        <option value="off">{t('settings.wordWrapOff')}</option>
                        <option value="on">{t('settings.wordWrapOn')}</option>
                        <option value="wordWrapColumn">{t('settings.wordWrapColumn')}</option>
                        <option value="bounded">{t('settings.wordWrapBounded')}</option>
                      </select>
                    </div>
                    
                    <div className="setting-item toggle">
                      <label>{t('settings.minimap')}</label>
                      <div 
                        className={`toggle-switch ${settings.minimapEnabled ? 'active' : ''}`}
                        onClick={() => updateSettings({ minimapEnabled: !settings.minimapEnabled })}
                      >
                        <div className="toggle-slider" />
                      </div>
                    </div>
                    
                    <h3 style={{ marginTop: '24px' }}>{t('settings.extremeMode')}</h3>
                    
                    <div className="setting-item toggle">
                      <label>{t('settings.enableExtremeMode')}</label>
                      <div 
                        className={`toggle-switch ${settings.extremeMode ? 'active' : ''}`}
                        onClick={() => updateSettings({ extremeMode: !settings.extremeMode })}
                      >
                        <div className="toggle-slider" />
                      </div>
                    </div>
                    <p className="setting-description">{t('settings.extremeModeDesc')}</p>
                    
                    <div className="setting-item">
                      <label>{t('settings.lineNumbers')}</label>
                      <select
                        value={settings.lineNumbers}
                        onChange={(e) => updateSettings({ lineNumbers: e.target.value })}
                      >
                        <option value="on">{t('settings.lineNumbersOn')}</option>
                        <option value="off">{t('settings.lineNumbersOff')}</option>
                        <option value="relative">{t('settings.lineNumbersRelative')}</option>
                      </select>
                    </div>
                    
                    <div className="setting-item">
                      <label>{t('settings.cursorStyle')}</label>
                      <select
                        value={settings.cursorStyle}
                        onChange={(e) => updateSettings({ cursorStyle: e.target.value })}
                      >
                        <option value="line">Line</option>
                        <option value="block">Block</option>
                        <option value="underline">Underline</option>
                        <option value="line-thin">Line Thin</option>
                        <option value="block-outline">Block Outline</option>
                        <option value="underline-thin">Underline Thin</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {activeTab === 'files' && (
                  <div className="settings-section">
                    <h3>{t('settings.files')}</h3>
                    
                    <div className="setting-item toggle">
                      <label>{t('settings.autoSave')}</label>
                      <div 
                        className={`toggle-switch ${settings.autoSave ? 'active' : ''}`}
                        onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                      >
                        <div className="toggle-slider" />
                      </div>
                    </div>
                    
                    {settings.autoSave && (
                      <div className="setting-item">
                        <label>{t('settings.autoSaveDelay')}</label>
                        <div className="number-input">
                          <input
                            type="number"
                            min="100"
                            max="10000"
                            step="100"
                            value={settings.autoSaveDelay}
                            onChange={(e) => updateSettings({ autoSaveDelay: parseInt(e.target.value) })}
                          />
                          <span className="unit">ms</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="setting-item">
                      <label>{t('settings.encoding')}</label>
                      <select
                        value={settings.encoding}
                        onChange={(e) => updateSettings({ encoding: e.target.value })}
                      >
                        {Object.entries(encodingsByCategory).map(([category, encs]) => (
                          <optgroup key={category} label={category}>
                            {encs.map(enc => (
                              <option key={enc.name} value={enc.name}>
                                {enc.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    
                    <div className="setting-item">
                      <label>{t('settings.eol')}</label>
                      <select
                        value={settings.eol}
                        onChange={(e) => updateSettings({ eol: e.target.value })}
                      >
                        <option value="auto">Auto</option>
                        <option value="lf">LF (Unix/macOS)</option>
                        <option value="crlf">CRLF (Windows)</option>
                      </select>
                    </div>
                    
                    <div className="setting-item toggle">
                      <label>{t('settings.trimTrailingWhitespace')}</label>
                      <div 
                        className={`toggle-switch ${settings.trimTrailingWhitespace ? 'active' : ''}`}
                        onClick={() => updateSettings({ trimTrailingWhitespace: !settings.trimTrailingWhitespace })}
                      >
                        <div className="toggle-slider" />
                      </div>
                    </div>
                    
                    <div className="setting-item toggle">
                      <label>{t('settings.insertFinalNewline')}</label>
                      <div 
                        className={`toggle-switch ${settings.insertFinalNewline ? 'active' : ''}`}
                        onClick={() => updateSettings({ insertFinalNewline: !settings.insertFinalNewline })}
                      >
                        <div className="toggle-slider" />
                      </div>
                    </div>
                    
                    <h3 style={{ marginTop: '24px' }}>{t('settings.systemIntegration')}</h3>
                    
                    <div className="setting-item toggle">
                      <label>{t('settings.registerAsDefaultEditor')}</label>
                      <div 
                        className={`toggle-switch ${settings.registerAsDefaultEditor ? 'active' : ''}`}
                        onClick={() => updateSettings({ registerAsDefaultEditor: !settings.registerAsDefaultEditor })}
                      >
                        <div className="toggle-slider" />
                      </div>
                    </div>
                    
                    <div className="setting-item toggle">
                      <label>{t('settings.registerAsPathEditor')}</label>
                      <div 
                        className={`toggle-switch ${settings.registerAsPathEditor ? 'active' : ''}`}
                        onClick={() => updateSettings({ registerAsPathEditor: !settings.registerAsPathEditor })}
                      >
                        <div className="toggle-slider" />
                      </div>
                    </div>
                    
                    <div className="setting-item toggle">
                      <label>{t('settings.addToContextMenu')}</label>
                      <div 
                        className={`toggle-switch ${settings.addToContextMenu ? 'active' : ''}`}
                        onClick={() => updateSettings({ addToContextMenu: !settings.addToContextMenu })}
                      >
                        <div className="toggle-slider" />
                      </div>
                    </div>
                    <p className="setting-description">{t('settings.contextMenuDesc')}</p>
                    
                    <h3 style={{ marginTop: '24px' }}>{t('settings.terminal')}</h3>
                    
                    <div className="setting-item">
                      <label>{t('settings.terminalType')}</label>
                      <select
                        value={settings.terminalType}
                        onChange={(e) => updateSettings({ terminalType: e.target.value })}
                      >
                        <option value="powershell">PowerShell</option>
                        <option value="cmd">CMD (命令提示符)</option>
                        <option value="pwsh">PowerShell Core (pwsh)</option>
                        <option value="wsl">WSL (Windows Subsystem for Linux)</option>
                        <option value="gitbash">Git Bash</option>
                      </select>
                    </div>
                    <p className="setting-description">{t('settings.terminalTypeDesc')}</p>
                  </div>
                )}
                
                {activeTab === 'keyboard' && (
                  <div className="settings-section">
                    <h3>{t('settings.keyboard')}</h3>
                    <div className="keyboard-shortcuts">
                      <div className="shortcut-item">
                        <span className="shortcut-action">{t('file.new')}</span>
                        <kbd>Ctrl+N</kbd>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-action">{t('file.open')}</span>
                        <kbd>Ctrl+O</kbd>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-action">{t('file.save')}</span>
                        <kbd>Ctrl+S</kbd>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-action">{t('file.saveAs')}</span>
                        <kbd>Ctrl+Shift+S</kbd>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-action">{t('edit.find')}</span>
                        <kbd>Ctrl+F</kbd>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-action">{t('edit.replace')}</span>
                        <kbd>Ctrl+H</kbd>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-action">{t('view.commandPalette')}</span>
                        <kbd>Ctrl+Shift+P</kbd>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-action">{t('go.goToLine')}</span>
                        <kbd>Ctrl+G</kbd>
                      </div>
                    </div>
                  </div>
                )}
                

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
