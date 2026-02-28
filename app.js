const BACKGROUNDS = {
  investment_banker: { name: "投行背景", growthBoost: 1.03, complianceDelta: 2.2 },
  state_enterprise: { name: "国企背景", growthBoost: 0.99, complianceDelta: 0.8 },
  big_four: { name: "四大背景", growthBoost: 1.0, complianceDelta: 0.9 },
};

const DECISIONS = {
  tighten_collection: {
    name: "收款政策收紧",
    description: "降低应收，但轻微影响收入",
    apply: (s) => ({ ...s, ar: s.ar * 0.9, revenue: s.revenue * 0.98, complianceRisk: s.complianceRisk + 1 }),
  },
  delay_payables: {
    name: "拉长应付账款",
    description: "改善现金压力，但提高合规风险",
    apply: (s) => ({ ...s, ap: s.ap * 1.15, complianceRisk: s.complianceRisk + 3 }),
  },
  increase_marketing: {
    name: "增加营销投入",
    description: "追求增长，提高销售费用率",
    apply: (s) => ({ ...s, revenue: s.revenue * 1.08, salesExpenseRate: s.salesExpenseRate + 0.02, growthPressure: Math.max(0, s.growthPressure - 3) }),
  },
  compliance_audit: {
    name: "强化内控审计",
    description: "降低合规风险，增加管理费用率",
    apply: (s) => ({ ...s, adminExpenseRate: s.adminExpenseRate + 0.01, complianceRisk: Math.max(0, s.complianceRisk - 6) }),
  },
  debt_restructure: {
    name: "债务结构重组",
    description: "压短债、拉长债务久期",
    apply: (s) => ({ ...s, shortDebt: s.shortDebt * 0.7, longDebt: s.longDebt + s.shortDebt * 0.3 }),
  },
  ar_task_force: {
    name: "应收专项治理",
    description: "应收回款专项行动，牺牲部分增长",
    apply: (s) => ({ ...s, ar: s.ar * 0.8, growthPressure: s.growthPressure + 2 }),
  },
};

let game;
let selectedTab = "pnl";
let selectedDecisions = [];

