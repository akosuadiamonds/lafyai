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