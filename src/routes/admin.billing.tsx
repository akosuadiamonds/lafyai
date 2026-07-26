import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CreditCard, Plus, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BILLING_ACCOUNTS,
  PLAN_CATALOGUE,
  REVENUE_TREND,
  type BillingAccount,
  type BillingPlan,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/billing")({
  head: () => ({
    meta: [
      { title: "Billing & subscription — lafyai super admin" },
      {
        name: "description",
        content:
          "Create billing accounts, manage subscription plans, seats and invoices across every implementor.",
      },
      { property: "og:title", content: "Billing & subscription — lafyai super admin" },
      {
        property: "og:description",
        content: "Subscription plans, billing accounts and invoice status across the platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminBilling,
});

function Stat({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof Wallet }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

const STATUS_LABEL: Record<BillingAccount["status"], string> = {
  active: "Active",
  trial: "Trial",
  past_due: "Past due",
  cancelled: "Cancelled",
};

function AdminBilling() {
  const [accounts, setAccounts] = useState<BillingAccount[]>(BILLING_ACCOUNTS);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    account: "",
    plan: "Growth" as BillingPlan,
    cycle: "Monthly" as BillingAccount["cycle"],
    seats: "20",
    facilities: "5",
  });

  const mrr = useMemo(
    () =>
      accounts
        .filter((a) => a.status === "active" || a.status === "trial")
        .reduce((s, a) => s + (a.cycle === "Annual" ? Math.round(a.amount / 12) : a.amount), 0),
    [accounts],
  );
  const pastDue = accounts.filter((a) => a.status === "past_due").length;
  const seats = accounts.reduce((s, a) => s + a.seats, 0);

  const createAccount = () => {
    if (!form.account.trim()) {
      toast.error("Account name is required");
      return;
    }
    const price = PLAN_CATALOGUE.find((p) => p.plan === form.plan)!.pricePerMonth;
    setAccounts((prev) => [
      {
        id: `acc-${1000 + prev.length + 1}`,
        account: form.account.trim(),
        implementor: form.account.trim(),
        plan: form.plan,
        facilities: Number(form.facilities) || 0,
        seats: Number(form.seats) || 0,
        amount: form.cycle === "Annual" ? price * 12 : price,
        cycle: form.cycle,
        status: "trial",
        nextInvoice: "2026-08-26",
      },
      ...prev,
    ]);
    setForm({ account: "", plan: "Growth", cycle: "Monthly", seats: "20", facilities: "5" });
    setOpen(false);
    toast.success("Billing account created");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & subscription"
        description="Subscription plans, billing accounts and invoice status across the platform."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> New billing account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New billing account</DialogTitle>
                <DialogDescription>
                  Create a subscription and billing account for an implementor.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account">Account name</Label>
                  <Input
                    id="account"
                    value={form.account}
                    onChange={(e) => setForm({ ...form, account: e.target.value })}
                    placeholder="e.g. Northern Health Alliance"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select
                      value={form.plan}
                      onValueChange={(v) => setForm({ ...form, plan: v as BillingPlan })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PLAN_CATALOGUE.map((p) => (
                          <SelectItem key={p.plan} value={p.plan}>
                            {p.plan} — ${p.pricePerMonth}/mo
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Billing cycle</Label>
                    <Select
                      value={form.cycle}
                      onValueChange={(v) => setForm({ ...form, cycle: v as BillingAccount["cycle"] })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seats">Seats</Label>
                    <Input
                      id="seats"
                      type="number"
                      value={form.seats}
                      onChange={(e) => setForm({ ...form, seats: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facilities">Facilities</Label>
                    <Input
                      id="facilities"
                      type="number"
                      value={form.facilities}
                      onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createAccount}>Create account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="MRR" value={`$${mrr.toLocaleString()}`} sub="Active + trial accounts" icon={Wallet} />
        <Stat label="Accounts" value={String(accounts.length)} sub={`${accounts.filter((a) => a.status === "active").length} active`} icon={CreditCard} />
        <Stat label="Licensed seats" value={String(seats)} sub="Across all plans" icon={TrendingUp} />
        <Stat label="Past due" value={String(pastDue)} sub="Needs follow-up" icon={AlertCircle} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recurring revenue trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip wrapperStyle={{ zIndex: 50 }} />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  name="MRR ($)"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.18}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PLAN_CATALOGUE.map((p) => (
              <div key={p.plan} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{p.plan}</span>
                  <span className="text-sm tabular-nums">${p.pricePerMonth}/mo</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.blurb}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {p.seatsIncluded} seats included
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing accounts</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Facilities</TableHead>
                <TableHead className="text-right">Seats</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Next invoice</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium">{a.account}</div>
                    <div className="text-xs text-muted-foreground">{a.id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.plan === "Starter" ? "secondary" : "default"}>{a.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{a.facilities}</TableCell>
                  <TableCell className="text-right tabular-nums">{a.seats}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    ${a.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{a.cycle}</TableCell>
                  <TableCell className="text-muted-foreground">{a.nextInvoice}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        a.status === "past_due"
                          ? "destructive"
                          : a.status === "cancelled"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {STATUS_LABEL[a.status]}
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
