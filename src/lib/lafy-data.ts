// Mock data for the lafyai implementor dashboard. Read-only, deterministic.

export const KPIS = [
  { label: "Fully immunized children", value: "82%", delta: "+4.1 pts", trend: "up", sub: "vs. last month" },
  { label: "Open SE alerts", value: "12", delta: "+3 today", trend: "flat", sub: "2 critical · 6 moderate" },
  { label: "Dropout (Penta1→Penta3)", value: "6.4%", delta: "-1.2 pts", trend: "down", sub: "Target < 10%" },
  { label: "Active facilities", value: "24 / 26", delta: "2 offline", trend: "flat", sub: "Last 7 days" },
];

export const PROGRAMS = [
  { id: "epi", name: "National immunization & Vitamin A" },
  { id: "polio", name: "Polio eradication" },
  { id: "measles", name: "Measles-Rubella catch-up" },
  { id: "malaria", name: "Malaria RTS,S rollout" },
  { id: "yellow", name: "Yellow Fever campaign" },
];

export type AdherenceRow = {
  dose: string;
  age: string;
  eligible: number;
  onTime?: number;
  late?: number;
  missed?: number;
  adherence?: number;
  tag?: "leading" | "sparse";
  notMeasurable?: string;
};

export const ADHERENCE_BY_DOSE: AdherenceRow[] = [
  { dose: "BCG + OPV 0", age: "At birth", eligible: 2412, onTime: 96, late: 3, missed: 1, adherence: 98, tag: "leading" },
  { dose: "DPT-HepB-Hib 1", age: "6 weeks", eligible: 2188, onTime: 88, late: 8, missed: 4, adherence: 92 },
  { dose: "DPT-HepB-Hib 2", age: "10 weeks", eligible: 1944, onTime: 82, late: 12, missed: 6, adherence: 88 },
  { dose: "DPT-HepB-Hib 3", age: "14 weeks", eligible: 1601, onTime: 76, late: 16, missed: 8, adherence: 84 },
  { dose: "Vit A · RTS,S 1", age: "6 months", eligible: 612, onTime: 70, late: 20, missed: 10, adherence: 80 },
  { dose: "Measles-Rubella 1", age: "9 months", eligible: 188, onTime: 62, late: 24, missed: 14, adherence: 76, tag: "sparse" },
  { dose: "Vit A booster", age: "12 months", eligible: 0, notMeasurable: "first reading Apr 2027" },
  { dose: "Measles-Rubella 2", age: "18 months", eligible: 0, notMeasurable: "first reading Oct 2027" },
];

export const TOP_FACILITIES = [
  { name: "Korle Bu Teaching Hospital", region: "Greater Accra", babies: 487, adherence: 81 },
  { name: "Adabraka Polyclinic", region: "Greater Accra", babies: 198, adherence: 79 },
  { name: "Tema General Hospital", region: "Greater Accra", babies: 341, adherence: 78 },
  { name: "Ridge Hospital", region: "Greater Accra", babies: 312, adherence: 76 },
  { name: "Nsawam Government Hospital", region: "Eastern", babies: 271, adherence: 74 },
];

export const NEEDS_ATTENTION = [
  { name: "Aburi CHPS", region: "Eastern", babies: 67, adherence: 54 },
  { name: "Dodowa CHPS", region: "Greater Accra", babies: 88, adherence: 58 },
  { name: "Madina CHPS", region: "Greater Accra", babies: 142, adherence: 64 },
  { name: "Akropong Health Centre", region: "Eastern", babies: 119, adherence: 68 },
  { name: "Kasoa Polyclinic", region: "Central", babies: 224, adherence: 70 },
];

export type SEAlert = {
  id: string;
  name: string;
  facility: string;
  detail: string;
  dose: string;
  batch: string;
  severity: "critical" | "moderate" | "mild";
  reportedAt: string;
  status: "open" | "escalated" | "resolved";
};

export const SE_ALERTS: SEAlert[] = [
  { id: "SE-2601", name: "Nana Aba Sey", facility: "Ridge Hospital", detail: "Localised swelling, child refusing to feed", dose: "Yellow Fever", batch: "YF-2601", severity: "critical", reportedAt: "2h ago", status: "escalated" },
  { id: "SE-2604", name: "Yaw Boateng", facility: "Korle Bu", detail: "Fever 39.1°C, persistent crying", dose: "DPT-HepB-Hib 3", batch: "DH-K2604", severity: "moderate", reportedAt: "5h ago", status: "open" },
  { id: "SE-2603", name: "Kweku Otoo", facility: "Madina CHPS", detail: "Rash on left arm, mild fever", dose: "Measles-Rubella 1", batch: "MR-2603", severity: "moderate", reportedAt: "9h ago", status: "open" },
  { id: "SE-2519", name: "Ama Serwaa", facility: "Nsawam Gov. Hospital", detail: "Low-grade fever, tolerating feeds", dose: "PCV 2", batch: "PC-2519", severity: "mild", reportedAt: "1d ago", status: "open" },
  { id: "SE-2517", name: "Kofi Mensah", facility: "Tema General", detail: "Injection-site tenderness, resolved <24h", dose: "DPT-HepB-Hib 2", batch: "DH-K2517", severity: "mild", reportedAt: "2d ago", status: "resolved" },
];

