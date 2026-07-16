import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban, Plus, Users, Calendar as CalendarIcon, MoreHorizontal, Pencil, Trash2, PlayCircle, PauseCircle, Layers, CheckCircle2, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/lafy/page-header";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/implementor/programs")({
  head: () => ({
    meta: [
      { title: "Programs — lafyai" },
      { name: "description", content: "Create programs and manage cohorts underneath each program." },
    ],
  }),
  component: ProgramsPage,
});

type Cohort = {
  id: string;
  name: string;
  ageBand: string;
  size: number;
  expectedDate?: string;
  status: "active" | "closed";
};
type Program = {
  id: string;
  name: string;
  description: string;
  antigen: string;
  startDate: string;
  endDate?: string;
  cohorts: Cohort[];
};

const SEED: Program[] = [
  {
    id: "epi-2026",
    name: "National immunization & Vitamin A",
    description: "Routine EPI schedule plus Vitamin A supplementation.",
    antigen: "Mixed",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    cohorts: [
      { id: "c1", name: "Q3 2026 · 6-week intake", ageBand: "6 weeks", size: 412, status: "active" },
      { id: "c2", name: "Q3 2026 · 14-week intake", ageBand: "14 weeks", size: 298, status: "active" },
      { id: "c3", name: "Q2 2026 · Measles 1", ageBand: "9 months", size: 188, status: "closed" },
    ],
  },
  {
    id: "polio-2026",
    name: "Polio eradication",
    description: "OPV supplementary rounds in high-risk sub-counties.",
    antigen: "OPV",
    startDate: "2026-03-15",
    endDate: "2026-09-30",
    cohorts: [
      { id: "c4", name: "Round 2 · Nairobi informal", ageBand: "0–59 months", size: 1240, status: "active" },
    ],
  },
];

