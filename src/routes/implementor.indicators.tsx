import { createFileRoute } from "@tanstack/react-router";
import { Check, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/lafy/page-header";
import { ME_INDICATORS, QUALITATIVE, SAFETY_LOG } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/indicators")({
  head: () => ({
    meta: [
      { title: "M&E Indicators — lafyai" },
      { name: "description", content: "§7.2 monitoring & evaluation indicators, qualitative checklist, and safety log." },
    ],
  }),
  component: IndicatorsPage,
});

function progressFor(i: typeof ME_INDICATORS[number]) {
  if (i.invert) {
    // lower is better: baseline is start, target is goal (smaller)
    const span = i.baseline - i.target;
    const done = Math.max(0, Math.min(span, i.baseline - i.current));
    return Math.round((done / span) * 100);
  }
  const span = i.target - i.baseline;
  const done = Math.max(0, Math.min(span, i.current - i.baseline));
  return Math.round((done / span) * 100);
}

function statusFor(pct: number) {
  if (pct >= 90) return { label: "On target", cls: "bg-primary/10 text-primary" };
  if (pct >= 60) return { label: "On track", cls: "bg-emerald-100 text-emerald-800" };
  if (pct >= 30) return { label: "Watch", cls: "bg-amber-100 text-amber-800" };
  return { label: "At risk", cls: "bg-destructive/10 text-destructive" };
}

function IndicatorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="M&E indicators"
        description="The seven §7.2 program indicators with baseline, target, current value, and source of truth."
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                  <th className="py-3 px-5 font-medium">§ Indicator</th>
                  <th className="py-3 px-2 font-medium tabular-nums">Baseline</th>
                  <th className="py-3 px-2 font-medium tabular-nums">Target</th>
                  <th className="py-3 px-2 font-medium tabular-nums">Current</th>
                  <th className="py-3 px-4 font-medium w-[24%]">Progress</th>
                  <th className="py-3 px-2 font-medium">Status</th>
                  <th className="py-3 px-2 font-medium">Source</th>
                  <th className="py-3 px-5 font-medium">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {ME_INDICATORS.map((i) => {
                  const pct = progressFor(i);
                  const st = statusFor(pct);
                  const suffix = i.unit ?? "%";
                  return (
                    <tr key={i.code} className="border-b last:border-0">
                      <td className="py-4 px-5">
                        <div className="font-medium">{i.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">§{i.code}</div>
                      </td>
                      <td className="py-4 px-2 tabular-nums text-muted-foreground">{i.baseline}{suffix}</td>
                      <td className="py-4 px-2 tabular-nums font-medium">{i.target}{suffix}</td>
                      <td className="py-4 px-2 tabular-nums font-semibold">{i.current}{suffix}</td>
                      <td className="py-4 px-4">
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${Math.max(4, pct)}%` }} />
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">{pct}% to target</div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={"text-[11px] font-medium rounded-full px-2 py-0.5 " + st.cls}>{st.label}</span>
                      </td>
                      <td className="py-4 px-2 text-xs text-muted-foreground">{i.source}</td>
                      <td className="py-4 px-5 text-xs text-muted-foreground">{i.frequency}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Qualitative indicator checklist</CardTitle>
            <p className="text-xs text-muted-foreground">Quarterly qualitative activities.</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {QUALITATIVE.map((q) => (
                <li key={q.item} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <span
                    className={
                      "mt-0.5 h-5 w-5 rounded-md grid place-items-center shrink-0 " +
                      (q.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border")
                    }
                  >
                    {q.done ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className={"text-sm " + (q.done ? "text-foreground" : "text-muted-foreground")}>{q.item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" /> Safety & ethics log
            </CardTitle>
            <p className="text-xs text-muted-foreground">AEFI, cold-chain, and data-privacy events.</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {SAFETY_LOG.map((e, i) => (
                <li key={i} className="rounded-md border p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{e.date} · {e.site}</span>
                    <Badge variant={e.status === "Closed" ? "outline" : "secondary"}>{e.status}</Badge>
                  </div>
                  <div className="mt-1.5 text-sm font-medium">{e.type}</div>
                  <div className="text-sm text-muted-foreground">{e.note}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}