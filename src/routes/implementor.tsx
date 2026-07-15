import { Outlet, createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Syringe,
  Building2,
  Users,
  Gauge,
  FileDown,
  Leaf,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/implementor")({
  component: ImplementorLayout,
});

const NAV = [
  { to: "/implementor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/implementor/coverage", label: "Coverage", icon: Syringe },
  { to: "/implementor/facilities", label: "Facilities", icon: Building2 },
  { to: "/implementor/cohort", label: "Cohort & Follow-up", icon: Users },
  { to: "/implementor/indicators", label: "M&E Indicators", icon: Gauge },
  { to: "/implementor/reports", label: "Reports & Exports", icon: FileDown },
] as const;

function ImplementorLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full bg-muted/40 flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">lafyai</div>
            <div className="text-[11px] text-sidebar-foreground/60">Implementor console</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
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
        <div className="p-4 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60">
          v2.4 · Jul 2026<br />All data anonymized.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center gap-3 px-4 md:px-8">
          <div className="md:hidden font-semibold flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" /> lafyai
          </div>
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search facilities, cohorts, indicators…" className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
              <span className="text-sm font-medium">Amara Okoye</span>
              <span className="text-xs text-muted-foreground">Nairobi region · Lead</span>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">AO</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}