import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function RequireAuth({ children }) {
  const { isAuthenticated, isLoadingAuth, authChecked } = useAuth();

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Iniciá sesión para continuar</h2>
            <p className="text-sm text-muted-foreground">
              Necesitás una cuenta para acceder a tus contratos, descargas y suscripción.
            </p>
          </div>
          <Button onClick={handleLogin} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <LogIn className="w-4 h-4" />
            Iniciar sesión
          </Button>
          <p className="text-xs text-muted-foreground">
            Si no tenés cuenta, se creará una automáticamente al registrarte.
          </p>
        </div>
      </div>
    );
  }

  return children;
}