const MAX_TURNS = 12;
const IPO_TARGETS = {
  revenue: 240,
  netIncomeMargin: 0.1,
  operatingCashFlow: 10,
  complianceRiskMax: 45,
  cash: 28,
  marketShare: 0.2,
};

const INDUSTRY_PRESETS = {
  saas: {
    name: "SaaS",
    base: { revenue: 110, cogsRate: 0.32, salesExpenseRate: 0.2, adminExpenseRate: 0.11, rndExpenseRate: 0.13, ar: 50, inventory: 6, fixedAssets: 40, ap: 18, shortDebt: 30, longDebt: 24, marketDemand: 1.02, marketShare: 0.11, productQuality: 1.05, brandStrength: 1 },
  },
  manufacturing: {
    name: "制造业",
    base: { revenue: 130, cogsRate: 0.48, salesExpenseRate: 0.14, adminExpenseRate: 0.1, rndExpenseRate: 0.07, ar: 42, inventory: 28, fixedAssets: 75, ap: 26, shortDebt: 38, longDebt: 32, marketDemand: 1, marketShare: 0.13, productQuality: 1, brandStrength: 0.98 },
  },
  consumer: {
    name: "消费品",
    base: { revenue: 125, cogsRate: 0.4, salesExpenseRate: 0.18, adminExpenseRate: 0.1, rndExpenseRate: 0.08, ar: 36, inventory: 20, fixedAssets: 55, ap: 24, shortDebt: 34, longDebt: 28, marketDemand: 1.04, marketShare: 0.14, productQuality: 0.98, brandStrength: 1.08 },
  },
};

const BACKGROUNDS = {
  investment_banker: { name: "投行背景", growthBoost: 1.03, complianceDelta: 2.2, financingDiscount: 0.86 },
  state_enterprise: { name: "国企背景", growthBoost: 1, complianceDelta: 0.9, financingDiscount: 0.95 },
  big_four: { name: "四大背景", growthBoost: 1.01, complianceDelta: 1.1, financingDiscount: 1 },
};

const DECISIONS = {
  increase_marketing: { category: "增长", name: "增加营销投入", description: "扩大获客", preview: "Demand +0.05, Brand +0.03, 销售费率 +1.5%", apply: (s) => ({ ...s, marketDemand: Math.min(1.45, s.marketDemand + 0.05), brandStrength: Math.min(1.5, s.brandStrength + 0.03), salesExpenseRate: s.salesExpenseRate + 0.015, growthPressure: Math.max(0, s.growthPressure - 3) }) },
  improve_product: { category: "增长", name: "产品体验升级", description: "提高产品力", preview: "Product +0.04, 研发费率 +1%", apply: (s) => ({ ...s, productQuality: Math.min(1.5, s.productQuality + 0.04), rndExpenseRate: s.rndExpenseRate + 0.01 }) },
  rightsize_team: { category: "降本", name: "组织瘦身", description: "降费提效", preview: "销售费率 -1.2%, 管理费率 -1%", apply: (s) => ({ ...s, salesExpenseRate: Math.max(0.08, s.salesExpenseRate - 0.012), adminExpenseRate: Math.max(0.06, s.adminExpenseRate - 0.01), growthPressure: s.growthPressure + 2, complianceRisk: s.complianceRisk + 1 }) },
  ops_excellence: { category: "降本", name: "运营提效", description: "降低成本率", preview: "COGS率 -1.2%, 库存 -7%", apply: (s) => ({ ...s, cogsRate: Math.max(0.24, s.cogsRate - 0.012), inventory: s.inventory * 0.93 }) },
  compliance_audit: { category: "风控", name: "强化内控审计", description: "降低合规风险", preview: "Compliance -6, 管理费率 +1%", apply: (s) => ({ ...s, complianceRisk: Math.max(0, s.complianceRisk - 6), adminExpenseRate: s.adminExpenseRate + 0.01 }) },
  ar_task_force: { category: "风控", name: "应收专项治理", description: "回款改善", preview: "AR -20%, Revenue -1%", apply: (s) => ({ ...s, ar: s.ar * 0.8, revenue: s.revenue * 0.99 }) },
  bridge_financing: { category: "融资", name: "过桥融资", description: "快但贵", preview: "短债 +10, 短债利率 +0.25%", apply: (s) => ({ ...s, shortDebt: s.shortDebt + 10, interestRateShort: s.interestRateShort + 0.0025 }) },
  equity_financing: { category: "融资", name: "股权融资", description: "缓债务但稀释", preview: "Dilution +3%, 合规风险 -2", apply: (s) => ({ ...s, equityDilution: Math.min(0.4, s.equityDilution + 0.03), complianceRisk: Math.max(0, s.complianceRisk - 2) }) },
};

