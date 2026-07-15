import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/lafy/page-header";
import { COHORT, DOSE_FORECAST, FOLLOWUP_QUEUE } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/cohort")({
  head: () => ({
    meta: [
      { title: "Cohort & Follow-up — lafyai" },
      { name: "description", content: "Cohort funnel, 4-week dose forecast, and anonymized follow-up queue." },
    ],
  }),
  component: CohortPage,
});

function CohortPage() {
  const top = COHORT[0].value;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohort & follow-up"
        description="How caregivers move from registration through attendance, what's coming due, and who needs a nudge."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cohort funnel</CardTitle>
            <p className="text-xs text-muted-foreground">Cumulative caregivers across program lifecycle.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {COHORT.map((s, i) => {
                const pct = Math.round((s.value / top) * 100);
                const prev = i === 0 ? null : COHORT[i - 1];
                const conv = prev ? Math.round((s.value / prev.value) * 100) : 100;
                return (
                  <div key={s.stage}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.stage}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {s.value.toLocaleString()} · {pct}% of top{prev ? ` · ${conv}% step conv.` : ""}
                      </span>
                    </div>
                    <div className="mt-1.5 h-9 rounded-md bg-muted overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 flex items-center px-3 text-xs font-medium text-primary-foreground"
                        style={{ width: `${pct}%` }}
                      >
                        {s.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">4-week doses-due forecast</CardTitle>
            <p className="text-xs text-muted-foreground">By antigen, next 28 days.</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={DOSE_FORECAST}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="penta" stackId="a" fill="var(--color-primary)" name="Penta" />
                <Bar dataKey="measles" stackId="a" fill="var(--color-chart-2)" name="Measles" />
                <Bar dataKey="opv" stackId="a" fill="var(--color-chart-3)" name="OPV" />
                <Bar dataKey="pcv" stackId="a" fill="var(--color-chart-4)" name="PCV" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Follow-up queue</CardTitle>
            <Badge variant="outline">Read-only · anonymized</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Anonymized IDs. Personal data is not visible to implementors.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                  <th className="py-2 pr-4 font-medium">Child ID</th>
                  <th className="py-2 pr-4 font-medium">Age</th>
                  <th className="py-2 pr-4 font-medium">Due dose</th>
                  <th className="py-2 pr-4 font-medium">Days late</th>
                  <th className="py-2 pr-4 font-medium">Channel</th>
                  <th className="py-2 pr-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {FOLLOWUP_QUEUE.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{r.id}</td>
                    <td className="py-3 pr-4">{r.ageMo} mo</td>
                    <td className="py-3 pr-4">{r.dueDose}</td>
                    <td className="py-3 pr-4">
                      <span className={"tabular-nums text-xs font-medium " + (r.daysLate >= 5 ? "text-destructive" : "text-amber-700")}>
                        {r.daysLate}d
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.channel}</td>
                    <td className="py-3 pr-4 text-right">
                      <Badge
                        variant="outline"
                        className={
                          r.status === "Confirmed"
                            ? "border-primary text-primary"
                            : r.status === "Escalated"
                              ? "border-destructive text-destructive"
                              : ""
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}