function createInitialState(backgroundId) {
  const company = {
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
  const prev = { ...company, revenue: 100, ar: 38, inventory: 16, ap: 18, cash: 40 };
  const statements = buildStatements(company, prev);
  return {
    turn: 1,
    maxTurns: 8,
    backgroundId,
    company,
    previous: prev,
    statements,
    ratios: buildRatios(company, prev, statements),
    unlocked: new Set(["tighten_collection", "delay_payables", "increase_marketing", "compliance_audit"]),
    logs: ["游戏开始：请阅读报表并做出本季度决策。"],
  };
}

function buildStatements(current, previous) {
  const revenue = current.revenue;
  const cogs = revenue * current.cogsRate;
  const grossProfit = revenue - cogs;
  const salesExpense = revenue * current.salesExpenseRate;
  const adminExpense = revenue * current.adminExpenseRate;
  const rndExpense = revenue * current.rndExpenseRate;
  const depreciation = current.depreciation;
  const ebit = grossProfit - salesExpense - adminExpense - rndExpense - depreciation;
  const interestExpense = current.shortDebt * current.interestRateShort + current.longDebt * current.interestRateLong;
  const preTaxIncome = ebit - interestExpense;
  const tax = Math.max(0, preTaxIncome) * current.taxRate;
  const netIncome = preTaxIncome - tax;

  const deltaAR = current.ar - previous.ar;
  const deltaInventory = current.inventory - previous.inventory;
  const deltaAP = current.ap - previous.ap;
  const operatingCashFlow = netIncome + depreciation - deltaAR - deltaInventory + deltaAP;
  const investingCashFlow = -(current.fixedAssets - previous.fixedAssets);
  const financingCashFlow = (current.shortDebt - previous.shortDebt) + (current.longDebt - previous.longDebt);
  const netCashChange = operatingCashFlow + investingCashFlow + financingCashFlow;
  const endingCash = previous.cash + netCashChange;
  const assets = endingCash + current.ar + current.inventory + current.fixedAssets;
  const liabilities = current.ap + current.shortDebt + current.longDebt;
  const equity = assets - liabilities;

  return {
    pnl: { revenue, cogs, grossProfit, salesExpense, adminExpense, rndExpense, depreciation, ebit, interestExpense, preTaxIncome, tax, netIncome },
    cf: { operatingCashFlow, investingCashFlow, financingCashFlow, netCashChange, endingCash },
    bs: { assets, liabilities, equity },
  };
}

function buildRatios(current, previous, statements) {
  return {
    growthRate: (current.revenue - previous.revenue) / previous.revenue,
    grossMargin: statements.pnl.grossProfit / statements.pnl.revenue,
    netMargin: statements.pnl.netIncome / statements.pnl.revenue,
    debtRatio: statements.bs.liabilities / statements.bs.assets,
    dso: (current.ar / current.revenue) * 90,
    inventoryDays: (current.inventory / statements.pnl.cogs) * 90,
    interestCoverage: statements.pnl.ebit / statements.pnl.interestExpense,
  };
}

function unlockDecisions(state) {
  if ((state.ratios.interestCoverage < 1.8 || state.company.shortDebt > state.company.longDebt) && !state.unlocked.has("debt_restructure")) {
    state.unlocked.add("debt_restructure");
    state.logs.unshift("解锁：债务结构重组（短债压力过高）");
  }
  if (state.statements.pnl.netIncome > 0 && state.statements.cf.operatingCashFlow < 0 && state.ratios.dso > 55 && !state.unlocked.has("ar_task_force")) {
    state.unlocked.add("ar_task_force");
    state.logs.unshift("解锁：应收专项治理（增收不增现）");
  }
}

function playTurn() {
  let ap = 2;
  let company = { ...game.company };
  for (const id of selectedDecisions) {
    if (ap <= 0) break;
    company = DECISIONS[id].apply(company);
    ap -= 1;
  }

  const bg = BACKGROUNDS[game.backgroundId];
  company.revenue *= bg.growthBoost;
  company.complianceRisk += bg.complianceDelta;
  company.growthPressure = Math.max(0, company.growthPressure + (bg.growthBoost < 1 ? 3 : -1));

  const nextStatements = buildStatements(company, game.company);
  company.cash = nextStatements.cf.endingCash;
  const finalStatements = buildStatements(company, game.company);
  const ratios = buildRatios(company, game.company, finalStatements);

  game = {
    ...game,
    turn: game.turn + 1,
    previous: game.company,
    company,
    statements: finalStatements,
    ratios,
    logs: [`Q${game.turn}结算：净利润 ${finalStatements.pnl.netIncome.toFixed(2)}, 经营现金流 ${finalStatements.cf.operatingCashFlow.toFixed(2)}`, ...game.logs],
  };
  unlockDecisions(game);
  selectedDecisions = [];

  if (game.company.cash < 0) {
    game.logs.unshift("失败：现金流断裂，公司进入破产保护。 ");
  } else if (game.company.complianceRisk >= 75) {
    game.logs.unshift("失败：合规爆雷，IPO 终止。");
  } else if (game.turn > game.maxTurns) {
    const ipo = game.company.revenue >= 220 && game.statements.pnl.netIncome > 0 && game.statements.cf.operatingCashFlow > 0 && game.company.complianceRisk < 45;
    game.logs.unshift(ipo ? "胜利：你带领公司达成 IPO！" : "回合结束：未达到 IPO 标准。");
  }

  render();
}

function fmt(n) { return Number.isFinite(n) ? n.toFixed(2) : "-"; }

function renderTable(rows) {
  return `<table class="table">${rows.map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>`;
}

function badge(value, reverse = false) {
  const bad = reverse ? value > 60 : value > 60;
  const warn = reverse ? value > 35 && value <= 60 : value > 35 && value <= 60;
  if (bad) return "bad";
  if (warn) return "warn";
  return "good";
}

function render() {
  document.getElementById("meta").innerHTML = `回合 Q${Math.min(game.turn, game.maxTurns)} / ${game.maxTurns}<br/>背景：${BACKGROUNDS[game.backgroundId].name}`;
  const triad = [
    ["现金压力", Math.max(0, 100 - game.company.cash)],
    ["增长压力", game.company.growthPressure],
    ["合规风险", game.company.complianceRisk],
  ];
  document.getElementById("triad").innerHTML = triad.map(([name,val]) => `<div class="metric"><span>${name}</span><span class="badge ${badge(val)}">${fmt(val)}</span></div>`).join("");

  const pnl = game.statements.pnl;
  const bs = game.statements.bs;
  const cf = game.statements.cf;
  const ratio = game.ratios;

  const map = {
    pnl: renderTable([["营业收入", fmt(pnl.revenue)], ["营业成本", fmt(pnl.cogs)], ["毛利", fmt(pnl.grossProfit)], ["销售费用", fmt(pnl.salesExpense)], ["管理费用", fmt(pnl.adminExpense)], ["研发费用", fmt(pnl.rndExpense)], ["EBIT", fmt(pnl.ebit)], ["净利润", fmt(pnl.netIncome)]]),
    bs: renderTable([["总资产", fmt(bs.assets)], ["总负债", fmt(bs.liabilities)], ["股东权益", fmt(bs.equity)], ["现金", fmt(game.company.cash)], ["应收", fmt(game.company.ar)], ["应付", fmt(game.company.ap)]]),
    cf: renderTable([["经营现金流", fmt(cf.operatingCashFlow)], ["投资现金流", fmt(cf.investingCashFlow)], ["融资现金流", fmt(cf.financingCashFlow)], ["净现金变动", fmt(cf.netCashChange)], ["期末现金", fmt(cf.endingCash)]]),
    ratio: renderTable([["收入增速", `${fmt(ratio.growthRate * 100)}%`], ["毛利率", `${fmt(ratio.grossMargin * 100)}%`], ["净利率", `${fmt(ratio.netMargin * 100)}%`], ["资产负债率", `${fmt(ratio.debtRatio * 100)}%`], ["DSO", fmt(ratio.dso)], ["库存周转天数", fmt(ratio.inventoryDays)], ["利息保障倍数", fmt(ratio.interestCoverage)]]),
  };
  document.getElementById("statement-table").innerHTML = map[selectedTab];

  const decisionList = [...game.unlocked].map((id) => {
    const d = DECISIONS[id];
    const active = selectedDecisions.includes(id);
    return `<div class="decision"><h4>${d.name}</h4><p>${d.description}</p><button data-pick="${id}" ${active ? "disabled" : ""}>${active ? "已选择" : "选择"}</button></div>`;
  }).join("");
  document.getElementById("decision-list").innerHTML = decisionList;

  document.getElementById("logs").innerHTML = game.logs.map((l) => `<div>${l}</div>`).join("");
}

document.querySelectorAll(".tabs button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTab = btn.dataset.tab;
    render();
  });
});

document.getElementById("decision-list").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-pick]");
  if (!btn) return;
  if (selectedDecisions.length >= 2) return;
  selectedDecisions.push(btn.dataset.pick);
  render();
});

document.getElementById("end-turn").addEventListener("click", () => {
  playTurn();
});

const dialog = document.getElementById("start-dialog");
dialog.showModal();
dialog.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-bg]");
  if (!btn) return;
  game = createInitialState(btn.dataset.bg);
  dialog.close();
  render();
});
