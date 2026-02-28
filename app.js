const MAX_TURNS = 12;
const IPO_TARGETS = {
  revenue: 260,
  netIncomeMargin: 0.12,
  operatingCashFlow: 15,
  complianceRiskMax: 42,
  cash: 35,
  marketShare: 0.23,
};

const BACKGROUNDS = {
  investment_banker: { name: "投行背景", growthBoost: 1.04, complianceDelta: 2.3, financingDiscount: 0.85 },
  state_enterprise: { name: "国企背景", growthBoost: 1.0, complianceDelta: 0.9, financingDiscount: 0.95 },
  big_four: { name: "四大背景", growthBoost: 1.01, complianceDelta: 1.0, financingDiscount: 1 },
};

const DECISIONS = {
  increase_marketing: {
    category: "增长",
    name: "增加营销投入",
    description: "拉升市场需求和品牌势能，短期费用上升",
    preview: "Demand +0.06, Brand +0.04, 销售费率 +2%",
    apply: (s) => ({ ...s, marketDemand: Math.min(1.45, s.marketDemand + 0.06), brandStrength: Math.min(1.5, s.brandStrength + 0.04), salesExpenseRate: s.salesExpenseRate + 0.02, growthPressure: Math.max(0, s.growthPressure - 3) }),
  },
  improve_product: {
    category: "增长",
    name: "产品体验升级",
    description: "提高产品力，长期提升份额转化",
    preview: "Product +0.05, 研发费率 +1%",
    apply: (s) => ({ ...s, productQuality: Math.min(1.5, s.productQuality + 0.05), rndExpenseRate: s.rndExpenseRate + 0.01 }),
  },
  rightsize_team: {
    category: "降本",
    name: "组织瘦身",
    description: "裁员降本，提高利润率，增长承压",
    preview: "销售费率 -1.5%, 管理费率 -1.2%, Growth压力 +3",
    apply: (s) => ({ ...s, salesExpenseRate: Math.max(0.08, s.salesExpenseRate - 0.015), adminExpenseRate: Math.max(0.06, s.adminExpenseRate - 0.012), growthPressure: s.growthPressure + 3, complianceRisk: s.complianceRisk + 1 }),
  },
  ops_excellence: {
    category: "降本",
    name: "运营提效",
    description: "优化供应链和流程，降低成本率",
    preview: "COGS率 -1.5%, 库存 -8%",
    apply: (s) => ({ ...s, cogsRate: Math.max(0.25, s.cogsRate - 0.015), inventory: s.inventory * 0.92 }),
  },
  compliance_audit: {
    category: "风控",
    name: "强化内控审计",
    description: "降低合规风险，增加管理费用",
    preview: "Compliance -6, 管理费率 +1%",
    apply: (s) => ({ ...s, adminExpenseRate: s.adminExpenseRate + 0.01, complianceRisk: Math.max(0, s.complianceRisk - 6) }),
  },
  ar_task_force: {
    category: "风控",
    name: "应收专项治理",
    description: "加速回款，牺牲一部分增长",
    preview: "AR -20%, Revenue -1.5%",
    apply: (s) => ({ ...s, ar: s.ar * 0.8, revenue: s.revenue * 0.985, growthPressure: s.growthPressure + 2 }),
  },
  bridge_financing: {
    category: "融资",
    name: "过桥融资",
    description: "快速补充现金，但融资成本提高",
    preview: "短债 +12, 短债利率 +0.3%",
    apply: (s) => ({ ...s, shortDebt: s.shortDebt + 12, interestRateShort: s.interestRateShort + 0.003 }),
  },
  equity_financing: {
    category: "融资",
    name: "股权融资",
    description: "补现金、降风险，但发生股权稀释",
    preview: "Dilution +3%, 合规风险 -2",
    apply: (s) => ({ ...s, equityDilution: Math.min(0.4, s.equityDilution + 0.03), complianceRisk: Math.max(0, s.complianceRisk - 2) }),
  },
};

