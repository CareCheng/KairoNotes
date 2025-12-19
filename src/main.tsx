import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadLanguagesFromFolder } from './i18n';
import './styles/global.css';

// 在渲染应用之前加载语言文件
async function initApp() {
  try {
    await loadLanguagesFromFolder();
    console.log('Languages loaded successfully');
  } catch (error) {
    console.error('Failed to load languages:', error);
  }
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

initApp();
