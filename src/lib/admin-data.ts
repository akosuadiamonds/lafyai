// Mock cross-implementor data for the super admin console. Deterministic, read-only.

export type Implementor = {
  slug: string;
  name: string;
  lead: string;
  region: string;
  facilities: number;
  programs: number;
  cohorts: number;
  patients: number;
  coverage: number;
  adherence: number;
  openAlerts: number;
  status: "active" | "onboarding" | "suspended";
};

export const IMPLEMENTORS: Implementor[] = [
  { slug: "lafy-field-ops", name: "LafyAI Field Ops", lead: "Amara Okoye", region: "Greater Accra", facilities: 12, programs: 5, cohorts: 14, patients: 8420, coverage: 84, adherence: 88, openAlerts: 5, status: "active" },
  { slug: "eastern-health-trust", name: "Eastern Health Trust", lead: "Kojo Anane", region: "Eastern", facilities: 6, programs: 3, cohorts: 8, patients: 3110, coverage: 71, adherence: 79, openAlerts: 3, status: "active" },
  { slug: "ashanti-child-health", name: "Ashanti Child Health", lead: "Efua Danso", region: "Ashanti", facilities: 9, programs: 4, cohorts: 11, patients: 5240, coverage: 80, adherence: 85, openAlerts: 2, status: "active" },
  { slug: "central-epi-partners", name: "Central EPI Partners", lead: "Nii Adjei", region: "Central", facilities: 5, programs: 3, cohorts: 6, patients: 2380, coverage: 76, adherence: 81, openAlerts: 1, status: "active" },
  { slug: "western-reach", name: "Western Reach Initiative", lead: "Abena Sarpong", region: "Western", facilities: 4, programs: 2, cohorts: 4, patients: 1620, coverage: 68, adherence: 74, openAlerts: 4, status: "onboarding" },
  { slug: "volta-outreach", name: "Volta Outreach Network", lead: "Yaw Dumor", region: "Volta", facilities: 3, programs: 2, cohorts: 3, patients: 980, coverage: 66, adherence: 72, openAlerts: 0, status: "suspended" },
];

export const NATIONAL_TREND = [
  { month: "Feb", coverage: 68, adherence: 74 },
  { month: "Mar", coverage: 71, adherence: 76 },
  { month: "Apr", coverage: 73, adherence: 78 },
  { month: "May", coverage: 75, adherence: 80 },
  { month: "Jun", coverage: 77, adherence: 82 },
  { month: "Jul", coverage: 79, adherence: 84 },
];

export type AdminProgram = {
  id: string;
  name: string;
  implementor: string;
  cohorts: number;
  enrolled: number;
  completion: number;
  status: "active" | "closed";
};

export const ADMIN_PROGRAMS: AdminProgram[] = [
  { id: "epi-ga", name: "National immunization & Vitamin A", implementor: "LafyAI Field Ops", cohorts: 6, enrolled: 4210, completion: 84, status: "active" },
  { id: "polio-ga", name: "Polio eradication", implementor: "LafyAI Field Ops", cohorts: 3, enrolled: 1880, completion: 78, status: "active" },
  { id: "mr-as", name: "Measles-Rubella catch-up", implementor: "Ashanti Child Health", cohorts: 4, enrolled: 2640, completion: 74, status: "active" },
  { id: "rtss-ea", name: "Malaria RTS,S rollout", implementor: "Eastern Health Trust", cohorts: 3, enrolled: 1210, completion: 66, status: "active" },
  { id: "yf-ce", name: "Yellow Fever campaign", implementor: "Central EPI Partners", cohorts: 2, enrolled: 890, completion: 71, status: "active" },
  { id: "epi-we", name: "National immunization & Vitamin A", implementor: "Western Reach Initiative", cohorts: 2, enrolled: 640, completion: 58, status: "active" },
  { id: "mr-vo", name: "Measles-Rubella catch-up", implementor: "Volta Outreach Network", cohorts: 3, enrolled: 480, completion: 52, status: "closed" },
];

export const NATIONAL_ANTIGENS = [
  { antigen: "BCG", coverage: 94, target: 90 },
  { antigen: "OPV0", coverage: 90, target: 90 },
  { antigen: "Penta 1", coverage: 87, target: 90 },
  { antigen: "Penta 3", coverage: 76, target: 90 },
  { antigen: "PCV 3", coverage: 74, target: 90 },
  { antigen: "Measles 1", coverage: 71, target: 90 },
  { antigen: "Measles 2", coverage: 57, target: 90 },
];

export const NATIONAL_LOCATIONS = [
  { location: "Greater Accra", completion: 84, facilities: 12, implementors: 1 },
  { location: "Ashanti", completion: 80, facilities: 9, implementors: 1 },
  { location: "Central", completion: 76, facilities: 5, implementors: 1 },
  { location: "Eastern", completion: 71, facilities: 6, implementors: 1 },
  { location: "Western", completion: 68, facilities: 4, implementors: 1 },
  { location: "Volta", completion: 66, facilities: 3, implementors: 1 },
];