const EVENTS = [
  {
    id: "policy_subsidy",
    name: "政策补贴窗口",
    desc: "政府鼓励创新，合规良好企业可获现金补贴。",
    condition: (g) => g.company.complianceRisk < 40,
    apply: (s) => ({ ...s, cash: s.cash + 8, complianceRisk: Math.max(0, s.complianceRisk - 1) }),
  },
  {
    id: "competitor_price_war",
    name: "竞品价格战",
    desc: "竞争对手降价，市场份额承压。",
    condition: () => true,
    apply: (s) => ({ ...s, marketShare: Math.max(0.06, s.marketShare - 0.02), revenue: s.revenue * 0.97 }),
  },
  {
    id: "tax_audit",
    name: "税务抽查",
    desc: "税务机关抽查，内控薄弱则罚款。",
    condition: () => true,
    apply: (s) => (s.complianceRisk > 48 ? { ...s, cash: s.cash - 10, complianceRisk: s.complianceRisk + 3 } : { ...s, complianceRisk: Math.max(0, s.complianceRisk - 2) }),
  },
  {
    id: "star_sales_lead",
    name: "明星销售签约",
    desc: "关键销售负责人加入，短期有助于获客。",
    condition: (g) => g.company.salesExpenseRate > 0.14,
    apply: (s) => ({ ...s, marketDemand: Math.min(1.5, s.marketDemand + 0.05), brandStrength: Math.min(1.5, s.brandStrength + 0.03) }),
  },
];

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
    maxTurns: MAX_TURNS,
    backgroundId,
    company,
    previous: prev,
    statements,
    ratios: buildRatios(company, prev, statements),
    unlocked: new Set(["increase_marketing", "improve_product", "rightsize_team", "ops_excellence", "compliance_audit", "ar_task_force", "bridge_financing", "equity_financing"]),
    logs: ["游戏开始：本季度必须选择 2 个行动。"],
    events: [],
    gameOver: false,
    outcome: "ongoing",
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

function applyMarketAndFinancing(company, backgroundId, localSelected) {
  const bg = BACKGROUNDS[backgroundId];
  const marketShock = 0.96 + Math.random() * 0.1;
  const financingShock = 0.94 + Math.random() * 0.14;

  const demand = company.marketDemand * marketShock;
  const competitiveness = 0.5 * company.productQuality + 0.3 * company.brandStrength + 0.2 * bg.growthBoost;
  const share = Math.min(0.45, Math.max(0.05, company.marketShare + (competitiveness - 1) * 0.04));
  const revenueMultiplier = demand * (0.72 + share) * bg.growthBoost;

  const next = { ...company };
  next.marketDemand = demand;
  next.marketShare = share;
  next.financingWindow = financingShock;
  next.revenue = Math.max(35, company.revenue * revenueMultiplier);

  if (localSelected.includes("equity_financing")) {
    const capital = 18 * financingShock * bg.financingDiscount;
    next.cash += capital;
  }

  return next;
}

function applyRandomEvent(state) {
  const candidates = EVENTS.filter((e) => e.condition(state));
  if (!candidates.length) return { company: state.company, eventLog: null };

  const event = candidates[Math.floor(Math.random() * candidates.length)];
  const company = event.apply({ ...state.company });
  return { company, eventLog: `事件：${event.name} - ${event.desc}` };
}

function getOutcome(nextState) {
  if (nextState.company.cash < 0) return "cash_crash";
  if (nextState.company.complianceRisk >= 75) return "compliance_blowup";

  if (nextState.turn > nextState.maxTurns) {
    const margin = nextState.statements.pnl.revenue > 0 ? nextState.statements.pnl.netIncome / nextState.statements.pnl.revenue : 0;
    const ipoReady =
      nextState.company.revenue >= IPO_TARGETS.revenue &&
      margin >= IPO_TARGETS.netIncomeMargin &&
      nextState.statements.cf.operatingCashFlow >= IPO_TARGETS.operatingCashFlow &&
      nextState.company.complianceRisk <= IPO_TARGETS.complianceRiskMax &&
      nextState.company.cash >= IPO_TARGETS.cash &&
      nextState.company.marketShare >= IPO_TARGETS.marketShare;
    return ipoReady ? "ipo" : "not_qualified";
  }

  return "ongoing";
}

