import type { CompanyState, Decision } from "../models/types";

const withPatch = (state: CompanyState, patch: Partial<CompanyState>): CompanyState => ({ ...state, ...patch });

export const DECISIONS: Decision[] = [
  {
    id: "tighten_collection",
    name: "收款政策收紧",
    apCost: 1,
    unlockedByDefault: true,
    apply: (s) => withPatch(s, { ar: s.ar * 0.9, revenue: s.revenue * 0.98, complianceRisk: s.complianceRisk + 1 }),
  },
  {
    id: "delay_payables",
    name: "拉长应付账款",
    apCost: 1,
    unlockedByDefault: true,
    apply: (s) => withPatch(s, { ap: s.ap * 1.15, complianceRisk: s.complianceRisk + 3 }),
  },
  {
    id: "increase_marketing",
    name: "增加营销投入",
    apCost: 1,
    unlockedByDefault: true,
    apply: (s) => withPatch(s, { revenue: s.revenue * 1.08, salesExpenseRate: s.salesExpenseRate + 0.02, growthPressure: Math.max(0, s.growthPressure - 3) }),
  },
  {
    id: "compliance_audit",
    name: "强化内控审计",
    apCost: 1,
    unlockedByDefault: true,
    apply: (s) => withPatch(s, { adminExpenseRate: s.adminExpenseRate + 0.01, complianceRisk: Math.max(0, s.complianceRisk - 6) }),
  },
  {
    id: "debt_restructure",
    name: "债务结构重组",
    apCost: 1,
    unlockedByDefault: false,
    apply: (s) => withPatch(s, { shortDebt: s.shortDebt * 0.7, longDebt: s.longDebt + s.shortDebt * 0.3, adminExpenseRate: s.adminExpenseRate + 0.005 }),
  },
  {
    id: "ar_task_force",
    name: "应收专项治理",
    apCost: 1,
    unlockedByDefault: false,
    apply: (s) => withPatch(s, { ar: s.ar * 0.8, adminExpenseRate: s.adminExpenseRate + 0.01, growthPressure: s.growthPressure + 2 }),
  },
];
