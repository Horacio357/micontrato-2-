import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'
import App from '@/App.jsx'

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Critical rendering error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>No se pudo cargar la vista</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              {this.state.error?.message || "Ocurrió un error inesperado al inicializar la aplicación."}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ width: '100%', padding: '12px', background: '#15294b', color: '#fff', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Recargar página
              </button>
              <button
                onClick={() => {
                  try { localStorage.clear(); sessionStorage.clear(); } catch (_) {}
                  window.location.href = '/';
                }}
                style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: '#334155', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Limpiar datos y volver al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
)

// Register Service Worker for offline support & PWA only in production
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          reg.update();
        })
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