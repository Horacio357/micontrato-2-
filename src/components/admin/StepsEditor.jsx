import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from "lucide-react";

const FIELD_TYPES = ["text", "number", "date", "select", "textarea", "email"];

function FieldEditor({ field, onChange, onDelete }) {
  return (
    <div className="bg-secondary/30 border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-xs font-semibold text-foreground">{field.label || "Campo sin nombre"}</span>
        </div>
        <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground hover:text-destructive" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Etiqueta</label>
          <Input className="text-xs h-8" value={field.label || ""} onChange={(e) => onChange({ ...field, label: e.target.value })} placeholder="Nombre del campo" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Variable (nombre interno)</label>
          <Input
            className="text-xs h-8 font-mono"
            value={field.name || ""}
            onChange={(e) => onChange({ ...field, name: e.target.value.replace(/\s/g, "_").toLowerCase() })}
            placeholder="nombre_variable"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
          <select
            className="w-full border border-border bg-background text-xs h-8 px-2 text-foreground"
            value={field.type || "text"}
            onChange={(e) => onChange({ ...field, type: e.target.value, options: [] })}
          >
            {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Placeholder</label>
          <Input className="text-xs h-8" value={field.placeholder || ""} onChange={(e) => onChange({ ...field, placeholder: e.target.value })} placeholder="Texto de ayuda" />
        </div>
      </div>

      {field.type === "select" && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Opciones (una por línea)</label>
          <textarea
            className="w-full border border-border bg-background text-xs px-2 py-1.5 text-foreground resize-none"
            rows={3}
            value={(field.options || []).join("\n")}
            onChange={(e) => onChange({ ...field, options: e.target.value.split("\n").filter(Boolean) })}
            placeholder={"Opción 1\nOpción 2\nOpción 3"}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`req-${field.name}`}
          checked={field.required || false}
          onChange={(e) => onChange({ ...field, required: e.target.checked })}
          className="w-3.5 h-3.5"
        />
        <label htmlFor={`req-${field.name}`} className="text-xs text-muted-foreground cursor-pointer">Campo obligatorio</label>
      </div>
    </div>
  );
}

function StepCard({ step, index, onChange, onDelete, total }) {
  const [open, setOpen] = useState(index === 0);

  const addField = () => {
    onChange({
      ...step,
      fields: [...(step.fields || []), { name: "", label: "", type: "text", required: true, placeholder: "" }],
    });
  };

  const updateField = (i, updated) => {
    const fields = [...step.fields];
    fields[i] = updated;
    onChange({ ...step, fields });
  };

  const deleteField = (i) => {
    onChange({ ...step, fields: step.fields.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="border border-border bg-card">
      {/* Step header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold shrink-0">
          {index + 1}
        </div>
        <Input
          className="flex-1 text-sm font-medium h-8 border-transparent hover:border-border focus:border-border bg-transparent"
          value={step.title || ""}
          onChange={(e) => onChange({ ...step, title: e.target.value })}
          placeholder="Título del paso"
          onClick={(e) => e.stopPropagation()}
        />
        <span className="text-xs text-muted-foreground shrink-0">{step.fields?.length || 0} campos</span>
        <Button size="icon" variant="ghost" className="w-6 h-6 text-muted-foreground hover:text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border">
          {(step.fields || []).map((field, i) => (
            <FieldEditor
              key={i}
              field={field}
              onChange={(updated) => updateField(i, updated)}
              onDelete={() => deleteField(i)}
            />
          ))}
          <Button size="sm" variant="outline" className="w-full text-xs mt-2" onClick={addField}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Agregar campo
          </Button>
        </div>
      )}
    </div>
  );
}

export default function StepsEditor({ steps, onChange }) {
  const addStep = () => {
    onChange([
      ...steps,
      { title: `Paso ${steps.length + 1}`, fields: [] },
    ]);
  };

  const updateStep = (i, updated) => {
    const s = [...steps];
    s[i] = updated;
    onChange(s);
  };

  const deleteStep = (i) => {
    onChange(steps.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Pasos del formulario</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Definí los pasos y campos que el usuario verá al completar el contrato.{" "}
            Usá <code className="bg-muted px-1 text-xs font-mono">{"{{nombre_variable}}"}</code> en el texto base para vincular campos.
          </p>
        </div>
      </div>

      {steps.length === 0 && (
        <div className="border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No hay pasos definidos</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={addStep}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Agregar primer paso
          </Button>
        </div>
      )}

      {steps.map((step, i) => (
        <StepCard
          key={i}
          step={step}
          index={i}
          total={steps.length}
          onChange={(updated) => updateStep(i, updated)}
          onDelete={() => deleteStep(i)}
        />
      ))}

      {steps.length > 0 && (
        <Button size="sm" variant="outline" className="w-full" onClick={addStep}>
          <Plus className="w-4 h-4 mr-1" /> Agregar paso
        </Button>
      )}
    </div>
  );
}