// Tools Panel - 工具面板（JSON格式化、Base64编解码、颜色选择器等）
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { X, FileJson, Binary, Palette, Hash, Copy, Check } from 'lucide-react';
import '../styles/ToolsPanel.css';

type ToolType = 'json' | 'base64' | 'color' | 'hash';

interface ToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToolsPanel({ isOpen, onClose }: ToolsPanelProps) {
  const { t } = useTranslation();
  const { tabs, activeTabId, updateTabContent } = useStore();
  const [activeTool, setActiveTool] = useState<ToolType>('json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [color, setColor] = useState('#007acc');

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const tools = [
    { id: 'json' as ToolType, label: 'JSON', icon: FileJson },
    { id: 'base64' as ToolType, label: 'Base64', icon: Binary },
    { id: 'color' as ToolType, label: t('tools.color'), icon: Palette },
    { id: 'hash' as ToolType, label: 'Hash', icon: Hash },
  ];

  const formatJson = () => {
    try {
      const text = input || activeTab?.content || '';
      const formatted = JSON.stringify(JSON.parse(text), null, 2);
      setOutput(formatted);
      if (!input && activeTab) {
        updateTabContent(activeTab.id, formatted);
      }
    } catch (e) {
      setOutput('Invalid JSON');
    }
  };

  const minifyJson = () => {
    try {
      const text = input || activeTab?.content || '';
      const minified = JSON.stringify(JSON.parse(text));
      setOutput(minified);
      if (!input && activeTab) {
        updateTabContent(activeTab.id, minified);
      }
    } catch (e) {
      setOutput('Invalid JSON');
    }
  };

  const encodeBase64 = () => {
    try {
      const text = input || activeTab?.content || '';
      setOutput(btoa(unescape(encodeURIComponent(text))));
    } catch (e) {
      setOutput('Encoding failed');
    }
  };

  const decodeBase64 = () => {
    try {
      const text = input || activeTab?.content || '';
      setOutput(decodeURIComponent(escape(atob(text))));
    } catch (e) {
      setOutput('Invalid Base64');
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertToEditor = () => {
    if (activeTab && output) {
      updateTabContent(activeTab.id, output);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="tools-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="tools-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tools-header">
            <h2>{t('tools.title')}</h2>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="tools-body">
            <div className="tools-sidebar">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  className={`tool-tab ${activeTool === tool.id ? 'active' : ''}`}
                  onClick={() => setActiveTool(tool.id)}
                >
                  <tool.icon size={18} />
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>

            <div className="tools-content">
              {activeTool === 'json' && (
                <div className="tool-section">
                  <h3>JSON {t('tools.formatter')}</h3>
                  <textarea
                    className="tool-input"
                    placeholder={t('tools.inputPlaceholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <div className="tool-actions">
                    <button className="tool-btn primary" onClick={formatJson}>
                      {t('tools.format')}
                    </button>
                    <button className="tool-btn" onClick={minifyJson}>
                      {t('tools.minify')}
                    </button>
                  </div>
                  {output && (
                    <>
                      <textarea className="tool-output" value={output} readOnly />
                      <div className="tool-actions">
                        <button className="tool-btn" onClick={copyToClipboard}>
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? t('tools.copied') : t('tools.copy')}
                        </button>
                        <button className="tool-btn" onClick={insertToEditor}>
                          {t('tools.insertToEditor')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTool === 'base64' && (
                <div className="tool-section">
                  <h3>Base64 {t('tools.encoder')}</h3>
                  <textarea
                    className="tool-input"
                    placeholder={t('tools.inputPlaceholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <div className="tool-actions">
                    <button className="tool-btn primary" onClick={encodeBase64}>
                      {t('tools.encode')}
                    </button>
                    <button className="tool-btn" onClick={decodeBase64}>
                      {t('tools.decode')}
                    </button>
                  </div>
                  {output && (
                    <>
                      <textarea className="tool-output" value={output} readOnly />
                      <div className="tool-actions">
                        <button className="tool-btn" onClick={copyToClipboard}>
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? t('tools.copied') : t('tools.copy')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTool === 'color' && (
                <div className="tool-section">
                  <h3>{t('tools.colorPicker')}</h3>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="color-input"
                    />
                    <div className="color-preview" style={{ backgroundColor: color }} />
                  </div>
                  <div className="color-values">
                    <div className="color-value">
                      <label>HEX</label>
                      <input type="text" value={color.toUpperCase()} readOnly />
                    </div>
                    {rgb && (
                      <div className="color-value">
                        <label>RGB</label>
                        <input type="text" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} readOnly />
                      </div>
                    )}
                    {hsl && (
                      <div className="color-value">
                        <label>HSL</label>
                        <input type="text" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} readOnly />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTool === 'hash' && (
                <div className="tool-section">
                  <h3>Hash {t('tools.generator')}</h3>
                  <textarea
                    className="tool-input"
                    placeholder={t('tools.inputPlaceholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <p className="tool-note">{t('tools.hashNote')}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
