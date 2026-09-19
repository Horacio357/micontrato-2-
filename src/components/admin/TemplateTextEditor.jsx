import { useState } from "react";
import { Info } from "lucide-react";

export default function TemplateTextEditor({ value, onChange }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Texto base del contrato</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Redactá el cuerpo del contrato usando variables{" "}
            <code className="bg-muted px-1 font-mono text-xs">{"{{nombre_variable}}"}</code> que serán reemplazadas por los datos del formulario.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showHelp && (
        <div className="bg-accent/5 border border-accent/20 p-4 text-xs text-foreground space-y-2">
          <p className="font-semibold text-accent">Cómo usar variables dinámicas</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Usá <code className="bg-muted px-1 font-mono">{"{{nombre_variable}}"}</code> para insertar datos del formulario.</li>
            <li>• El nombre de la variable debe coincidir exactamente con el "nombre interno" del campo.</li>
            <li>• Ejemplo: <code className="bg-muted px-1 font-mono">{"{{locador_nombre}}"}</code> se reemplaza con el nombre del locador.</li>
            <li>• La IA también usa este texto como guía para generar el contrato final.</li>
          </ul>
          <p className="font-semibold text-foreground mt-2">Variables comunes:</p>
          <div className="grid grid-cols-2 gap-1 font-mono text-xs">
            {["{{parte_a_nombre}}", "{{parte_b_nombre}}", "{{fecha_firma}}", "{{lugar_firma}}", "{{monto}}", "{{plazo}}"].map((v) => (
              <span key={v} className="bg-muted px-1.5 py-0.5">{v}</span>
            ))}
          </div>
        </div>
      )}

      <textarea
        className="w-full border border-border bg-background text-sm px-4 py-3 text-foreground font-mono leading-relaxed resize-y min-h-[400px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`CONTRATO DE LOCACIÓN

En la ciudad de {{lugar_firma}}, a los {{fecha_firma}}, entre:

PRIMERA PARTE: {{locador_nombre}}, DNI {{locador_dni}}...

SEGUNDA PARTE: {{locatario_nombre}}, DNI {{locatario_dni}}...

CLÁUSULA PRIMERA...`}
      />

      <p className="text-xs text-muted-foreground text-right">
        {value.length.toLocaleString("es-AR")} caracteres · {(value.match(/\{\{[^}]+\}\}/g) || []).length} variables detectadas
      </p>
    </div>
  );
}