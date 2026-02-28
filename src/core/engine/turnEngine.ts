import { BACKGROUNDS } from "../content/backgrounds";
import { DECISIONS } from "../content/decisions";
import { buildRatios, buildStatements, validateStatements } from "../finance/statements";
import type { CfoBackgroundId, CompanyState, Decision, GameState } from "../models/types";
import { evaluateUnlocks } from "./unlocks";

const DEFAULT_AP = 2;

export function createInitialState(backgroundId: CfoBackgroundId, maxTurns = 8): GameState {
  const background = BACKGROUNDS.find((b) => b.id === backgroundId);
  if (!background) {
    throw new Error(`Unknown background: ${backgroundId}`);
  }

  const baseline: CompanyState = {
    revenue: 120,
    cogsRate: 0.42,
    salesExpenseRate: 0.16,
    adminExpenseRate: 0.11,
    rndExpenseRate: 0.09,
    depreciation: 4,
    taxRate: 0.2,

    cash: 45,
    ar: 48,
    inventory: 20,
    fixedAssets: 60,
    ap: 22,
    shortDebt: 35,
    longDebt: 28,

    interestRateShort: 0.02,
    interestRateLong: 0.012,

    complianceRisk: 25,
    growthPressure: 35,
  };

  const previous = { ...baseline, revenue: 100, ar: 38, inventory: 16, ap: 18, cash: 40 };
  const statements = buildStatements(baseline, previous);
  const ratios = buildRatios(baseline, previous, statements);

  return {
    turn: 1,
    maxTurns,
    ap: DEFAULT_AP,
    background,
    company: baseline,
    previousCompany: previous,
    unlockedDecisionIds: new Set(DECISIONS.filter((d) => d.unlockedByDefault).map((d) => d.id)),
    statements,
    ratios,
    logs: ["游戏开始：你已接任 CFO。"],
  };
}

export function getAvailableDecisions(state: GameState): Decision[] {
  return DECISIONS.filter((d) => state.unlockedDecisionIds.has(d.id));
}

export function playTurn(state: GameState, decisionIds: string[]): GameState {
  if (state.turn > state.maxTurns) {
    throw new Error("Game is already over");
  }

  let current = { ...state.company };
  let ap = DEFAULT_AP;

  for (const id of decisionIds) {
    const decision = DECISIONS.find((d) => d.id === id);
    if (!decision) {
      throw new Error(`Unknown decision: ${id}`);
    }
    if (!state.unlockedDecisionIds.has(id)) {
      throw new Error(`Decision not unlocked: ${id}`);
    }
    if (ap < decision.apCost) {
      throw new Error(`Insufficient AP for ${id}`);
    }
    ap -= decision.apCost;
    current = decision.apply(current);
  }

  current = applyQuarterDrift(current, state.background.id);

  const statements = buildStatements(current, state.company);
  current.cash = statements.cf.endingCash;
  const recomputed = buildStatements(current, state.company);
  validateStatements(recomputed);
  const ratios = buildRatios(current, state.company, recomputed);

  const next: GameState = {
    ...state,
    turn: state.turn + 1,
    ap: DEFAULT_AP,
    previousCompany: state.company,
    company: current,
    statements: recomputed,
    ratios,
    logs: [...state.logs, `Q${state.turn} 结束：净利润 ${recomputed.pnl.netIncome.toFixed(2)}，经营现金流 ${recomputed.cf.operatingCashFlow.toFixed(2)}`],
  };

  const unlocked = evaluateUnlocks(next, DECISIONS);
  for (const id of unlocked) {
    next.logs.push(`已解锁高级决策：${id}`);
  }

  return next;
}

function applyQuarterDrift(company: CompanyState, backgroundId: CfoBackgroundId): CompanyState {
  let growthBoost = 1;
  let complianceDelta = 1.5;

  if (backgroundId === "investment_banker") {
    growthBoost = 1.03;
    complianceDelta = 2.2;
  } else if (backgroundId === "state_enterprise") {
    growthBoost = 0.99;
    complianceDelta = 0.8;
  } else if (backgroundId === "big_four") {
    growthBoost = 1.0;
    complianceDelta = 0.9;
  }

  return {
    ...company,
    revenue: company.revenue * growthBoost,
    complianceRisk: Math.max(0, company.complianceRisk + complianceDelta),
    growthPressure: Math.max(0, company.growthPressure + (growthBoost < 1 ? 3 : -1)),
  };
}

export function getGameOutcome(state: GameState): "ongoing" | "ipo" | "cash_crash" | "compliance_blowup" {
  if (state.company.cash < 0) {
    return "cash_crash";
  }
  if (state.company.complianceRisk >= 75) {
    return "compliance_blowup";
  }

  if (state.turn > state.maxTurns) {
    const ipoQualified =
      state.company.revenue >= 220 &&
      state.statements.pnl.netIncome > 0 &&
      state.statements.cf.operatingCashFlow > 0 &&
      state.company.complianceRisk < 45 &&
      state.company.cash > 20;
    return ipoQualified ? "ipo" : "cash_crash";
  }

  return "ongoing";
}
