import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  MapPin,
  ArrowLeft,
  Activity,
  Users,
  Syringe,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/lafy/page-header";
import { SITES, PROGRAMS, ANTIGENS, SE_ALERTS } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/facilities/$slug")({
  head: () => ({
    meta: [{ title: "Facility profile — lafyai" }],
  }),
  component: FacilityProfilePage,
});

function FacilityProfilePage() {
  const { slug } = Route.useParams();
  const name = decodeURIComponent(slug);
  const s = SITES.find((x) => x.name === name);

  if (!s) {
    return (
      <div className="space-y-4">
        <Link to="/implementor/facilities" className="text-sm text-primary inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to facilities
        </Link>
        <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
          Facility not found.
        </div>
      </div>
    );
  }

  const facilityPrograms = PROGRAMS.slice(0, 3).map((p, i) => ({
    ...p,
    coverage: Math.max(0, Math.min(100, s.coverage - i * 5)),
    enrolled: 280 - i * 60,
    alerts: i === 0 ? 2 : i === 1 ? 1 : 0,
  }));

  const relatedAlerts = SE_ALERTS.filter((a) => a.facility.includes(name.split(" ")[0]));

  return (
    <div className="space-y-6">
      <Link to="/implementor/facilities" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to facilities
      </Link>

      <PageHeader
        title={s.name}
        description="Nairobi · Public facility"
        actions={<Badge className="bg-primary/10 text-primary hover:bg-primary/10">Active</Badge>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Coverage" value={`${s.coverage}%`} icon={<TrendingUp className="h-4 w-4 text-primary" />} />
        <Stat label="Adherence" value={`${s.adherence}%`} icon={<Activity className="h-4 w-4 text-primary" />} />
        <Stat label="Engagement" value={`${s.engagement}%`} icon={<Users className="h-4 w-4 text-primary" />} />
        <Stat label="D-1 confirm" value={`${s.d1}%`} icon={<Calendar className="h-4 w-4 text-primary" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Active insights by program
          </CardTitle>
          <p className="text-xs text-muted-foreground">Performance across the programs this facility participates in.</p>
        </CardHeader>
        <CardContent className="divide-y">
          {facilityPrograms.map((p) => {
            const bar = p.coverage >= 90 ? "bg-primary" : p.coverage >= 80 ? "bg-amber-500" : "bg-destructive";
            return (
              <div key={p.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.enrolled} enrolled · {p.alerts} open alert{p.alerts === 1 ? "" : "s"}
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{p.coverage}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div className={"h-full " + bar} style={{ width: `${p.coverage}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Syringe className="h-4 w-4 text-primary" /> Antigen coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ANTIGENS.slice(0, 6).map((a) => {
              const v = Math.max(0, Math.min(100, Math.round((a.coverage * s.coverage) / 82)));
              const bar = v >= 90 ? "bg-primary" : v >= 80 ? "bg-amber-500" : "bg-destructive";
              return (
                <div key={a.antigen} className="grid grid-cols-[110px_1fr_40px] items-center gap-3 text-xs">
                  <span className="font-medium truncate">{a.antigen}</span>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={"h-full " + bar} style={{ width: `${v}%` }} />
                  </div>
                  <span className="tabular-nums text-right">{v}%</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Recent SE alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {relatedAlerts.length === 0 && (
              <div className="py-6 text-sm text-muted-foreground text-center">No recent alerts.</div>
            )}
            {relatedAlerts.map((a) => (
              <div key={a.id} className="py-3 first:pt-0 last:pb-0">
                <div className="text-sm font-medium">{a.detail}</div>
                <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                  {a.id} · {a.dose} · {a.severity} · {a.reportedAt}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}