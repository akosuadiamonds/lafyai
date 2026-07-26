import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useState } from "react";
import { Building2, Users, Syringe, AlertTriangle, ArrowUpRight } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  IMPLEMENTORS,
  NATIONAL_TREND,
  CROSS_ALERTS,
  USER_SEGMENTS,
  TOTAL_PLATFORM_USERS,
} from "@/lib/admin-data";
import { cn as _cn } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/overview")({
  head: () => ({
    meta: [
      { title: "National overview — lafyai super admin" },
      {
        name: "description",
        content:
          "National immunization rollup across all implementors: coverage, adherence, enrolment and open safety events.",
      },
      { property: "og:title", content: "National overview — lafyai super admin" },
      {
        property: "og:description",
        content: "Cross-implementor coverage, adherence and safety oversight.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminOverview,
});

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

function TotalUsersCard() {
  const [segment, setSegment] = useState<"all" | (typeof USER_SEGMENTS)[number]["key"]>("all");
  const selected = USER_SEGMENTS.find((s) => s.key === segment);
  const total = selected ? selected.total : TOTAL_PLATFORM_USERS;
  const active = selected
    ? selected.active
    : USER_SEGMENTS.reduce((s, u) => s + u.active, 0);

  const chips: { key: typeof segment; label: string }[] = [
    { key: "all", label: "All" },
    ...USER_SEGMENTS.map((s) => ({ key: s.key as typeof segment, label: s.label })),
  ];

  return (
    <Card className="sm:col-span-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total users · all portals
          </span>
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums">{total.toLocaleString()}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {active.toLocaleString()} active
          {selected ? ` · +${selected.newThisMonth} new this month` : " across every portal"}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setSegment(c.key)}
              className={_cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                segment === c.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AdminOverview() {
  const facilities = IMPLEMENTORS.reduce((s, i) => s + i.facilities, 0);
  const patients = IMPLEMENTORS.reduce((s, i) => s + i.patients, 0);
  const coverage = Math.round(
    IMPLEMENTORS.reduce((s, i) => s + i.coverage, 0) / IMPLEMENTORS.length,
  );
  const openAlerts = IMPLEMENTORS.reduce((s, i) => s + i.openAlerts, 0);

  const ranked = [...IMPLEMENTORS].sort((a, b) => b.coverage - a.coverage);
  const top = ranked.slice(0, 3);
  const bottom = ranked.slice(-3).reverse();

  return (
    <div className="space-y-6">
      <PageHeader
        title="National overview"
        description="Rollup across every implementor on the platform."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/implementors">
              All implementors <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TotalUsersCard />
        <Kpi icon={Building2} label="Facilities" value={String(facilities)} sub="Across 6 regions" />
        <Kpi
          icon={Users}
          label="Children enrolled"
          value={patients.toLocaleString()}
          sub="All programs"
        />
        <Kpi icon={Syringe} label="National coverage" value={`${coverage}%`} sub="Target 90%" />
        <Kpi
          icon={AlertTriangle}
          label="Open SE alerts"
          value={String(openAlerts)}
          sub="Cross-implementor"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">National coverage & adherence trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={NATIONAL_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip wrapperStyle={{ zIndex: 50 }} />
                <Area
                  type="monotone"
                  dataKey="coverage"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.18}
                  name="Coverage"
                />
                <Area
                  type="monotone"
                  dataKey="adherence"
                  stroke="var(--muted-foreground)"
                  fill="var(--muted-foreground)"
                  fillOpacity={0.1}
                  name="Adherence"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Latest SE alerts</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/se-alerts">All alerts</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {CROSS_ALERTS.filter((a) => a.status !== "resolved")
              .slice(0, 4)
              .map((a) => (
                <div key={a.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{a.name}</span>
                    <Badge
                      variant={a.severity === "critical" ? "destructive" : "secondary"}
                      className="capitalize"
                    >
                      {a.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {a.implementor} · {a.facility} · {a.reportedAt}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { title: "Top performing implementors", rows: top, tone: "text-primary" },
          { title: "Needs attention", rows: bottom, tone: "text-destructive" },
        ].map((block) => (
          <Card key={block.title}>
            <CardHeader>
              <CardTitle className="text-base">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {block.rows.map((i) => (
                <Link
                  key={i.slug}
                  to="/admin/implementors"
                  className="block rounded-md p-2 -m-2 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{i.name}</span>
                    <span className={cn("tabular-nums font-semibold", block.tone)}>
                      {i.coverage}%
                    </span>
                  </div>
                  <Progress value={i.coverage} className="mt-2 h-1.5" />
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {i.region} · {i.facilities} facilities · {i.patients.toLocaleString()} children
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}