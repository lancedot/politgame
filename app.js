const IPO_TARGETS = {
  revenue: 220,
  netIncome: 10,
  operatingCashFlow: 8,
  complianceRiskMax: 45,
  cash: 25,
  marketShare: 0.2,
};

const BACKGROUNDS = {
  investment_banker: { name: "投行背景", growthBoost: 1.03, complianceDelta: 2.2, financingDiscount: 0.85 },
  state_enterprise: { name: "国企背景", growthBoost: 0.99, complianceDelta: 0.8, financingDiscount: 0.95 },
  big_four: { name: "四大背景", growthBoost: 1.0, complianceDelta: 0.9, financingDiscount: 1 },
};

const DECISIONS = {
  tighten_collection: {
    name: "收款政策收紧",
    description: "降低应收，轻微影响收入",
    preview: "AR -10%, Revenue -2%",
    apply: (s) => ({ ...s, ar: s.ar * 0.9, revenue: s.revenue * 0.98, complianceRisk: s.complianceRisk + 1 }),
  },
  delay_payables: {
    name: "拉长应付账款",
    description: "缓解现金压力，提高合规风险",
    preview: "AP +15%, Compliance +3",
    apply: (s) => ({ ...s, ap: s.ap * 1.15, complianceRisk: s.complianceRisk + 3 }),
  },
  increase_marketing: {
    name: "增加营销投入",
    description: "提升品牌和需求，短期成本上升",
    preview: "Demand +0.06, Brand +0.04, S&M +2pct",
    apply: (s) => ({
      ...s,
      marketDemand: Math.min(1.35, s.marketDemand + 0.06),
      brandStrength: Math.min(1.4, s.brandStrength + 0.04),
      salesExpenseRate: s.salesExpenseRate + 0.02,
      growthPressure: Math.max(0, s.growthPressure - 3),
    }),
  },
  improve_product: {
    name: "产品体验升级",
    description: "提高产品力与市场份额转化",
    preview: "Product +0.05, R&D +1pct",
    apply: (s) => ({ ...s, productQuality: Math.min(1.45, s.productQuality + 0.05), rndExpenseRate: s.rndExpenseRate + 0.01 }),
  },
  compliance_audit: {
    name: "强化内控审计",
    description: "降低合规风险，增加管理费用",
    preview: "Compliance -6, Admin +1pct",
    apply: (s) => ({ ...s, adminExpenseRate: s.adminExpenseRate + 0.01, complianceRisk: Math.max(0, s.complianceRisk - 6) }),
  },
  debt_restructure: {
    name: "债务结构重组",
    description: "压缩短债，拉长久期",
    preview: "Short Debt -30%, Long Debt +30%(of short debt)",
    apply: (s) => ({ ...s, shortDebt: s.shortDebt * 0.7, longDebt: s.longDebt + s.shortDebt * 0.3 }),
  },
  ar_task_force: {
    name: "应收专项治理",
    description: "回款提升，增长承压",
    preview: "AR -20%, Growth pressure +2",
    apply: (s) => ({ ...s, ar: s.ar * 0.8, growthPressure: s.growthPressure + 2 }),
  },
  bridge_financing: {
    name: "过桥融资",
    description: "快速拿现金，但融资成本较高",
    preview: "Short debt +12, rate +0.3pct",
    apply: (s) => ({ ...s, shortDebt: s.shortDebt + 12, interestRateShort: s.interestRateShort + 0.003 }),
  },
  equity_financing: {
    name: "股权融资",
    description: "改善现金与负债结构，但稀释股权",
    preview: "Cash via financing, Dilution +3%",
    apply: (s) => ({ ...s, equityDilution: Math.min(0.35, s.equityDilution + 0.03), complianceRisk: Math.max(0, s.complianceRisk - 2) }),
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
    marketDemand: 1,
    marketShare: 0.12,
    productQuality: 1,
    brandStrength: 1,
    financingWindow: 1,
    equityDilution: 0,
  };
  const prev = { ...company, revenue: 100, ar: 38, inventory: 16, ap: 18, cash: 40, marketShare: 0.1 };
  const statements = buildStatements(company, prev);
  return {
    turn: 1,
    maxTurns: 8,
    backgroundId,
    company,
    previous: prev,
    statements,
    ratios: buildRatios(company, prev, statements),
    unlocked: new Set(["tighten_collection", "delay_payables", "increase_marketing", "improve_product", "compliance_audit", "bridge_financing", "equity_financing"]),
    logs: ["游戏开始：本季度请先选择 2 个行动。"],
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
    growthRate: previous.revenue === 0 ? 0 : (current.revenue - previous.revenue) / previous.revenue,
    grossMargin: statements.pnl.revenue === 0 ? 0 : statements.pnl.grossProfit / statements.pnl.revenue,
    netMargin: statements.pnl.revenue === 0 ? 0 : statements.pnl.netIncome / statements.pnl.revenue,
    debtRatio: statements.bs.assets === 0 ? 0 : statements.bs.liabilities / statements.bs.assets,
    dso: current.revenue === 0 ? 0 : (current.ar / current.revenue) * 90,
    inventoryDays: statements.pnl.cogs === 0 ? 0 : (current.inventory / statements.pnl.cogs) * 90,
    interestCoverage: statements.pnl.interestExpense === 0 ? 99 : statements.pnl.ebit / statements.pnl.interestExpense,
  };
}

