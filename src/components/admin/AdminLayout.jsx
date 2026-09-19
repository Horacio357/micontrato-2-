import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { FileText, BarChart2, DollarSign, CreditCard, Shield, ChevronRight, Home, Menu, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import BrandLogo from "@/components/ui/BrandLogo";

const ADMIN_PIN = "gordo12345";
const SESSION_KEY = "admin_unlocked";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: BarChart2, exact: true },
  { to: "/admin/contratos", label: "Contratos", icon: FileText },
  { to: "/admin/metricas", label: "Métricas", icon: BarChart2 },
  { to: "/admin/precios", label: "Precios", icon: DollarSign },
  { to: "/admin/pagos", label: "Pagos y Suscripciones", icon: CreditCard },
  { to: "/admin/plantillas", label: "Plantillas", icon: FileText },
  { to: "/admin/legal", label: "Legal", icon: Shield },
];

function NavContent({ pathname, onNavigate }) {
  return (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <Link to="/" className="flex items-center gap-2" onClick={onNavigate}>
          <BrandLogo size="sm" />
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Panel de administración</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm",
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-0.5">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors rounded-sm"
        >
          <Home className="w-4 h-4" />
          Ir al sitio
        </Link>
      </div>
    </>
  );
}

function AdminPinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onUnlock();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card border border-border p-8 w-full max-w-sm shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BrandLogo />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">Panel de administración</p>
        <p className="text-xs text-muted-foreground mb-6">Ingresá el código de acceso para continuar.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="Código de acceso"
              className={`w-full border px-4 py-3 text-sm bg-background text-foreground outline-none focus:border-accent transition-colors ${error ? "border-destructive" : "border-border"}`}
            />
            {error && <p className="text-xs text-destructive mt-1">Código incorrecto. Intentá de nuevo.</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-medium py-3 transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");

  if (!unlocked) {
    return <AdminPinGate onUnlock={() => setUnlocked(true)} />;
  }

  const currentItem = navItems.find(({ to, exact }) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/")
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 border-r border-border bg-card flex-col shrink-0">
        <NavContent pathname={pathname} onNavigate={() => {}} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed top-0 left-0 h-full w-60 bg-card flex flex-col z-50 md:hidden"
            >
              <NavContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-foreground/70 hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <BrandLogo size="sm" />
          {currentItem && (
            <span className="ml-auto text-xs text-muted-foreground">{currentItem.label}</span>
          )}
        </header>

        <main className="flex-1 overflow-auto font-sans text-foreground">
          <Outlet />
        </main>
      </div>
    </div>
  );
}