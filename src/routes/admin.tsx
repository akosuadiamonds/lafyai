import { useState } from "react";
import {
  Outlet,
  createFileRoute,
  redirect,
  Link,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  ShieldCheck,
  CreditCard,
  Sparkles,
  MessageSquare,
  Leaf,
  Menu,
  LogOut,
  User as UserIcon,
  Bell,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { initials, loadAuthState, roleHome } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { CROSS_ALERTS } from "@/lib/admin-data";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const state = await loadAuthState();
    if (!state) throw redirect({ to: "/auth" });
    if (state.role !== "super_admin") {
      throw redirect({ to: state.role ? roleHome[state.role] : "/auth" });
    }
    return { auth: state };
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/implementors", label: "Implementors", icon: Building2 },
  { to: "/admin/facilities", label: "Facilities", icon: Building2 },
  { to: "/admin/programs", label: "Programs", icon: FolderKanban },
  { to: "/admin/users", label: "User management", icon: ShieldCheck },
  { to: "/admin/billing", label: "Billing & Subscription", icon: CreditCard },
  { to: "/admin/messages", label: "Message Log", icon: MessageSquare },
  { to: "/admin/insights", label: "Insights", icon: Sparkles },
] as const;

function AdminLayout() {
  const { auth } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const name = auth.profile?.full_name || auth.email;
  const openAlerts = CROSS_ALERTS.filter((a) => a.status !== "resolved").slice(0, 5);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
          <Leaf className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-tight">lafyai</div>
          <div className="text-[11px] text-sidebar-foreground/60">Super admin console</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => {
            onNavigate?.();
            handleSignOut();
          }}
          className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen w-full bg-muted/40 flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground sticky top-0 h-screen">
        <SidebarInner />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center gap-3 px-4 md:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r-0"
            >
              <SidebarInner onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="md:hidden font-semibold flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" /> lafyai
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            National oversight
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  {openAlerts.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Cross-implementor alerts</span>
                  <Badge variant="secondary" className="tabular-nums">
                    {openAlerts.length} open
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {openAlerts.map((a) => (
                  <DropdownMenuItem
                    key={a.id}
                    onClick={() => navigate({ to: "/admin/se-alerts" })}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <span className="text-sm font-medium truncate">{a.detail}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {a.implementor} · {a.facility} · {a.reportedAt}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/admin/se-alerts" })}
                  className="justify-center text-primary"
                >
                  View all SE alerts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full hover:bg-muted/60 px-1 py-0.5 transition-colors"
                  aria-label="Open profile menu"
                >
                  <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
                    <span className="text-sm font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground">
                      {auth.profile?.organisation || "Super admin"}
                    </span>
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials(name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{auth.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/admin/users" })}>
                  <UserIcon className="h-4 w-4" /> User management
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}