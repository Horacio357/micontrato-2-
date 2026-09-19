import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, CreditCard, DollarSign, Calendar } from "lucide-react";

const mockLinks = [
  { name: "Locación de Vivienda - Pago único", url: "https://mpago.la/xxxxx1", amount: 4990, active: true },
  { name: "Locación Comercial - Pago único", url: "https://mpago.la/xxxxx2", amount: 5990, active: true },
  { name: "Plan Pro - Suscripción mensual", url: "https://mpago.la/xxxxx3", amount: 19990, active: true },
  { name: "Plan Básico - Suscripción mensual", url: "https://mpago.la/xxxxx4", amount: 9990, active: false },
];

export default function AdminPagos() {
  const [search, setSearch] = useState("");
  const [links, setLinks] = useState(mockLinks);

  const { data: contracts = [] } = useQuery({
    queryKey: ["admin-paid-contracts"],
    queryFn: () => base44.entities.GeneratedContract.list("-created_date", 500),
  });

  const paidContracts = contracts.filter((c) => c.status === "paid" || c.status === "downloaded");
  const totalRevenue = paidContracts.reduce((sum) => sum + 4990, 0);
  const subs = paidContracts.filter((c) => c.payment_method === "subscription").length;
  const singles = paidContracts.filter((c) => c.payment_method === "single").length;

  const filteredPaid = paidContracts.filter((c) =>
    !search || c.template_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Admin</p>
        <h1 className="font-display text-4xl font-semibold text-foreground">Pagos y Suscripciones</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ingresos estimados</p>
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-semibold">${(totalRevenue / 1000).toFixed(0)}K ARS</p>
        </Card>
        <Card className="p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pagos únicos</p>
            <CreditCard className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-semibold">{singles}</p>
        </Card>
        <Card className="p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Suscripciones</p>
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-semibold">{subs}</p>
        </Card>
      </div>

      {/* Payment links */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Links de pago</h2>
        <Card className="border border-border">
          <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Link</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monto</p>
          </div>
          <div className="divide-y divide-border">
            {links.map((link, i) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${link.active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{link.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{link.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-sm font-semibold text-foreground">${link.amount.toLocaleString("es-AR")}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-accent">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Payment history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Historial de pagos</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 w-52" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Card className="border border-border">
          <div className="divide-y divide-border">
            {filteredPaid.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">Sin pagos registrados</div>
            )}
            {filteredPaid.map((c) => (
              <div key={c.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.template_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.province} · {new Date(c.created_date).toLocaleDateString("es-AR")} · {c.created_by}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-xs border ${c.payment_method === "subscription" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                    {c.payment_method === "subscription" ? "Suscripción" : "Pago único"}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">$4.990</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}