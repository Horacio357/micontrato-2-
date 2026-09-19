import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CONTRACTS, CATEGORIES } from "@/lib/contractsData";
import { Search, Edit2, Trash2, CheckCircle, Clock, MapPin, FileText } from "lucide-react";

const statusMap = {
  draft: { label: "Borrador", className: "bg-muted text-muted-foreground border-border" },
  pending_payment: { label: "Pendiente", className: "bg-amber-50 text-amber-800 border-amber-200" },
  paid: { label: "Pagado", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  downloaded: { label: "Descargado", className: "bg-blue-50 text-blue-800 border-blue-200" },
};

export default function AdminContratos() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("all");

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["admin-all-contracts"],
    queryFn: () => base44.entities.GeneratedContract.list("-created_date", 500),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GeneratedContract.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-contracts"] }),
  });

  const filtered = contracts.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      c.template_name?.toLowerCase().includes(q) ||
      c.province?.toLowerCase().includes(q) ||
      c.created_by?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchCat = filterCat === "all" || c.category === filterCat;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Admin</p>
        <h1 className="font-display text-4xl font-semibold text-foreground">Contratos generados</h1>
        <p className="text-sm text-muted-foreground mt-1">{contracts.length} contratos en total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 w-72"
            placeholder="Buscar por nombre, cliente o provincia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-border bg-background text-sm px-3 py-2 text-foreground"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="pending_payment">Pendiente de pago</option>
          <option value="paid">Pagado</option>
          <option value="downloaded">Descargado</option>
        </select>
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

      <Card className="border border-border">
        <div className="divide-y divide-border">
          {isLoading && (
            <div className="p-8 text-center text-muted-foreground text-sm">Cargando...</div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">No hay contratos que coincidan</div>
          )}
          {filtered.map((c) => {
            const s = statusMap[c.status] || statusMap.draft;
            return (
              <div key={c.id} className="px-5 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 border border-border bg-primary/5 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.template_name}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {c.province || "—"}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(c.created_date).toLocaleDateString("es-AR")}
                      </span>
                      <span className="text-xs text-muted-foreground">{c.created_by}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <Badge className={`text-xs border ${s.className}`}>{s.label}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-destructive"
                    onClick={() => confirm("¿Eliminar este contrato?") && deleteMutation.mutate(c.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}