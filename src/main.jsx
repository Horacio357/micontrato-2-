import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'

const App = lazy(() => import('@/App.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <Suspense fallback={
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  }>
    <App />
  </Suspense>
)

// Register Service Worker for offline support & PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {
        // SW registration failed silently — app still works online
      });
  });
}