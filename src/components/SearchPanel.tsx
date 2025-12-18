import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { X, ChevronDown, ChevronUp, Replace, ReplaceAll } from 'lucide-react';
import '../styles/SearchPanel.css';

export function SearchPanel() {
  const { t } = useTranslation();
  const {
    showSearch, toggleSearch,
    searchQuery, setSearchQuery,
    replaceQuery, setReplaceQuery,
    searchResults, performSearch, performReplace,
    settings, updateSettings
  } = useStore();
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showReplace, setShowReplace] = useState(false);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, settings.searchCaseSensitive, settings.searchRegex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      toggleSearch();
    } else if (e.key === 'Enter') {
      performSearch();
    }
  };

  return (
    <AnimatePresence>
      {showSearch && (
        <motion.div
          className="search-panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="search-header">
            <button 
              className="toggle-replace"
              onClick={() => setShowReplace(!showReplace)}
            >
              {showReplace ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            <div className="search-inputs">
              <div className="search-row">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder={t('search.findPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="search-options">
                  <button
                    className={`option-btn ${settings.searchCaseSensitive ? 'active' : ''}`}
                    onClick={() => updateSettings({ searchCaseSensitive: !settings.searchCaseSensitive })}
                    title={t('search.caseSensitive')}
                  >
                    Aa
                  </button>
                  <button
                    className={`option-btn ${settings.searchWholeWord ? 'active' : ''}`}
                    onClick={() => updateSettings({ searchWholeWord: !settings.searchWholeWord })}
                    title={t('search.wholeWord')}
                  >
                    ab
                  </button>
                  <button
                    className={`option-btn ${settings.searchRegex ? 'active' : ''}`}
                    onClick={() => updateSettings({ searchRegex: !settings.searchRegex })}
                    title={t('search.useRegex')}
                  >
                    .*
                  </button>
                </div>
              </div>
              
              {showReplace && (
                <div className="search-row">
                  <input
                    type="text"
                    className="search-input"
                    placeholder={t('search.replacePlaceholder')}
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                  />
                  <div className="replace-actions">
                    <button
                      className="replace-btn"
                      onClick={() => performReplace(false)}
                      title={t('search.replaceOne')}
                    >
                      <Replace size={14} />
                    </button>
                    <button
                      className="replace-btn"
                      onClick={() => performReplace(true)}
                      title={t('search.replaceAll')}
                    >
                      <ReplaceAll size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button className="close-btn" onClick={toggleSearch}>
              <X size={16} />
            </button>
          </div>
          
          <div className="search-results-info">
            {searchQuery && (
              <span>
                {searchResults.length > 0
                  ? t('search.results', { count: searchResults.length })
                  : t('search.noResults')}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
