import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, CheckCheck, XCircle, BellOff } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  MESSAGE_DELIVERY,
  MESSAGE_LOG,
  MESSAGE_VOLUME_TREND,
} from "@/lib/lafy-data";

export const Route = createFileRoute("/admin/messages")({
  head: () => ({
    meta: [
      { title: "Message log — lafyai" },
      {
        name: "description",
        content:
          "Delivery log for every reminder sent: channel, template, status and outcome across facilities.",
      },
      { property: "og:title", content: "Message log — lafyai" },
      {
        property: "og:description",
        content: "Track delivery, read and failure rates for caregiver reminders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessagesPage,
});

const PAGE_SIZE = 8;

const STATUS_LABEL: Record<string, string> = {
  delivered: "Delivered",
  read: "Read",
  failed: "Failed",
  opted_out: "Opted out",
  queued: "Queued",
};

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "failed" ? "destructive" : status === "read" ? "default" : "secondary";
  return (
    <Badge variant={variant as "default" | "secondary" | "destructive"}>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof MessageSquare;
}) {
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
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

function MessagesPage() {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("All channels");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(0);

  const facilities = useMemo(
    () => Array.from(new Set(MESSAGE_LOG.map((m) => m.facility))),
    [],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MESSAGE_LOG.filter(
      (m) =>
        (channel === "All channels" || m.channel === channel) &&
        (status === "All statuses" || m.status === status) &&
        (q === "" ||
          m.recipient.toLowerCase().includes(q) ||
          m.facility.toLowerCase().includes(q) ||
          m.template.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)),
    );
  }, [query, channel, status]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const totalSent = MESSAGE_VOLUME_TREND.reduce((s, w) => s + w.sent, 0);
  const failed = MESSAGE_LOG.filter((m) => m.status === "failed").length;
  const optedOut = MESSAGE_LOG.filter((m) => m.status === "opted_out").length;

  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Message log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every reminder sent to caregivers, with delivery outcome by channel and facility.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Messages sent"
          value={totalSent.toLocaleString()}
          hint="Last 4 weeks"
          icon={MessageSquare}
        />
        <Stat label="Delivered" value="96.2%" hint="Of all sent" icon={CheckCheck} />
        <Stat label="Failed" value={`${failed}`} hint="In recent log window" icon={XCircle} />
        <Stat label="Opted out" value={`${optedOut}`} hint="Caregivers unsubscribed" icon={BellOff} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Message delivery{" "}
              <span className="font-normal text-muted-foreground">
                last 30 days · all facilities
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MESSAGE_DELIVERY.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm font-medium">{d.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${d.value}%` }} />
                </div>
                <span className="w-14 shrink-0 text-right text-sm font-bold tabular-nums">
                  {d.value}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Weekly volume</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MESSAGE_VOLUME_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip wrapperStyle={{ zIndex: 50 }} />
                <Bar dataKey="sent" name="Sent" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" name="Delivered" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="read" name="Read" fill="var(--accent-foreground)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-base">
            Delivery log{" "}
            <span className="font-normal text-muted-foreground">
              {rows.length} of {MESSAGE_LOG.length} messages
            </span>
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search recipient, facility, template…"
              value={query}
              onChange={(e) => resetPage(setQuery)(e.target.value)}
              className="sm:max-w-xs"
            />
            <Select value={channel} onValueChange={resetPage(setChannel)}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["All channels", "WhatsApp", "Voice IVR", "SMS"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={resetPage(setStatus)}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["All statuses", "delivered", "read", "failed", "opted_out", "queued"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s] ?? s}
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
                <TableHead>Sent</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{m.sentAt}</TableCell>
                  <TableCell className="font-mono text-xs">{m.recipient}</TableCell>
                  <TableCell className="font-medium">{m.facility}</TableCell>
                  <TableCell>{m.channel}</TableCell>
                  <TableCell className="text-muted-foreground">{m.template}</TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.detail}</TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No messages match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
          <span>
            Page {current + 1} of {pageCount} · {facilities.length} facilities
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
