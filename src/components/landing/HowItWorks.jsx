import { motion } from "framer-motion";
import { MousePointerClick, FileEdit, CreditCard, Download } from "lucide-react";

const steps = [
  { icon: MousePointerClick, title: "Elegí tu contrato", desc: "Seleccioná el tipo de contrato y tu provincia" },
  { icon: FileEdit, title: "Completá los datos", desc: "Un formulario guiado paso a paso, sin jerga legal" },
  { icon: CreditCard, title: "Pagá y desbloqueá", desc: "Pago único o suscripción con MercadoPago" },
  { icon: Download, title: "Descargá y firmá", desc: "PDF listo para imprimir + Word editable" },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Cómo funciona</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            4 pasos simples
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative text-center"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border" />
              )}
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold mb-3">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}