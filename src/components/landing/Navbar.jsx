import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/ui/BrandLogo";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cómo funciona
            </a>
            <a href="#contratos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contratos
            </a>
            <a href="#precios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Precios
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/mi-cuenta"><Button variant="ghost" size="sm">Mi cuenta</Button></Link>
            <Link to="/mis-contratos">
              <Button variant="ghost" size="sm">Mis contratos</Button>
            </Link>
            <Link to="/crear">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Crear contrato
              </Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#como-funciona" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Cómo funciona</a>
              <a href="#contratos" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Contratos</a>
              <a href="#precios" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Precios</a>
              <a href="#faq" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>FAQ</a>
              <div className="pt-3 border-t border-border space-y-2">
                <Link to="/mi-cuenta" onClick={() => setOpen(false)}><Button variant="ghost" size="sm" className="w-full">Mi cuenta</Button></Link>
                <Link to="/mis-contratos" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Mis contratos</Button>
                </Link>
                <Link to="/crear" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    Crear contrato
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}