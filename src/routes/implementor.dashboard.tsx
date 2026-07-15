import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Minus, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/lafy/page-header";
import {
  ADHERENCE_BY_DOSE,
  ANTIGENS,
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
  if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

function severityDot(sev: string) {
  if (sev === "critical") return "bg-destructive";
  if (sev === "moderate") return "bg-amber-500";
  return "bg-emerald-500";
}
function severityChip(sev: string) {
  if (sev === "critical") return "bg-destructive/10 text-destructive border-destructive/20";
  if (sev === "moderate") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
}

function DashboardPage() {
  const [program, setProgram] = useState<string>("epi");
  const active = PROGRAMS.find((p) => p.id === program)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Program overview"
        description={`Showing metrics for ${active.name}.`}
        actions={
          <Select value={program} onValueChange={setProgram}>
            <SelectTrigger className="w-[280px]">
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

      <CoverageSummary />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">On-time adherence by dose</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                % of babies who received each dose within ±2 weeks of their scheduled date
              </p>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5 inline-block" /> Leading indicator
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[minmax(180px,220px)_1fr_90px] gap-4 text-[11px] uppercase tracking-wide text-muted-foreground pb-2 border-b">
            <div>Dose · Scheduled age</div>
            <div>On-time / Late / Missed</div>
            <div className="text-right">Adherence</div>
          </div>
          <div className="divide-y">
            {ADHERENCE_BY_DOSE.map((r) => (
              <div key={r.dose} className="grid grid-cols-[minmax(180px,220px)_1fr_90px] gap-4 items-center py-3.5">
                <div>
                  <div className={"text-sm font-medium " + (r.notMeasurable ? "text-muted-foreground" : "")}>
                    {r.dose}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {r.age}
                    {r.eligible > 0 ? ` · ${r.eligible.toLocaleString()} eligible` : ` · no babies aged in yet`}
                  </div>
                </div>
                <div>
                  {r.notMeasurable ? (
                    <div className="h-3 rounded border border-dashed border-border grid place-items-center text-[11px] text-muted-foreground">
                      Not measurable yet · {r.notMeasurable}
                    </div>
                  ) : (
                    <div className="flex h-3 w-full rounded overflow-hidden bg-muted">
                      <div className="bg-emerald-500" style={{ width: `${r.onTime}%` }} />
                      <div className="bg-amber-500" style={{ width: `${r.late}%` }} />
                      <div className="bg-red-400" style={{ width: `${r.missed}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={
                      "text-sm font-semibold tabular-nums " +
                      (r.notMeasurable
                        ? "text-muted-foreground"
                        : r.adherence! >= 90
                          ? "text-emerald-600"
                          : "text-foreground")
                    }
                  >
                    {r.notMeasurable ? "—" : `${r.adherence}%`}
                  </span>
                  {r.tag === "sparse" && (
                    <span className="text-[10px] rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5">
                      Sparse
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> On time (±2w)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Late</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" /> Missed</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FacilityRankList
          title="Top performing facilities"
          subtitle="By on-time adherence"
          rows={TOP_FACILITIES}
          tone="good"
        />
        <FacilityRankList
          title="Needs attention"
          subtitle="Lowest on-time adherence · bottom 5"
          rows={NEEDS_ATTENTION}
          tone="bad"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">SE alerts · cross-facility</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Open and escalated</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              All alerts <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="divide-y">
          {SE_ALERTS.filter((a) => a.status !== "resolved").slice(0, 4).map((a) => (
            <div key={a.id} className="py-3.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-muted-foreground"> · {a.facility}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.detail}</div>
                <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                  {a.dose} · batch {a.batch}
                </div>
              </div>
              <span className={"inline-flex items-center gap-1.5 shrink-0 rounded-full border text-[11px] font-medium px-2 py-0.5 " + severityChip(a.severity)}>
                <span className={"h-1.5 w-1.5 rounded-full " + severityDot(a.severity)} />
                {a.severity}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function FacilityRankList({
  title,
  subtitle,
  rows,
  tone,
}: {
  title: string;
  subtitle: string;
  rows: { name: string; region: string; babies: number; adherence: number }[];
  tone: "good" | "bad";
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="divide-y">
        {rows.map((r, i) => {
          const barColor =
            tone === "bad" && r.adherence < 65
              ? "bg-red-400"
              : r.adherence >= 80
                ? "bg-emerald-500"
                : "bg-amber-500";
          const numColor =
            tone === "bad"
              ? "text-destructive"
              : r.adherence >= 80
                ? "text-emerald-600"
                : "text-foreground";
          return (
            <div key={r.name} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
              <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.region} · {r.babies} babies</div>
              </div>
              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={"h-full " + barColor} style={{ width: `${r.adherence}%` }} />
              </div>
              <div className={"text-sm font-semibold tabular-nums w-10 text-right " + numColor}>
                {r.adherence}%
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CoverageSummary() {
  const overall = Math.round(ANTIGENS.reduce((s, a) => s + a.coverage, 0) / ANTIGENS.length);
  const onTarget = ANTIGENS.filter((a) => a.coverage >= 90).length;
  const watch = ANTIGENS.filter((a) => a.coverage >= 80 && a.coverage < 90).length;
  const atRisk = ANTIGENS.filter((a) => a.coverage < 80).length;
  const sorted = [...ANTIGENS].sort((a, b) => b.coverage - a.coverage);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Coverage summary</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Fully immunized rate against the 90% national target, across all antigens.</p>
          </div>
          <Badge variant="outline" className="border-primary text-primary">Target 90%</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Overall coverage</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tabular-nums">{overall}%</span>
              <span className="text-xs text-muted-foreground">avg across {ANTIGENS.length} antigens</span>
            </div>
            <div className="relative mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={
                  "h-full " +
                  (overall >= 90 ? "bg-primary" : overall >= 80 ? "bg-amber-500" : "bg-destructive")
                }
                style={{ width: `${overall}%` }}
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-foreground/70" style={{ left: "90%" }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SummaryStat label="On target" value={onTarget} tone="good" hint="≥ 90%" />
            <SummaryStat label="Watch" value={watch} tone="warn" hint="80–89%" />
            <SummaryStat label="At risk" value={atRisk} tone="bad" hint="< 80%" />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Best performing antigen</div>
              <div className="font-medium">{best.antigen}</div>
            </div>
            <span className="text-emerald-600 font-semibold tabular-nums">{best.coverage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Lowest coverage</div>
              <div className="font-medium">{worst.antigen}</div>
            </div>
            <span className="text-destructive font-semibold tabular-nums">{worst.coverage}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryStat({ label, value, tone, hint }: { label: string; value: number; tone: "good" | "warn" | "bad"; hint: string }) {
  const border = tone === "good" ? "border-l-primary" : tone === "warn" ? "border-l-amber-500" : "border-l-destructive";
  const num = tone === "good" ? "text-primary" : tone === "warn" ? "text-amber-600" : "text-destructive";
  return (
    <div className={"rounded-lg border border-l-4 p-3 " + border}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={"mt-0.5 text-2xl font-semibold tabular-nums " + num}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}