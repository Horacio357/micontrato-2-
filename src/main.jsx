import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'
import App from '@/App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// Register Service Worker for offline support & PWA only in production
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {});
    });
  } else {
    // En desarrollo local desregistramos service workers para evitar bloqueos de caché
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}