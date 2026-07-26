import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CROSS_ALERTS, IMPLEMENTORS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/se-alerts")({
  head: () => ({
    meta: [
      { title: "Safety event oversight — lafyai super admin" },
      {
        name: "description",
        content:
          "Cross-implementor safety event alerts with severity, reporting facility and escalation status.",
      },
      { property: "og:title", content: "Safety event oversight — lafyai super admin" },
      {
        property: "og:description",
        content: "Monitor every reported safety event across implementors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSeAlerts,
});

const OWNERS = ["All implementors", ...IMPLEMENTORS.map((i) => i.name)];
const SEVERITIES = ["All severities", "critical", "moderate", "mild"];

function AdminSeAlerts() {
  const [owner, setOwner] = useState("All implementors");
  const [severity, setSeverity] = useState("All severities");

  const rows = useMemo(
    () =>
      CROSS_ALERTS.filter(
        (a) =>
          (owner === "All implementors" || a.implementor === owner) &&
          (severity === "All severities" || a.severity === severity),
      ),
    [owner, severity],
  );

  const counts = {
    critical: CROSS_ALERTS.filter((a) => a.severity === "critical").length,
    open: CROSS_ALERTS.filter((a) => a.status !== "resolved").length,
    resolved: CROSS_ALERTS.filter((a) => a.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safety event oversight"
        description="Every safety event reported across implementors."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Critical", counts.critical],
          ["Open / escalated", counts.open],
          ["Resolved", counts.resolved],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="pt-6">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger className="sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OWNERS.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {rows.map((a) => (
          <Card
            key={a.id}
            className={cn(a.severity === "critical" && "border-destructive/40 bg-destructive/5")}
          >
            <CardContent className="pt-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <AlertTriangle
                  className={cn(
                    "h-5 w-5 mt-0.5",
                    a.severity === "critical" ? "text-destructive" : "text-amber-500",
                  )}
                />
                <div>
                  <div className="font-medium">
                    {a.name} <span className="text-xs text-muted-foreground">· {a.id}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.detail}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {a.implementor} · {a.facility} · {a.reportedAt}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:flex-col sm:items-end">
                <Badge
                  variant={a.severity === "critical" ? "destructive" : "secondary"}
                  className="capitalize"
                >
                  {a.severity}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {a.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No alerts match these filters.</p>
        )}
      </div>
    </div>
  );
}