export const CROSS_ALERTS = [
  { id: "SE-2601", name: "Nana Aba Sey", implementor: "LafyAI Field Ops", facility: "Ridge Hospital", detail: "Localised swelling, child refusing to feed", severity: "critical" as const, reportedAt: "2h ago", status: "escalated" as const },
  { id: "SE-2604", name: "Yaw Boateng", implementor: "LafyAI Field Ops", facility: "Korle Bu", detail: "Fever 39.1°C, persistent crying", severity: "moderate" as const, reportedAt: "5h ago", status: "open" as const },
  { id: "SE-2609", name: "Adjoa Nyarko", implementor: "Western Reach Initiative", facility: "Takoradi Hospital", detail: "Vomiting after dose, under observation", severity: "critical" as const, reportedAt: "7h ago", status: "open" as const },
  { id: "SE-2603", name: "Kweku Otoo", implementor: "Ashanti Child Health", facility: "Madina CHPS", detail: "Rash on left arm, mild fever", severity: "moderate" as const, reportedAt: "9h ago", status: "open" as const },
  { id: "SE-2519", name: "Ama Serwaa", implementor: "Eastern Health Trust", facility: "Nsawam Gov. Hospital", detail: "Low-grade fever, tolerating feeds", severity: "mild" as const, reportedAt: "1d ago", status: "open" as const },
  { id: "SE-2517", name: "Kofi Mensah", implementor: "Central EPI Partners", facility: "Tema General", detail: "Injection-site tenderness, resolved <24h", severity: "mild" as const, reportedAt: "2d ago", status: "resolved" as const },
];
// ---------- Platform users (all portals) ----------

export type PortalSegment = "implementors" | "health_workers" | "facility_admins";

export const USER_SEGMENTS: {
  key: PortalSegment;
  label: string;
  total: number;
  active: number;
  newThisMonth: number;
}[] = [
  { key: "implementors", label: "Implementors", total: 148, active: 131, newThisMonth: 12 },
  { key: "health_workers", label: "Health workers", total: 1042, active: 902, newThisMonth: 87 },
  { key: "facility_admins", label: "Facilities", total: 39, active: 34, newThisMonth: 3 },
];

export const TOTAL_PLATFORM_USERS = USER_SEGMENTS.reduce((s, u) => s + u.total, 0);

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: "Super admin" | "Implementor lead" | "Implementor" | "Health worker" | "Facility admin";
  scope: string;
  organisation: string;
  status: "active" | "invited" | "suspended";
  lastActive: string;
};

export const PLATFORM_USERS: PlatformUser[] = [
  { id: "u-001", name: "Akosua Mensah", email: "akosua@lafyai.org", role: "Super admin", scope: "All facilities", organisation: "lafyai", status: "active", lastActive: "12m ago" },
  { id: "u-002", name: "Amara Okoye", email: "amara@fieldops.org", role: "Implementor lead", scope: "12 facilities · Greater Accra", organisation: "LafyAI Field Ops", status: "active", lastActive: "1h ago" },
  { id: "u-003", name: "Kojo Anane", email: "kojo@easterntrust.org", role: "Implementor lead", scope: "6 facilities · Eastern", organisation: "Eastern Health Trust", status: "active", lastActive: "3h ago" },
  { id: "u-004", name: "Efua Danso", email: "efua@ashantich.org", role: "Implementor", scope: "9 facilities · Ashanti", organisation: "Ashanti Child Health", status: "active", lastActive: "5h ago" },
  { id: "u-005", name: "Nii Adjei", email: "nii@centralepi.org", role: "Implementor", scope: "5 facilities · Central", organisation: "Central EPI Partners", status: "active", lastActive: "1d ago" },
  { id: "u-006", name: "Abena Sarpong", email: "abena@westernreach.org", role: "Implementor", scope: "4 facilities · Western", organisation: "Western Reach Initiative", status: "invited", lastActive: "—" },
  { id: "u-007", name: "Yaw Dumor", email: "yaw@voltaoutreach.org", role: "Implementor", scope: "3 facilities · Volta", organisation: "Volta Outreach Network", status: "suspended", lastActive: "24d ago" },
  { id: "u-008", name: "Gifty Boateng", email: "gifty@korlebu.gov.gh", role: "Facility admin", scope: "Korle Bu Teaching Hospital", organisation: "LafyAI Field Ops", status: "active", lastActive: "22m ago" },
  { id: "u-009", name: "Kwame Asare", email: "kwame@ridge.gov.gh", role: "Health worker", scope: "Ridge Hospital", organisation: "LafyAI Field Ops", status: "active", lastActive: "40m ago" },
  { id: "u-010", name: "Adjoa Nyarko", email: "adjoa@takoradi.gov.gh", role: "Health worker", scope: "Takoradi Hospital", organisation: "Western Reach Initiative", status: "active", lastActive: "2h ago" },
  { id: "u-011", name: "Selina Owusu", email: "selina@madinachps.gov.gh", role: "Health worker", scope: "Madina CHPS", organisation: "Ashanti Child Health", status: "invited", lastActive: "—" },
  { id: "u-012", name: "Daniel Tetteh", email: "daniel@temageneral.gov.gh", role: "Facility admin", scope: "Tema General Hospital", organisation: "Central EPI Partners", status: "active", lastActive: "6h ago" },
  { id: "u-013", name: "Rita Appiah", email: "rita@nsawam.gov.gh", role: "Health worker", scope: "Nsawam Gov. Hospital", organisation: "Eastern Health Trust", status: "suspended", lastActive: "12d ago" },
  { id: "u-014", name: "Joseph Amoah", email: "joseph@adabraka.gov.gh", role: "Health worker", scope: "Adabraka Polyclinic", organisation: "LafyAI Field Ops", status: "active", lastActive: "3h ago" },
];

