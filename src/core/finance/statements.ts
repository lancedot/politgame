import type { CompanyState, Ratios, Statements } from "../models/types";

export function buildStatements(current: CompanyState, previous: CompanyState): Statements {
  const revenue = current.revenue;
  const cogs = revenue * current.cogsRate;
  const grossProfit = revenue - cogs;
  const salesExpense = revenue * current.salesExpenseRate;
  const adminExpense = revenue * current.adminExpenseRate;
  const rndExpense = revenue * current.rndExpenseRate;
  const depreciation = current.depreciation;
  const ebit = grossProfit - salesExpense - adminExpense - rndExpense - depreciation;

  const interestExpense =
    current.shortDebt * current.interestRateShort +
    current.longDebt * current.interestRateLong;
  const preTaxIncome = ebit - interestExpense;
  const tax = Math.max(0, preTaxIncome) * current.taxRate;
  const netIncome = preTaxIncome - tax;

  const deltaAR = current.ar - previous.ar;
  const deltaInventory = current.inventory - previous.inventory;
  const deltaAP = current.ap - previous.ap;

  const operatingCashFlow = netIncome + depreciation - deltaAR - deltaInventory + deltaAP;
  const investingCashFlow = -(current.fixedAssets - previous.fixedAssets);
  const financingCashFlow =
    (current.shortDebt - previous.shortDebt) + (current.longDebt - previous.longDebt);
  const netCashChange = operatingCashFlow + investingCashFlow + financingCashFlow;
  const endingCash = previous.cash + netCashChange;

  const assets = endingCash + current.ar + current.inventory + current.fixedAssets;
  const liabilities = current.ap + current.shortDebt + current.longDebt;
  const equity = assets - liabilities;

  return {
    pnl: {
      revenue,
      cogs,
      grossProfit,
      salesExpense,
      adminExpense,
      rndExpense,
      depreciation,
      ebit,
      interestExpense,
      preTaxIncome,
      tax,
      netIncome,
    },
    cf: {
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashChange,
      endingCash,
    },
    bs: { assets, liabilities, equity },
  };
}

export function buildRatios(current: CompanyState, previous: CompanyState, statements: Statements): Ratios {
  const growthRate = previous.revenue === 0 ? 0 : (current.revenue - previous.revenue) / previous.revenue;
  const grossMargin = statements.pnl.revenue === 0 ? 0 : statements.pnl.grossProfit / statements.pnl.revenue;
  const netMargin = statements.pnl.revenue === 0 ? 0 : statements.pnl.netIncome / statements.pnl.revenue;
  const debtRatio = statements.bs.assets === 0 ? 0 : statements.bs.liabilities / statements.bs.assets;
  const dso = current.revenue === 0 ? 0 : (current.ar / current.revenue) * 90;
  const inventoryDays = statements.pnl.cogs === 0 ? 0 : (current.inventory / statements.pnl.cogs) * 90;
  const interestCoverage = statements.pnl.interestExpense === 0 ? 99 : statements.pnl.ebit / statements.pnl.interestExpense;

  return { growthRate, grossMargin, netMargin, debtRatio, dso, inventoryDays, interestCoverage };
}

export function validateStatements(statements: Statements): void {
  const diff = Math.abs(statements.bs.assets - (statements.bs.liabilities + statements.bs.equity));
  if (diff > 1e-6) {
    throw new Error("Balance sheet is not balanced");
  }
}