function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(SEED);
  const [addProgramOpen, setAddProgramOpen] = useState(false);
  const [cohortFor, setCohortFor] = useState<Program | null>(null);
  const [editCohort, setEditCohort] = useState<{ program: Program; cohort: Cohort } | null>(null);
  const [deleteCohort, setDeleteCohort] = useState<{ program: Program; cohort: Cohort } | null>(null);

  const updateCohort = (programId: string, cohortId: string, patch: Partial<Cohort>) => {
    setPrograms((prev) =>
      prev.map((pr) =>
        pr.id === programId
          ? { ...pr, cohorts: pr.cohorts.map((c) => (c.id === cohortId ? { ...c, ...patch } : c)) }
          : pr,
      ),
    );
  };
  const removeCohort = (programId: string, cohortId: string) => {
    setPrograms((prev) =>
      prev.map((pr) => (pr.id === programId ? { ...pr, cohorts: pr.cohorts.filter((c) => c.id !== cohortId) } : pr)),
    );
  };

  const today = new Date().toISOString().slice(0, 10);
  const totalPrograms = programs.length;
  const activePrograms = programs.filter(
    (p) => (!p.endDate || p.endDate >= today) && p.startDate <= today,
  ).length;
  const allCohorts = programs.flatMap((p) => p.cohorts);
  const totalCohorts = allCohorts.length;
  const activeCohorts = allCohorts.filter((c) => c.status === "active").length;
  const totalEnrolled = allCohorts.reduce((s, c) => s + (c.size || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programs"
        description="Group cohorts under the program they belong to. Each cohort tracks its own eligibility, coverage, and follow-up."
        actions={
          <Dialog open={addProgramOpen} onOpenChange={setAddProgramOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" /> New program
              </Button>
            </DialogTrigger>
            <NewProgramDialog
              onCreate={(p) => {
                setPrograms((prev) => [p, ...prev]);
                setAddProgramOpen(false);
                toast.success(`Program "${p.name}" created`);
              }}
            />
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Programs"
          value={totalPrograms}
          hint={`${activePrograms} active`}
          icon={<FolderKanban className="h-4 w-4 text-primary" />}
        />
        <StatCard
          label="Cohorts"
          value={totalCohorts}
          hint={`${activeCohorts} active · ${totalCohorts - activeCohorts} closed`}
          icon={<Layers className="h-4 w-4 text-primary" />}
        />
        <StatCard
          label="Active cohorts"
          value={activeCohorts}
          hint={totalCohorts ? `${Math.round((activeCohorts / totalCohorts) * 100)}% of all cohorts` : "—"}
          icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
        />
        <StatCard
          label="Total enrolled"
          value={totalEnrolled.toLocaleString()}
          hint="Across all cohorts"
          icon={<UserCheck className="h-4 w-4 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {programs.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.description}</div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {p.startDate}{p.endDate ? ` → ${p.endDate}` : ""}</span>
                      <span>·</span>
                      <span>{p.antigen}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.cohorts.length} cohorts</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCohortFor(p)}>
                  <Plus className="h-4 w-4" /> Add cohort
                </Button>
              </div>

              <div className="mt-4 border-t pt-3 divide-y">
                {p.cohorts.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No cohorts yet. Add the first cohort to start tracking.
                  </div>
                ) : (
                  p.cohorts.map((c) => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.ageBand}
                          {c.expectedDate ? ` · expected ${c.expectedDate}` : ""}
                          {c.size ? ` · ${c.size.toLocaleString()} enrolled` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.status === "active" ? "outline" : "secondary"} className={c.status === "active" ? "border-primary text-primary" : ""}>
                          {c.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditCohort({ program: p, cohort: c })}>
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {c.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  updateCohort(p.id, c.id, { status: "closed" });
                                  toast.success(`Cohort "${c.name}" closed`);
                                }}
                              >
                                <PauseCircle className="h-4 w-4" /> Close cohort
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  updateCohort(p.id, c.id, { status: "active" });
                                  toast.success(`Cohort "${c.name}" activated`);
                                }}
                              >
                                <PlayCircle className="h-4 w-4" /> Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteCohort({ program: p, cohort: c })}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!cohortFor} onOpenChange={(o) => !o && setCohortFor(null)}>
        {cohortFor && (
          <NewCohortDialog
            program={cohortFor}
            onCreate={(cohort) => {
              setPrograms((prev) =>
                prev.map((pr) => (pr.id === cohortFor.id ? { ...pr, cohorts: [...pr.cohorts, cohort] } : pr)),
              );
              setCohortFor(null);
              toast.success(`Cohort added to ${cohortFor.name}`);
            }}
          />
        )}
      </Dialog>

      <Dialog open={!!editCohort} onOpenChange={(o) => !o && setEditCohort(null)}>
        {editCohort && (
          <EditCohortDialog
            program={editCohort.program}
            cohort={editCohort.cohort}
            onSave={(patch) => {
              updateCohort(editCohort.program.id, editCohort.cohort.id, patch);
              setEditCohort(null);
              toast.success("Cohort updated");
            }}
          />
        )}
      </Dialog>

      <AlertDialog open={!!deleteCohort} onOpenChange={(o) => !o && setDeleteCohort(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete cohort?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{deleteCohort?.cohort.name}" from {deleteCohort?.program.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteCohort) {
                  removeCohort(deleteCohort.program.id, deleteCohort.cohort.id);
                  toast.success(`Cohort "${deleteCohort.cohort.name}" deleted`);
                  setDeleteCohort(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NewProgramDialog({ onCreate }: { onCreate: (p: Program) => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [antigen, setAntigen] = useState("Mixed");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create program</DialogTitle>
        <DialogDescription>
          A program groups related cohorts (e.g. National immunization, Polio rounds).
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="pname">Name</Label>
          <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Yellow Fever campaign" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pdesc">Description</Label>
          <Textarea id="pdesc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Purpose, scope, target population…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Primary antigen</Label>
            <Select value={antigen} onValueChange={setAntigen}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Mixed", "OPV", "Penta", "Measles-Rubella", "PCV", "Yellow Fever", "Vitamin A"].map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pstart">Start date</Label>
            <Input id="pstart" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="pend">End date</Label>
            <Input
              id="pend"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={!name.trim() || (endDate !== "" && endDate < startDate)}
          onClick={() =>
            onCreate({
              id: `prog-${Date.now()}`,
              name: name.trim(),
              description: desc.trim() || "—",
              antigen,
              startDate,
              endDate: endDate || undefined,
              cohorts: [],
            })
          }
        >
          Create program
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function EditCohortDialog({
  program,
  cohort,
  onSave,
}: {
  program: Program;
  cohort: Cohort;
  onSave: (patch: Partial<Cohort>) => void;
}) {
  const [name, setName] = useState(cohort.name);
  const [ageBand, setAgeBand] = useState(cohort.ageBand);
  const [size, setSize] = useState<number>(cohort.size);
  const [status, setStatus] = useState<Cohort["status"]>(cohort.status);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit cohort · {program.name}</DialogTitle>
        <DialogDescription>Update cohort details or change its status.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="ecname">Cohort name</Label>
          <Input id="ecname" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Age band</Label>
            <Select value={ageBand} onValueChange={setAgeBand}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["At birth", "6 weeks", "10 weeks", "14 weeks", "6 months", "9 months", "12 months", "18 months", "0–59 months"].map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ecsize">Enrolled</Label>
            <Input
              id="ecsize"
              type="number"
              min={0}
              value={size}
              onChange={(e) => setSize(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Cohort["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), ageBand, size, status })}
        >
          Save changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function NewCohortDialog({ program, onCreate }: { program: Program; onCreate: (c: Cohort) => void }) {
  const [name, setName] = useState("");
  const [ageBand, setAgeBand] = useState("6 weeks");
  const [expectedDate, setExpectedDate] = useState<Date | undefined>();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New cohort · {program.name}</DialogTitle>
        <DialogDescription>
          A cohort is a group of eligible children tracked together.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="cname">Cohort name</Label>
          <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q4 2026 · 6-week intake" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Age band</Label>
            <Select value={ageBand} onValueChange={setAgeBand}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["At birth", "6 weeks", "10 weeks", "14 weeks", "6 months", "9 months", "12 months", "18 months", "0–59 months"].map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Expected enrolment date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expectedDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {expectedDate ? format(expectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expectedDate}
                  onSelect={setExpectedDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={!name.trim()}
          onClick={() =>
            onCreate({
              id: `c-${Date.now()}`,
              name: name.trim(),
              ageBand,
              size: 0,
              expectedDate: expectedDate ? format(expectedDate, "PPP") : undefined,
              status: "active",
            })
          }
        >
          Add cohort
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}