export type CfoBackgroundId = "investment_banker" | "state_enterprise" | "big_four";

export interface Background {
  id: CfoBackgroundId;
  name: string;
  modifiers: {
    financingPower: number;
    complianceControl: number;
    growthExecution: number;
  };
}

export interface CompanyState {
  revenue: number;
  cogsRate: number;
  salesExpenseRate: number;
  adminExpenseRate: number;
  rndExpenseRate: number;
  depreciation: number;
  taxRate: number;

  cash: number;
  ar: number;
  inventory: number;
  fixedAssets: number;
  ap: number;
  shortDebt: number;
  longDebt: number;

  interestRateShort: number;
  interestRateLong: number;

  complianceRisk: number;
  growthPressure: number;
}

export interface Decision {
  id: string;
  name: string;
  apCost: number;
  unlockedByDefault: boolean;
  apply: (state: CompanyState) => CompanyState;
}

export interface Statements {
  pnl: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    salesExpense: number;
    adminExpense: number;
    rndExpense: number;
    depreciation: number;
    ebit: number;
    interestExpense: number;
    preTaxIncome: number;
    tax: number;
    netIncome: number;
  };
  cf: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashChange: number;
    endingCash: number;
  };
  bs: {
    assets: number;
    liabilities: number;
    equity: number;
  };
}

export interface Ratios {
  growthRate: number;
  grossMargin: number;
  netMargin: number;
  debtRatio: number;
  dso: number;
  inventoryDays: number;
  interestCoverage: number;
}

export interface GameState {
  turn: number;
  maxTurns: number;
  ap: number;
  background: Background;
  company: CompanyState;
  previousCompany: CompanyState;
  unlockedDecisionIds: Set<string>;
  statements: Statements;
  ratios: Ratios;
  logs: string[];
}
