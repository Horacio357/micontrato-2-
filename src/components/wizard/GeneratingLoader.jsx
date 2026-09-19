import { motion } from "framer-motion";
import { FileText, Scale, CheckCircle2 } from "lucide-react";

const STEPS = [
  { icon: FileText, text: "Analizando los datos del formulario..." },
  { icon: Scale, text: "Aplicando marco normativo argentino..." },
  { icon: CheckCircle2, text: "Estructurando cláusulas legales..." },
];

export default function GeneratingLoader({ currentPhase = 0 }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-6 h-6 text-accent" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-foreground font-semibold">Generando tu contrato</p>
        <p className="text-xs text-muted-foreground">Basado en legislación argentina vigente</p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i <= currentPhase ? 1 : 0.3, x: 0 }}
            transition={{ delay: i * 0.8 }}
            className="flex items-center gap-2 text-xs"
          >
            <step.icon className={`w-3.5 h-3.5 shrink-0 ${i <= currentPhase ? "text-accent" : "text-muted-foreground"}`} />
            <span className={i <= currentPhase ? "text-foreground" : "text-muted-foreground"}>
              {step.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}