import { createFileRoute } from "@tanstack/react-router";
import { Building2, Clock, Signal, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/lafy/page-header";
import { SITES } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/facilities")({
  head: () => ({
    meta: [
      { title: "Facilities — lafyai" },
      { name: "description", content: "Per-site adherence, engagement, D-1 confirmation, and response-time comparison." },
    ],
  }),
  component: FacilitiesPage,
});

function statusFor(v: number) {
  if (v >= 85) return { label: "On track", cls: "bg-primary/10 text-primary" };
  if (v >= 75) return { label: "Watch", cls: "bg-amber-100 text-amber-800" };
  return { label: "At risk", cls: "bg-destructive/10 text-destructive" };
}

function FacilitiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Facilities"
        description="Compare supported health facilities on the operational metrics that drive coverage."
        actions={<Button size="sm" variant="outline">Add facility</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SITES.map((s) => {
          const st = statusFor(s.coverage);
          return (
            <Card key={s.name}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">Nairobi · public</div>
                    </div>
                  </div>
                  <span className={"text-[11px] font-medium rounded-full px-2 py-0.5 " + st.cls}>{st.label}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-semibold tabular-nums">{s.coverage}%</div>
                    <div className="text-[11px] text-muted-foreground">Coverage</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold tabular-nums">{s.d1}%</div>
                    <div className="text-[11px] text-muted-foreground">D-1 confirm</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold tabular-nums">{s.engagement}%</div>
                    <div className="text-[11px] text-muted-foreground">Engagement</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> SE {s.seResp}</span>
                  <span className="inline-flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> Reg {s.regTime}</span>
                  <span className="inline-flex items-center gap-1"><Signal className="h-3.5 w-3.5" /> Adh {s.adherence}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Side-by-side comparison</CardTitle>
            <Badge variant="secondary">6 sites</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                  <th className="py-2 pr-4 font-medium">Facility</th>
                  <th className="py-2 pr-4 font-medium">Adherence</th>
                  <th className="py-2 pr-4 font-medium">Engagement</th>
                  <th className="py-2 pr-4 font-medium">D-1 confirmation</th>
                  <th className="py-2 pr-4 font-medium">SE response</th>
                  <th className="py-2 pr-4 font-medium">Registration time</th>
                  <th className="py-2 pr-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {SITES.map((s) => {
                  const st = statusFor(s.coverage);
                  return (
                    <tr key={s.name} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{s.name}</td>
                      <td className="py-3 pr-4 tabular-nums">{s.adherence}%</td>
                      <td className="py-3 pr-4 tabular-nums">{s.engagement}%</td>
                      <td className="py-3 pr-4 tabular-nums">{s.d1}%</td>
                      <td className="py-3 pr-4 tabular-nums">{s.seResp}</td>
                      <td className="py-3 pr-4 tabular-nums">{s.regTime}</td>
                      <td className="py-3 pr-4 text-right">
                        <span className={"text-[11px] font-medium rounded-full px-2 py-0.5 " + st.cls}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}