// ---------- Facilities (national) ----------

export type BillingPlan = "Starter" | "Growth" | "National";

export type AdminFacility = {
  id: string;
  name: string;
  region: string;
  district: string;
  type: "Teaching hospital" | "Hospital" | "Polyclinic" | "CHPS";
  implementor: string;
  plan: BillingPlan;
  seats: number;
  patients: number;
  coverage: number;
  active: boolean;
  renewsOn: string;
};

export const ADMIN_FACILITIES: AdminFacility[] = [
  { id: "f-01", name: "Korle Bu Teaching Hospital", region: "Greater Accra", district: "Ablekuma South", type: "Teaching hospital", implementor: "LafyAI Field Ops", plan: "National", seats: 48, patients: 2140, coverage: 91, active: true, renewsOn: "2026-11-01" },
  { id: "f-02", name: "Ridge Hospital", region: "Greater Accra", district: "Korle Klottey", type: "Hospital", implementor: "LafyAI Field Ops", plan: "Growth", seats: 26, patients: 1480, coverage: 86, active: true, renewsOn: "2026-09-15" },
  { id: "f-03", name: "Adabraka Polyclinic", region: "Greater Accra", district: "Korle Klottey", type: "Polyclinic", implementor: "LafyAI Field Ops", plan: "Growth", seats: 18, patients: 940, coverage: 88, active: true, renewsOn: "2026-10-05" },
  { id: "f-04", name: "Madina CHPS", region: "Greater Accra", district: "La Nkwantanang", type: "CHPS", implementor: "Ashanti Child Health", plan: "Starter", seats: 8, patients: 410, coverage: 74, active: true, renewsOn: "2026-08-20" },
  { id: "f-05", name: "Tema General Hospital", region: "Greater Accra", district: "Tema Metro", type: "Hospital", implementor: "Central EPI Partners", plan: "Growth", seats: 22, patients: 1180, coverage: 79, active: true, renewsOn: "2026-12-01" },
  { id: "f-06", name: "Nsawam Gov. Hospital", region: "Eastern", district: "Nsawam Adoagyiri", type: "Hospital", implementor: "Eastern Health Trust", plan: "Growth", seats: 20, patients: 860, coverage: 71, active: true, renewsOn: "2026-09-30" },
  { id: "f-07", name: "Koforidua Central", region: "Eastern", district: "New Juaben", type: "Hospital", implementor: "Eastern Health Trust", plan: "Starter", seats: 10, patients: 520, coverage: 68, active: false, renewsOn: "2026-07-10" },
  { id: "f-08", name: "Komfo Anokye Teaching", region: "Ashanti", district: "Kumasi Metro", type: "Teaching hospital", implementor: "Ashanti Child Health", plan: "National", seats: 44, patients: 1990, coverage: 84, active: true, renewsOn: "2027-01-15" },
  { id: "f-09", name: "Suame Polyclinic", region: "Ashanti", district: "Suame", type: "Polyclinic", implementor: "Ashanti Child Health", plan: "Starter", seats: 9, patients: 380, coverage: 66, active: false, renewsOn: "2026-06-28" },
  { id: "f-10", name: "Cape Coast Metro Hospital", region: "Central", district: "Cape Coast", type: "Hospital", implementor: "Central EPI Partners", plan: "Growth", seats: 19, patients: 780, coverage: 76, active: true, renewsOn: "2026-11-20" },
  { id: "f-11", name: "Takoradi Hospital", region: "Western", district: "Takoradi Metro", type: "Hospital", implementor: "Western Reach Initiative", plan: "Starter", seats: 12, patients: 640, coverage: 68, active: true, renewsOn: "2026-08-08" },
  { id: "f-12", name: "Ho Municipal Hospital", region: "Volta", district: "Ho Municipal", type: "Hospital", implementor: "Volta Outreach Network", plan: "Starter", seats: 8, patients: 420, coverage: 66, active: false, renewsOn: "2026-07-01" },
];

