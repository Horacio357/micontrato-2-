import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FileText, Download, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function AdminDashboard() {
  const { data: contracts = [] } = useQuery({
    queryKey: ["admin-contracts"],
    queryFn: () => base44.entities.GeneratedContract.list("-created_date", 200),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const total = contracts.length;
  const paid = contracts.filter((c) => c.status === "paid" || c.status === "downloaded").length;
  const downloaded = contracts.filter((c) => c.status === "downloaded").length;
  const revenue = contracts
    .filter((c) => c.status === "paid" || c.status === "downloaded")
    .reduce((sum, c) => sum + (c.price || 4990), 0);

  // Contracts per day (last 7 days)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const chartData = days.map((date) => ({
    date: date.slice(5),
    contratos: contracts.filter((c) => c.created_date?.slice(0, 10) === date).length,
  }));

  // By category
  const CATEGORY_COLORS = {
    inmobiliario: "hsl(207,100%,42%)",
    laboral: "hsl(152,60%,40%)",
    comercial: "hsl(43,74%,50%)",
    civil: "hsl(270,50%,55%)",
  };
  const byCategory = ["inmobiliario", "laboral", "comercial", "civil"]
    .map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: contracts.filter((c) => c.category === cat).length,
      color: CATEGORY_COLORS[cat],
    }))
    .filter((c) => c.value > 0);

  const stats = [
    { label: "Contratos generados", value: total, icon: FileText, color: "text-accent" },
    { label: "Contratos pagados", value: paid, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Descargas", value: downloaded, icon: Download, color: "text-blue-600" },
    { label: "Ingresos estimados", value: `$${(revenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-amber-600" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Admin</p>
        <h1 className="font-display text-4xl font-semibold text-foreground">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-3xl font-semibold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity chart */}
        <Card className="p-6 border border-border">
          <p className="text-sm font-medium text-foreground mb-4">Contratos últimos 7 días</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="contratos" fill="hsl(207,100%,42%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By category - Pie chart */}
        <Card className="p-6 border border-border">
          <p className="text-sm font-medium text-foreground mb-4">Demanda por categoría</p>
          {byCategory.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
              Sin datos aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={36}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Contratos"]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Recent */}
      <Card className="mt-6 border border-border">
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm font-medium text-foreground">Contratos recientes</p>
        </div>
        <div className="divide-y divide-border">
          {contracts.slice(0, 8).map((c) => (
            <div key={c.id} className="px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{c.template_name}</p>
                <p className="text-xs text-muted-foreground">{c.province} · {new Date(c.created_date).toLocaleDateString("es-AR")}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 border ${
                c.status === "paid" || c.status === "downloaded"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : c.status === "pending_payment"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-muted text-muted-foreground border-border"
              }`}>
                {c.status === "paid" ? "Pagado" : c.status === "downloaded" ? "Descargado" : c.status === "pending_payment" ? "Pendiente" : "Borrador"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}