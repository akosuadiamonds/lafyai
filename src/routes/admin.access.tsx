import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/lafy/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { roleLabel, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/admin/access")({
  head: () => ({
    meta: [
      { title: "Access management — lafyai super admin" },
      {
        name: "description",
        content:
          "Approve super admin requests and review every platform account, role and organisation.",
      },
      { property: "og:title", content: "Access management — lafyai super admin" },
      {
        property: "og:description",
        content: "Approve admin requests and review platform accounts and roles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAccess,
});

function AdminAccess() {
  const qc = useQueryClient();

  const requests = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_requests")
        .select("*")
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [p, r] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, organisation, region, status, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (p.error) throw p.error;
      if (r.error) throw r.error;
      const roleByUser = new Map<string, AppRole>();
      for (const row of r.data ?? []) {
        const existing = roleByUser.get(row.user_id);
        if (row.role === "super_admin" || !existing) roleByUser.set(row.user_id, row.role as AppRole);
      }
      return (p.data ?? []).map((u) => ({ ...u, role: roleByUser.get(u.id) ?? null }));
    },
  });

  const decide = useMutation({
    mutationFn: async ({
      id,
      userId,
      email,
      approve,
    }: {
      id: string;
      userId: string;
      email: string;
      approve: boolean;
    }) => {
      if (approve) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "super_admin" });
        if (error && !error.message.includes("duplicate")) throw error;
      }
      const { error: reqError } = await supabase
        .from("admin_requests")
        .update({ status: approve ? "approved" : "denied", decided_at: new Date().toISOString() })
        .eq("id", id);
      if (reqError) throw reqError;

      await supabase.from("audit_log").insert({
        action: approve ? "admin_request_approved" : "admin_request_denied",
        target: email,
        detail: `Super admin access ${approve ? "granted to" : "denied for"} ${email}`,
      });
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.approve ? "Super admin access granted" : "Request denied");
      qc.invalidateQueries({ queryKey: ["admin-requests"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["audit-log"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pending = (requests.data ?? []).filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access management"
        description="Approve super admin requests and review platform accounts."
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Pending super admin requests
          </CardTitle>
          <Badge variant="secondary">{pending.length} pending</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!requests.isLoading && pending.length === 0 && (
            <p className="text-sm text-muted-foreground">No requests waiting for review.</p>
          )}
          {pending.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="text-sm font-medium">{r.full_name || r.email}</div>
                <div className="text-xs text-muted-foreground">
                  {r.email} · requested {new Date(r.requested_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={decide.isPending}
                  onClick={() =>
                    decide.mutate({
                      id: r.id,
                      userId: r.user_id,
                      email: r.email,
                      approve: true,
                    })
                  }
                >
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={decide.isPending}
                  onClick={() =>
                    decide.mutate({
                      id: r.id,
                      userId: r.user_id,
                      email: r.email,
                      approve: false,
                    })
                  }
                >
                  <X className="h-4 w-4" /> Deny
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform accounts</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users.data ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {u.role ? (
                      <Badge variant={u.role === "super_admin" ? "default" : "secondary"}>
                        {roleLabel[u.role]}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No role</Badge>
                    )}
                  </TableCell>
                  <TableCell>{u.organisation || "—"}</TableCell>
                  <TableCell>{u.region || "—"}</TableCell>
                  <TableCell className="capitalize">{u.status}</TableCell>
                </TableRow>
              ))}
              {!users.isLoading && (users.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No accounts found.
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