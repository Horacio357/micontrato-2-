import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import {
  Lock,
  CheckCircle2,
  FileDown,
  Sparkles,
  Zap,
  LogIn,
  UserPlus,
  CreditCard,
  UserCheck,
  Loader2,
} from 'lucide-react';

export default function ContractAccessModal({
  isOpen,
  onClose,
  contract,
  pendingAction = null, // 'word' | 'pdf'
  onActionComplete,
}) {
  const { user, isAuthenticated, checkUserAuth } = useAuth();
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState(false);

  const contractId = contract?.id;
  const isContractPaid = contract?.status === 'paid' || contract?.status === 'downloaded' || contract?.status === 'signed';
  const hasActiveSubscription = user?.subscription_status === 'active';
  const isDevOrQA = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // 1. Fast QA 1-click login handler
  const handleQALogin = async (email, password) => {
    setLoadingAction(true);
    try {
      await base44.auth.login(email, password, contractId);
      await checkUserAuth();
      toast.success(`Sesión iniciada como ${email}`);
      if (email === 'demo@micontrato.com.ar') {
        toast.info('Usuario con membresía activa detectado.');
        onClose();
        onActionComplete?.();
      }
    } catch (err) {
      toast.error(err.message || 'Error en inicio de sesión');
    } finally {
      setLoadingAction(false);
    }
  };

  // 2. QA Simulate Single Contract Payment
  const handleQAPaySingle = async () => {
    setLoadingAction(true);
    try {
      const res = await base44.functions.invoke('simulatePayment', {
        contractId,
        type: 'single',
      });
      if (res.data?.success) {
        // Also update local storage if local contract
        if (contractId?.startsWith('local_')) {
          const item = localStorage.getItem(`contract_${contractId}`);
          if (item) {
            const parsed = JSON.parse(item);
            parsed.status = 'paid';
            localStorage.setItem(`contract_${contractId}`, JSON.stringify(parsed));
          }
        }
        toast.success('⚡ Pago de documento simulado con éxito (QA)');
        onClose();
        onActionComplete?.();
      }
    } catch (err) {
      toast.error(err.message || 'Error al procesar pago');
    } finally {
      setLoadingAction(false);
    }
  };

  // 3. QA Simulate Pro Subscription Activation
  const handleQAActivateSubscription = async () => {
    setLoadingAction(true);
    try {
      const res = await base44.functions.invoke('simulatePayment', {
        contractId,
        type: 'subscription',
        plan: 'pro_monthly',
      });
      if (res.data?.success) {
        await checkUserAuth();
        toast.success('⚡ Membresía Pro activada para tu cuenta (QA)');
        onClose();
        onActionComplete?.();
      }
    } catch (err) {
      toast.error(err.message || 'Error al activar membresía');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8">
        {!isAuthenticated ? (
          /* ===================================================
             VIEW 1: User is NOT authenticated
             =================================================== */
          <div>
            <DialogHeader className="text-center sm:text-center pb-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-accent" />
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Iniciá sesión para descargar tu contrato
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Tu contrato ya está redactado con rigor legal argentino. Asociá tu cuenta para guardarlo, verificar si tenés membresía o habilitar su descarga.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  onClose();
                  navigate(`/login?returnTo=${encodeURIComponent(`/preview/${contractId}`)}&contractId=${contractId}`);
                }}
                className="w-full flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50 font-medium"
              >
                <LogIn className="w-4 h-4 text-primary" />
                Iniciar Sesión
              </Button>

              <Button
                size="lg"
                onClick={() => {
                  onClose();
                  navigate(`/login?mode=register&returnTo=${encodeURIComponent(`/preview/${contractId}`)}&contractId=${contractId}`);
                }}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                <UserPlus className="w-4 h-4" />
                Crear Cuenta Gratis
              </Button>
            </div>

            {/* QA Testing Section for Fast Evaluation */}
            {isDevOrQA && (
              <div className="mt-6 pt-5 border-t border-slate-200/80 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-lg">
                <div className="flex items-center gap-2 mb-2.5">
                  <Badge variant="outline" className="bg-amber-100/70 text-amber-800 border-amber-300 text-xs gap-1">
                    <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                    ACCESOS RÁPIDOS QA (Ambiente de Pruebas)
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Para acelerar la evaluación del flujo, ingresá con 1-click simulando distintos perfiles:
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loadingAction}
                    onClick={() => handleQALogin('demo@micontrato.com.ar', '123456')}
                    className="w-full justify-start text-xs bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Probar con Membresía Activa
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loadingAction}
                    onClick={() => handleQALogin('sinpago@micontrato.com.ar', '123456')}
                    className="w-full justify-start text-xs bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Probar sin Membresía (Flujo de Pago)
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ===================================================
             VIEW 2: User is authenticated but requires payment/membership
             =================================================== */
          <div>
            <DialogHeader className="text-center sm:text-center pb-4">
              <div className="flex justify-center mb-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-3 py-1">
                  Conectado como <strong className="ml-1 font-semibold">{user?.email}</strong>
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Desbloqueá la descarga de tu contrato
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                Elegí la opción que mejor se adapte a tu necesidad: adquirí este único documento o suscribite a descargas ilimitadas.
              </DialogDescription>
            </DialogHeader>

            {/* Pricing Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {/* Option 1: Single Document */}
              <div className="relative rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-accent/40 hover:shadow-sm transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pago Único</span>
                    <FileDown className="w-5 h-5 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Documento Único</h3>
                  <div className="mt-2 mb-3">
                    <span className="text-2xl font-extrabold text-foreground">$4.990</span>
                    <span className="text-xs text-muted-foreground ml-1">ARS</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 mb-4">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Descarga Word (.docx) editable
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Descarga e impresión PDF oficial
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Acceso permanente en tu cuenta
                    </li>
                  </ul>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleQAPaySingle}
                  disabled={loadingAction}
                  className="w-full font-semibold border-slate-300 hover:bg-slate-50"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1.5 text-slate-700" />
                  Pagar solo este documento
                </Button>
              </div>

              {/* Option 2: Pro Membership */}
              <div className="relative rounded-xl border-2 border-accent bg-accent/5 p-5 flex flex-col justify-between shadow-sm">
                <div className="absolute -top-3 right-3">
                  <Badge className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                    Más Conveniente
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">Plan Profesional</span>
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Suscripción Ilimitada</h3>
                  <div className="mt-2 mb-3">
                    <span className="text-2xl font-extrabold text-foreground">$9.990</span>
                    <span className="text-xs text-muted-foreground ml-1">ARS / mes</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 mb-4">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                      <strong>Descargas ilimitadas</strong> de todos los modelos
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                      Firma digital y certificados de trazabilidad
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                      Soporte y actualizaciones legales automáticas
                    </li>
                  </ul>
                </div>
                <Button
                  size="sm"
                  onClick={handleQAActivateSubscription}
                  disabled={loadingAction}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Suscribirme al Plan Pro
                </Button>
              </div>
            </div>

            {/* QA Testing Simulation Box */}
            {isDevOrQA && (
              <div className="mt-5 pt-4 border-t border-slate-200/80 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-amber-100/70 text-amber-800 border-amber-300 text-xs gap-1">
                    <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                    SIMULADOR DE PAGOS QA
                  </Badge>
                  <span className="text-[11px] text-slate-500">Probá sin tarjeta real en 1-click</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loadingAction}
                    onClick={handleQAPaySingle}
                    className="w-full justify-center text-xs bg-white hover:bg-slate-100 font-medium text-slate-800 border-slate-300"
                  >
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Zap className="w-3.5 h-3.5 text-amber-600 mr-1.5" />}
                    ⚡ Simular Pago Documento ($4.990)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loadingAction}
                    onClick={handleQAActivateSubscription}
                    className="w-full justify-center text-xs bg-white hover:bg-slate-100 font-medium text-slate-800 border-slate-300"
                  >
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Sparkles className="w-3.5 h-3.5 text-accent mr-1.5" />}
                    ⚡ Simular Membresía Activa (Pro)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
