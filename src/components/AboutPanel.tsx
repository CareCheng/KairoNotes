// About Panel - 关于面板
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { X } from 'lucide-react';
import '../styles/AboutPanel.css';

export function AboutPanel() {
  const { t } = useTranslation();
  const { showAbout, toggleAbout } = useStore();

  return (
    <AnimatePresence>
      {showAbout && (
        <motion.div
          className="about-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleAbout}
        >
          <motion.div
            className="about-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={toggleAbout}>
              <X size={20} />
            </button>
            
            <div className="about-content">
              <div className="about-logo">
                <img src="/kaironotes.svg" alt="KairoNotes" width="80" height="80" />
              </div>
              <h1>KairoNotes</h1>
              <p className="version">Version 1.0.0</p>
              <p className="description">
                {t('app.description')}
              </p>
              <div className="about-links">
                <a href="https://github.com/kaironotes/kaironotes" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <a href="https://kaironotes.com" target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              </div>
              <p className="copyright">
                © 2024 KairoNotes Team. All rights reserved.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
