import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Minus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ADHERENCE_BY_DOSE,
  ANTIGENS,
  COVERAGE_BY_LOCATION,
  KPIS,
  NEEDS_ATTENTION,
  PROGRAMS,
  SE_ALERTS,
  TOP_FACILITIES,
} from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — lafyai" },
      { name: "description", content: "Program overview: KPIs, on-time adherence, top facilities, SE alerts." },
    ],
  }),
  component: DashboardPage,
});

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <ArrowUpRight className="h-3 w-3" />;
  if (trend === "down") return <ArrowDownRight className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
}

function trendClasses(trend: string, label: string) {
  const isAlertsKpi = /alert/i.test(label);
  if (trend === "up") return isAlertsKpi ? "text-destructive" : "text-primary";
  if (trend === "down") return isAlertsKpi ? "text-primary" : "text-destructive";
  return "text-muted-foreground";
}

function DashboardPage() {
  const [program, setProgram] = useState<string>("epi");
  const active = PROGRAMS.find((p) => p.id === program)!;
  const [coverageView, setCoverageView] = useState<"antigen" | "location">("antigen");

  const PROGRAM_FACTORS: Record<string, number> = {
    epi: 1, polio: 0.94, measles: 0.88, malaria: 0.82, yellow: 0.9,
  };
  const factor = PROGRAM_FACTORS[program] ?? 1;
  const adj = (v: number) => Math.max(0, Math.min(100, Math.round(v * factor)));

  const antigens = ANTIGENS.map((a) => ({ ...a, coverage: adj(a.coverage) }));
  const locations = COVERAGE_BY_LOCATION.map((l) => ({ ...l, completion: adj(l.completion) }));
  const adherence = ADHERENCE_BY_DOSE.map((r) =>
    r.notMeasurable ? r : { ...r, adherence: adj(r.adherence!) },
  );
  const topFacilities = TOP_FACILITIES.map((f) => ({ ...f, adherence: adj(f.adherence) }));
  const needsAttention = NEEDS_ATTENTION.map((f) => ({ ...f, adherence: adj(f.adherence) }));

  const overall = Math.round(antigens.reduce((s, a) => s + a.coverage, 0) / antigens.length);
  const onTarget = antigens.filter((a) => a.coverage >= 90).length;
  const watch = antigens.filter((a) => a.coverage >= 80 && a.coverage < 90).length;
  const atRisk = antigens.filter((a) => a.coverage < 80).length;
  const sortedAntigens = [...antigens].sort((a, b) => b.coverage - a.coverage);
  const sortedLocations = [...locations].sort((a, b) => b.completion - a.completion);
  const openAlerts = SE_ALERTS.filter((a) => a.status !== "resolved");

  const kpis = KPIS.map((k, i) =>
    i === 0 ? { ...k, value: `${adj(82)}%` } : k,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Program performance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live operational view for {active.name}.
          </p>
        </div>
        <div>
          <Select value={program} onValueChange={setProgram}>
            <SelectTrigger className="w-[280px] font-semibold shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROGRAMS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Tier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {k.label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums">{k.value}</span>
              <span
                className={
                  "inline-flex items-center gap-0.5 text-xs font-bold " +
                  trendClasses(k.trend, k.label)
                }
              >
                <TrendIcon trend={k.trend} /> {k.delta}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Main operational grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Analytics Core */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Coverage summary — hero panel */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-tight">
                Coverage summary
              </h3>
              <div className="inline-flex rounded-md border p-0.5 bg-background">
                {(["antigen", "location"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setCoverageView(v)}
                    className={
                      "px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors " +
                      (coverageView === v
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    By {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center mb-6">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Overall coverage
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-black tabular-nums">{overall}%</span>
                    <span className="text-xs text-muted-foreground">
                      avg · {coverageView === "antigen" ? `${antigens.length} antigens` : `${locations.length} locations`}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <BucketStat label="On target" value={onTarget} hint="≥ 90%" tone="good" />
                  <BucketStat label="Watch" value={watch} hint="80–89%" tone="warn" />
                  <BucketStat label="At risk" value={atRisk} hint="< 80%" tone="bad" />
                </div>
              </div>

              {/* Per-antigen / per-location bars */}
              <div className="relative pt-6">
                <div
                  className="absolute top-0 bottom-0 w-px bg-foreground/40"
                  style={{ left: "90%" }}
                >
                  <span className="absolute -top-1 -translate-x-1/2 text-[9px] font-bold text-foreground/60 uppercase tracking-wider whitespace-nowrap">
                    90%
                  </span>
                </div>
                <div className="space-y-2.5">
                  {(coverageView === "antigen"
                    ? sortedAntigens.map((a) => ({ label: a.antigen, value: a.coverage }))
                    : sortedLocations.map((l) => ({ label: l.location, value: l.completion }))
                  ).map((row) => {
                    const barColor =
                      row.value >= 90 ? "bg-primary" : row.value >= 80 ? "bg-amber-500" : "bg-destructive";
                    return (
                      <div key={row.label} className="grid grid-cols-[130px_1fr_46px] items-center gap-3 text-xs">
                        <span className="font-semibold text-foreground/80 truncate">{row.label}</span>
                        <div className="h-2.5 rounded-sm bg-muted overflow-hidden">
                          <div className={"h-full " + barColor} style={{ width: `${row.value}%` }} />
                        </div>
                        <span className="text-right font-bold tabular-nums">{row.value}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* On-time Adherence */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-tight">On-time adherence by dose</h3>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Leading indicator
              </span>
            </div>
            <div className="p-6 space-y-5">
              {adherence.map((r) => {
                if (r.notMeasurable) {
                  return (
                    <div key={r.dose} className="grid grid-cols-[minmax(180px,220px)_1fr_50px] gap-4 items-center opacity-60">
                      <div>
                        <div className="text-xs font-bold text-muted-foreground">{r.dose}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{r.age}</div>
                      </div>
                      <div className="h-2 rounded border border-dashed border-border grid place-items-center text-[10px] text-muted-foreground">
                        Not measurable · {r.notMeasurable}
                      </div>
                      <span className="text-xs text-muted-foreground text-right">—</span>
                    </div>
                  );
                }
                const barColor = r.adherence! >= 90 ? "bg-primary" : r.adherence! >= 80 ? "bg-amber-500" : "bg-destructive";
                return (
                  <div key={r.dose} className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs font-bold text-foreground">{r.dose}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">
                          {r.age} · {r.eligible.toLocaleString()} eligible
                        </span>
                      </div>
                      <span className="text-xs font-black tabular-nums">{r.adherence}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={"h-full rounded-full " + barColor} style={{ width: `${r.adherence}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Triage & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* SE Alerts — critical panel */}
          <div className="rounded-xl border border-destructive/25 bg-destructive/5 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-destructive flex items-center justify-between">
              <h3 className="text-xs font-bold text-destructive-foreground uppercase tracking-wider">
                Critical alerts (SE)
              </h3>
              <span className="bg-background text-destructive text-[10px] font-black px-1.5 py-0.5 rounded">
                {openAlerts.length} OPEN
              </span>
            </div>
            <div className="divide-y divide-destructive/10">
              {openAlerts.slice(0, 4).map((a) => (
                <div key={a.id} className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-destructive uppercase tracking-wider truncate">
                      {a.facility}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 font-medium leading-relaxed">
                    {a.detail}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                    {a.dose} · batch {a.batch}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-destructive/10 bg-background">
              <Link
                to="/implementor/se-alerts"
                className="w-full py-1.5 text-[10px] font-bold text-destructive uppercase tracking-widest hover:bg-destructive/5 rounded transition-colors inline-flex items-center justify-center gap-1"
              >
                All alerts <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Facility performance combined */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="px-4 py-3 border-b">
              <h3 className="text-xs font-bold uppercase tracking-tight">Facility performance</h3>
            </div>
            <div className="p-4">
              <div className="mb-5">
                <p className="text-[9px] font-black text-destructive uppercase tracking-widest mb-2">
                  Needs attention
                </p>
                <div className="space-y-2">
                  {needsAttention.slice(0, 3).map((r) => (
                    <div key={r.name} className="flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">{r.name}</div>
                        <div className="text-[10px] text-muted-foreground">{r.region}</div>
                      </div>
                      <span className="text-destructive font-bold tabular-nums shrink-0">
                        {r.adherence}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">
                  Top performing
                </p>
                <div className="space-y-2">
                  {topFacilities.slice(0, 3).map((r) => (
                    <div key={r.name} className="flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">{r.name}</div>
                        <div className="text-[10px] text-muted-foreground">{r.region}</div>
                      </div>
                      <span className="text-primary font-bold tabular-nums shrink-0">
                        {r.adherence}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/implementor/facilities"
                className="block text-center w-full mt-5 py-2 border rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted transition-colors"
              >
                View all facilities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BucketStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone: "good" | "warn" | "bad";
}) {
  const num = tone === "good" ? "text-primary" : tone === "warn" ? "text-amber-600" : "text-destructive";
  const border = tone === "good" ? "border-l-primary" : tone === "warn" ? "border-l-amber-500" : "border-l-destructive";
  return (
    <div className={"rounded-lg border border-l-4 bg-background p-3 " + border}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={"mt-0.5 text-2xl font-black tabular-nums " + num}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
    </div>
  );
}