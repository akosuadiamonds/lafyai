import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Leaf, ShieldCheck, Stethoscope, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { loadAuthState, roleHome, roleLabel, type AppRole } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — lafyai immunization console" },
      {
        name: "description",
        content:
          "Sign in or create an account to access the lafyai implementor console or the national super admin console.",
      },
      { property: "og:title", content: "Sign in — lafyai immunization console" },
      {
        property: "og:description",
        content: "Access the lafyai implementor or super admin immunization dashboards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const ROLE_CARDS: { role: AppRole; icon: typeof Leaf; blurb: string }[] = [
  { role: "implementor", icon: Stethoscope, blurb: "Run programs, cohorts and facilities" },
  { role: "super_admin", icon: ShieldCheck, blurb: "Oversee implementors nationally" },
];

function AuthPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole>("implementor");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    loadAuthState().then((state) => {
      if (!state) return;
      if (state.role) navigate({ to: roleHome[state.role], replace: true });
      else setPending(true);
    });
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    const state = await loadAuthState();
    setBusy(false);
    if (!state) return;
    if (!state.role) {
      setPending(true);
      return;
    }
    if (state.role !== role) {
      toast.info(`This account is a ${roleLabel[state.role].toLowerCase()} account.`);
    } else {
      toast.success(`Welcome back, ${state.profile?.full_name || state.email}`);
    }
    navigate({ to: roleHome[state.role], replace: true });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email") ?? "").trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: String(form.get("full_name") ?? "").trim(),
          organisation: String(form.get("organisation") ?? "").trim(),
          requested_role: role,
        },
      },
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    const state = await loadAuthState();
    setBusy(false);
    if (state?.role) {
      toast.success("Account created");
      navigate({ to: roleHome[state.role], replace: true });
      return;
    }
    setPending(true);
    toast.success("Account created — super admin access is awaiting approval.");
  };

  if (pending) {
    return (
      <main className="min-h-screen grid place-items-center bg-muted/40 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto h-11 w-11 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold">Awaiting approval</h1>
            <p className="text-sm text-muted-foreground">
              Your super admin request has been recorded. An existing super admin needs to approve it
              before you can open the national console.
            </p>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                setPending(false);
              }}
            >
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      <section className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">lafyai</span>
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className="text-3xl font-bold leading-tight">
            Immunization monitoring for implementors and national oversight.
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            Coverage, adherence, cohorts and safety events — one console per role, with anonymized
            follow-up data.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">v2.4 · All data anonymized</p>
      </section>

      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold">lafyai</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">Choose your console</h1>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_CARDS.map(({ role: r, icon: Icon, blurb }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    role === r
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-input hover:bg-muted/60",
                  )}
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <div className="mt-2 text-sm font-medium">{roleLabel[r]}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">{blurb}</div>
                </button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="pt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-password">Password</Label>
                  <Input
                    id="si-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign in as {roleLabel[role].toLowerCase()}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="pt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" name="full_name" required maxLength={80} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-org">Organisation</Label>
                  <Input id="su-org" name="organisation" maxLength={80} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password">Password</Label>
                  <Input
                    id="su-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <p className="text-[11px] text-muted-foreground">At least 8 characters.</p>
                </div>
                {role === "super_admin" && (
                  <p className="text-[11px] text-muted-foreground rounded-md bg-muted/60 p-2">
                    Super admin sign-ups are reviewed — an existing super admin approves access from
                    the Access management page.
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create {roleLabel[role].toLowerCase()} account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}