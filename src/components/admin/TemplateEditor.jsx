import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { CATEGORIES } from "@/lib/contractsData";
import StepsEditor from "@/components/admin/StepsEditor";
import TemplateTextEditor from "@/components/admin/TemplateTextEditor";

const TABS = ["General", "Formulario", "Texto base"];

export default function TemplateEditor({ template, onClose, onSaved }) {
  const isNew = !template;
  const [activeTab, setActiveTab] = useState("General");
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    name: template?.name || "",
    slug: template?.slug || "",
    category: template?.category || "inmobiliario",
    description: template?.description || "",
    when_to_use: template?.when_to_use || "",
    estimated_time: template?.estimated_time || "",
    price: template?.price || "",
    available_provinces: template?.available_provinces || ["caba", "buenos-aires", "cordoba", "santa-fe"],
    form_steps: template?.form_steps || [],
    template_text: template?.template_text || "",
  });

  const set = (key, value) => setData((d) => ({ ...d, [key]: value }));

  const handleSave = async () => {
    if (!data.name || !data.slug || !data.category) {
      alert("Nombre, slug y categoría son obligatorios");
      return;
    }
    setSaving(true);
    const payload = {
      ...data,
      price: data.price ? Number(data.price) : undefined,
      estimated_time: data.estimated_time ? Number(data.estimated_time) : undefined,
    };
    if (isNew) {
      await base44.entities.ContractTemplate.create(payload);
    } else {
      await base44.entities.ContractTemplate.update(template.id, payload);
    }
    setSaving(false);
    onSaved();
  };

  // Auto-generate slug from name
  const handleNameChange = (val) => {
    set("name", val);
    if (isNew) {
      set("slug", val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60));
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {isNew ? "Nueva plantilla" : "Editar plantilla"}
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground truncate">
            {data.name || "Sin nombre"}
          </h1>
        </div>
        <Button
          className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* General tab */}
      {activeTab === "General" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Nombre del contrato *</label>
              <Input value={data.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ej: Locación de Vivienda" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Slug (URL) *</label>
              <Input value={data.slug} onChange={(e) => set("slug", e.target.value)} placeholder="locacion-vivienda" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Categoría *</label>
              <select
                className="w-full border border-border bg-background text-sm px-3 py-2 text-foreground"
                value={data.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Precio (ARS)</label>
              <Input type="number" value={data.price} onChange={(e) => set("price", e.target.value)} placeholder="4990" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Tiempo estimado (min)</label>
              <Input type="number" value={data.estimated_time} onChange={(e) => set("estimated_time", e.target.value)} placeholder="7" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Descripción breve</label>
            <textarea
              className="w-full border border-border bg-background text-sm px-3 py-2 text-foreground resize-none"
              rows={2}
              value={data.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Breve descripción del contrato"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">¿Cuándo usarlo?</label>
            <textarea
              className="w-full border border-border bg-background text-sm px-3 py-2 text-foreground resize-none"
              rows={2}
              value={data.when_to_use}
              onChange={(e) => set("when_to_use", e.target.value)}
              placeholder="Cuando alquilás o das en alquiler una propiedad..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-2">Provincias disponibles</label>
            <ProvincesSelector value={data.available_provinces} onChange={(v) => set("available_provinces", v)} />
          </div>
        </div>
      )}

      {/* Formulario tab */}
      {activeTab === "Formulario" && (
        <StepsEditor
          steps={data.form_steps}
          onChange={(steps) => set("form_steps", steps)}
        />
      )}

      {/* Texto base tab */}
      {activeTab === "Texto base" && (
        <TemplateTextEditor
          value={data.template_text}
          onChange={(v) => set("template_text", v)}
        />
      )}
    </div>
  );
}

const ALL_PROVINCES = [
  { slug: "caba", name: "CABA" },
  { slug: "buenos-aires", name: "Buenos Aires" },
  { slug: "cordoba", name: "Córdoba" },
  { slug: "santa-fe", name: "Santa Fe" },
  { slug: "mendoza", name: "Mendoza" },
  { slug: "tucuman", name: "Tucumán" },
  { slug: "entre-rios", name: "Entre Ríos" },
  { slug: "salta", name: "Salta" },
  { slug: "misiones", name: "Misiones" },
];

function ProvincesSelector({ value, onChange }) {
  const toggle = (slug) => {
    if (value.includes(slug)) {
      onChange(value.filter((s) => s !== slug));
    } else {
      onChange([...value, slug]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_PROVINCES.map((p) => {
        const selected = value.includes(p.slug);
        return (
          <button
            key={p.slug}
            type="button"
            onClick={() => toggle(p.slug)}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              selected
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-background text-muted-foreground border-border hover:border-accent/50"
            }`}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}