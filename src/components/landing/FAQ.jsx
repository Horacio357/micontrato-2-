import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "¿Los contratos tienen validez legal?", a: "Sí. Todos los contratos están redactados conforme a la legislación argentina vigente y se adaptan a las normativas de cada provincia. Son documentos privados válidos, listos para firmar." },
  { q: "¿Necesito un abogado para usar micontrato?", a: "No. El formulario guiado te explica cada campo en lenguaje simple. Si tenés dudas, nuestro asistente IA te ayuda en tiempo real. Igualmente, siempre recomendamos consulta profesional para contratos complejos." },
  { q: "¿En qué formatos puedo descargar el contrato?", a: "PDF listo para imprimir y firmar, y Word editable por si necesitás hacer ajustes con tu abogado." },
  { q: "¿Qué provincias están disponibles?", a: "En la primera versión soportamos CABA, Buenos Aires, Córdoba y Santa Fe. Estamos trabajando para agregar más provincias pronto." },
  { q: "¿Puedo editar el contrato después de descargarlo?", a: "Sí, la versión Word es completamente editable. El PDF viene listo para imprimir y firmar directamente." },
  { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos MercadoPago (tarjeta, transferencia, débito) y tarjetas internacionales." },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Preguntas frecuentes
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6 data-[state=open]:bg-muted/30">
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-5 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}