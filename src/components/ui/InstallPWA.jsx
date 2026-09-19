import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    const standalone = window.navigator.standalone;
    setIsIOS(ios && !standalone);

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Don't show if already dismissed this session or already installed
  const alreadyDismissed = sessionStorage.getItem("pwa-dismissed");
  if (alreadyDismissed || dismissed) return null;

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setDismissed(true);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-dismissed", "1");
  };

  // Android/Chrome install prompt
  if (prompt) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-xl px-4 py-4 flex items-center gap-3"
          style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))` }}
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">Instalar micontrato</p>
            <p className="text-xs text-muted-foreground">Accedé más rápido desde tu pantalla de inicio</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs" onClick={handleInstall}>
              Instalar
            </Button>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // iOS guide
  if (isIOS) {
    return (
      <AnimatePresence>
        {showIOSGuide ? (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-xl px-4 py-4"
            style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))` }}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-sm text-foreground">Instalar en iPhone/iPad</p>
              <button onClick={handleDismiss} className="text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tocá el botón <strong>Compartir</strong> (□↑) en Safari, luego seleccioná <strong>"Agregar a inicio"</strong>.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-xl px-4 py-4 flex items-center gap-3"
            style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))` }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">Instalar micontrato</p>
              <p className="text-xs text-muted-foreground">Disponible para tu iPhone/iPad</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowIOSGuide(true)}>
                Cómo
              </Button>
              <button onClick={handleDismiss} className="text-muted-foreground p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return null;
}