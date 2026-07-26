import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IMPLEMENTORS, type Implementor } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/implementors")({
  head: () => ({
    meta: [
      { title: "Implementors — lafyai super admin" },
      {
        name: "description",
        content:
          "Every implementor on the platform with facilities, programs, enrolment, coverage and adherence.",
      },
      { property: "og:title", content: "Implementors — lafyai super admin" },
      {
        property: "og:description",
        content: "Compare implementor performance across regions and programs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminImplementors,
});

const REGIONS = ["All regions", ...new Set(IMPLEMENTORS.map((i) => i.region))];
const STATUSES = ["All statuses", "active", "onboarding", "suspended"];

function AdminImplementors() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All regions");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState<Implementor | null>(null);

  const rows = useMemo(
    () =>
      IMPLEMENTORS.filter(
        (i) =>
          (region === "All regions" || i.region === region) &&
          (status === "All statuses" || i.status === status) &&
          (i.name.toLowerCase().includes(q.toLowerCase()) ||
            i.lead.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, region, status],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Implementors"
        description="Organisations running immunization programs on lafyai."
      />

      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-base">
            {rows.length} of {IMPLEMENTORS.length} implementors
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search implementor or lead…"
                className="pl-9"
              />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Implementor</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Facilities</TableHead>
                <TableHead className="text-right">Programs</TableHead>
                <TableHead className="text-right">Children</TableHead>
                <TableHead className="text-right">Coverage</TableHead>
                <TableHead className="text-right">Adherence</TableHead>
                <TableHead className="text-right">Open SE</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow key={i.slug}>
                  <TableCell>
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.lead}</div>
                  </TableCell>
                  <TableCell>{i.region}</TableCell>
                  <TableCell className="text-right tabular-nums">{i.facilities}</TableCell>
                  <TableCell className="text-right tabular-nums">{i.programs}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {i.patients.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{i.coverage}%</TableCell>
                  <TableCell className="text-right tabular-nums">{i.adherence}%</TableCell>
                  <TableCell className="text-right tabular-nums">{i.openAlerts}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        i.status === "active"
                          ? "secondary"
                          : i.status === "suspended"
                            ? "destructive"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {i.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(i)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">
                    No implementors match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Lead {selected.lead} · {selected.region} · {selected.status}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Facilities", selected.facilities],
                  ["Programs", selected.programs],
                  ["Cohorts", selected.cohorts],
                  ["Children enrolled", selected.patients.toLocaleString()],
                  ["Open SE alerts", selected.openAlerts],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-lg font-semibold tabular-nums">{value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Coverage</span>
                    <span className="font-semibold tabular-nums">{selected.coverage}%</span>
                  </div>
                  <Progress value={selected.coverage} className="mt-1 h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Adherence</span>
                    <span className="font-semibold tabular-nums">{selected.adherence}%</span>
                  </div>
                  <Progress value={selected.adherence} className="mt-1 h-2" />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}