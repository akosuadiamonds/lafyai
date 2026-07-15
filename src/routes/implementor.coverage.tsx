import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/lafy/page-header";
import { ANTIGENS, MONTHLY_TREND } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/coverage")({
  head: () => ({
    meta: [
      { title: "Coverage — lafyai" },
      { name: "description", content: "Antigen and dose coverage against the 90% target, filtered by engagement channel." },
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
        description="Antigen and dose coverage against the 90% national target, with dropout flags between paired doses."
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
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
                    <th className="py-2 pr-4 font-medium w-[45%]">Coverage vs. target</th>
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
                            <div className="relative h-2 w-full max-w-xs rounded-full bg-muted overflow-hidden">
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly coverage trend</CardTitle>
            <p className="text-xs text-muted-foreground">Fully immunized by 12 months.</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_TREND}>
                <defs>
                  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[50, 100]} unit="%" />
                <Tooltip />
                <ReferenceLine y={90} stroke="var(--color-chart-5)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="coverage" stroke="var(--color-primary)" strokeWidth={2} fill="url(#gc)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Feb — Aug 2026</span>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Export CSV</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}