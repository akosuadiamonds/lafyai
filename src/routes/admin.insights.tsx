import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Lightbulb, Users, MessageSquare } from "lucide-react";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CHANNEL_MIX,
  ENGAGEMENT_TREND,
  IMPLEMENTORS,
  NATIONAL_ANTIGENS,
  PLATFORM_INSIGHTS,
  TOTAL_PLATFORM_USERS,
  USER_SEGMENTS,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/insights")({
  head: () => ({
    meta: [
      { title: "Insights — lafyai super admin" },
      {
        name: "description",
        content:
          "Platform-wide insights: engagement trends, channel performance, antigen bottlenecks and recommended actions.",
      },
      { property: "og:title", content: "Insights — lafyai super admin" },
      {
        property: "og:description",
        content: "Engagement, channel performance and recommended actions across the platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminInsights,
});

function Stat({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof Users }) {
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

function AdminInsights() {
  const latest = ENGAGEMENT_TREND[ENGAGEMENT_TREND.length - 1];
  const first = ENGAGEMENT_TREND[0];
  const activeGrowth = Math.round(((latest.activeUsers - first.activeUsers) / first.activeUsers) * 100);
  const avgAdherence = Math.round(
    IMPLEMENTORS.reduce((s, i) => s + i.adherence, 0) / IMPLEMENTORS.length,
  );
  const laggards = [...NATIONAL_ANTIGENS].sort((a, b) => a.coverage - b.coverage).slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Where the platform is winning, where it is stuck, and what to act on next."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat
          label="Monthly active users"
          value={latest.activeUsers.toLocaleString()}
          sub={`+${activeGrowth}% since ${first.month}`}
          icon={Users}
        />
        <Stat
          label="Confirmation rate"
          value={`${latest.confirmations}%`}
          sub="Reminder → confirmed visit"
          icon={MessageSquare}
        />
        <Stat
          label="Avg adherence"
          value={`${avgAdherence}%`}
          sub={`${TOTAL_PLATFORM_USERS.toLocaleString()} users on platform`}
          icon={Lightbulb}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Engagement trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENGAGEMENT_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip wrapperStyle={{ zIndex: 50 }} />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  name="Active users"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="confirmations"
                  name="Confirmation %"
                  stroke="var(--muted-foreground)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users by portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {USER_SEGMENTS.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="tabular-nums">{s.total.toLocaleString()}</span>
                </div>
                <Progress
                  value={Math.round((s.total / TOTAL_PLATFORM_USERS) * 100)}
                  className="mt-2 h-1.5"
                />
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {s.active.toLocaleString()} active · +{s.newThisMonth} this month
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel performance</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHANNEL_MIX}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip wrapperStyle={{ zIndex: 50 }} />
                <Bar dataKey="share" name="Share of reminders" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="confirmations"
                  name="Confirmation rate"
                  fill="var(--muted-foreground)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Biggest coverage gaps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {laggards.map((a) => (
              <div key={a.antigen}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{a.antigen}</span>
                  <span className="tabular-nums text-destructive font-semibold">
                    {a.target - a.coverage} pts below target
                  </span>
                </div>
                <Progress value={a.coverage} className="mt-2 h-1.5" />
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {a.coverage}% coverage · target {a.target}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" /> Recommended actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {PLATFORM_INSIGHTS.map((i) => (
            <div key={i.title} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">{i.title}</span>
                <Badge
                  variant={i.impact === "high" ? "destructive" : i.impact === "medium" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {i.impact}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{i.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
