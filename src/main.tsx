import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import App from '@/App';

// Run browser language auto-detection on initial load
(function initLanguage() {
  try {
    const stored = localStorage.getItem('learn_rust_lang');
    if (stored === 'zh' || stored === 'en' || stored === 'ja') {
      document.documentElement.lang = stored;
      return;
    }
    const navLang = (navigator.language || '').toLowerCase();
    let detected = 'zh';
    if (navLang.startsWith('en')) detected = 'en';
    else if (navLang.startsWith('ja')) detected = 'ja';
    document.documentElement.lang = detected;
  } catch {
    document.documentElement.lang = 'zh';
  }
})();

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found in document');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
