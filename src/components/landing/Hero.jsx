import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

function AnimatedCounter({ target = 3547, duration = 2000 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * easeOut);
      el.textContent = current.toLocaleString("es-AR");
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [target, duration]);

  return <span ref={ref}>0</span>;
}

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
              <Shield className="w-3.5 h-3.5" />
              Contratos legales argentinos
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight"
          >
            Tu contrato legal,{" "}
            <span className="text-accent">listo en minutos</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Generá contratos legales adaptados a tu provincia. Completá un formulario guiado
            y descargá tu contrato en PDF y Word, listo para firmar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/crear">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-8 text-base">
                Crear mi contrato
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                ¿Cómo funciona?
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {/* Métrica 1: contador animado */}
            <div className="text-center">
              <FileCheck className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCounter target={3547} />
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Contratos generados</p>
            </div>

            {/* Métrica 2: listo en minutos */}
            <div className="text-center">
              <Clock className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">Listo</p>
              <p className="text-xs text-muted-foreground mt-0.5">En minutos</p>
            </div>

            {/* Métrica 3: 100% legal */}
            <div className="text-center">
              <Shield className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Legal</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}