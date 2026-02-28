import type { Decision, GameState } from "../models/types";

export function evaluateUnlocks(state: GameState, decisions: Decision[]): string[] {
  const newlyUnlocked: string[] = [];

  const shouldUnlockDebtRestructure = state.ratios.interestCoverage < 1.8 || state.company.shortDebt > state.company.longDebt;
  if (shouldUnlockDebtRestructure && !state.unlockedDecisionIds.has("debt_restructure")) {
    state.unlockedDecisionIds.add("debt_restructure");
    newlyUnlocked.push("debt_restructure");
  }

  const profitCashMismatch = state.statements.pnl.netIncome > 0 && state.statements.cf.operatingCashFlow < 0;
  const highDso = state.ratios.dso > 55;
  if (profitCashMismatch && highDso && !state.unlockedDecisionIds.has("ar_task_force")) {
    state.unlockedDecisionIds.add("ar_task_force");
    newlyUnlocked.push("ar_task_force");
  }

  return newlyUnlocked;
}
