import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOnline(false);
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium shadow-md"
          style={{ paddingTop: `calc(0.625rem + env(safe-area-inset-top))` }}
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          Sin conexión — Estás viendo contenido guardado
        </motion.div>
      )}
      {isOnline && showRestored && (
        <motion.div
          key="online"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium shadow-md"
          style={{ paddingTop: `calc(0.625rem + env(safe-area-inset-top))` }}
        >
          <Wifi className="w-4 h-4 shrink-0" />
          Conexión restaurada
        </motion.div>
      )}
    </AnimatePresence>
  );
}