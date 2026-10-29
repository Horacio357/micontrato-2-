import { FileText, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              mi<span className="text-accent">contratos</span>
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/60">
              <Link to="/crear" className="hover:text-primary-foreground transition-colors">Crear contrato</Link>
              <a href="/#como-funciona" className="hover:text-primary-foreground transition-colors">Cómo funciona</a>
              <a href="/#faq" className="hover:text-primary-foreground transition-colors">FAQ</a>
              <Link to="/terminos" className="hover:text-primary-foreground transition-colors">Términos y Condiciones</Link>
              <Link to="/privacidad" className="hover:text-primary-foreground transition-colors">Privacidad</Link>
              <a href="mailto:admin@micontratos.com" className="hover:text-primary-foreground transition-colors">admin@micontratos.com</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} micontratos.com. Todos los derechos reservados. Argentina.
        </div>
      </div>
    </footer>
  );
}