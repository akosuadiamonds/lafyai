import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — lafyai super admin" },
      {
        name: "description",
        content: "Chronological record of access decisions and administrative actions on lafyai.",
      },
      { property: "og:title", content: "Audit log — lafyai super admin" },
      {
        property: "og:description",
        content: "Every administrative action recorded with actor, target and time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAudit,
});

function AdminAudit() {
  const log = useQuery({
    queryKey: ["audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Administrative actions across the platform." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(log.data ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{row.action.replace(/_/g, " ")}</TableCell>
                  <TableCell>{row.actor_email || "system"}</TableCell>
                  <TableCell>{row.target || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{row.detail || "—"}</TableCell>
                </TableRow>
              ))}
              {!log.isLoading && (log.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}