// ---------- Billing & subscriptions ----------

export const PLAN_CATALOGUE: {
  plan: BillingPlan;
  pricePerMonth: number;
  seatsIncluded: number;
  blurb: string;
}[] = [
  { plan: "Starter", pricePerMonth: 250, seatsIncluded: 10, blurb: "Single facility, core coverage tracking" },
  { plan: "Growth", pricePerMonth: 780, seatsIncluded: 30, blurb: "Multi-facility programs, SE alerting, exports" },
  { plan: "National", pricePerMonth: 2400, seatsIncluded: 60, blurb: "Region-wide rollout, API access, priority support" },
];

export type BillingAccount = {
  id: string;
  account: string;
  implementor: string;
  plan: BillingPlan;
  facilities: number;
  seats: number;
  amount: number;
  cycle: "Monthly" | "Annual";
  status: "active" | "trial" | "past_due" | "cancelled";
  nextInvoice: string;
};

export const BILLING_ACCOUNTS: BillingAccount[] = [
  { id: "acc-1001", account: "LafyAI Field Ops", implementor: "LafyAI Field Ops", plan: "National", facilities: 12, seats: 60, amount: 2400, cycle: "Monthly", status: "active", nextInvoice: "2026-08-01" },
  { id: "acc-1002", account: "Ashanti Child Health", implementor: "Ashanti Child Health", plan: "National", facilities: 9, seats: 50, amount: 25920, cycle: "Annual", status: "active", nextInvoice: "2027-01-15" },
  { id: "acc-1003", account: "Eastern Health Trust", implementor: "Eastern Health Trust", plan: "Growth", facilities: 6, seats: 30, amount: 780, cycle: "Monthly", status: "past_due", nextInvoice: "2026-07-30" },
  { id: "acc-1004", account: "Central EPI Partners", implementor: "Central EPI Partners", plan: "Growth", facilities: 5, seats: 24, amount: 780, cycle: "Monthly", status: "active", nextInvoice: "2026-08-05" },
  { id: "acc-1005", account: "Western Reach Initiative", implementor: "Western Reach Initiative", plan: "Starter", facilities: 4, seats: 12, amount: 250, cycle: "Monthly", status: "trial", nextInvoice: "2026-08-12" },
  { id: "acc-1006", account: "Volta Outreach Network", implementor: "Volta Outreach Network", plan: "Starter", facilities: 3, seats: 8, amount: 250, cycle: "Monthly", status: "cancelled", nextInvoice: "—" },
];

export const REVENUE_TREND = [
  { month: "Feb", mrr: 3980 },
  { month: "Mar", mrr: 4210 },
  { month: "Apr", mrr: 4460 },
  { month: "May", mrr: 4980 },
  { month: "Jun", mrr: 5240 },
  { month: "Jul", mrr: 5590 },
];

// ---------- Insights ----------

export const ENGAGEMENT_TREND = [
  { month: "Feb", activeUsers: 720, sessions: 4100, confirmations: 61 },
  { month: "Mar", activeUsers: 812, sessions: 4680, confirmations: 64 },
  { month: "Apr", activeUsers: 884, sessions: 5220, confirmations: 67 },
  { month: "May", activeUsers: 951, sessions: 5810, confirmations: 71 },
  { month: "Jun", activeUsers: 1018, sessions: 6240, confirmations: 74 },
  { month: "Jul", activeUsers: 1067, sessions: 6710, confirmations: 77 },
];

export const CHANNEL_MIX = [
  { channel: "WhatsApp", share: 62, confirmations: 81 },
  { channel: "Voice / IVR", share: 24, confirmations: 68 },
  { channel: "SMS", share: 14, confirmations: 54 },
];

export const PLATFORM_INSIGHTS = [
  { title: "Measles 2 is the national bottleneck", detail: "Coverage sits at 57% — 33 points below target and the largest single drag on the national number.", impact: "high" as const },
  { title: "Onboarding stalls in Western & Volta", detail: "Two implementors have facilities inactive past renewal, holding 1,060 children out of active follow-up.", impact: "high" as const },
  { title: "WhatsApp outperforms voice by 13 points", detail: "Shifting voice-first cohorts to WhatsApp could lift confirmations in Eastern and Central.", impact: "medium" as const },
  { title: "Health worker activation improving", detail: "902 of 1,042 health workers active this month, up from 814 in May.", impact: "low" as const },
];
