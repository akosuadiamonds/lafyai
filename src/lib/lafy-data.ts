// Mock data for the lafyai implementor dashboard. Read-only, deterministic.

export const KPIS = [
  { label: "Fully immunized children", value: "82%", delta: "+4.1 pts", trend: "up", sub: "vs. last month" },
  { label: "D-1 confirmation rate", value: "71%", delta: "+2.6 pts", trend: "up", sub: "WhatsApp + Voice" },
  { label: "Dropout (Penta1→Penta3)", value: "6.4%", delta: "-1.2 pts", trend: "down", sub: "Target < 10%" },
  { label: "Active facilities", value: "24 / 26", delta: "2 offline", trend: "flat", sub: "Last 7 days" },
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