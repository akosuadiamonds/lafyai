## Goal

Put every dashboard behind a login, let people sign in or sign up choosing their role (Implementor or Super admin), and add a new Super Admin console with both oversight analytics and user/access management.

Since you want real sign-up (not just two fixed logins), this needs a backend — I'll enable Lovable Cloud (database + auth, no external accounts needed) and seed the two accounts you gave:

- `implementor@gmail.com` / `qwerty123` → Implementor console
- `admin@gmail.com` / `admin1234` → Super Admin console

## Auth flow

1. `/auth` page with two tabs: **Sign in** and **Sign up**.
   - Role selector (Implementor / Super admin) shown as two cards.
   - Sign up captures full name, email, password, role.
   - Email confirmation turned off so sign-up lands straight in the app.
2. After sign-in, the user is routed by role: implementors → `/implementor/dashboard`, super admins → `/admin/overview`.
3. All dashboard routes move behind an authenticated gate; unauthenticated visitors are redirected to `/auth`. Landing on a console you don't have the role for shows a "no access" state with a link to your own console.
4. Sidebar profile menu shows the real signed-in user (name, email, role) and Sign out actually clears the session.

Note on roles: self-selected "Super admin" at sign-up means anyone can grant themselves admin. Default I'll implement: sign-up as Implementor is instant; choosing Super admin creates the account with a **pending** admin request that an existing super admin approves from the Access management page. Your seeded `admin@gmail.com` is approved out of the box. Say the word if you'd rather admin sign-up be granted instantly for demo purposes.

## Super Admin console (`/admin/*`)

Own sidebar, same deep-green design language.

- **Overview** — national rollup KPIs (implementors, facilities, patients enrolled, national coverage, open SE alerts), coverage trend, top/bottom implementors, alert feed.
- **Implementors** — table of implementor organisations/users: region, facilities, programs, patients, avg coverage, adherence, status; click through to a detail view.
- **Programs** — all programs across implementors with cohorts, enrolment, completion.
- **Coverage** — national coverage by antigen and by location, with implementor comparison.
- **SE Alerts** — cross-implementor alert oversight with severity filters.
- **Access management** — user list with role, status, last active; approve/reject pending admin requests, invite users, activate/deactivate, change role.
- **Audit log** — record of role changes, approvals, invitations, sign-ins.

Analytics reuse the existing mock dataset, extended with an implementor/organisation dimension so cross-implementor rollups are real numbers rather than placeholders.

## Technical notes

- Lovable Cloud (Supabase) auth with email/password. Profiles table (`id`, full_name, email, status) auto-created on sign-up via trigger.
- Roles stored in a **separate** `user_roles` table with an `app_role` enum (`implementor`, `super_admin`) and a `has_role()` security-definer function — never on the profile row — plus RLS policies and explicit GRANTs. Admin approval requests live in their own table.
- Route protection via a pathless `_authenticated` layout; role checks read from the roles table server-side, not from localStorage.
- Existing `/implementor/*` routes move under the auth gate; their internals and mock data stay as-is apart from the profile menu now reflecting the real user.
- Seeded users are created through the auth admin API in a one-time setup step, with their roles inserted in a migration.
