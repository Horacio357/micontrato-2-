import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CreditCard, DollarSign, Calendar } from "lucide-react";

export default function AdminPagos() {
  const [search, setSearch] = useState("");

  const { data: contracts = [] } = useQuery({
    queryKey: ["admin-paid-contracts"],
    queryFn: () => base44.entities.GeneratedContract.list("-created_at", 500),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["admin-pagos-templates"],
    queryFn: () => base44.entities.ContractTemplate.list("name", 200),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-pagos-users"],
    queryFn: () => base44.entities.User.list("-created_at", 500),
  });

  const priceBySlug = Object.fromEntries(templates.map((t) => [t.slug, Number(t.price) || 4990]));
  const isPaidStatus = (s) => s === "paid" || s === "downloaded" || s === "signed";

  const paidContracts = contracts.filter((c) => isPaidStatus(c.status));
  const activeSubscribers = users.filter((u) => u.subscription_status === "active" && u.role !== "admin");
  const singles = paidContracts.filter((c) => c.payment_method !== "subscription");
  const singleRevenue = singles.reduce((sum, c) => sum + (c.price || priceBySlug[c.template_id] || 4990), 0);
  const subRevenue = activeSubscribers.length * 9990;
  const totalRevenue = singleRevenue + subRevenue;

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ingresos estimados</p>
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-semibold">${totalRevenue.toLocaleString("es-AR")} ARS</p>
        </Card>
        <Card className="p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pagos únicos</p>
            <CreditCard className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-semibold">{singles.length}</p>
        </Card>
        <Card className="p-5 border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Suscriptores Pro activos</p>
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <p className="text-3xl font-semibold">{activeSubscribers.length}</p>
        </Card>
      </div>

      {/* Tarifario Stripe activo */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Tarifas activas en Stripe</h2>
        <Card className="border border-border">
          <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Producto</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monto</p>
          </div>
          <div className="divide-y divide-border">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Plan Profesional Ilimitado (Suscripción mensual)</p>
                  <p className="text-xs text-muted-foreground font-mono">Stripe Checkout · mode=subscription</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground">$9.990 ARS / mes</span>
            </div>
            {templates.map((t) => (
              <div key={t.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${t.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name} - Pago único</p>
                    <p className="text-xs text-muted-foreground font-mono">Stripe Checkout · slug: {t.slug}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">${(Number(t.price) || 4990).toLocaleString("es-AR")} ARS</span>
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
            {filteredPaid.map((c) => {
              const amount = c.payment_method === "subscription"
                ? "Suscripción"
                : `$${(c.price || priceBySlug[c.template_id] || 4990).toLocaleString("es-AR")}`;
              return (
                <div key={c.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.template_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.province} · {new Date(c.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs border ${c.payment_method === "subscription" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                      {c.payment_method === "subscription" ? "Suscripción" : c.payment_method === "stripe" ? "Stripe" : "Pago único"}
                    </Badge>
                    <span className="text-sm font-semibold text-foreground">{amount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}