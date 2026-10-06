import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointerClick, FileEdit, CreditCard, Download } from "lucide-react";

const steps = [
  {
    icon: MousePointerClick,
    title: "Elegí tu contrato",
    desc: "Seleccioná el tipo de contrato y tu provincia",
    hint: "Plantillas legales 100% actualizadas"
  },
  {
    icon: FileEdit,
    title: "Completá los datos",
    desc: "Un formulario guiado paso a paso, sin jerga legal",
    hint: "Validación instantánea de cláusulas"
  },
  {
    icon: CreditCard,
    title: "Pagá y desbloqueá",
    desc: "Pago único o suscripción con MercadoPago",
    hint: "Acceso inmediato y seguro"
  },
  {
    icon: Download,
    title: "Descargá y firmá",
    desc: "PDF listo para imprimir + Word editable",
    hint: "Firma digital con validez jurídica"
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  // Spotlight secuencial automático: avanza suavemente cada 3.2 segundos
  useEffect(() => {
    if (isInteracting) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3200);

    return () => clearInterval(timer);
  }, [isInteracting]);

  return (
    <section id="como-funciona" className="py-16 sm:py-24 bg-muted/30 relative overflow-hidden">
      {/* Luz ambiental sutil (ajustada para móvil y desktop) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[700px] h-[300px] sm:h-[350px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-2.5 sm:mb-3">
            Cómo funciona
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground">
            4 pasos simples
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto px-2">
            Seguí el recorrido interactivo para conocer cómo generar tu contrato legal en minutos.
          </p>
        </div>

        {/* Grilla interactiva adaptada a móvil (1 columna) y escritorio (4 columnas) */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 relative max-w-md mx-auto md:max-w-none"
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          onTouchStart={() => setIsInteracting(true)}
        >
          {steps.map((step, i) => {
            const isActive = activeStep === i;
            const StepIcon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onClick={() => setActiveStep(i)}
                className={`relative text-center cursor-pointer select-none transition-all duration-300 group p-4 sm:p-5 rounded-2xl border ${
                  isActive
                    ? "bg-background shadow-md shadow-accent/5 border-accent/20"
                    : "bg-background/40 hover:bg-background/80 border-transparent hover:border-border/50"
                }`}
              >
                {/* Conector horizontal para Desktop */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[62%] w-[76%] h-px border-t-2 border-dashed border-border pointer-events-none z-0">
                    {activeStep > i && (
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-[-2px] left-0 h-[2px] bg-accent"
                      />
                    )}
                    {isActive && (
                      <motion.div
                        initial={{ left: "0%", width: "0%" }}
                        animate={{ left: ["0%", "100%"], width: ["20%", "40%", "0%"] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-2px] h-[2px] bg-accent shadow-[0_0_8px_hsl(var(--accent))]"
                      />
                    )}
                  </div>
                )}

                {/* Conector vertical para Móvil */}
                {i < steps.length - 1 && (
                  <div className="md:hidden absolute left-1/2 -translate-x-1/2 bottom-[-24px] w-px h-6 border-l-2 border-dashed border-border pointer-events-none z-0">
                    {activeStep > i && (
                      <div className="w-[2px] h-full bg-accent -ml-[1px]" />
                    )}
                  </div>
                )}

                {/* Contenedor del Icono con resalte Spotlight */}
                <div className="relative mx-auto mb-3.5 sm:mb-5 w-16 h-16 flex items-center justify-center">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.25 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-accent/20 rounded-2xl blur-lg pointer-events-none"
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    animate={
                      isActive
                        ? { y: -4, scale: 1.05 }
                        : { y: 0, scale: 1 }
                    }
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-accent/30 shadow-lg shadow-accent/20"
                        : "bg-primary/90 text-primary-foreground/90 group-hover:bg-primary"
                    }`}
                  >
                    <motion.div
                      animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <StepIcon className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${isActive ? "text-accent-foreground" : "text-primary-foreground"}`} />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Número del paso con micro-onda */}
                <div className="relative inline-flex items-center justify-center mb-2 sm:mb-3">
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0.9, opacity: 0.8 }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-accent pointer-events-none"
                    />
                  )}
                  <motion.div
                    animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`relative z-10 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[11px] sm:text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground shadow-sm shadow-accent/40"
                        : "bg-muted-foreground/20 text-muted-foreground group-hover:bg-accent/70 group-hover:text-accent-foreground"
                    }`}
                  >
                    {i + 1}
                  </motion.div>
                </div>

                {/* Título y descripción */}
                <h3
                  className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 transition-colors duration-200 ${
                    isActive ? "text-foreground font-bold" : "text-foreground/80 group-hover:text-foreground"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-xs sm:text-sm leading-relaxed transition-opacity duration-200 ${
                    isActive ? "text-muted-foreground font-medium opacity-100" : "text-muted-foreground/75 opacity-80 group-hover:opacity-100"
                  }`}
                >
                  {step.desc}
                </p>

                {/* Píldora de detalle contextual */}
                <div className="mt-2.5 sm:mt-3 min-h-[20px] sm:min-h-[22px]">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block text-[10px] sm:text-[11px] font-semibold text-accent bg-accent/10 px-2 sm:px-2.5 py-0.5 rounded-full"
                      >
                        ✓ {step.hint}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Píldoras interactivas inferiores con área táctil cómoda para móvil */}
        <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className="p-2 sm:p-1.5 focus:outline-none touch-manipulation"
              title={`Ir al paso ${idx + 1}`}
            >
              <div
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  activeStep === idx
                    ? "w-8 sm:w-10 bg-accent shadow-sm shadow-accent/30"
                    : "w-2.5 sm:w-3 bg-border group-hover:bg-muted-foreground/40"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}