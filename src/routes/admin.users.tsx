import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/lafy/page-header";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PLATFORM_USERS, type PlatformUser } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User management — lafyai super admin" },
      {
        name: "description",
        content:
          "Manage users and roles across every portal: facility scope, status, approvals and account actions.",
      },
      { property: "og:title", content: "User management — lafyai super admin" },
      {
        property: "og:description",
        content: "Users, roles, facility scope and account actions across all portals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminUsers,
});

const STATUS_TONE: Record<PlatformUser["status"], "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  invited: "outline",
  suspended: "destructive",
};

function AdminUsers() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [users, setUsers] = useState<PlatformUser[]>(PLATFORM_USERS);

  const roles = Array.from(new Set(users.map((u) => u.role))).filter(
    (r) => r !== "Super admin" && r !== "Implementor lead",
  );

  const rows = useMemo(
    () =>
      users.filter((u) => {
        const matchesQ =
          !q ||
          [u.name, u.email, u.organisation, u.scope]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase());
        return (
          matchesQ && (role === "all" || u.role === role) && (status === "all" || u.status === status)
        );
      }),
    [users, q, role, status],
  );

  const update = (id: string, patch: Partial<PlatformUser>, message: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    toast.success(message);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User management"
        description="Users and roles across every portal, with facility scope and account actions."
      />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Users &amp; roles</CardTitle>
            <Badge variant="secondary" className="tabular-nums">
              {rows.length} of {users.length}
            </Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, scope"
                className="pl-8"
              />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Facility scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "Super admin" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>{u.scope}</div>
                    <div className="text-xs text-muted-foreground">{u.organisation}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_TONE[u.status]} className="capitalize">
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${u.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Manage {u.name.split(" ")[0]}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            update(u.id, { role: "Implementor lead" }, `${u.name} is now an implementor lead`)
                          }
                        >
                          Make implementor lead
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            update(u.id, { role: "Health worker" }, `${u.name} is now a health worker`)
                          }
                        >
                          Make health worker
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast.success(`Invite re-sent to ${u.email}`)}
                        >
                          Resend invite
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.status === "suspended" ? (
                          <DropdownMenuItem
                            onClick={() => update(u.id, { status: "active" }, `${u.name} reactivated`)}
                          >
                            Reactivate account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => update(u.id, { status: "suspended" }, `${u.name} suspended`)}
                          >
                            Suspend account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No users match these filters.
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
