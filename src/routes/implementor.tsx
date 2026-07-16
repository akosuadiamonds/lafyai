import { useState } from "react";
import { Outlet, createFileRoute, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Syringe,
  Building2,
  FolderKanban,
  AlertTriangle,
  FileDown,
  Leaf,
  Bell,
  Search,
  Users,
  Menu,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SE_ALERTS } from "@/lib/lafy-data";

export const Route = createFileRoute("/implementor")({
  component: ImplementorLayout,
});

const NAV = [
  { to: "/implementor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/implementor/patients", label: "Patients", icon: Users },
  { to: "/implementor/coverage", label: "Coverage", icon: Syringe },
  { to: "/implementor/facilities", label: "Facilities", icon: Building2 },
  { to: "/implementor/programs", label: "Programs", icon: FolderKanban },
  { to: "/implementor/se-alerts", label: "SE Alerts", icon: AlertTriangle },
  { to: "/implementor/reports", label: "Reports & Exports", icon: FileDown },
] as const;

function ImplementorLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  const openAlerts = SE_ALERTS.filter((a) => a.status !== "resolved").slice(0, 5);

  const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
          <Leaf className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-tight">lafyai</div>
          <div className="text-[11px] text-sidebar-foreground/60">Implementor console</div>
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
            <SheetContent side="left" className="p-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r-0">
              <SidebarInner onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="md:hidden font-semibold flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" /> lafyai
          </div>
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search facilities, cohorts, indicators…" className="pl-9" />
          </div>
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
                  <span>Notifications</span>
                  <Badge variant="secondary" className="tabular-nums">{openAlerts.length} open</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {openAlerts.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">You're all caught up.</div>
                )}
                {openAlerts.map((a) => (
                  <DropdownMenuItem
                    key={a.id}
                    onClick={() => navigate({ to: "/implementor/se-alerts" })}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          a.severity === "critical" ? "bg-destructive" : a.severity === "moderate" ? "bg-amber-500" : "bg-primary",
                        )}
                      />
                      <span className="text-sm font-medium truncate">{a.detail}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground pl-3.5">
                      {a.facility} · {a.reportedAt}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/implementor/se-alerts" })} className="justify-center text-primary">
                  View all SE alerts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:bg-muted/60 pr-1 pl-1 py-0.5 transition-colors" aria-label="Open profile menu">
                  <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
                    <span className="text-sm font-medium">Amara Okoye</span>
                    <span className="text-xs text-muted-foreground">Nairobi region · Lead</span>
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">AO</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>Amara Okoye</span>
                    <span className="text-xs font-normal text-muted-foreground">amara.okoye@lafy.health</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast("Profile is view-only in this demo.")}>
                  <UserIcon className="h-4 w-4" /> My profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast("Settings are view-only in this demo.")}>
                  <SettingsIcon className="h-4 w-4" /> Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
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