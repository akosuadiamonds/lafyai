import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_PROGRAMS, IMPLEMENTORS } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/programs")({
  head: () => ({
    meta: [
      { title: "Programs across implementors — lafyai super admin" },
      {
        name: "description",
        content:
          "Every immunization program on the platform with cohorts, enrolment and completion by implementor.",
      },
      { property: "og:title", content: "Programs across implementors — lafyai super admin" },
      {
        property: "og:description",
        content: "Cohorts, enrolment and completion for every program on lafyai.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPrograms,
});

const OWNERS = ["All implementors", ...IMPLEMENTORS.map((i) => i.name)];

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

function AdminPrograms() {
  const [owner, setOwner] = useState("All implementors");

  const rows = useMemo(
    () =>
      ADMIN_PROGRAMS.filter((p) => owner === "All implementors" || p.implementor === owner),
    [owner],
  );

  const active = ADMIN_PROGRAMS.filter((p) => p.status === "active").length;
  const cohorts = ADMIN_PROGRAMS.reduce((s, p) => s + p.cohorts, 0);
  const enrolled = ADMIN_PROGRAMS.reduce((s, p) => s + p.enrolled, 0);
  const avgCompletion = Math.round(
    ADMIN_PROGRAMS.reduce((s, p) => s + p.completion, 0) / ADMIN_PROGRAMS.length,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programs"
        description="All programs and cohorts running across implementors."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Programs"
          value={String(ADMIN_PROGRAMS.length)}
          sub={`${active} active · ${ADMIN_PROGRAMS.length - active} closed`}
        />
        <Stat label="Cohorts" value={String(cohorts)} sub="Across all programs" />
        <Stat label="Children enrolled" value={enrolled.toLocaleString()} sub="Cumulative" />
        <Stat label="Avg completion" value={`${avgCompletion}%`} sub="Schedule completion" />
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Program register</CardTitle>
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
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Implementor</TableHead>
                <TableHead className="text-right">Cohorts</TableHead>
                <TableHead className="text-right">Enrolled</TableHead>
                <TableHead className="w-48">Completion</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.implementor}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.cohorts}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.enrolled.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={p.completion} className="h-1.5" />
                      <span className="text-xs tabular-nums w-9 text-right">{p.completion}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={p.status === "active" ? "secondary" : "outline"}
                      className="capitalize"
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}