import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Minus, MapPin, Building2, TrendingUp, AlertTriangle, Target, Activity, Syringe } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/lafy/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ANTIGENS, COVERAGE_BY_LOCATION, FACILITIES_BY_LOCATION } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/coverage")({
  head: () => ({
    meta: [
      { title: "Coverage — lafyai" },
      { name: "description", content: "Coverage by antigen and by location against the 90% target." },
    ],
  }),
  component: CoveragePage,
});

type Location = (typeof COVERAGE_BY_LOCATION)[number];

function CoveragePage() {
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);

  const avgAntigen = Math.round(ANTIGENS.reduce((s, a) => s + a.coverage, 0) / ANTIGENS.length);
  const avgLocation = Math.round(
    COVERAGE_BY_LOCATION.reduce((s, l) => s + l.completion, 0) / COVERAGE_BY_LOCATION.length,
  );
  const onTarget = COVERAGE_BY_LOCATION.filter((l) => l.completion >= 90).length;
  const belowTarget = COVERAGE_BY_LOCATION.length - onTarget;
  const worstDropout = ANTIGENS.reduce((m, a) => (a.dropout > m.dropout ? a : m), ANTIGENS[0]);
  const totalFacilities = COVERAGE_BY_LOCATION.reduce((s, l) => s + l.facilities, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coverage"
        description="Immunization coverage against the 90% national target."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Avg. antigen coverage"
          value={`${avgAntigen}%`}
          hint={`Target 90% · ${avgAntigen >= 90 ? "on track" : `${90 - avgAntigen} pts to go`}`}
          icon={<Syringe className="h-4 w-4 text-primary" />}
          tone={avgAntigen >= 90 ? "good" : avgAntigen >= 80 ? "warn" : "bad"}
        />
        <SummaryCard
          label="Avg. location completion"
          value={`${avgLocation}%`}
          hint={`${totalFacilities.toLocaleString()} facilities tracked`}
          icon={<Activity className="h-4 w-4 text-primary" />}
          tone={avgLocation >= 90 ? "good" : avgLocation >= 80 ? "warn" : "bad"}
        />
        <SummaryCard
          label="Locations on target"
          value={`${onTarget}/${COVERAGE_BY_LOCATION.length}`}
          hint={`${belowTarget} below 90%`}
          icon={<Target className="h-4 w-4 text-primary" />}
          tone={belowTarget === 0 ? "good" : belowTarget <= 2 ? "warn" : "bad"}
        />
        <SummaryCard
          label="Highest dropout"
          value={`${worstDropout.dropout}%`}
          hint={worstDropout.antigen}
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          tone={worstDropout.dropout > 10 ? "bad" : worstDropout.dropout > 5 ? "warn" : "good"}
        />
      </div>

      <Tabs defaultValue="antigen" className="space-y-4">
        <TabsList>
          <TabsTrigger value="antigen">By antigen</TabsTrigger>
          <TabsTrigger value="location">By location</TabsTrigger>
        </TabsList>

        <TabsContent value="antigen">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Antigen & dose coverage</CardTitle>
                <Badge variant="outline" className="border-primary text-primary">Target 90%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                      <th className="py-2 pr-4 font-medium">Antigen / dose</th>
                      <th className="py-2 pr-4 font-medium w-[50%]">Coverage vs. target</th>
                      <th className="py-2 pr-4 font-medium">Dropout</th>
                      <th className="py-2 pr-4 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ANTIGENS.map((a) => {
                      const cov = a.coverage;
                      const meets = cov >= 90;
                      return (
                        <tr key={a.antigen} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">{a.antigen}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-2 w-full max-w-md rounded-full bg-muted overflow-hidden">
                                <div
                                  className={"h-full " + (meets ? "bg-primary" : cov >= 80 ? "bg-amber-500" : "bg-destructive")}
                                  style={{ width: `${cov}%` }}
                                />
                                <div className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-foreground/70" style={{ left: "90%" }} />
                              </div>
                              <span className="tabular-nums text-xs w-10 text-right">{cov}%</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            {a.dropout > 10 ? (
                              <Badge variant="destructive">{a.dropout}%</Badge>
                            ) : a.dropout > 5 ? (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{a.dropout}%</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">{a.dropout > 0 ? `${a.dropout}%` : "—"}</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {a.trend === "up" ? (
                              <ArrowUp className="h-4 w-4 text-primary" />
                            ) : a.trend === "down" ? (
                              <ArrowDown className="h-4 w-4 text-destructive" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Coverage by location</CardTitle>
                <Badge variant="outline" className="border-primary text-primary">Target 90%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                      <th className="py-2 pr-4 font-medium">Location</th>
                      <th className="py-2 pr-4 font-medium w-[50%]">Completion rate</th>
                      <th className="py-2 pr-4 font-medium text-right">Total facilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COVERAGE_BY_LOCATION.map((r) => {
                      const c = r.completion;
                      const meets = c >= 90;
                      return (
                        <tr
                          key={r.location}
                          onClick={() => setSelectedLoc(r)}
                          className="border-b last:border-0 cursor-pointer hover:bg-muted/40"
                        >
                          <td className="py-3 pr-4 font-medium">
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {r.location}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-2 w-full max-w-md rounded-full bg-muted overflow-hidden">
                                <div
                                  className={"h-full " + (meets ? "bg-primary" : c >= 75 ? "bg-amber-500" : "bg-destructive")}
                                  style={{ width: `${c}%` }}
                                />
                                <div className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-foreground/70" style={{ left: "90%" }} />
                              </div>
                              <span className="tabular-nums text-xs w-10 text-right">{c}%</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums">{r.facilities}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LocationInsightsDialog location={selectedLoc} onClose={() => setSelectedLoc(null)} />
    </div>
  );
}

function LocationInsightsDialog({
  location,
  onClose,
}: {
  location: Location | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!location} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {location && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {location.location}
              </DialogTitle>
              <DialogDescription>
                Regional insights, gaps, and top-performing antigens.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-3 py-2">
              <MiniStat label="Completion" value={`${location.completion}%`} icon={<TrendingUp className="h-4 w-4 text-primary" />} />
              <MiniStat label="Facilities" value={String(location.facilities)} icon={<Building2 className="h-4 w-4 text-primary" />} />
              <MiniStat label="Gap to target" value={`${Math.max(0, 90 - location.completion)} pts`} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} />
            </div>
            <FacilitiesInLocation locationName={location.location} />
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">Antigen coverage in {location.location}</h4>
              <div className="space-y-2">
                {ANTIGENS.slice(0, 6).map((a) => {
                  const v = Math.max(0, Math.min(100, Math.round((a.coverage * location.completion) / 82)));
                  const bar = v >= 90 ? "bg-primary" : v >= 75 ? "bg-amber-500" : "bg-destructive";
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
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  icon,
  tone = "good",
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone?: "good" | "warn" | "bad";
}) {
  const bar = tone === "good" ? "bg-primary" : tone === "warn" ? "bg-amber-500" : "bg-destructive";
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-2 flex items-center gap-2">
        <span className={"inline-block h-1.5 w-8 rounded-full " + bar} />
        <span className="text-[11px] text-muted-foreground truncate">{hint}</span>
      </div>
    </div>
  );
}

function FacilitiesInLocation({ locationName }: { locationName: string }) {
  const facilities = FACILITIES_BY_LOCATION[locationName] ?? [];
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" /> Facilities in {locationName}
        </h4>
        <span className="text-[11px] text-muted-foreground">{facilities.length} listed</span>
      </div>
      {facilities.length === 0 ? (
        <div className="text-xs text-muted-foreground py-4 text-center">No facility roster available.</div>
      ) : (
        <ul className="divide-y">
          {facilities.map((f) => {
            const bar = f.coverage >= 90 ? "bg-primary" : f.coverage >= 80 ? "bg-amber-500" : "bg-destructive";
            return (
              <li key={f.name} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to="/implementor/facilities/$slug"
                      params={{ slug: encodeURIComponent(f.name) }}
                      className="text-sm font-medium hover:text-primary truncate block"
                    >
                      {f.name}
                    </Link>
                    <div className="text-[11px] text-muted-foreground">
                      {f.district} · {f.type} · {f.babies} enrolled
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-40">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className={"h-full " + bar} style={{ width: `${f.coverage}%` }} />
                    </div>
                    <span className="text-xs tabular-nums font-semibold w-9 text-right">{f.coverage}%</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}