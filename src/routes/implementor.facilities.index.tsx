import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Plus, MapPin, Activity, Users, TrendingUp, TrendingDown, Search, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/lafy/page-header";
import { SITES, REGION_DISTRICTS, TOP_FACILITIES, NEEDS_ATTENTION, FACILITY_ADHERENCE_TREND } from "@/lib/lafy-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/implementor/facilities/")({
  head: () => ({
    meta: [
      { title: "Facilities — lafyai" },
      { name: "description", content: "Per-site adherence, engagement, and response times." },
    ],
  }),
  component: FacilitiesPage,
});

type Facility = (typeof SITES)[number] & { region?: string; district?: string; type?: string };

function statusFor(v: number) {
  if (v >= 85) return { label: "On track", cls: "bg-primary/10 text-primary" };
  if (v >= 75) return { label: "Watch", cls: "bg-amber-100 text-amber-800" };
  return { label: "At risk", cls: "bg-destructive/10 text-destructive" };
}

const PAGE_SIZE = 8;

function FacilitiesPage() {
  const navigate = useNavigate();
  // Build a fuller catalogue so the paginated table has meaningful volume.
  const regionKeys = Object.keys(REGION_DISTRICTS);
  const types: Facility["type"][] = ["Public", "Private", "CHPS", "Faith-based"];
  const seed: Facility[] = SITES.flatMap((s, i) =>
    regionKeys.slice(0, 4).map((region, ri) => {
      const dList = REGION_DISTRICTS[region];
      const drift = (ri + 1) * 2;
      return {
        ...s,
        name: ri === 0 ? s.name : `${s.name.split(" ")[0]} ${region} ${ri}`,
        region,
        district: dList[(i + ri) % dList.length],
        type: types[(i + ri) % types.length],
        coverage: Math.max(45, Math.min(97, s.coverage + (ri % 2 === 0 ? drift : -drift))),
        adherence: Math.max(45, Math.min(98, s.adherence + (ri % 2 === 0 ? -drift : drift))),
        engagement: Math.max(40, Math.min(95, s.engagement + drift - 3)),
        d1: Math.max(40, Math.min(95, s.d1 + (ri % 2 === 0 ? drift : -drift))),
      };
    }),
  );
  const [facilities, setFacilities] = useState<Facility[]>(seed);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Facility | null>(null);
  const [perfOpen, setPerfOpen] = useState<null | "top" | "attn">(null);

  // Filters
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [district, setDistrict] = useState<string>("all");
  const [ftype, setFtype] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return facilities.filter((f) => {
      if (q && !f.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (region !== "all" && f.region !== region) return false;
      if (district !== "all" && f.district !== district) return false;
      if (ftype !== "all" && f.type !== ftype) return false;
      if (status !== "all") {
        const s = statusFor(f.coverage).label;
        if (status === "on" && s !== "On track") return false;
        if (status === "watch" && s !== "Watch") return false;
        if (status === "risk" && s !== "At risk") return false;
      }
      return true;
    });
  }, [facilities, q, region, district, ftype, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const districtOptions = region === "all"
    ? Array.from(new Set(facilities.map((f) => f.district).filter(Boolean) as string[]))
    : (REGION_DISTRICTS[region] ?? []);

  const avgAdherence = Math.round(facilities.reduce((s, f) => s + f.adherence, 0) / facilities.length);
  const latestTrend = FACILITY_ADHERENCE_TREND[FACILITY_ADHERENCE_TREND.length - 1].adherence;
  const firstTrend = FACILITY_ADHERENCE_TREND[0].adherence;
  const trendDelta = latestTrend - firstTrend;

  const resetFilters = () => {
    setQ(""); setRegion("all"); setDistrict("all"); setFtype("all"); setStatus("all"); setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facilities"
        description="Supported health facilities and their operational health."
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" /> Add facility
              </Button>
            </DialogTrigger>
            <AddFacilityDialog
              onCreate={(f) => {
                setFacilities((prev) => [f, ...prev]);
                setAddOpen(false);
                toast.success(`${f.name} added`);
              }}
            />
          </Dialog>
        }
      />

      {/* Adherence trend summary across all facilities */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Adherence trend across facilities
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Network-wide on-time adherence, last 8 weeks.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums">{avgAdherence}%</div>
            <div className={"text-xs font-medium " + (trendDelta >= 0 ? "text-primary" : "text-destructive")}>
              {trendDelta >= 0 ? "▲" : "▼"} {Math.abs(trendDelta)} pts vs. W-8
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FACILITY_ADHERENCE_TREND} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="fadhFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={32} />
                <RTooltip
                  wrapperStyle={{ zIndex: 50, outline: "none" }}
                  allowEscapeViewBox={{ x: true, y: true }}
                  contentStyle={{ background: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "Adherence"]}
                />
                <Area type="monotone" dataKey="adherence" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#fadhFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerfPanel
          tone="good"
          title="Top performing"
          icon={<TrendingUp className="h-4 w-4" />}
          rows={TOP_FACILITIES}
          onViewAll={() => setPerfOpen("top")}
        />
        <PerfPanel
          tone="bad"
          title="Needs attention"
          icon={<TrendingDown className="h-4 w-4" />}
          rows={NEEDS_ATTENTION}
          onViewAll={() => setPerfOpen("attn")}
        />
      </div>

      {/* Filters + paginated facility table */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> All facilities
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {filtered.length} of {facilities.length} facilities · page {currentPage} of {totalPages}
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search facility name…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Select value={region} onValueChange={(v) => { setRegion(v); setDistrict("all"); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {regionKeys.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={district} onValueChange={(v) => { setDistrict(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All districts</SelectItem>
                {districtOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={ftype} onValueChange={(v) => { setFtype(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {types.map((t) => <SelectItem key={t} value={t!}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="on">On track</SelectItem>
                <SelectItem value="watch">Watch</SelectItem>
                <SelectItem value="risk">At risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(q || region !== "all" || district !== "all" || ftype !== "all" || status !== "all") && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={resetFilters}>Clear filters</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead className="hidden md:table-cell">Region</TableHead>
                  <TableHead className="hidden lg:table-cell">District</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead className="text-right">Coverage</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Adherence</TableHead>
                  <TableHead className="text-right hidden md:table-cell">D-1</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      No facilities match these filters.
                    </TableCell>
                  </TableRow>
                )}
                {pageRows.map((f) => {
                  const st = statusFor(f.coverage);
                  return (
                    <TableRow
                      key={f.name}
                      onClick={() => setSelected(f)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{f.name}</div>
                            <div className="text-[11px] text-muted-foreground md:hidden">
                              {f.region}{f.district ? ` · ${f.district}` : ""}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{f.region}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{f.district}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{f.type}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{f.coverage}%</TableCell>
                      <TableCell className="text-right tabular-nums hidden sm:table-cell">{f.adherence}%</TableCell>
                      <TableCell className="text-right tabular-nums hidden md:table-cell">{f.d1}%</TableCell>
                      <TableCell>
                        <span className={"text-[11px] font-medium rounded-full px-2 py-0.5 " + st.cls}>{st.label}</span>
                      </TableCell>
                      <TableCell>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + (pageRows.length ? 1 : 0)}–
              {(currentPage - 1) * PAGE_SIZE + pageRows.length} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FacilityDetailDialog
        facility={selected}
        onClose={() => setSelected(null)}
        onOpenProfile={(f) => {
          setSelected(null);
          navigate({ to: "/implementor/facilities/$slug", params: { slug: encodeURIComponent(f.name) } });
        }}
      />

      <PerfDetailDialog
        open={perfOpen}
        onClose={() => setPerfOpen(null)}
        onOpenProfile={(name) => {
          setPerfOpen(null);
          navigate({ to: "/implementor/facilities/$slug", params: { slug: encodeURIComponent(name) } });
        }}
      />
    </div>
  );
}

function AddFacilityDialog({ onCreate }: { onCreate: (f: Facility) => void }) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("Nairobi");
  const [district, setDistrict] = useState(REGION_DISTRICTS.Nairobi[0]);
  const [type, setType] = useState("Public");
  const districts = REGION_DISTRICTS[region] ?? [];

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add facility</DialogTitle>
        <DialogDescription>
          Register a health facility to start tracking coverage and engagement.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="fname">Facility name</Label>
          <Input id="fname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ridge Hospital" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Region</Label>
            <Select
              value={region}
              onValueChange={(v) => {
                setRegion(v);
                setDistrict((REGION_DISTRICTS[v] ?? [""])[0]);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(REGION_DISTRICTS).map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>District</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Public", "Private", "CHPS", "Faith-based"].map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={!name.trim()}
          onClick={() =>
            onCreate({
              name: name.trim(),
              region,
              district,
              type,
              coverage: 0,
              adherence: 0,
              engagement: 0,
              d1: 0,
              seResp: "—",
              regTime: "—",
            })
          }
        >
          Create facility
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function PerfPanel({
  tone,
  title,
  icon,
  rows,
  onViewAll,
}: {
  tone: "good" | "bad";
  title: string;
  icon: React.ReactNode;
  rows: { name: string; region: string; babies: number; adherence: number }[];
  onViewAll: () => void;
}) {
  const accent = tone === "good" ? "text-primary" : "text-destructive";
  const chip = tone === "good" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive";
  const border = tone === "good" ? "border-l-primary" : "border-l-destructive";
  return (
    <div className={"rounded-xl border border-l-4 bg-card " + border}>
      <div className="px-5 py-3 border-b flex items-center justify-between">
        <h3 className={"text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 " + accent}>
          {icon} {title}
        </h3>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="h-7 text-xs">
          View details
        </Button>
      </div>
      <ul className="divide-y">
        {rows.slice(0, 3).map((r) => (
          <li key={r.name} className="px-5 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{r.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {r.region} · {r.babies} babies enrolled
              </div>
            </div>
            <span className={"text-[11px] font-semibold rounded-full px-2 py-0.5 tabular-nums " + chip}>
              {r.adherence}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PerfDetailDialog({
  open,
  onClose,
  onOpenProfile,
}: {
  open: null | "top" | "attn";
  onClose: () => void;
  onOpenProfile: (name: string) => void;
}) {
  const isTop = open === "top";
  const rows = isTop ? TOP_FACILITIES : NEEDS_ATTENTION;
  const accent = isTop ? "text-primary" : "text-destructive";
  const chip = isTop ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive";
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.adherence, 0) / rows.length) : 0;
  const babies = rows.reduce((s, r) => s + r.babies, 0);
  return (
    <Dialog open={!!open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className={"flex items-center gap-2 " + accent}>
            {isTop ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            {isTop ? "Top performing facilities" : "Facilities needing attention"}
          </DialogTitle>
          <DialogDescription>
            {isTop
              ? "Facilities exceeding regional benchmarks for adherence and coverage."
              : "Facilities with adherence gaps that warrant coaching or supply follow-up."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 py-1">
          <SummaryStat label="Facilities" value={rows.length.toString()} />
          <SummaryStat label="Avg. adherence" value={`${avg}%`} />
          <SummaryStat label="Babies enrolled" value={babies.toLocaleString()} />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead className="hidden sm:table-cell">Region</TableHead>
                <TableHead className="text-right">Babies</TableHead>
                <TableHead className="text-right">Adherence</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.name}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{r.region}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.babies}</TableCell>
                  <TableCell className="text-right">
                    <span className={"text-[11px] font-semibold rounded-full px-2 py-0.5 tabular-nums " + chip}>{r.adherence}%</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => onOpenProfile(r.name)}>
                      Open <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 bg-muted/30">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function FacilityDetailDialog({
  facility,
  onClose,
  onOpenProfile,
}: {
  facility: Facility | null;
  onClose: () => void;
  onOpenProfile: (f: Facility) => void;
}) {
  return (
    <Dialog open={!!facility} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {facility && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {facility.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {facility.region}</span>
                <span>·</span>
                <span>{facility.type}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              <Stat label="Coverage" value={`${facility.coverage}%`} />
              <Stat label="D-1 confirm" value={`${facility.d1}%`} />
              <Stat label="Engagement" value={`${facility.engagement}%`} />
              <Stat label="Adherence" value={`${facility.adherence}%`} />
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Operations
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Row label="SE response time" value={facility.seResp} />
                <Row label="Registration time" value={facility.regTime} />
                <Row label="Weekly sessions" value="6" />
                <Row label="Open SE alerts" value="2" />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary" /> Recent activity
              </h4>
              <ul className="text-sm space-y-2">
                <li className="text-muted-foreground">Batch DH-K2604 administered · 82 doses</li>
                <li className="text-muted-foreground">D-1 reminders sent · 148 caregivers</li>
                <li className="text-muted-foreground">1 SE alert escalated to regional</li>
              </ul>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={() => onOpenProfile(facility)}>Open full profile</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}