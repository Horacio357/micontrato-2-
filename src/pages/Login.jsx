import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { checkUserAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.login(email, password);
      await checkUserAuth();
      toast.success('Inicio de sesión exitoso');
      
      const params = new URLSearchParams(location.search);
      const returnTo = params.get('returnTo');
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate('/mi-cuenta');
      }
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full border border-border bg-background px-3 py-2 text-sm rounded-md outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
            <input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full border border-border bg-background px-3 py-2 text-sm rounded-md outline-none focus:border-accent"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <div className="pt-3 border-t border-border text-center">
            <button
              type="button"
              onClick={() => {
                setEmail('demo@micontrato.com.ar');
                setPassword('123456');
              }}
              className="text-xs text-accent hover:underline font-medium"
            >
              🚀 Usar cuenta demo local (demo@micontrato.com.ar / 123456)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
