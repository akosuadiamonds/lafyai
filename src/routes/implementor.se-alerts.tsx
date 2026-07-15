import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Clock, MapPin, Syringe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/lafy/page-header";
import { SE_ALERTS, type SEAlert } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/se-alerts")({
  head: () => ({
    meta: [
      { title: "SE Alerts — lafyai" },
      { name: "description", content: "Suspected adverse events flagged across facilities." },
    ],
  }),
  component: SEAlertsPage,
});

const FILTERS = ["All", "Critical", "Moderate", "Mild", "Resolved"] as const;
type Filter = (typeof FILTERS)[number];

function sevAccent(sev: SEAlert["severity"]) {
  if (sev === "critical") return {
    bar: "bg-destructive",
    chip: "bg-destructive text-destructive-foreground",
    ring: "border-destructive/30",
    text: "text-destructive",
  };
  if (sev === "moderate") return {
    bar: "bg-amber-500",
    chip: "bg-amber-500 text-white",
    ring: "border-amber-300",
    text: "text-amber-700",
  };
  return {
    bar: "bg-emerald-500",
    chip: "bg-emerald-500 text-white",
    ring: "border-emerald-300",
    text: "text-emerald-700",
  };
}

function SEAlertsPage() {
  const [filter, setFilter] = useState<Filter>("All");

  const rows = SE_ALERTS.filter((a) => {
    if (filter === "All") return true;
    if (filter === "Resolved") return a.status === "resolved";
    return a.severity === filter.toLowerCase();
  });

  const counts = {
    critical: SE_ALERTS.filter((a) => a.severity === "critical" && a.status !== "resolved").length,
    moderate: SE_ALERTS.filter((a) => a.severity === "moderate" && a.status !== "resolved").length,
    mild: SE_ALERTS.filter((a) => a.severity === "mild" && a.status !== "resolved").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="SE alerts"
        description="Suspected adverse events reported across facilities. Escalate anything you're unsure about."
        actions={
          <div className="inline-flex rounded-md border p-0.5 bg-background">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors " +
                  (filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
                }
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Critical (open)" value={counts.critical} tone="critical" />
        <SummaryCard label="Moderate (open)" value={counts.moderate} tone="moderate" />
        <SummaryCard label="Mild (open)" value={counts.mild} tone="mild" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alerts</CardTitle>
          <p className="text-xs text-muted-foreground">{rows.length} matching · sorted by recency</p>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {rows.map((a) => {
              const acc = sevAccent(a.severity);
              return (
                <li key={a.id} className={"relative flex gap-4 px-5 py-4 hover:bg-muted/40 transition-colors border-l-4 " + acc.ring.replace("border-", "border-l-")}>
                  <div className={"h-9 w-9 shrink-0 rounded-full grid place-items-center " + acc.chip}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold">{a.name}</span>
                      <span className={"text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 " + acc.chip}>
                        {a.severity}
                      </span>
                      <Badge variant="outline" className="capitalize text-[10px]">{a.status}</Badge>
                      <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {a.reportedAt}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed">{a.detail}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {a.facility}</span>
                      <span className="inline-flex items-center gap-1"><Syringe className="h-3 w-3" /> {a.dose}</span>
                      <span className="font-mono">{a.id} · batch {a.batch}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {rows.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No alerts match this filter.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "critical" | "moderate" | "mild" }) {
  const border =
    tone === "critical" ? "border-l-destructive" : tone === "moderate" ? "border-l-amber-500" : "border-l-emerald-500";
  return (
    <Card className={"border-l-4 " + border}>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
        </div>
        <AlertTriangle className={"h-6 w-6 " + (tone === "critical" ? "text-destructive" : tone === "moderate" ? "text-amber-500" : "text-emerald-500")} />
      </CardContent>
    </Card>
  );
}