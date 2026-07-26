import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Leaf, Loader2, ShieldCheck, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { loadAuthState, roleHome, roleLabel, type AppRole } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  {
    role: "implementor",
    icon: Stethoscope,
    blurb: "Run immunization programs, cohorts, facilities and follow-up",
  },
  {
    role: "super_admin",
    icon: ShieldCheck,
    blurb: "Oversee implementors nationally, manage users and access",
  },
];

type Step = "role" | "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole | null>(null);
  const [step, setStep] = useState<Step>("role");
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
    <main className="min-h-screen bg-muted/30 px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-xl space-y-8">
        <div className="flex items-center justify-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">lafyai</span>
        </div>

        {step === "role" && (
          <div className="space-y-6">
            <header className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">How will you use lafyai?</h1>
              <p className="text-muted-foreground">
                Select your role to personalize your experience
              </p>
            </header>

            <div className="space-y-3">
              {ROLE_CARDS.map(({ role: r, icon: Icon, blurb }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setStep("signin");
                  }}
                  className={cn(
                    "group w-full rounded-xl border bg-card p-4 text-left transition-all",
                    "flex items-center gap-4 hover:border-primary hover:shadow-sm",
                    role === r ? "border-primary ring-1 ring-primary" : "border-border",
                  )}
                >
                  <span className="h-12 w-12 shrink-0 rounded-xl bg-muted text-muted-foreground grid place-items-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold">
                      I&apos;m {r === "implementor" ? "an" : "a"} {roleLabel[r]}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">{blurb}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step !== "role" && role && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setStep("role")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Change role
            </button>

            <header className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {step === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-muted-foreground">
                Continuing as{" "}
                <span className="font-medium text-foreground">{roleLabel[role]}</span>
              </p>
            </header>

            {step === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email address</Label>
                  <Input
                    id="si-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-password">Password</Label>
                  <Input
                    id="si-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Continue
                  {!busy && <ArrowRight className="h-4 w-4" />}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setStep("signup")}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input
                      id="su-name"
                      name="full_name"
                      required
                      maxLength={80}
                      placeholder="Ama Mensah"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-org">Organisation</Label>
                    <Input
                      id="su-org"
                      name="organisation"
                      maxLength={80}
                      placeholder="Optional"
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email address</Label>
                  <Input
                    id="su-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12"
                  />
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
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                </div>
                {role === "super_admin" && (
                  <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    Super admin sign-ups are reviewed — an existing super admin approves access from
                    the Access management page.
                  </p>
                )}
                <Button type="submit" className="w-full h-12 text-base" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Continue
                  {!busy && <ArrowRight className="h-4 w-4" />}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setStep("signin")}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}