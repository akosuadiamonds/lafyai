import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function sevChip(sev: SEAlert["severity"]) {
  if (sev === "critical") return "bg-destructive/10 text-destructive border-destructive/20";
  if (sev === "moderate") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
}
function sevDot(sev: SEAlert["severity"]) {
  if (sev === "critical") return "bg-destructive";
  if (sev === "moderate") return "bg-amber-500";
  return "bg-emerald-500";
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
        <CardContent className="divide-y">
          {rows.map((a) => (
            <div key={a.id} className="py-4 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-muted-foreground"> · {a.facility}</span>
                  <span className="text-muted-foreground text-xs"> · {a.reportedAt}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">{a.detail}</div>
                <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                  {a.id} · {a.dose} · batch {a.batch}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={"inline-flex items-center gap-1.5 rounded-full border text-[11px] font-medium px-2 py-0.5 " + sevChip(a.severity)}>
                  <span className={"h-1.5 w-1.5 rounded-full " + sevDot(a.severity)} />
                  {a.severity}
                </span>
                <Badge variant="outline" className="capitalize">{a.status}</Badge>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </div>
          ))}
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