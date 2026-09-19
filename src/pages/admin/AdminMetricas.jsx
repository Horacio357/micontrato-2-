import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { CONTRACTS } from "@/lib/contractsData";

const COLORS = ["hsl(207,100%,42%)", "hsl(215,50%,16%)", "hsl(43,74%,56%)", "hsl(0,84%,60%)"];

export default function AdminMetricas() {
  const { data: contracts = [] } = useQuery({
    queryKey: ["admin-metrics-contracts"],
    queryFn: () => base44.entities.GeneratedContract.list("-created_date", 500),
  });

  // By contract type
  const byType = CONTRACTS.map((ct) => ({
    name: ct.name.replace("Contrato de ", "").replace("Acuerdo de ", ""),
    total: contracts.filter((c) => c.template_name === ct.name).length,
    pagados: contracts.filter((c) => c.template_name === ct.name && (c.status === "paid" || c.status === "downloaded")).length,
  })).filter((x) => x.total > 0);

  // By category pie
  const byCat = ["inmobiliario", "laboral", "comercial", "civil"].map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: contracts.filter((c) => c.category === cat).length,
  }));

  // By province
  const byProvince = ["CABA", "Buenos Aires", "Córdoba", "Santa Fe"].map((p) => ({
    name: p,
    value: contracts.filter((c) => c.province === p).length,
  }));

  // Conversion rate
  const total = contracts.length;
  const paid = contracts.filter((c) => c.status === "paid" || c.status === "downloaded").length;
  const convRate = total ? ((paid / total) * 100).toFixed(1) : 0;

  // Last 30 days by day
  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const dailyData = days30.map((date) => ({
    date: date.slice(5),
    generados: contracts.filter((c) => c.created_date?.slice(0, 10) === date).length,
    pagados: contracts.filter((c) => c.created_date?.slice(0, 10) === date && (c.status === "paid" || c.status === "downloaded")).length,
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Admin</p>
        <h1 className="font-display text-4xl font-semibold text-foreground">Métricas</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total generados", value: total },
          { label: "Pagados", value: paid },
          { label: "Conversión", value: `${convRate}%` },
          { label: "Descargas", value: contracts.filter((c) => c.status === "downloaded").length },
        ].map((k) => (
          <Card key={k.label} className="p-5 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{k.label}</p>
            <p className="text-3xl font-semibold text-foreground">{k.value}</p>
          </Card>
        ))}
      </div>

      {/* 30-day line chart */}
      <Card className="p-6 border border-border mb-6">
        <p className="text-sm font-medium mb-4">Actividad últimos 30 días</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="generados" stroke="hsl(207,100%,42%)" strokeWidth={2} dot={false} name="Generados" />
            <Line type="monotone" dataKey="pagados" stroke="hsl(215,50%,16%)" strokeWidth={2} dot={false} name="Pagados" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By type */}
        <Card className="col-span-2 p-6 border border-border">
          <p className="text-sm font-medium mb-4">Por tipo de contrato</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byType} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(207,100%,42%)" name="Total" radius={[0, 2, 2, 0]} />
              <Bar dataKey="pagados" fill="hsl(215,50%,16%)" name="Pagados" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By category pie */}
        <Card className="p-6 border border-border">
          <p className="text-sm font-medium mb-4">Por categoría</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => value > 0 ? name : null} labelLine={false}>
                {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* By province */}
      <Card className="p-6 border border-border mt-6">
        <p className="text-sm font-medium mb-4">Por provincia</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={byProvince}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(207,100%,42%)" name="Contratos" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}