import { useState, useEffect, useCallback } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Lightbulb, 
  FileText, 
  PenTool, 
  Search, 
  HelpCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const DEFAULT_PROFESSIONAL_STEPS = [
  {
    id: "panel",
    targetSelector: '[data-tour="tour-panel"]',
    title: "Bienvenido a tu Centro Legal",
    badge: "1. Visión General",
    icon: FileText,
    description: "Este es tu panel central donde gestionas todos tus contratos, borradores y documentos firmados en un solo lugar seguro."
  },
  {
    id: "crear",
    targetSelector: '[data-tour="tour-nuevo-contrato"]',
    title: "Generación de Nuevos Contratos",
    badge: "2. Creación Rápida",
    icon: PenTool,
    description: "Crea contratos en minutos con plantillas profesionales validadas para cada provincia. El asistente te guiará paso a paso."
  },
  {
    id: "buscar",
    targetSelector: '[data-tour="tour-busqueda"]',
    title: "Búsqueda y Filtros Inmediatos",
    badge: "3. Organización",
    icon: Search,
    description: "Encuentra cualquier contrato al instante buscando por nombre de cliente, provincia o tipo de acuerdo legal."
  },
  {
    id: "lista",
    targetSelector: '[data-tour="tour-lista"]',
    title: "Gestión, Descarga y Firma Digital",
    badge: "4. Acciones Clave",
    icon: CheckCircle2,
    description: "Sigue el estado de las firmas en tiempo real, comparte enlaces de firma digital con tus clientes y descarga tus documentos en PDF o DOCX."
  },
  {
    id: "guia",
    targetSelector: '[data-tour="tour-boton-guia"]',
    title: "Siempre a tu Disposición",
    badge: "5. Ayuda Continua",
    icon: HelpCircle,
    description: "Si necesitas recordar alguna función o entrenar a un miembro de tu equipo, puedes reiniciar este tour en cualquier momento desde aquí."
  }
];

export default function ProfessionalSpotlight({
  steps = DEFAULT_PROFESSIONAL_STEPS,
  storageKey = "micontrato_pro_tour_completed",
  isOpen: externalIsOpen,
  onClose
}) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  // Control de apertura automática (onboarding primera vez) o manual
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setActive(externalIsOpen);
      if (externalIsOpen) setStepIndex(0);
      return;
    }

    const hasSeenTour = localStorage.getItem(storageKey);
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setActive(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [externalIsOpen, storageKey]);

  // Cálculo de posición del elemento resaltado
  const updatePosition = useCallback(() => {
    if (!active) return;
    const current = steps[stepIndex];
    if (!current) return;

    const element = document.querySelector(current.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    } else {
      // Si el elemento no está en el DOM en este momento, centramos el diálogo
      setTargetRect(null);
    }
  }, [active, stepIndex, steps]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  const handleFinish = (completed = true) => {
    localStorage.setItem(storageKey, completed ? "completed" : "dismissed");
    setActive(false);
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      handleFinish(true);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  if (!active || !steps[stepIndex]) return null;

  const current = steps[stepIndex];
  const StepIcon = current.icon || Lightbulb;
  const isLast = stepIndex === steps.length - 1;

  // Cálculo de posición segura de la tarjeta flotante
  const getCardStyle = () => {
    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        position: "fixed"
      };
    }

    const margin = 16;
    const cardWidth = 360;
    const cardHeight = 240;

    // Calcular posición horizontal segura
    let left = targetRect.left + (targetRect.width / 2) - (cardWidth / 2);
    if (left < 16) left = 16;
    if (left + cardWidth > window.innerWidth - 16) {
      left = window.innerWidth - cardWidth - 16;
    }

    // Calcular posición vertical segura (abajo si cabe, sino arriba)
    let top = targetRect.bottom + margin;
    if (top + cardHeight > window.innerHeight - 20) {
      top = Math.max(16, targetRect.top - cardHeight - margin);
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      position: "fixed"
    };
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto">
      {/* Fondo oscuro con recorte de foco */}
      {targetRect ? (
        <div
          className="fixed rounded-lg transition-all duration-300 ease-out pointer-events-none ring-2 ring-primary ring-offset-2 ring-offset-background"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.72)",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" />
      )}

      {/* Tarjeta interactiva del Spotlight */}
      <div
        style={getCardStyle()}
        className="w-[90vw] max-w-[360px] bg-card text-card-foreground rounded-xl shadow-2xl border border-border p-5 transition-all duration-200 z-[10000] animate-in fade-in zoom-in-95"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <StepIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              {current.badge}
            </span>
          </div>

          <button
            onClick={() => handleFinish(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            title="Saltar guía"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Título y descripción */}
        <h3 className="font-semibold text-base text-foreground mb-1.5 leading-snug">
          {current.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
          {current.description}
        </p>

        {/* Footer con progreso y botones */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {/* Indicadores de pasos */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === stepIndex
                    ? "w-5 bg-accent"
                    : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Atrás
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="h-8 px-3.5 text-xs bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-sm gap-1"
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ¡Entendido!
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