const EVENTS = [
  {
    id: "tax_check",
    name: "税务抽查",
    desc: "监管部门开展专项税务抽查。",
    options: [
      {
        key: "strict",
        label: "主动配合（合规优先）",
        effect: (s) => ({ ...s, complianceRisk: Math.max(0, s.complianceRisk - 3), adminExpenseRate: s.adminExpenseRate + 0.003 }),
        passChance: (g) => Math.min(0.95, 0.45 + (55 - g.company.complianceRisk) / 100),
        onPass: (s) => ({ ...s, cash: s.cash + 2 }),
        onFail: (s) => ({ ...s, cash: s.cash - 6, complianceRisk: s.complianceRisk + 4 }),
      },
      {
        key: "delay",
        label: "拖延应对（现金优先）",
        effect: (s) => ({ ...s, adminExpenseRate: Math.max(0.05, s.adminExpenseRate - 0.002) }),
        passChance: () => 0.35,
        onPass: (s) => ({ ...s, cash: s.cash + 1 }),
        onFail: (s) => ({ ...s, cash: s.cash - 10, complianceRisk: s.complianceRisk + 7 }),
      },
    ],
  },
  {
    id: "price_war",
    name: "竞品价格战",
    desc: "竞争对手大幅降价抢份额。",
    options: [
      {
        key: "follow",
        label: "跟随降价保份额",
        effect: (s) => ({ ...s, marketShare: Math.min(0.5, s.marketShare + 0.01), cogsRate: s.cogsRate + 0.004 }),
        passChance: (g) => Math.min(0.9, 0.5 + (g.company.brandStrength - 1) * 0.5),
        onPass: (s) => ({ ...s, revenue: s.revenue * 1.02 }),
        onFail: (s) => ({ ...s, revenue: s.revenue * 0.96 }),
      },
      {
        key: "hold",
        label: "坚持价格保利润",
        effect: (s) => ({ ...s, cogsRate: Math.max(0.2, s.cogsRate - 0.003) }),
        passChance: (g) => Math.min(0.88, 0.45 + (g.company.productQuality - 1) * 0.7),
        onPass: (s) => ({ ...s, marketShare: s.marketShare - 0.005, revenue: s.revenue * 1.01 }),
        onFail: (s) => ({ ...s, marketShare: s.marketShare - 0.02, revenue: s.revenue * 0.95 }),
      },
    ],
  },
  {
    id: "subsidy_window",
    name: "政策补贴窗口",
    desc: "地方产业政策开放补贴申请。",
    options: [
      {
        key: "apply",
        label: "申报补贴（合规材料）",
        effect: (s) => ({ ...s, adminExpenseRate: s.adminExpenseRate + 0.002 }),
        passChance: (g) => Math.min(0.92, 0.45 + (50 - g.company.complianceRisk) / 90),
        onPass: (s) => ({ ...s, cash: s.cash + 9 }),
        onFail: (s) => ({ ...s, cash: s.cash - 2 }),
      },
      {
        key: "skip",
        label: "放弃补贴（专注业务）",
        effect: (s) => ({ ...s, marketDemand: s.marketDemand + 0.01 }),
        passChance: () => 1,
        onPass: (s) => s,
        onFail: (s) => s,
      },
    ],
  },
];


const MARKET_METRIC_MEANINGS = {
  "市场需求": "行业整体需求热度（>1 代表扩张）",
  "市场份额": "公司在目标市场占比",
  "产品力": "产品竞争能力，影响转化与定价",
  "品牌势能": "品牌影响力，提升获客效率",
  "融资窗口": "当前市场融资环境（越高越容易融资）",
  "累计股权稀释": "历史股权融资导致的稀释比例",
  "年度考核失败次数": "累计未通过董事会年度KPI次数",
};