function applyMarketAndFinancing(company, backgroundId) {
  const bg = BACKGROUNDS[backgroundId];
  const marketShock = 0.97 + Math.random() * 0.08;
  const financingShock = 0.95 + Math.random() * 0.12;

  const demand = company.marketDemand * marketShock;
  const competitiveness = 0.45 * company.productQuality + 0.35 * company.brandStrength + 0.2 * bg.growthBoost;
  const share = Math.min(0.45, Math.max(0.05, company.marketShare + (competitiveness - 1) * 0.04));
  const revenueMultiplier = demand * (0.7 + share) * bg.growthBoost;

  const next = { ...company };
  next.marketDemand = demand;
  next.marketShare = share;
  next.financingWindow = financingShock;
  next.revenue = Math.max(40, company.revenue * revenueMultiplier);

  if (selectedDecisions.includes("equity_financing")) {
    const capital = 18 * financingShock * bg.financingDiscount;
    next.cash += capital;
  }

  return next;
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

function getOutcome() {
  if (game.company.cash < 0) return "cash_crash";
  if (game.company.complianceRisk >= 75) return "compliance_blowup";
  if (game.turn <= game.maxTurns) return "ongoing";

  const ipoReady =
    game.company.revenue >= IPO_TARGETS.revenue &&
    game.statements.pnl.netIncome >= IPO_TARGETS.netIncome &&
    game.statements.cf.operatingCashFlow >= IPO_TARGETS.operatingCashFlow &&
    game.company.complianceRisk <= IPO_TARGETS.complianceRiskMax &&
    game.company.cash >= IPO_TARGETS.cash &&
    game.company.marketShare >= IPO_TARGETS.marketShare;

  return ipoReady ? "ipo" : "not_qualified";
}

function playTurn() {
  if (selectedDecisions.length !== 2) {
    game.logs.unshift("请先选择 2 个行动再结算。");
    render();
    return;
  }

  let company = { ...game.company };
  const beforeRevenue = company.revenue;

  for (const id of selectedDecisions) {
    company = DECISIONS[id].apply(company);
  }

  company = applyMarketAndFinancing(company, game.backgroundId);
  company.complianceRisk += BACKGROUNDS[game.backgroundId].complianceDelta;
  company.growthPressure = Math.max(0, company.growthPressure + (company.revenue > beforeRevenue ? -2 : 2));

  const firstPass = buildStatements(company, game.company);
  company.cash = firstPass.cf.endingCash + (company.cash - game.company.cash);
  const finalStatements = buildStatements(company, game.company);
  const ratios = buildRatios(company, game.company, finalStatements);
  const revenueDelta = company.revenue - beforeRevenue;

  game = {
    ...game,
    turn: game.turn + 1,
    previous: game.company,
    company,
    statements: finalStatements,
    ratios,
    logs: [
      `Q${game.turn}结算：Revenue Δ ${fmt(revenueDelta)}, Net Income ${fmt(finalStatements.pnl.netIncome)}, CFO ${fmt(finalStatements.cf.operatingCashFlow)}`,
      ...game.logs,
    ],
  };

  unlockDecisions(game);
  selectedDecisions = [];

  const outcome = getOutcome();
  if (outcome === "cash_crash") game.logs.unshift("失败：现金流断裂，公司进入破产保护。");
  else if (outcome === "compliance_blowup") game.logs.unshift("失败：合规爆雷，IPO 终止。");
  else if (outcome === "ipo") game.logs.unshift("胜利：你带领公司达成 IPO！");
  else if (outcome === "not_qualified") game.logs.unshift("回合结束：未达 IPO 标准（请查看 IPO 目标进度）。");

  render();
}

function fmt(n) {
  return Number.isFinite(n) ? n.toFixed(2) : "-";
}

function renderTable(rows) {
  return `<table class="table">${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>`;
}

function badge(value, goodThreshold, warnThreshold, lowerIsBetter = false) {
  if (lowerIsBetter) {
    if (value <= goodThreshold) return "good";
    if (value <= warnThreshold) return "warn";
    return "bad";
  }
  if (value >= goodThreshold) return "good";
  if (value >= warnThreshold) return "warn";
  return "bad";
}

function renderIpoProgress() {
  const items = [
    ["收入规模", game.company.revenue, IPO_TARGETS.revenue, false],
    ["净利润", game.statements.pnl.netIncome, IPO_TARGETS.netIncome, false],
    ["经营现金流", game.statements.cf.operatingCashFlow, IPO_TARGETS.operatingCashFlow, false],
    ["现金储备", game.company.cash, IPO_TARGETS.cash, false],
    ["市场份额", game.company.marketShare, IPO_TARGETS.marketShare, false],
    ["合规风险(越低越好)", game.company.complianceRisk, IPO_TARGETS.complianceRiskMax, true],
  ];

  document.getElementById("ipo-progress").innerHTML = items
    .map(([name, current, target, lowerIsBetter]) => {
      const ok = lowerIsBetter ? current <= target : current >= target;
      const gap = lowerIsBetter ? current - target : target - current;
      const status = ok ? "good" : gap < (lowerIsBetter ? 10 : target * 0.2) ? "warn" : "bad";
      return `<div class="metric"><span>${name}<br><small>目标 ${fmt(target)} / 当前 ${fmt(current)}</small></span><span class="badge ${status}">${ok ? "达成" : `差 ${fmt(Math.max(0, gap))}`}</span></div>`;
    })
    .join("");
}

function render() {
  document.getElementById("meta").innerHTML = `回合 Q${Math.min(game.turn, game.maxTurns)} / ${game.maxTurns}<br/>背景：${BACKGROUNDS[game.backgroundId].name}`;

  document.getElementById("triad").innerHTML = [
    ["现金压力", Math.max(0, 100 - game.company.cash), 25, 60, true],
    ["增长压力", game.company.growthPressure, 20, 45, true],
    ["合规风险", game.company.complianceRisk, 25, 50, true],
  ]
    .map(([name, val, good, warn, lower]) => `<div class="metric"><span>${name}</span><span class="badge ${badge(val, good, warn, lower)}">${fmt(val)}</span></div>`)
    .join("");

  renderIpoProgress();

  document.getElementById("market").innerHTML = [
    ["市场需求", game.company.marketDemand],
    ["市场份额", game.company.marketShare],
    ["产品力", game.company.productQuality],
    ["品牌势能", game.company.brandStrength],
    ["融资窗口", game.company.financingWindow],
    ["累计股权稀释", game.company.equityDilution],
  ].map(([k, v]) => `<div class="metric"><span>${k}</span><span>${fmt(v)}</span></div>`).join("");

  const pnl = game.statements.pnl;
  const bs = game.statements.bs;
  const cf = game.statements.cf;
  const ratio = game.ratios;

  const map = {
    pnl: renderTable([
      ["营业收入", fmt(pnl.revenue)], ["营业成本", fmt(pnl.cogs)], ["毛利", fmt(pnl.grossProfit)], ["销售费用", fmt(pnl.salesExpense)], ["管理费用", fmt(pnl.adminExpense)], ["研发费用", fmt(pnl.rndExpense)], ["EBIT", fmt(pnl.ebit)], ["净利润", fmt(pnl.netIncome)],
    ]),
    bs: renderTable([
      ["总资产", fmt(bs.assets)], ["总负债", fmt(bs.liabilities)], ["股东权益", fmt(bs.equity)], ["现金", fmt(game.company.cash)], ["应收", fmt(game.company.ar)], ["应付", fmt(game.company.ap)],
    ]),
    cf: renderTable([
      ["经营现金流", fmt(cf.operatingCashFlow)], ["投资现金流", fmt(cf.investingCashFlow)], ["融资现金流", fmt(cf.financingCashFlow)], ["净现金变动", fmt(cf.netCashChange)], ["期末现金", fmt(cf.endingCash)],
    ]),
    ratio: renderTable([
      ["收入增速", `${fmt(ratio.growthRate * 100)}%`], ["毛利率", `${fmt(ratio.grossMargin * 100)}%`], ["净利率", `${fmt(ratio.netMargin * 100)}%`], ["资产负债率", `${fmt(ratio.debtRatio * 100)}%`], ["DSO", fmt(ratio.dso)], ["库存周转天数", fmt(ratio.inventoryDays)], ["利息保障倍数", fmt(ratio.interestCoverage)],
    ]),
  };
  document.getElementById("statement-table").innerHTML = map[selectedTab];

  document.getElementById("decision-tip").textContent = `已选择 ${selectedDecisions.length}/2。再次点击已选项可取消。`;
  document.getElementById("end-turn").disabled = selectedDecisions.length !== 2;

  document.getElementById("decision-list").innerHTML = [...game.unlocked]
    .map((id) => {
      const d = DECISIONS[id];
      const active = selectedDecisions.includes(id);
      return `<div class="decision ${active ? "selected" : ""}"><h4>${d.name}</h4><p>${d.description}<br><small>${d.preview}</small></p><button data-pick="${id}">${active ? "取消选择" : "选择行动"}</button></div>`;
    })
    .join("");

  document.getElementById("logs").innerHTML = game.logs.slice(0, 30).map((l) => `<div>${l}</div>`).join("");
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
  const id = btn.dataset.pick;
  const index = selectedDecisions.indexOf(id);

  if (index >= 0) {
    selectedDecisions.splice(index, 1);
  } else if (selectedDecisions.length < 2) {
    selectedDecisions.push(id);
  } else {
    game.logs.unshift("你已选满2个行动，请先取消其中一个。");
  }

  render();
});

document.getElementById("end-turn").addEventListener("click", playTurn);

const dialog = document.getElementById("start-dialog");
dialog.showModal();
dialog.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-bg]");
  if (!btn) return;
  game = createInitialState(btn.dataset.bg);
  selectedDecisions = [];
  dialog.close();
  render();
});
