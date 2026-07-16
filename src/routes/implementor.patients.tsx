import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users, TrendingDown, AlertCircle, Sparkles, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/lafy/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROGRAMS,
  PATIENT_AGE_DISTRIBUTION,
  PATIENT_DOSE_COMPLETION,
  PATIENT_STATUS,
  PATIENT_DROPOFFS,
  PATIENT_OVERDUES,
  PATIENT_INSIGHTS,
} from "@/lib/lafy-data";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/implementor/patients")({
  head: () => ({
    meta: [
      { title: "Patients — lafyai" },
      { name: "description", content: "Age distribution, dose completion, drop-offs, and overdue patients across programs." },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  const [program, setProgram] = useState<string>("epi");
  const active = PROGRAMS.find((p) => p.id === program)!;

  const factor = ({ epi: 1, polio: 0.94, measles: 0.88, malaria: 0.82, yellow: 0.9 } as const)[program as "epi"] ?? 1;
  const adj = (v: number) => Math.max(0, Math.round(v * factor));

  const ageData = PATIENT_AGE_DISTRIBUTION.map((r) => ({ ...r, count: adj(r.count) }));
  const doseData = PATIENT_DOSE_COMPLETION.map((r) => ({ ...r, rate: adj(r.rate) }));
  const statusData = PATIENT_STATUS.map((r) => ({ ...r, value: adj(r.value) }));
  const totalPatients = statusData.reduce((s, r) => s + r.value, 0);
  const overdueTotal = statusData.filter((s) => s.label.startsWith("Overdue")).reduce((s, r) => s + r.value, 0);
  const droppedTotal = statusData.find((s) => s.label === "Dropped off")?.value ?? 0;
  const onSchedule = statusData.find((s) => s.label === "On schedule")?.value ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description={`Cohort health for ${active.name}.`}
        actions={
          <Select value={program} onValueChange={setProgram}>
            <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROGRAMS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* KPI band */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile label="Enrolled patients" value={totalPatients.toLocaleString()} icon={<Users className="h-4 w-4 text-primary" />} sub={`${active.name}`} />
        <KpiTile label="On schedule" value={`${Math.round((onSchedule / totalPatients) * 100)}%`} icon={<CalendarClock className="h-4 w-4 text-primary" />} sub={`${onSchedule.toLocaleString()} patients`} />
        <KpiTile label="Overdue" value={overdueTotal.toLocaleString()} icon={<AlertCircle className="h-4 w-4 text-amber-500" />} sub="Needs outreach" tone="warn" />
        <KpiTile label="Dropped off" value={droppedTotal.toLocaleString()} icon={<TrendingDown className="h-4 w-4 text-destructive" />} sub=">28 days no contact" tone="bad" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Age distribution */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Age distribution
            </CardTitle>
            <p className="text-xs text-muted-foreground">Enrolled patients by age band.</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="band" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={36} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    wrapperStyle={{ zIndex: 50, outline: "none" }}
                    allowEscapeViewBox={{ x: true, y: true }}
                    contentStyle={{ background: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                    formatter={(v: number) => [v.toLocaleString(), "Patients"]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card className="col-span-12 lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Status breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">Where patients stand against their schedule.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusData.map((s) => {
              const pct = Math.round((s.value / totalPatients) * 100);
              const bar = s.tone === "good" ? "bg-primary" : s.tone === "warn" ? "bg-amber-500" : "bg-destructive";
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{s.label}</span>
                    <span className="tabular-nums text-muted-foreground">{s.value.toLocaleString()} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={"h-full " + bar} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Dose completion */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-base">Dose completion rate</CardTitle>
            <p className="text-xs text-muted-foreground">Completed vs. scheduled doses per antigen.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {doseData.map((d) => {
                const bar = d.rate >= 90 ? "bg-primary" : d.rate >= 80 ? "bg-amber-500" : "bg-destructive";
                return (
                  <div key={d.dose} className="grid grid-cols-[160px_1fr_120px] items-center gap-3 text-xs">
                    <span className="font-medium truncate">{d.dose}</span>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={"h-full " + bar} style={{ width: `${d.rate}%` }} />
                    </div>
                    <span className="tabular-nums text-right text-muted-foreground">
                      <span className="font-semibold text-foreground">{d.rate}%</span> · {d.completed.toLocaleString()}/{d.scheduled.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Drop-off between doses */}
        <Card className="col-span-12 lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" /> Drop-off between doses
            </CardTitle>
            <p className="text-xs text-muted-foreground">Where the cohort is leaking.</p>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PATIENT_DROPOFFS} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                  <YAxis type="category" dataKey="stage" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={140} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    wrapperStyle={{ zIndex: 50, outline: "none" }}
                    allowEscapeViewBox={{ x: true, y: true }}
                    contentStyle={{ background: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                    formatter={(v: number) => [`${v}%`, "Drop-off"]}
                  />
                  <Bar dataKey="drop" radius={[0, 6, 6, 0]}>
                    {PATIENT_DROPOFFS.map((r, i) => (
                      <Cell key={i} fill={r.drop > 10 ? "hsl(var(--destructive))" : r.drop > 6 ? "#f59e0b" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Overdue queue */}
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" /> Overdue patients
            </CardTitle>
            <p className="text-xs text-muted-foreground">Patients past their scheduled dose window.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                    <th className="py-2 px-5 font-medium">Patient</th>
                    <th className="py-2 pr-4 font-medium">Due dose</th>
                    <th className="py-2 pr-4 font-medium">Age</th>
                    <th className="py-2 pr-4 font-medium">Days late</th>
                    <th className="py-2 pr-4 font-medium">Facility</th>
                    <th className="py-2 pr-5 font-medium">Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {PATIENT_OVERDUES.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2.5 px-5 font-mono text-xs">{p.id}</td>
                      <td className="py-2.5 pr-4">{p.dueDose}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{p.ageMo} mo</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={p.daysLate > 6 ? "destructive" : "outline"} className="tabular-nums">
                          {p.daysLate}d
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{p.facility}</td>
                      <td className="py-2.5 pr-5 text-muted-foreground">{p.channel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Key insights */}
        <Card className="col-span-12 lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Key insights
            </CardTitle>
            <p className="text-xs text-muted-foreground">What the numbers suggest this week.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {PATIENT_INSIGHTS.map((i) => (
              <div key={i.title} className="rounded-lg border p-3 bg-muted/30">
                <div className="text-sm font-semibold">{i.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{i.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiTile({
  label,
  value,
  icon,
  sub,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
  tone?: "warn" | "bad";
}) {
  const accent = tone === "bad" ? "border-l-destructive" : tone === "warn" ? "border-l-amber-500" : "border-l-primary";
  return (
    <div className={"rounded-xl border border-l-4 bg-card p-5 shadow-sm " + accent}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}