export const COVERAGE_BY_LOCATION = [
  { location: "Greater Accra", completion: 84, facilities: 12 },
  { location: "Ashanti", completion: 80, facilities: 9 },
  { location: "Central", completion: 76, facilities: 5 },
  { location: "Eastern", completion: 71, facilities: 6 },
  { location: "Western", completion: 68, facilities: 4 },
  { location: "Volta", completion: 66, facilities: 3 },
];

export const EPI_VISITS = [
  { visit: "Birth", coverage: 94, baseline: 82 },
  { visit: "6 wks", coverage: 88, baseline: 78 },
  { visit: "10 wks", coverage: 84, baseline: 74 },
  { visit: "14 wks", coverage: 79, baseline: 70 },
  { visit: "9 mo", coverage: 72, baseline: 63 },
  { visit: "15 mo", coverage: 65, baseline: 55 },
  { visit: "18 mo", coverage: 58, baseline: 48 },
];

export const WEEKLY_ATTENDANCE = [
  { week: "W1", confirmed: 320, attended: 268 },
  { week: "W2", confirmed: 342, attended: 289 },
  { week: "W3", confirmed: 358, attended: 302 },
  { week: "W4", confirmed: 371, attended: 318 },
  { week: "W5", confirmed: 389, attended: 331 },
  { week: "W6", confirmed: 402, attended: 349 },
  { week: "W7", confirmed: 418, attended: 364 },
  { week: "W8", confirmed: 431, attended: 382 },
];

export const CHANNELS = [
  { channel: "WhatsApp", reach: 3820, engaged: 2914, confirmed: 2011, cost: "$0.02" },
  { channel: "Voice IVR", reach: 2410, engaged: 1682, confirmed: 1121, cost: "$0.06" },
  { channel: "SMS fallback", reach: 1150, engaged: 612, confirmed: 348, cost: "$0.01" },
];

export const SITES = [
  { name: "Kibera Health Ctr", coverage: 88, adherence: 92, engagement: 81, d1: 74, seResp: "38m", regTime: "2.1m" },
  { name: "Mathare North", coverage: 79, adherence: 84, engagement: 72, d1: 66, seResp: "51m", regTime: "2.8m" },
  { name: "Kawangware PHC", coverage: 85, adherence: 89, engagement: 78, d1: 71, seResp: "42m", regTime: "2.3m" },
  { name: "Dandora Dispensary", coverage: 74, adherence: 80, engagement: 68, d1: 61, seResp: "1h 04m", regTime: "3.1m" },
  { name: "Korogocho HC", coverage: 82, adherence: 87, engagement: 76, d1: 69, seResp: "46m", regTime: "2.5m" },
  { name: "Mukuru Kwa Njenga", coverage: 77, adherence: 83, engagement: 70, d1: 63, seResp: "58m", regTime: "2.9m" },
];

export const ANTIGENS = [
  { antigen: "BCG", target: 90, coverage: 96, dropout: 0, trend: "up" },
  { antigen: "OPV0", target: 90, coverage: 92, dropout: 1.2, trend: "up" },
  { antigen: "Penta 1", target: 90, coverage: 89, dropout: 0, trend: "flat" },
  { antigen: "Penta 2", target: 90, coverage: 84, dropout: 5.6, trend: "down" },
  { antigen: "Penta 3", target: 90, coverage: 78, dropout: 12.3, trend: "down" },
  { antigen: "PCV 3", target: 90, coverage: 76, dropout: 14.6, trend: "down" },
  { antigen: "Measles 1", target: 90, coverage: 72, dropout: 0, trend: "up" },
  { antigen: "Measles 2", target: 90, coverage: 58, dropout: 19.4, trend: "flat" },
];

export const MONTHLY_TREND = [
  { month: "Feb", coverage: 68 },
  { month: "Mar", coverage: 71 },
  { month: "Apr", coverage: 73 },
  { month: "May", coverage: 76 },
  { month: "Jun", coverage: 78 },
  { month: "Jul", coverage: 80 },
  { month: "Aug", coverage: 82 },
];