let game;
let selectedTab = "pnl";
let selectedDecisions = [];
let openDecisionGroups = new Set(["增长"]);

function createInitialState(backgroundId, industryId) {
  const industry = INDUSTRY_PRESETS[industryId];
  const base = industry.base;
  const company = {
    revenue: base.revenue,
    cogsRate: base.cogsRate,
    salesExpenseRate: base.salesExpenseRate,
    adminExpenseRate: base.adminExpenseRate,
    rndExpenseRate: base.rndExpenseRate,
    depreciation: 4,
    taxRate: 0.2,
    cash: 45,
    ar: base.ar,
    inventory: base.inventory,
    fixedAssets: base.fixedAssets,
    ap: base.ap,
    shortDebt: base.shortDebt,
    longDebt: base.longDebt,
    interestRateShort: 0.02,
    interestRateLong: 0.012,
    complianceRisk: 25,
    growthPressure: 35,
    marketDemand: base.marketDemand,
    marketShare: base.marketShare,
    productQuality: base.productQuality,
    brandStrength: base.brandStrength,
    financingWindow: 1,
    equityDilution: 0,
  };

  const previous = { ...company, revenue: company.revenue * 0.9, ar: company.ar * 0.9, inventory: company.inventory * 0.92, ap: company.ap * 0.9, cash: 40 };
  const statements = buildStatements(company, previous);

  return {
    turn: 1,
    maxTurns: MAX_TURNS,
    backgroundId,
    industryId,
    company,
    previous,
    statements,
    ratios: buildRatios(company, previous, statements),
    unlocked: new Set(Object.keys(DECISIONS)),
    logs: ["游戏开始：先选 2 个决策，再处理随机事件。"],
    events: [],
    pendingEvent: null,
    pendingCompany: null,
    gameOver: false,
    outcome: "ongoing",
    annualFailures: 0,
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

  return { pnl: { revenue, cogs, grossProfit, salesExpense, adminExpense, rndExpense, depreciation, ebit, interestExpense, preTaxIncome, tax, netIncome }, cf: { operatingCashFlow, investingCashFlow, financingCashFlow, netCashChange, endingCash }, bs: { assets, liabilities, equity } };
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

function applyMarketAndFinancing(company, backgroundId, selected) {
  const bg = BACKGROUNDS[backgroundId];
  const marketShock = 0.98 + Math.random() * 0.06;
  const financingShock = 0.95 + Math.random() * 0.1;

  const demand = company.marketDemand * marketShock;
  const competitiveness = 0.5 * company.productQuality + 0.32 * company.brandStrength + 0.18 * bg.growthBoost;
  const share = Math.min(0.45, Math.max(0.06, company.marketShare + (competitiveness - 1) * 0.03));
  const revenueMultiplier = demand * (0.78 + share) * bg.growthBoost;

  const next = { ...company, marketDemand: demand, marketShare: share, financingWindow: financingShock, revenue: Math.max(40, company.revenue * revenueMultiplier) };
  if (selected.includes("equity_financing")) next.cash += 16 * financingShock * bg.financingDiscount;
  return next;
}

function pickRandomEvent() {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}

function evaluateAnnualKpi(nextState) {
  if (![5, 9].includes(nextState.turn)) return nextState;

  const margin = nextState.ratios.netMargin;
  const pass = nextState.ratios.growthRate >= 0.06 && margin >= 0.06 && nextState.statements.cf.operatingCashFlow > 0 && nextState.company.complianceRisk < 60;

  if (pass) {
    nextState.logs.unshift(`年度绩效考核通过：增长 ${(nextState.ratios.growthRate * 100).toFixed(1)}%，净利率 ${(margin * 100).toFixed(1)}%。`);
    return nextState;
  }

  nextState.annualFailures += 1;
  nextState.logs.unshift("年度绩效考核未通过：董事会启动问责。再失败一次将被解聘。");
  if (nextState.annualFailures >= 2) {
    nextState.outcome = "fired";
    nextState.gameOver = true;
    nextState.logs.unshift("你被董事会解聘，游戏结束。");
  }

  return nextState;
}

function getOutcome(nextState) {
  if (nextState.outcome === "fired") return "fired";
  if (nextState.company.cash < 0) return "cash_crash";
  if (nextState.company.complianceRisk >= 75) return "compliance_blowup";

  if (nextState.turn > nextState.maxTurns) {
    const margin = nextState.ratios.netMargin;
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

function startTurnResolution() {
  if (!game || game.gameOver || game.pendingEvent) return;
  if (selectedDecisions.length !== 2) {
    game.logs.unshift("请先选择 2 个行动再提交。");
    render();
    return;
  }

  let company = { ...game.company };
  for (const id of selectedDecisions) company = DECISIONS[id].apply(company);

  company = applyMarketAndFinancing(company, game.backgroundId, selectedDecisions);
  company.complianceRisk += BACKGROUNDS[game.backgroundId].complianceDelta;
  company.growthPressure = Math.max(0, company.growthPressure + (company.revenue > game.company.revenue ? -2 : 2));

  game.pendingCompany = company;
  game.pendingEvent = pickRandomEvent();
  game.logs.unshift(`出现随机事件：${game.pendingEvent.name}，请选择应对方案。`);
  render();
}

function resolveEvent(optionKey) {
  if (!game || game.gameOver || !game.pendingEvent || !game.pendingCompany) return;

  const event = game.pendingEvent;
  const option = event.options.find((o) => o.key === optionKey);
  if (!option) return;

  let company = option.effect({ ...game.pendingCompany });
  const passChance = Math.max(0.05, Math.min(0.98, option.passChance({ ...game, company })));
  const passed = Math.random() < passChance;
  company = passed ? option.onPass(company) : option.onFail(company);

  const firstPass = buildStatements(company, game.company);
  company.cash = firstPass.cf.endingCash + (company.cash - game.company.cash);
  const statements = buildStatements(company, game.company);
  const ratios = buildRatios(company, game.company, statements);

  let nextState = {
    ...game,
    turn: game.turn + 1,
    previous: game.company,
    company,
    statements,
    ratios,
    pendingEvent: null,
    pendingCompany: null,
    events: [`${event.name} - 选择「${option.label}」：${passed ? "通过" : "失败"}`, ...game.events].slice(0, 12),
    logs: [
      `Q${game.turn}结算：净利率 ${(ratios.netMargin * 100).toFixed(1)}%，CFO ${fmt(statements.cf.operatingCashFlow)}。`,
      `事件结果：${event.name} ${passed ? "通过" : "失败"}（成功率 ${(passChance * 100).toFixed(0)}%）。`,
      ...game.logs,
    ].slice(0, 45),
  };

  selectedDecisions = [];
  nextState = evaluateAnnualKpi(nextState);

  const outcome = getOutcome(nextState);
  nextState.outcome = outcome;
  if (outcome !== "ongoing") nextState.gameOver = true;

  if (outcome === "cash_crash") nextState.logs.unshift("失败：现金流断裂，公司进入破产保护。游戏结束。");
  else if (outcome === "compliance_blowup") nextState.logs.unshift("失败：合规爆雷，IPO 终止。游戏结束。");
  else if (outcome === "ipo") nextState.logs.unshift("胜利：你在 Q12 成功达成 IPO！游戏结束。");
  else if (outcome === "not_qualified") nextState.logs.unshift("Q12 结束：未达 IPO 标准。游戏结束。");

  game = nextState;
  render();
}

function fmt(n) { return Number.isFinite(n) ? n.toFixed(2) : "-"; }
function renderTable(rows) { return `<table class="table">${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>`; }

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
    ["净利率", game.ratios.netMargin, IPO_TARGETS.netIncomeMargin, false],
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

function renderEventPanel() {
  if (!game.pendingEvent) {
    document.getElementById("event-feed").innerHTML = game.events.length ? game.events.map((e) => `<div>${e}</div>`).join("") : "<div>暂无事件（提交决策后会触发）</div>";
    return;
  }

  const options = game.pendingEvent.options
    .map((o) => `<button class="event-option" data-event-option="${o.key}">${o.label}</button>`)
    .join("");

  document.getElementById("event-feed").innerHTML = `<div class="event-card"><div><strong>${game.pendingEvent.name}</strong></div><div>${game.pendingEvent.desc}</div>${options}</div>`;
}

function render() {
  if (!game) return;

  document.getElementById("meta").innerHTML = `行业：${INDUSTRY_PRESETS[game.industryId].name}<br/>回合 Q${Math.min(game.turn, game.maxTurns)} / ${game.maxTurns}<br/>背景：${BACKGROUNDS[game.backgroundId].name}${game.gameOver ? "<br/>状态：已结束" : ""}`;

  document.getElementById("triad").innerHTML = [
    ["现金压力", Math.max(0, 100 - game.company.cash), 25, 60, true],
    ["增长压力", game.company.growthPressure, 20, 45, true],
    ["合规风险", game.company.complianceRisk, 25, 50, true],
  ].map(([name, val, good, warn, lower]) => `<div class="metric"><span>${name}</span><span class="badge ${badge(val, good, warn, lower)}">${fmt(val)}</span></div>`).join("");

  renderIpoProgress();

  document.getElementById("market").innerHTML = [
    ["市场需求", game.company.marketDemand],
    ["市场份额", game.company.marketShare],
    ["产品力", game.company.productQuality],
    ["品牌势能", game.company.brandStrength],
    ["融资窗口", game.company.financingWindow],
    ["累计股权稀释", game.company.equityDilution],
    ["年度考核失败次数", game.annualFailures],
  ]
    .map(([k, v]) => `<div class="metric"><span>${k}<br><small>${MARKET_METRIC_MEANINGS[k]}</small></span><span>${fmt(v)}</span></div>`)
    .join("");

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
  const groupEntries = Object.entries(grouped);
  if (!openDecisionGroups.size && groupEntries.length) {
    openDecisionGroups.add(groupEntries[0][0]);
  }
  document.getElementById("decision-groups").innerHTML = groupEntries.map(([category, list]) => {
    const inner = list.map(([id, d]) => {
      const active = selectedDecisions.includes(id);
      return `<div class="decision ${active ? "selected" : ""}"><h4>${d.name}</h4><p>${d.description}<br><small>${d.preview}</small></p><button data-pick="${id}">${active ? "取消" : "选择"}</button></div>`;
    }).join("");
    return `<details class="group" data-group="${category}" ${openDecisionGroups.has(category) ? "open" : ""}><summary>${category}</summary>${inner}</details>`;
  }).join("");

  const submitDisabled = selectedDecisions.length !== 2 || game.gameOver || !!game.pendingEvent;
  document.getElementById("decision-tip").textContent = game.gameOver ? "本局已结束。" : game.pendingEvent ? "请先处理当前随机事件。" : `已选择 ${selectedDecisions.length}/2。`;
  document.getElementById("end-turn").disabled = submitDisabled;

  renderEventPanel();
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
  if (!btn || game.gameOver || game.pendingEvent) return;
  const id = btn.dataset.pick;
  const idx = selectedDecisions.indexOf(id);
  if (idx >= 0) selectedDecisions.splice(idx, 1);
  else if (selectedDecisions.length < 2) selectedDecisions.push(id);
  else game.logs.unshift("已选满2项，请先取消一项。"), game.logs = game.logs.slice(0, 45);
  render();
});


document.getElementById("decision-groups").addEventListener("toggle", (e) => {
  const details = e.target.closest("details[data-group]");
  if (!details) return;
  const name = details.dataset.group;
  if (details.open) openDecisionGroups.add(name);
  else openDecisionGroups.delete(name);
}, true);

document.getElementById("event-feed").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-event-option]");
  if (!btn) return;
  resolveEvent(btn.dataset.eventOption);
});

document.getElementById("end-turn").addEventListener("click", startTurnResolution);

document.getElementById("start-game").addEventListener("click", () => {
  const bg = document.getElementById("background-select").value;
  const industry = document.getElementById("industry-select").value;
  game = createInitialState(bg, industry);
  selectedDecisions = [];
  openDecisionGroups = new Set(["增长"]);

  const dialog = document.getElementById("start-dialog");
  if (typeof dialog.close === "function") dialog.close();
  dialog.setAttribute("hidden", "true");
  dialog.style.display = "none";

  render();
});

const startDialog = document.getElementById("start-dialog");
if (typeof startDialog.showModal === "function") startDialog.showModal();
else {
  startDialog.removeAttribute("hidden");
  startDialog.style.display = "grid";
}
