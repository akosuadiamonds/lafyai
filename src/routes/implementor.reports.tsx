import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/lafy/page-header";
import { REPORTS } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Exports — lafyai" },
      { name: "description", content: "Automated monthly PDF summaries and anonymized CSV exports with flexible filters." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & exports"
        description="Generate the automated monthly one-pager, or pull anonymized CSV extracts scoped to what you need."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 bg-primary text-primary-foreground overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
              <Sparkles className="h-4 w-4" /> Automated
            </div>
            <div className="mt-2 text-xl font-semibold leading-tight">
              Monthly implementor summary
            </div>
            <p className="mt-2 text-sm opacity-90">
              One-page PDF covering KPIs, coverage by antigen, channel performance, and the top 3 issues to address next month.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button variant="secondary" className="w-full">
                <FileText className="h-4 w-4" /> Generate July 2026 PDF
              </Button>
              <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-foreground/10">
                Schedule monthly delivery
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Anonymized CSV export</CardTitle>
            <p className="text-xs text-muted-foreground">
              All exports strip personal identifiers. Choose a dataset, then narrow by facility, channel, and period.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Dataset</label>
                <Select defaultValue="coverage">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coverage">Coverage by antigen</SelectItem>
                    <SelectItem value="channel">Channel performance</SelectItem>
                    <SelectItem value="cohort">Cohort funnel</SelectItem>
                    <SelectItem value="indicators">M&E indicators</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Facility</label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All facilities</SelectItem>
                    <SelectItem value="kibera">Kibera Health Ctr</SelectItem>
                    <SelectItem value="mathare">Mathare North</SelectItem>
                    <SelectItem value="kawangware">Kawangware PHC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Channel</label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All channels</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="voice">Voice IVR</SelectItem>
                    <SelectItem value="sms">SMS fallback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Period</label>
                <Select defaultValue="30">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last quarter</SelectItem>
                    <SelectItem value="ytd">Year to date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t pt-4">
              <p className="text-xs text-muted-foreground">Exports include a data-dictionary sheet and consent metadata.</p>
              <Button>
                <Download className="h-4 w-4" /> Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Report library</CardTitle>
            <Badge variant="secondary">{REPORTS.length} available</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {REPORTS.map((r) => (
              <li key={r.name} className="flex items-center gap-4 py-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
                  {r.type === "PDF" ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.type} · {r.size} · Generated {r.date}</div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}