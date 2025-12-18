import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { X } from 'lucide-react';
import '../styles/SettingsPanel.css';

export function SettingsPanel() {
  const { t } = useTranslation();
  const { showSettings, toggleSettings, settings, updateSettings } = useStore();

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-header">
              <h2>{t('settings.title')}</h2>
              <button className="close-btn" onClick={toggleSettings}>
                <X size={20} />
              </button>
            </div>
            
            <div className="settings-content">
              <section className="settings-section">
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
                    onChange={(e) => updateSettings({ language: e.target.value })}
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </section>
              
              <section className="settings-section">
                <h3>{t('settings.editor')}</h3>
                
                <div className="setting-item">
                  <label>{t('settings.fontFamily')}</label>
                  <input
                    type="text"
                    value={settings.fontFamily}
                    onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                  />
                </div>
                
                <div className="setting-item">
                  <label>{t('settings.fontSize')}</label>
                  <input
                    type="number"
                    min="8"
                    max="32"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  />
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
                
                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.insertSpaces}
                      onChange={(e) => updateSettings({ insertSpaces: e.target.checked })}
                    />
                    {t('settings.insertSpaces')}
                  </label>
                </div>
                
                <div className="setting-item">
                  <label>{t('settings.wordWrap')}</label>
                  <select
                    value={settings.wordWrap}
                    onChange={(e) => updateSettings({ wordWrap: e.target.value })}
                  >
                    <option value="off">Off</option>
                    <option value="on">On</option>
                    <option value="wordWrapColumn">Word Wrap Column</option>
                    <option value="bounded">Bounded</option>
                  </select>
                </div>
                
                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.minimapEnabled}
                      onChange={(e) => updateSettings({ minimapEnabled: e.target.checked })}
                    />
                    {t('settings.minimap')}
                  </label>
                </div>
                
                <div className="setting-item">
                  <label>{t('settings.lineNumbers')}</label>
                  <select
                    value={settings.lineNumbers}
                    onChange={(e) => updateSettings({ lineNumbers: e.target.value })}
                  >
                    <option value="on">On</option>
                    <option value="off">Off</option>
                    <option value="relative">Relative</option>
                  </select>
                </div>
              </section>
              
              <section className="settings-section">
                <h3>{t('settings.files')}</h3>
                
                <div className="setting-item checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                    />
                    {t('settings.autoSave')}
                  </label>
                </div>
                
                <div className="setting-item">
                  <label>{t('settings.encoding')}</label>
                  <select
                    value={settings.encoding}
                    onChange={(e) => updateSettings({ encoding: e.target.value })}
                  >
                    <option value="UTF-8">UTF-8</option>
                    <option value="UTF-16">UTF-16</option>
                    <option value="GBK">GBK</option>
                    <option value="GB18030">GB18030</option>
                    <option value="Shift_JIS">Shift_JIS</option>
                  </select>
                </div>
                
                <div className="setting-item">
                  <label>{t('settings.eol')}</label>
                  <select
                    value={settings.eol}
                    onChange={(e) => updateSettings({ eol: e.target.value })}
                  >
                    <option value="auto">Auto</option>
                    <option value="lf">LF</option>
                    <option value="crlf">CRLF</option>
                  </select>
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
