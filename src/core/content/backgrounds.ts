import type { Background } from "../models/types";

export const BACKGROUNDS: Background[] = [
  {
    id: "investment_banker",
    name: "投行背景",
    modifiers: { financingPower: 0.2, complianceControl: -0.1, growthExecution: 0.1 },
  },
  {
    id: "state_enterprise",
    name: "国企背景",
    modifiers: { financingPower: -0.05, complianceControl: 0.2, growthExecution: -0.1 },
  },
  {
    id: "big_four",
    name: "四大背景",
    modifiers: { financingPower: 0, complianceControl: 0.15, growthExecution: -0.02 },
  },
];
