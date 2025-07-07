import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';

// ✅ Import semua style (Tailwind, custom, dll)
import './index.css'; // Tailwind base
import './assets/c_strategist-panel-ho.css'; // Strategist panel khusus

// ✅ Pastikan elemen root tersedia sebelum render
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemen #root tidak ditemukan di index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