function playTurn() {
  if (!game || game.gameOver) return;

  if (selectedDecisions.length !== 2) {
    game.logs.unshift("请先选择 2 个行动再结算。");
    render();
    return;
  }

  let company = { ...game.company };
  const beforeRevenue = company.revenue;
  for (const id of selectedDecisions) company = DECISIONS[id].apply(company);

  company = applyMarketAndFinancing(company, game.backgroundId, selectedDecisions);
  company.complianceRisk += BACKGROUNDS[game.backgroundId].complianceDelta;
  company.growthPressure = Math.max(0, company.growthPressure + (company.revenue > beforeRevenue ? -2 : 2));

  const eventResult = applyRandomEvent({ ...game, company });
  company = eventResult.company;

  const firstPass = buildStatements(company, game.company);
  company.cash = firstPass.cf.endingCash + (company.cash - game.company.cash);
  const statements = buildStatements(company, game.company);
  const ratios = buildRatios(company, game.company, statements);

  const nextState = {
    ...game,
    turn: game.turn + 1,
    previous: game.company,
    company,
    statements,
    ratios,
    events: eventResult.eventLog ? [eventResult.eventLog, ...game.events].slice(0, 12) : game.events,
    logs: [
      `Q${game.turn}结算：Revenue Δ ${fmt(company.revenue - beforeRevenue)}, 净利率 ${(ratios.netMargin * 100).toFixed(1)}%, CFO ${fmt(statements.cf.operatingCashFlow)}`,
      ...game.logs,
    ].slice(0, 40),
  };

  const outcome = getOutcome(nextState);
  nextState.outcome = outcome;
  nextState.gameOver = outcome !== "ongoing";

  if (eventResult.eventLog) nextState.logs.unshift(eventResult.eventLog);

  if (outcome === "cash_crash") nextState.logs.unshift("失败：现金流断裂，公司进入破产保护。游戏结束。");
  else if (outcome === "compliance_blowup") nextState.logs.unshift("失败：合规爆雷，IPO 终止。游戏结束。");
  else if (outcome === "ipo") nextState.logs.unshift("胜利：你在 Q12 成功达成 IPO！游戏结束。");
  else if (outcome === "not_qualified") nextState.logs.unshift("Q12 结束：未达 IPO 标准。游戏结束。");

  game = nextState;
  selectedDecisions = [];
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
  const margin = game.statements.pnl.revenue > 0 ? game.statements.pnl.netIncome / game.statements.pnl.revenue : 0;
  const items = [
    ["收入规模", game.company.revenue, IPO_TARGETS.revenue, false],
    ["净利率", margin, IPO_TARGETS.netIncomeMargin, false],
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

function groupDecisions() {
  const groups = {};
  for (const [id, item] of Object.entries(DECISIONS)) {
    if (!game.unlocked.has(id)) continue;
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push([id, item]);
  }
  return groups;
}

function render() {
  if (!game) return;
  document.getElementById("meta").innerHTML = `回合 Q${Math.min(game.turn, game.maxTurns)} / ${game.maxTurns}<br/>背景：${BACKGROUNDS[game.backgroundId].name}${game.gameOver ? "<br/>状态：已结束" : ""}`;

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
    pnl: renderTable([["营业收入", fmt(pnl.revenue)], ["营业成本", fmt(pnl.cogs)], ["毛利", fmt(pnl.grossProfit)], ["销售费用", fmt(pnl.salesExpense)], ["管理费用", fmt(pnl.adminExpense)], ["研发费用", fmt(pnl.rndExpense)], ["EBIT", fmt(pnl.ebit)], ["净利润", fmt(pnl.netIncome)]]),
    bs: renderTable([["总资产", fmt(bs.assets)], ["总负债", fmt(bs.liabilities)], ["股东权益", fmt(bs.equity)], ["现金", fmt(game.company.cash)], ["应收", fmt(game.company.ar)], ["应付", fmt(game.company.ap)]]),
    cf: renderTable([["经营现金流", fmt(cf.operatingCashFlow)], ["投资现金流", fmt(cf.investingCashFlow)], ["融资现金流", fmt(cf.financingCashFlow)], ["净现金变动", fmt(cf.netCashChange)], ["期末现金", fmt(cf.endingCash)]]),
    ratio: renderTable([["收入增速", `${fmt(ratio.growthRate * 100)}%`], ["毛利率", `${fmt(ratio.grossMargin * 100)}%`], ["净利率", `${fmt(ratio.netMargin * 100)}%`], ["资产负债率", `${fmt(ratio.debtRatio * 100)}%`], ["DSO", fmt(ratio.dso)], ["库存周转天数", fmt(ratio.inventoryDays)], ["利息保障倍数", fmt(ratio.interestCoverage)]]),
  };
  document.getElementById("statement-table").innerHTML = map[selectedTab];

  const grouped = groupDecisions();
  const groupsHtml = Object.entries(grouped)
    .map(([category, list], idx) => {
      const inner = list
        .map(([id, d]) => {
          const active = selectedDecisions.includes(id);
          return `<div class="decision ${active ? "selected" : ""}"><h4>${d.name}</h4><p>${d.description}<br><small>${d.preview}</small></p><button data-pick="${id}">${active ? "取消" : "选择"}</button></div>`;
        })
        .join("");
      return `<details class="group" ${idx === 0 ? "open" : ""}><summary>${category}</summary>${inner}</details>`;
    })
    .join("");

  document.getElementById("decision-groups").innerHTML = groupsHtml;
  document.getElementById("decision-tip").textContent = game.gameOver ? "本局已结束，无法继续操作。" : `已选择 ${selectedDecisions.length}/2。再次点击已选项可取消。`;
  document.getElementById("end-turn").disabled = selectedDecisions.length !== 2 || game.gameOver;

  document.getElementById("event-feed").innerHTML = game.events.length ? game.events.map((e) => `<div>${e}</div>`).join("") : "<div>暂无事件</div>";
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

document.getElementById("decision-groups").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-pick]");
  if (!btn || game.gameOver) return;

  const id = btn.dataset.pick;
  const index = selectedDecisions.indexOf(id);
  if (index >= 0) {
    selectedDecisions.splice(index, 1);
  } else if (selectedDecisions.length < 2) {
    selectedDecisions.push(id);
  } else {
    game.logs.unshift("已选满 2 项，请先取消一项。");
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
