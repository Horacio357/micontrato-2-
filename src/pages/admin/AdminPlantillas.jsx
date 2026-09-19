import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit2, Trash2, FileText, Clock, DollarSign, Eye } from "lucide-react";
import { CATEGORIES } from "@/lib/contractsData";
import TemplateEditor from "@/components/admin/TemplateEditor";

const categoryColors = {
  inmobiliario: "bg-blue-50 text-blue-700 border-blue-200",
  laboral: "bg-emerald-50 text-emerald-700 border-emerald-200",
  comercial: "bg-amber-50 text-amber-700 border-amber-200",
  civil: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AdminPlantillas() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [editing, setEditing] = useState(null); // null | "new" | template object

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["admin-templates"],
    queryFn: () => base44.entities.ContractTemplate.list("-created_date", 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContractTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-templates"] }),
  });

  const filtered = templates.filter((t) => {
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || t.category === filterCat;
    return matchSearch && matchCat;
  });

  if (editing !== null) {
    return (
      <TemplateEditor
        template={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Admin</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">Plantillas de contratos</h1>
          <p className="text-sm text-muted-foreground mt-1">{templates.length} plantillas en total</p>
        </div>
        <Button
          className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
          onClick={() => setEditing("new")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva plantilla
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar plantilla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-border bg-background text-sm px-3 py-2 text-foreground"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No hay plantillas aún</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {search ? "Ninguna plantilla coincide con la búsqueda" : "Creá tu primera plantilla de contrato"}
          </p>
          {!search && (
            <Button size="sm" onClick={() => setEditing("new")} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4 mr-1" /> Crear plantilla
            </Button>
          )}
        </div>
      )}

      {isLoading && (
        <div className="text-center text-sm text-muted-foreground py-12">Cargando...</div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <Card key={t.id} className="border border-border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-primary/5 border border-border flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.slug}</p>
                </div>
              </div>
              <Badge className={`text-xs border shrink-0 ${categoryColors[t.category] || "bg-muted text-muted-foreground border-border"}`}>
                {t.category}
              </Badge>
            </div>

            {t.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {t.estimated_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t.estimated_time} min
                </span>
              )}
              {t.price && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> ${Number(t.price).toLocaleString("es-AR")}
                </span>
              )}
              {t.form_steps?.length > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {t.form_steps.length} pasos
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-auto pt-2 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setEditing(t)}
              >
                <Edit2 className="w-3 h-3 mr-1" /> Editar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => confirm(`¿Eliminar "${t.name}"?`) && deleteMutation.mutate(t.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}