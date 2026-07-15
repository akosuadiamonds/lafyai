import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Clock, Signal, UserCheck, Plus, MapPin, Activity, Users, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/lafy/page-header";
import { SITES, REGION_DISTRICTS, TOP_FACILITIES, NEEDS_ATTENTION } from "@/lib/lafy-data";
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

function FacilitiesPage() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>(
    SITES.map((s, i) => ({
      ...s,
      region: "Nairobi",
      district: REGION_DISTRICTS.Nairobi[i % REGION_DISTRICTS.Nairobi.length],
      type: "Public",
    })),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Facility | null>(null);

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

      {/* Performance tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerfPanel
          tone="good"
          title="Top performing"
          icon={<TrendingUp className="h-4 w-4" />}
          rows={TOP_FACILITIES}
        />
        <PerfPanel
          tone="bad"
          title="Needs attention"
          icon={<TrendingDown className="h-4 w-4" />}
          rows={NEEDS_ATTENTION}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {facilities.map((s) => {
          const st = statusFor(s.coverage);
          return (
            <button
              key={s.name}
              onClick={() => setSelected(s)}
              className="text-left"
            >
              <Card className="hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.region}{s.district ? ` · ${s.district}` : ""} · {s.type}
                        </div>
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
            </button>
          );
        })}
      </div>

      <FacilityDetailDialog
        facility={selected}
        onClose={() => setSelected(null)}
        onOpenProfile={(f) => {
          setSelected(null);
          navigate({ to: "/implementor/facilities/$slug", params: { slug: encodeURIComponent(f.name) } });
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
}: {
  tone: "good" | "bad";
  title: string;
  icon: React.ReactNode;
  rows: { name: string; region: string; babies: number; adherence: number }[];
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
        <span className="text-[11px] text-muted-foreground">{rows.length} facilities</span>
      </div>
      <ul className="divide-y">
        {rows.slice(0, 5).map((r) => (
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