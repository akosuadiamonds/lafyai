import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Minus, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/lafy/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ANTIGENS, COVERAGE_BY_LOCATION } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/coverage")({
  head: () => ({
    meta: [
      { title: "Coverage — lafyai" },
      { name: "description", content: "Coverage by antigen and by location against the 90% target." },
    ],
  }),
  component: CoveragePage,
});

const CHANNEL_FILTERS = ["All", "WhatsApp", "Voice"] as const;
type Channel = (typeof CHANNEL_FILTERS)[number];

function CoveragePage() {
  const [channel, setChannel] = useState<Channel>("All");

  const adj = (v: number) => {
    if (channel === "WhatsApp") return Math.min(100, Math.round(v * 1.04));
    if (channel === "Voice") return Math.max(0, Math.round(v * 0.94));
    return v;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coverage"
        description="Immunization coverage against the 90% national target."
        actions={
          <div className="inline-flex rounded-md border p-0.5 bg-background">
            {CHANNEL_FILTERS.map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={
                  "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors " +
                  (channel === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
                }
              >
                {c}
              </button>
            ))}
          </div>
        }
      />

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
                      const cov = adj(a.coverage);
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
                      const c = adj(r.completion);
                      const meets = c >= 90;
                      return (
                        <tr key={r.location} className="border-b last:border-0">
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
    </div>
  );
}