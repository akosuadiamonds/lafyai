import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/lafy/page-header";
import { CHANNELS, EPI_VISITS, KPIS, SITES, WEEKLY_ATTENDANCE } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — lafyai" },
      { name: "description", content: "Program KPIs, EPI schedule rail, and channel performance for lafyai implementors." },
    ],
  }),
  component: DashboardPage,
});

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Program overview"
        description="Real-time snapshot of coverage, engagement, and facility performance across all supported sites."
        actions={
          <>
            <Button variant="outline" size="sm">Last 30 days</Button>
            <Button size="sm">Export snapshot</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-3xl font-semibold tracking-tight">{k.value}</div>
                <span
                  className={
                    "inline-flex items-center gap-0.5 text-xs font-medium rounded-full px-1.5 py-0.5 " +
                    (k.trend === "up"
                      ? "bg-primary/10 text-primary"
                      : k.trend === "down"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted text-muted-foreground")
                  }
                >
                  <TrendIcon trend={k.trend} /> {k.delta}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Schedule rail — coverage per EPI visit</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Current coverage vs. pre-lafyai baseline for each scheduled visit.</p>
              </div>
              <Badge variant="secondary">Target 90%</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={EPI_VISITS} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="visit" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} unit="%" />
                <Tooltip cursor={{ fill: "var(--color-muted)" }} />
                <ReferenceLine y={90} stroke="var(--color-chart-5)" strokeDasharray="4 4" label={{ value: "Target 90%", position: "right", fontSize: 11, fill: "var(--color-chart-5)" }} />
                <Bar dataKey="baseline" fill="var(--color-muted)" radius={[4, 4, 0, 0]} name="Baseline" />
                <Bar dataKey="coverage" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Current" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly attendance vs. confirmation</CardTitle>
            <p className="text-xs text-muted-foreground">Rolling 8 weeks.</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={WEEKLY_ATTENDANCE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="confirmed" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} name="Confirmed" />
                <Line type="monotone" dataKey="attended" stroke="var(--color-primary)" strokeWidth={2} dot={false} name="Attended" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Channel performance</CardTitle>
            <p className="text-xs text-muted-foreground">Reach → engaged → confirmed.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {CHANNELS.map((c) => {
              const engagedPct = Math.round((c.engaged / c.reach) * 100);
              const confirmedPct = Math.round((c.confirmed / c.reach) * 100);
              return (
                <div key={c.channel}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.channel}</span>
                    <span className="text-muted-foreground text-xs">{c.reach.toLocaleString()} reached · {c.cost}/msg</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-primary/30" style={{ width: `${engagedPct}%` }} />
                    <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${confirmedPct}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{engagedPct}% engaged</span>
                    <span>{confirmedPct}% confirmed</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Per-site snapshot</CardTitle>
              <Button variant="ghost" size="sm">View all facilities →</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SITES.slice(0, 4).map((s) => (
                <div key={s.name} className="rounded-lg border p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">D-1 confirm {s.d1}% · SE resp {s.seResp}</div>
                    </div>
                    <div className={"text-lg font-semibold " + (s.coverage >= 85 ? "text-primary" : s.coverage >= 75 ? "text-foreground" : "text-destructive")}>
                      {s.coverage}%
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${s.coverage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Prevent unused import warning for Cell (kept for future donut variant)
void Cell;