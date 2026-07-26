import { supabase } from "@/integrations/supabase/client";

export type AppRole = "implementor" | "super_admin";

export type AuthProfile = {
  id: string;
  full_name: string;
  email: string;
  organisation: string | null;
  region: string | null;
  status: string;
};

export type AuthState = {
  userId: string;
  email: string;
  role: AppRole | null;
  profile: AuthProfile | null;
};

export const roleLabel: Record<AppRole, string> = {
  implementor: "Implementor",
  super_admin: "Super admin",
};

export const roleHome: Record<AppRole, string> = {
  implementor: "/implementor/dashboard",
  super_admin: "/admin/overview",
};

/** Client-only: resolves the signed-in user, their role and profile. */
export async function loadAuthState(): Promise<AuthState | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const [rolesRes, profileRes] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", data.user.id),
    supabase
      .from("profiles")
      .select("id, full_name, email, organisation, region, status")
      .eq("id", data.user.id)
      .maybeSingle(),
  ]);

  const roles = (rolesRes.data ?? []).map((r) => r.role as AppRole);
  const role: AppRole | null = roles.includes("super_admin")
    ? "super_admin"
    : roles.includes("implementor")
      ? "implementor"
      : null;

  return {
    userId: data.user.id,
    email: data.user.email ?? "",
    role,
    profile: (profileRes.data as AuthProfile | null) ?? null,
  };
}

export function initials(name: string, fallback = "LA") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export async function signOutEverywhere() {
  await supabase.auth.signOut();
}