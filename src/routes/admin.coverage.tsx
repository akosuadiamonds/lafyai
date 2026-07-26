import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NATIONAL_ANTIGENS, NATIONAL_LOCATIONS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/coverage")({
  head: () => ({
    meta: [
      { title: "National coverage — lafyai super admin" },
      {
        name: "description",
        content:
          "National antigen coverage and regional completion against the 90% immunization target.",
      },
      { property: "og:title", content: "National coverage — lafyai super admin" },
      {
        property: "og:description",
        content: "Antigen and regional coverage against the 90% target.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminCoverage,
});

function Bar({ value, target = 90 }: { value: number; target?: number }) {
  return (
    <div className="relative h-2 w-full rounded-full bg-muted">
      <div
        className={cn(
          "h-2 rounded-full",
          value >= target ? "bg-primary" : value >= target - 15 ? "bg-amber-500" : "bg-destructive",
        )}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
      <div
        className="absolute top-[-3px] h-3.5 w-px bg-foreground/60"
        style={{ left: `${target}%` }}
      />
    </div>
  );
}

function statusOf(value: number, target = 90) {
  if (value >= target) return { label: "On target", variant: "secondary" as const };
  if (value >= target - 15) return { label: "Watch", variant: "outline" as const };
  return { label: "At risk", variant: "destructive" as const };
}

function AdminCoverage() {
  const avgAntigen = Math.round(
    NATIONAL_ANTIGENS.reduce((s, a) => s + a.coverage, 0) / NATIONAL_ANTIGENS.length,
  );
  const avgLocation = Math.round(
    NATIONAL_LOCATIONS.reduce((s, l) => s + l.completion, 0) / NATIONAL_LOCATIONS.length,
  );
  const onTarget = NATIONAL_ANTIGENS.filter((a) => a.coverage >= a.target).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="National coverage"
        description="Coverage against the 90% target, by antigen and by region."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Avg antigen coverage", `${avgAntigen}%`, "Across 7 antigens"],
          ["Avg regional completion", `${avgLocation}%`, "6 regions reporting"],
          ["Antigens on target", `${onTarget}/${NATIONAL_ANTIGENS.length}`, "≥ 90% coverage"],
        ].map(([label, value, sub]) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="antigen">
        <TabsList>
          <TabsTrigger value="antigen">By antigen</TabsTrigger>
          <TabsTrigger value="location">By location</TabsTrigger>
        </TabsList>

        <TabsContent value="antigen">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">National antigen coverage</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Antigen</TableHead>
                    <TableHead className="w-64">Coverage vs 90% target</TableHead>
                    <TableHead className="text-right">Coverage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {NATIONAL_ANTIGENS.map((a) => {
                    const s = statusOf(a.coverage, a.target);
                    return (
                      <TableRow key={a.antigen}>
                        <TableCell className="font-medium">{a.antigen}</TableCell>
                        <TableCell>
                          <Bar value={a.coverage} target={a.target} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{a.coverage}%</TableCell>
                        <TableCell>
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regional completion</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-64">Completion</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Facilities</TableHead>
                    <TableHead className="text-right">Implementors</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {NATIONAL_LOCATIONS.map((l) => {
                    const s = statusOf(l.completion);
                    return (
                      <TableRow key={l.location}>
                        <TableCell className="font-medium">{l.location}</TableCell>
                        <TableCell>
                          <Bar value={l.completion} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{l.completion}%</TableCell>
                        <TableCell className="text-right tabular-nums">{l.facilities}</TableCell>
                        <TableCell className="text-right tabular-nums">{l.implementors}</TableCell>
                        <TableCell>
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}