export const COHORT = [
  { stage: "Registered", value: 5200 },
  { stage: "Opted in", value: 4680 },
  { stage: "Engaged", value: 4012 },
  { stage: "Confirmed", value: 2941 },
  { stage: "Attended", value: 2418 },
];

export const DOSE_FORECAST = [
  { week: "Week 1", penta: 142, measles: 88, opv: 121, pcv: 96 },
  { week: "Week 2", penta: 158, measles: 92, opv: 133, pcv: 104 },
  { week: "Week 3", penta: 171, measles: 101, opv: 148, pcv: 118 },
  { week: "Week 4", penta: 164, measles: 96, opv: 139, pcv: 112 },
];

export const FOLLOWUP_QUEUE = [
  { id: "A-8241", ageMo: 4, dueDose: "Penta 2", daysLate: 3, channel: "WhatsApp", status: "Reminder sent" },
  { id: "A-8244", ageMo: 6, dueDose: "Penta 3", daysLate: 5, channel: "Voice", status: "No answer" },
  { id: "A-8251", ageMo: 9, dueDose: "Measles 1", daysLate: 2, channel: "WhatsApp", status: "Confirmed" },
  { id: "A-8258", ageMo: 4, dueDose: "Penta 2", daysLate: 7, channel: "Voice", status: "Escalated" },
  { id: "A-8262", ageMo: 15, dueDose: "Measles 2", daysLate: 4, channel: "WhatsApp", status: "Reminder sent" },
  { id: "A-8270", ageMo: 3, dueDose: "Penta 1", daysLate: 1, channel: "SMS", status: "Reminder sent" },
  { id: "A-8274", ageMo: 6, dueDose: "PCV 3", daysLate: 6, channel: "WhatsApp", status: "No answer" },
];

export const ME_INDICATORS = [
  { code: "7.2.1", name: "% children fully immunized by 12 mo", baseline: 68, target: 90, current: 82, source: "DHIS2", frequency: "Monthly" },
  { code: "7.2.2", name: "Dropout rate Penta1→Penta3", baseline: 12, target: 5, current: 6.4, source: "DHIS2", frequency: "Monthly", invert: true },
  { code: "7.2.3", name: "% caregivers engaged via chosen channel", baseline: 40, target: 80, current: 74, source: "Platform", frequency: "Weekly" },
  { code: "7.2.4", name: "D-1 confirmation rate", baseline: 30, target: 75, current: 71, source: "Platform", frequency: "Weekly" },
  { code: "7.2.5", name: "Session attendance rate", baseline: 55, target: 85, current: 79, source: "Facility logs", frequency: "Weekly" },
  { code: "7.2.6", name: "Median SE response time (min)", baseline: 180, target: 60, current: 48, source: "Platform", frequency: "Weekly", invert: true, unit: "min" },
  { code: "7.2.7", name: "% facilities meeting cold-chain SOP", baseline: 70, target: 100, current: 92, source: "Supervision", frequency: "Monthly" },
];

export const QUALITATIVE = [
  { item: "Caregiver satisfaction interviews conducted this quarter", done: true },
  { item: "Community health worker debrief completed", done: true },
  { item: "Facility staff feedback session held", done: false },
  { item: "Equity audit (gender, geography, language) reviewed", done: true },
  { item: "Escalation SOPs revised with field feedback", done: false },
];

export const SAFETY_LOG = [
  { date: "2026-07-08", site: "Mathare North", type: "AEFI mild", note: "Redness after Penta 2 — resolved <24h", status: "Closed" },
  { date: "2026-07-05", site: "Kibera Health Ctr", type: "Data privacy", note: "Consent form clarified with caregiver", status: "Closed" },
  { date: "2026-06-29", site: "Dandora Disp.", type: "Cold chain", note: "Fridge alarm — 2h excursion, vials retained per SOP", status: "Under review" },
  { date: "2026-06-24", site: "Korogocho HC", type: "AEFI mild", note: "Low fever post-Measles 1 — resolved", status: "Closed" },
];

export const REPORTS = [
  { name: "Monthly implementor summary — July 2026", type: "PDF", size: "412 KB", date: "2026-07-01" },
  { name: "Monthly implementor summary — June 2026", type: "PDF", size: "398 KB", date: "2026-06-01" },
  { name: "Q2 M&E indicator brief", type: "PDF", size: "1.1 MB", date: "2026-07-03" },
  { name: "Coverage by antigen (anonymized)", type: "CSV", size: "76 KB", date: "2026-07-14" },
  { name: "Channel performance detail", type: "CSV", size: "128 KB", date: "2026-07-14" },
  { name: "Cohort funnel weekly", type: "CSV", size: "44 KB", date: "2026-07-13" },
];