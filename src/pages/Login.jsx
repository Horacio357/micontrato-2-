import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { ShieldCheck, UserCheck, ArrowRight, FileText } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const [isRegister, setIsRegister] = useState(params.get('mode') === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { checkUserAuth } = useAuth();
  const returnTo = params.get('returnTo');
  const contractIdParam = params.get('contractId') || (returnTo?.includes('/contrato/') ? returnTo.split('/contrato/')[1] : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        await base44.auth.register(email, password, name, contractIdParam);
        toast.success('Cuenta creada exitosamente');
      } else {
        await base44.auth.login(email, password, contractIdParam);
        toast.success('Inicio de sesión exitoso');
      }

      await checkUserAuth();

      if (returnTo) {
        navigate(returnTo);
      } else if (contractIdParam) {
        navigate(`/mi-cuenta/contrato/${contractIdParam}`);
      } else {
        navigate('/mis-contratos');
      }
    } catch (error) {
      toast.error(error.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setIsRegister(false);
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center">
      <Navbar />

      <div className="pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8">
          
          {/* Banner de aviso si viene desde un contrato */}
          {contractIdParam && (
            <div className="mb-6 p-3.5 bg-accent/10 border border-accent/20 rounded-xl flex items-center gap-3">
              <FileText className="w-5 h-5 text-accent shrink-0" />
              <p className="text-xs text-foreground font-medium">
                Tu contrato está listo. Identificate para vincularlo a tu cuenta y proceder a la descarga.
              </p>
            </div>
          )}

          {/* Selector de Pestañas: Login / Registro */}
          <div className="flex border-b border-border mb-6">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                !isRegister
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                isRegister
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-medium text-foreground">
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ej: Dr. Martín Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                  className="w-full border border-border bg-background px-3.5 py-2.5 text-sm rounded-lg outline-none focus:border-accent"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-foreground">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-border bg-background px-3.5 py-2.5 text-sm rounded-lg outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-foreground">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-border bg-background px-3.5 py-2.5 text-sm rounded-lg outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                'Procesando...'
              ) : isRegister ? (
                <>
                  Crear cuenta y continuar
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Opciones rápidas de QA para pruebas locales */}
          {(import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
            <div className="mt-6 pt-5 border-t border-border space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                Accesos Rápidos de Prueba (QA / Local)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('demo@micontrato.com.ar', '123456')}
                  className="p-2 rounded-lg bg-accent/5 hover:bg-accent/10 border border-accent/20 text-xs text-accent font-medium flex items-center justify-center gap-1.5 text-left transition-colors"
                  title="Usuario con membresía activa para descargas ilimitadas"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Con Membresía</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('sinpago@micontrato.com.ar', '123456')}
                  className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground font-medium flex items-center justify-center gap-1.5 text-left transition-colors"
                  title="Usuario nuevo sin membresía para probar pantalla de pago"
                >
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Sin Pago previo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
