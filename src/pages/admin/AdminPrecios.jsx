import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Check } from "lucide-react";

const CATEGORY_LABELS = {
  inmobiliario: "Inmobiliario",
  laboral: "Laboral",
  comercial: "Comercial",
  civil: "Civil",
};

export default function AdminPrecios() {
  const queryClient = useQueryClient();
  const [prices, setPrices] = useState({});
  const [saved, setSaved] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["admin-templates-precios"],
    queryFn: () => base44.entities.ContractTemplate.list("name", 200),
    onSuccess: (data) => {
      const initial = Object.fromEntries(data.map((t) => [t.id, t.price ?? ""]));
      setPrices(initial);
    },
  });

  // Group by category
  const byCategory = templates.reduce((acc, t) => {
    const cat = t.category || "civil";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        templates.map((t) =>
          base44.entities.ContractTemplate.update(t.id, { price: Number(prices[t.id]) || t.price })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-templates-precios"] });
      queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Admin</p>
          <h1 className="font-display text-4xl font-semibold text-foreground">Precios</h1>
          <p className="text-sm text-muted-foreground mt-1">Administrá el precio de cada plantilla</p>
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={saved ? "bg-emerald-600 hover:bg-emerald-600 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground"}
        >
          {saved ? (
            <><Check className="w-4 h-4 mr-2" />Guardado</>
          ) : saveMutation.isPending ? (
            "Guardando..."
          ) : (
            <><Save className="w-4 h-4 mr-2" />Guardar cambios</>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
          const catTemplates = byCategory[cat] || [];
          if (catTemplates.length === 0) return null;
          return (
            <Card key={cat} className="border border-border">
              <div className="px-6 py-4 border-b border-border bg-secondary/30">
                <p className="text-sm font-semibold text-foreground">{label}</p>
              </div>
              <div className="divide-y divide-border">
                {catTemplates.map((t) => (
                  <div key={t.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-8">
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={prices[t.id] ?? ""}
                        onChange={(e) => setPrices((p) => ({ ...p, [t.id]: e.target.value }))}
                        className="w-28 text-right"
                      />
                      <span className="text-xs text-muted-foreground">ARS</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}