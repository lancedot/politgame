const content = window.GAME_CONTENT || {};

const GAME_CONFIG = {
  maxQuarter: 12,
  riskDangerLine: 80,
  boardQuarterDecay: 15,
  saveKey: "enron_save_v2",
  scenePermissions: {
    desk: ["exerciseBtn", "lobbyingBtn", "routineBtn", "ledgerPanel", "phasePanel", "timelinePanel", "investigationPanel"],
    warroom: ["actionPanel", "auditPanel", "reportPanel"],
    stage: ["callPanel", "ratingPanel"],
  },
};

const lifecycleHooks = {
  beforeQuarterStart: [],
  afterQuarterSettle: [],
  beforeEnding: [],
};

function onHook(name, fn) {
  if (!lifecycleHooks[name] || typeof fn !== "function") return;
  lifecycleHooks[name].push(fn);
  return () => {
    const i = lifecycleHooks[name].indexOf(fn);
    if (i >= 0) lifecycleHooks[name].splice(i, 1);
  };
}

function emitHook(name, payload = {}) {
  [...(lifecycleHooks[name] || [])].forEach((fn) => {
    try { fn(payload, state); } catch (e) { console.warn(`[hook:${name}]`, e); }
  });
}

function getRotatingKey(map, q) {
  return map[q] ? q : ((q - 1) % 4) + 1;
}

const state = {
  quarter: 1,
  paperGain: 95,
  realCash: 800,
  risk: 20,
  boardPatience: 72,
  consecutiveNormalOps: 0,
  firedByBoard: false,
  activeScene: "desk",
  heavyLobbyUsed: false,
  speDebtLots: [],
  riskGrowthFactor: 1,
  stockDropStreak: 0,
  boardUltimatum: 0,
  mtmPopupTriggered: false,
  privateAccount: 0,
  stock: 78,
  marketCap: 93.6,
  charisma: 40,
  morality: 80,
  fraudCount: 0,
  firstAction: "",
  forecastPaperGain: 95,
  marketExpectedGain: 110,
  personalOptions: 120,
  exercisedThisQuarter: false,
  secAttention: 18,
  mediaHeat: 16,
  whistleblowerPressure: 12,
  auditIndependence: 78,
  triggeredEvents: new Set(),
  actionDone: false,
  auditDone: false,
  callDone: false,
  historyLog: [],
  lastActionSummary: "",
  lastAuditSummary: "",
  lastCallSummary: "",
  lastEventSummary: "",
  randomEventResolved: false,
  tickerClock: 0,
  mtmMode: "neutral",
  prisonYears: 0,
  quoteShownForQuarter: 0,
  rotationDoorUsed: false,
  lobbyingUsedThisQuarter: false,
  tipShredBoost: false,
  rotationDoorShield: false,
  debt: 260,
  totalAssets: 1400,
  prevStock: 78,
  audioCtx: null,
  metricPrev: {},
};

const quarterConfig = {
  1: {
    name: "安然季度股东大会决议 · 第一季度",
    desc: "增长乏力，你准备用会计想象力补上现实缺口。",
    intro: "Q1 决议：MTM（逐日盯市）把未来利润搬到今天。",
  },
  2: {
    name: "安然季度股东大会决议 · 第二季度",
    desc: "债务堆高，SPE 成为‘把问题放在别处’的工具。",
    intro: "Q2 决议：通过 Chewco/LJM 转移亏损资产与债务。",
  },
  3: {
    name: "安然季度股东大会决议 · 第三季度",
    desc: "现金告急，你可以选择制造电力市场恐慌收割利润。",
    intro: "Q3 决议：停机套利与监管怒火，二者总会有一个先到。",
  },
  4: {
    name: "安然季度股东大会决议 · 第四季度",
    desc: "股价回落，担保链颤抖，你要决定是体面还是迅速离场。",
    intro: "Q4 决议：套现、灭证与甩锅，哪种组合最像‘长期主义’。",
  },
};

const quarterQuotes = {
  1: [
    '“我们不是一家能源公司，我们是一家改变世界的公司。” —— 杰夫·斯基林',
    '“如果你看不懂我们的财报，那是你的问题，不是我们的。” —— 管理层内部口吻（讽刺化复刻）',
  ],
  2: [
    '“复杂是竞争优势，透明是竞争劣势。” —— 华尔街黑话精选',
    '“只要故事足够大，脚注就没人看。” —— 路演备忘录（讽刺）',
  ],
  3: [
    '“市场没有情绪，只有可交易的波动。” —— 交易部门口号',
    '“危机也是一种盈利模型。” —— 会议纪要边角料',
  ],
  4: [
    '“我们对公司前景保持坚定信心。” —— 同日高管减持记录',
    '“司法是长期问题，流动性是今晚问题。” —— 走廊对话（讽刺）',
  ],
};

const timelineData = {
  1: {
    year: "1999-2000",
    event: "公司全面拥抱 MTM，会计利润与经营现金开始分轨。",
    people: "Jeff Skilling（增长叙事）、Andrew Fastow（结构设计）",
    impact: "短期股价抬升，长期增长压力指数级增加。",
  },
  2: {
    year: "2000-2001 上半年",
    event: "Chewco/LJM 等 SPE 承接烂资产，主表负债率被美化。",
    people: "Andrew Fastow（双重角色冲突）、Arthur Andersen（审计把关失效）",
    impact: "报表更干净，但股票担保把风险埋成连锁炸弹。",
  },
  3: {
    year: "2000-2001",
    event: "加州电力危机中，交易策略被质疑放大供需恐慌。",
    people: "交易部门、监管机构、做空研究员",
    impact: "现金短期回流，舆情与监管调查快速升级。",
  },
  4: {
    year: "2001 年末",
    event: "股价崩塌触发担保连锁，SPE 风险回流，审计底稿销毁争议爆发。",
    people: "Sherron Watkins（吹哨）、Arthur Andersen（司法后果）",
    impact: "公司申请破产，管理层与审计机构进入历史审判。",
  },
};

const quarterRandomEvents = Object.assign({
  1: {
    title: "季度突发：做空者质疑",
    desc: "做空机构钱诺斯在 CNBC 上公开质疑我们的现金流不匹配，盘中股价先跌 10%。",
    choices: [
      { label: "【公开羞辱他】（股价 +5%，风险 +15）", effect: (st) => { st.stock *= 1.05; st.risk += 15; st.mediaHeat += 8; st.charisma += 2; const msg = "你把电话会开成了擂台赛，短线情绪回暖，但监管留档更完整了。"; feed(msg, "warn"); return msg; } },
      { label: "【发布虚假利好压制】（现金 -$50M，风险 +5）", effect: (st) => { st.realCash -= 50; st.risk += 5; st.stock += 3; st.secAttention += 3; const msg = "你用利好公告盖住质疑，市场先信了，审计先记下了。"; feed(msg, "good"); return msg; } },
    ],
  },
  2: {
    title: "季度突发：评级机构来电",
    desc: "评级机构要求你解释 SPE 担保链的真实敞口。",
    choices: [
      { label: "A. 递交部分底稿，换取喘息（结果：股价 -2，SEC -3，风险 -2）", effect: (st) => { st.stock -= 2; st.secAttention = Math.max(0, st.secAttention - 3); st.risk = Math.max(0, st.risk - 2); const msg = "你勉强透明一次，市场嫌难看，但监管火气暂时下降。"; feed(msg, "good"); return msg; } },
      { label: "B. 用‘结构优化’术语继续拖延（结果：股价 +2，SEC +5，风险 +4）", effect: (st) => { st.stock += 2; st.secAttention += 5; st.risk += 4; const msg = "你又赢下一场电话会，也又输掉一截未来。"; feed(msg, "warn"); return msg; } },
    ],
  },
  3: {
    title: "季度突发：加州电网套利",
    desc: "西海岸电力需求激增。你可以通过人为制造局部停电，套取 10 倍电价差。",
    choices: [
      { label: "A. 执行‘死星’计划（结果：账面利润 +$500M，现金 +$180M，风险 +30，SEC +10）", effect: (st) => { st.paperGain += 500; st.forecastPaperGain += 120; st.realCash += 180; st.risk += 30; st.secAttention += 10; st.mediaHeat += 12; st.whistleblowerPressure += 8; const msg = "交易台欢呼‘死星’计划大获全胜，州政府与检察官同步上线。"; feed(msg, "bad"); return msg; } },
      { label: "B. 维持供电并签长期对冲（结果：账面利润 +$140M，现金 +$60M，风险 +8，SEC +2）", effect: (st) => { st.paperGain += 140; st.realCash += 60; st.risk += 8; st.secAttention += 2; st.mediaHeat += 2; const msg = "你选择克制套利，利润没那么炸裂，但舆情与监管都相对可控。"; feed(msg, "good"); return msg; } },
    ],
  },
  4: {
    title: "季度突发：内部邮件泄露",
    desc: "员工邮件外泄：‘我们只是把风险推迟到下个季度。’",
    choices: [
      { label: "A. 全面否认并威胁起诉（结果：股价 +1，SEC +7，风险 +6）", effect: (st) => { st.stock += 1; st.secAttention += 7; st.risk += 6; const msg = "你成功把语气拉满，也把检察官的兴趣拉满。"; feed(msg, "bad"); return msg; } },
      { label: "B. 牺牲一位高管止血（结果：股价 -2，风险 -3，SEC -2）", effect: (st) => { st.stock -= 2; st.risk = Math.max(0, st.risk - 3); st.secAttention = Math.max(0, st.secAttention - 2); const msg = "替罪羊出列，风暴短暂停顿，董事会掌声稀稀拉拉。"; feed(msg, "warn"); return msg; } },
    ],
  },
  6: {
    title: "季度突发：宽带泡沫",
    desc: "光纤里跑的不是数据，是华尔街的口水。是否签下虚假合同？",
    choices: [
      { label: "A. 签下虚假宽带大单（结果：股价 +20，债务 +300，风险 +18）", effect: (st) => { st.stock += 20; st.debt += 300; st.paperGain += 180; st.risk += 18; st.secAttention += 6; const msg = "路演掌声如潮，但合同回款条款只有脚注看得懂。"; feed(msg, "warn"); return msg; } },
      { label: "B. 拒绝吹泡泡（结果：股价 -5，风险 -2，董事会不满 +12）", effect: (st) => { st.stock -= 5; st.risk = Math.max(0, st.risk - 2); st.boardPatience = Math.max(0, st.boardPatience - 12); const msg = "你守住底线，董事会却在问‘隔壁为什么涨更快’。"; feed(msg, "good"); return msg; } },
    ],
  },
  9: {
    title: "季度突发：安达信旋转门",
    desc: "那个审计员挺聪明，给他个 VP 当当，他就会忘了那笔坏账。",
    choices: [
      { label: "A. 立即挖角（结果：风险 -30，现金 -100，SEC +4）", effect: (st) => { st.risk = Math.max(0, st.risk - 30); st.realCash -= 100; st.secAttention += 4; st.rotationDoorShield = true; const msg = "人事公告发布后，审计脚注立刻变得温柔。"; feed(msg, "warn"); return msg; } },
      { label: "B. 保持距离（结果：风险 +6，现金 0，审计独立性 +8）", effect: (st) => { st.risk += 6; st.auditIndependence = Math.min(100, st.auditIndependence + 8); const msg = "你选择合规，短期日子更难，长期睡眠更好。"; feed(msg, "good"); return msg; } },
    ],
  },

}, content.events || {});

const quarterTickerBase = {
  1: ["安然再获‘最具创新企业’提名，华尔街沉浸式鼓掌。", "分析师圈流传一句话：‘利润越好看，解释越复杂。’"],
  2: ["Chewco 与 LJM 再次成为会议关键词，投资者假装听懂。", "评级机构提示：表外结构不是隐身衣。"],
  3: ["加州进入紧急状态，电价与恐慌齐飞。", "交易员称‘我们只是提高了市场教育效率’。"],
  4: ["传闻 SEC 正在调取核心账目，发言人回应‘纯属流程’。", "董事会强调长期价值，管理层忙于短期航班。"],
};

const optionTickerMap = {
  insult: "分析师协会：电话会已从财务沟通升级为脱口秀。",
  yacht: "海湾游艇码头客流上升，研究报告口吻同步转柔。",
  transparent: "市场短暂惩罚透明，监管短暂奖励诚实。",
  delay: "术语密度创新高，真实问题继续延期处理。",
  blame: "州政府发布会称‘我们仍在等待完整解释’。",
  fund: "补偿基金上线，舆论热度回落，现金焦虑升温。",
  deny: "法律团队加班到凌晨，新闻标题加粗到首页。",
  scapegoat: "内部人事变动频繁，市场称其为‘治理升级’。",
  "激进MTM": "交易台庆祝模型胜利，风控部提前失眠。",
  "保守MTM": "部分基金称增长不够性感，仍维持观望。",
  "激进SPE": "投行圈私语：报表干净得像刚漂白。",
  "保守SPE": "债务被挪到隔壁房间，门却没上锁。",
  "高强度停机": "电力交易大厅欢呼，市民投诉热线爆满。",
  "低强度停机": "市场波动温和上行，质疑声开始累积。",
  "极速套现": "高管交易窗口异常活跃，社媒出现阴谋论热帖。",
  "温和套现": "管理层称‘长期看好’，同时小步减持。",
  "q1-tech": "电话会关键词：前置投入、结构优化、长期主义。",
  "q2-tech": "会计术语密度刷新纪录，散户群聊集体静音。",
  "q3-tech": "交易部门继续宣称自己只是‘流动性搬运工’。",
  "q4-tech": "管理层强调现金充足，市场开始查现金来源。",
  "q1-attack": "高管怒怼分析师片段登上财经热搜。",
  "q2-attack": "问答环节火药味拉满，机构笔记越写越密。",
  "q3-attack": "发布会演变为辩论赛，监管保持微笑记录。",
  "q4-attack": "最后一次电话会，语气强硬但成交冷淡。",
  "q1-promise": "新一轮增长承诺上线，未来现金流继续透支。",
  "q2-promise": "ROE 承诺升级，模型参数同步乐观。",
  "q3-promise": "超额利润口号再出发，做空报告同步加更。",
  "q4-promise": "资本计划口径发布，市场选择先看卖盘。",
};

const analystQuestionBank = {
  conservative: [
    "你 Q1 说‘稳健’，为何 Q2 利润增速突然像科幻片？",
    "现金流和利润背离，你到底在卖能源还是卖叙事？",
    "你们是不是把风险定义成‘下季度的问题’？",
  ],
  aggressive: [
    "Q1 激进 MTM 的关键假设是什么？谁对它负责？",
    "若新合同签约放缓，你的增长承诺如何兑现？",
    "如果模型回调 10%，本季利润会不会瞬间蒸发？",
  ],
};


const analystOptionBank = {
  1: [
    { key: "q1-tech", label: "“现金流错位是战略前置投入，我们看的是 20 年终局。”", stock: 5, risk: 6, sec: 3, media: 1 },
    { key: "q1-attack", label: "“提这个问题说明你不了解能源交易。”", stock: 2, risk: 8, sec: 2, media: 6, charisma: 2 },
    { key: "q1-promise", label: "“下季度我们会再给出双位数增长。”", stock: 10, risk: 11, sec: 3, whistle: 5, paper: 35, forecast: 40, corruption: 1 },
  ],
  2: [
    { key: "q2-tech", label: "“SPE 只是资本效率工具，不是风险转移。”", stock: 5, risk: 7, sec: 4, media: 1 },
    { key: "q2-attack", label: "“把结构金融当作弊，是你模型太落后。”", stock: 3, risk: 8, sec: 2, media: 7, charisma: 2 },
    { key: "q2-promise", label: "“资产轻量化会持续抬升 ROE。”", stock: 9, risk: 13, sec: 3, whistle: 4, paper: 28, forecast: 32, corruption: 1 },
  ],
  3: [
    { key: "q3-tech", label: "“价格波动反映供需，我们只是提供流动性。”", stock: 4, risk: 7, sec: 4, media: 2 },
    { key: "q3-attack", label: "“把停电归咎于我们，是把天气写进财报。”", stock: 2, risk: 11, sec: 2, media: 8, charisma: 2 },
    { key: "q3-promise", label: "“交易部门将继续贡献超额利润。”", stock: 8, risk: 11, sec: 3, whistle: 5, paper: 30, forecast: 35, corruption: 1 },
  ],
  4: [
    { key: "q4-tech", label: "“股价波动不改变基本面，我们现金部署充分。”", stock: 4, risk: 8, sec: 5, media: 2 },
    { key: "q4-attack", label: "“这是情绪问题，不是经营问题。”", stock: 2, risk: 11, sec: 3, media: 8, charisma: 2 },
    { key: "q4-promise", label: "“资本计划将覆盖所有短期压力。”", stock: 7, risk: 12, sec: 4, whistle: 5, paper: 25, forecast: 30, corruption: 1 },
  ],
};

const glossary = {
  MTM: {
    short: "MTM：未来利润先记今天。",
    full: "MTM（Mark-to-Market，逐日盯市）：按模型估值提前确认远期收益，会放大利润波动并提高后续兑现压力。",
  },
  SPE: {
    short: "SPE：把债务放到‘表外房间’。",
    full: "SPE（特殊目的实体）：用于承接主公司资产/负债。若担保与主公司股价强绑定，风险会在下跌时回流。",
  },
  "旋转门": {
    short: "旋转门：监督者变同事。",
    full: "审计、监管与被监督企业之间频繁流动，削弱独立性，形成利益共同体。",
  },
};

const jargonA = ["协同效应", "价值共生", "范式转移", "资产轻量化", "动态风险中台", "增长飞轮"]; 
const jargonB = ["全链路赋能", "战略解耦", "现金流再造", "监管友好优化", "跨周期韧性", "组织反脆弱"]; 

function formatMoney(v) {
  const sign = v >= 0 ? "$" : "-$";
  return `${sign}${Math.abs(v).toFixed(1)}M`;
}

function formatBillion(v) {
  return `$${v.toFixed(1)}B`;
}

function feed(text, type = "") {
  const li = document.createElement("li");
  li.textContent = `[Q${state.quarter}] ${text}`;
  if (type) li.classList.add(type);
  document.getElementById("feed").prepend(li);
}

function clampInvestigation() {
  state.secAttention = Math.min(100, Math.max(0, state.secAttention));
  state.mediaHeat = Math.min(100, Math.max(0, state.mediaHeat));
  state.whistleblowerPressure = Math.min(100, Math.max(0, state.whistleblowerPressure));
  state.auditIndependence = Math.min(100, Math.max(0, state.auditIndependence));
}

function bumpCorruption(level) {
  state.fraudCount += level;
  state.morality = Math.max(0, state.morality - 9 * level);
  state.charisma = Math.min(100, state.charisma + 7 * level);
  state.secAttention += level * 2;
  state.mediaHeat += level * 1.5;
  state.whistleblowerPressure += level * 1.5;
}

function applyRiskPressure(baseRisk) {
  const leverage = Math.max(0, state.debt / Math.max(1, Math.max(1, state.realCash)));
  const amplified = baseRisk * (1 + leverage) * state.riskGrowthFactor;
  state.risk += amplified;
  return amplified;
}

function updateDangerEffects() {
  const dangerOn = state.risk > GAME_CONFIG.riskDangerLine || state.realCash < 100;
  document.body.classList.toggle("danger-mode", dangerOn);
  document.body.classList.toggle("risk-shake", state.risk > GAME_CONFIG.riskDangerLine);
  document.body.classList.toggle("cash-negative", state.realCash < 0);
  if (!dangerOn) return;
  if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (state.audioCtx.state === "suspended") state.audioCtx.resume();
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 82 + Math.random() * 25;
  gain.gain.value = 0.004;
  osc.connect(gain);
  gain.connect(state.audioCtx.destination);
  osc.start();
  osc.stop(state.audioCtx.currentTime + 0.08);
}

function shakeStockMetric() {
  const stockEl = document.getElementById("metricStockValue");
  if (!stockEl) return;
  if (Math.abs(state.stock - state.prevStock) < 0.3) return;
  stockEl.classList.remove("shake");
  void stockEl.offsetWidth;
  stockEl.classList.add("shake");
  setTimeout(() => stockEl.classList.remove("shake"), 380);
  state.prevStock = state.stock;
}

function updateMarketDerived() {
  state.marketCap = state.stock * 1.2;
  // 预期仍随季度与舞弊抬升，但更强调可管理区间。
  state.marketExpectedGain = 86 + state.quarter * 12 + state.fraudCount * 2.6;
}

function getAnalystRatings() {
  const q = state.quarter;
  return [
    {
      bank: "高盛",
      rating: q >= 1 ? (state.mtmMode === "aggressive" ? "强力买入 (Strong Buy)" : "买入 (Buy)") : "覆盖中",
      tone: state.mtmMode === "aggressive" ? "buy" : "top",
    },
    {
      bank: "美林",
      rating: q >= 2 ? (state.risk < 55 ? "行业首选 (Top Pick)" : "增持 (Outperform)") : "覆盖观察中",
      tone: q >= 2 && state.risk < 55 ? "top" : "hold",
    },
    {
      bank: "摩根大通",
      rating: q >= 4 ? (state.secAttention > 80 ? "减持 (Underweight)" : "维持持有 (Hold)") : "暂无更新",
      tone: q >= 4 && state.secAttention > 80 ? "sell" : "hold",
    },
  ];
}

function renderRatings() {
  const root = document.getElementById("ratings");
  if (!root) return;
  root.innerHTML = "";
  getAnalystRatings().forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>[${item.bank}]</span><span class="rating-tag rating-${item.tone}">${item.rating}</span>`;
    root.appendChild(li);
  });
}

function maybeShowQuarterQuote() {
  if (state.quoteShownForQuarter === state.quarter) return;
  const quoteKey = getRotatingKey(quarterQuotes, state.quarter);
  const quotes = quarterQuotes[quoteKey] || quarterQuotes[1];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const modal = document.getElementById("quoteModal");
  document.getElementById("quoteText").textContent = quote;
  modal.classList.remove("hidden");
  state.quoteShownForQuarter = state.quarter;
}

function setActiveScene(scene) {
  state.activeScene = scene;
  document.body.classList.remove("scene-desk", "scene-warroom", "scene-stage");
  document.body.classList.add(`scene-${scene}`);
  document.querySelectorAll(".scene-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-scene") === scene);
  });
  const hints = {
    desk: "办公桌：处理日常经营、现金与邮件压力。",
    warroom: "小黑会：决定增长叙事与结构化动作。",
    stage: "大会现场：用话术管理华尔街预期。",
  };
  const hint = document.getElementById("sceneHint");
  if (hint) hint.textContent = hints[scene] || "";

  const byId = (id) => document.getElementById(id);
  Object.entries(GAME_CONFIG.scenePermissions).forEach(([k, ids]) => {
    ids.forEach((id) => {
      const el = byId(id);
      if (!el) return;
      el.style.display = k === scene ? "" : "none";
    });
  });
}

function wireSceneButtons() {
  document.querySelectorAll(".scene-btn").forEach((btn) => {
    btn.onclick = () => setActiveScene(btn.getAttribute("data-scene"));
  });
  setActiveScene(state.activeScene);
}

function animateNumber(el, from, to, formatter) {
  const start = performance.now();
  const dur = 320;
  const run = (t) => {
    const p = Math.min(1, (t - start) / dur);
    const v = from + (to - from) * p;
    el.textContent = formatter(v);
    if (p < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

function renderMetrics() {
  updateMarketDerived();
  const metrics = [
    { key: "stock", label: content.statusLabels?.price || "华尔街估值 (Market Cap/Price)", value: state.stock, fmt: (v) => `$${v.toFixed(1)}` },
    { key: "cash", label: content.statusLabels?.cash || "金库头寸 (Actual Liquidity)", value: state.realCash, fmt: (v) => formatMoney(v) },
    { key: "paper", label: content.statusLabels?.paper || "叙事利润 (Narrative Earnings)", value: state.paperGain, fmt: (v) => formatMoney(v) },
    { key: "risk", label: content.statusLabels?.risk || "SEC 绞索 (Regulatory Noose)", value: state.risk, fmt: (v) => `${Math.round(v)} / 120` },
    { key: "q", label: content.statusLabels?.quarter || "生存周期 (Fiscal Quarter)", value: state.quarter, fmt: (v) => `Q${Math.round(v)}` },
  ];

  document.getElementById("metrics").innerHTML = metrics
    .map((m, i) => `<article class="metric"><h3>${m.label}</h3><strong data-key="${m.key}" ${i === 0 ? 'id="metricStockValue"' : ""}>${m.fmt(m.value)}</strong></article>`)
    .join("");

  metrics.forEach((m) => {
    const el = document.querySelector(`[data-key="${m.key}"]`);
    if (!el) return;
    const prev = state.metricPrev[m.key] ?? m.value;
    if (Math.abs(prev - m.value) > 0.05) animateNumber(el, prev, m.value, m.fmt);
    state.metricPrev[m.key] = m.value;
  });

  const gap = state.forecastPaperGain - state.marketExpectedGain;
  const compareEl = document.getElementById("forecastCompare");
  compareEl.className = `small ${gap >= 0 ? "good" : "bad"}`;
  compareEl.textContent = `预期对比：你承诺 ${formatMoney(state.forecastPaperGain)}，市场要求 ${formatMoney(state.marketExpectedGain)}，差额 ${formatMoney(gap)}。`;

  const previewUnits = Math.min(12, state.personalOptions);
  const previewGross = previewUnits * state.stock * 0.02;
  const previewCap = Math.max(6, state.realCash * 0.18);
  const previewProceeds = Math.min(previewGross, previewCap);
  document.getElementById("optionInfo").textContent = state.exercisedThisQuarter
    ? "本季度已完成期权变现。"
    : `个人期权变现预览：${previewUnits} 份，预计到账 ${formatMoney(previewProceeds)}，基础风险 +3。`;

  const lobbyBtn = document.getElementById("lobbyingBtn");
  if (lobbyBtn) {
    lobbyBtn.disabled = state.lobbyingUsedThisQuarter;
    lobbyBtn.textContent = state.lobbyingUsedThisQuarter
      ? "公关与游说（本季度已执行）"
      : "公关与游说（三档）";
  }

  const nextSpeInterest = state.speDebtLots.reduce((sum, lot) => sum + (lot.amount * Math.pow(1.1, Math.max(1, (state.quarter + 1) - lot.bornQuarter + 1))), 0);
  const ledger = document.getElementById("ledgerInfo");
  if (ledger) ledger.textContent = `总债务 ${formatMoney(state.debt)} · 下季度SPE利息预估 ${formatMoney(nextSpeInterest)} · 董事会最后通牒 ${state.boardUltimatum ? `剩余 ${state.boardUltimatum} 季度` : "无"}`;

  const decay = Math.min(1, (100 - state.morality) / 100);
  const motto = document.getElementById("motto");
  motto.style.opacity = `${1 - decay * 0.65}`;
  motto.style.letterSpacing = `${0.28 - decay * 0.21}em`;
  motto.style.filter = `hue-rotate(${decay * 95}deg)`;
  motto.textContent = state.morality < 40 ? "沟 通 // 诚? // 尊X // 卓越" : "沟通 · 诚信 · 尊重 · 卓越";
}

function renderTimeline() {
  const t = timelineData[state.quarter] || timelineData[getRotatingKey(timelineData, state.quarter)];
  document.getElementById("timelineYear").textContent = `历史区间：${t.year}`;
  document.getElementById("timelineEvent").textContent = t.event;
  document.getElementById("timelinePeople").textContent = `关键人物：${t.people}`;
  document.getElementById("timelineImpact").textContent = `历史后果：${t.impact}`;
}

function renderInvestigationPanel() {
  clampInvestigation();
  document.getElementById("secBar").value = state.secAttention;
  document.getElementById("mediaBar").value = state.mediaHeat;
  document.getElementById("whistleBar").value = state.whistleblowerPressure;
  document.getElementById("auditBar").value = 100 - state.auditIndependence;
  const boardBar = document.getElementById("boardBar");
  if (boardBar) boardBar.value = state.boardPatience;

  const hint = [];
  if (state.secAttention > 65) hint.push("SEC 已进入深度问询");
  if (state.mediaHeat > 60) hint.push("媒体头条密集跟进");
  if (state.whistleblowerPressure > 58) hint.push("内部吹哨风险升高");
  if (state.auditIndependence < 40) hint.push("审计独立性接近失效");
  document.getElementById("investigationHint").textContent = hint.length ? `警报：${hint.join("；")}` : "目前尚可控，但‘尚可控’通常是事故前的最后一句话。";
}

function triggerSpecialEvents() {
  if (state.whistleblowerPressure >= 62 && !state.triggeredEvents.has("whistle")) {
    state.triggeredEvents.add("whistle");
    applyRiskPressure(3);
    feed("匿名内部备忘录外泄：‘我们正在把亏损藏在叙事里。’", "warn");
    state.historyLog.push("吹哨者事件触发");
  }
  if (state.quarter >= 3 && !state.triggeredEvents.has(`insider-tip-q${state.quarter}`) && Math.random() < 0.34) {
    state.triggeredEvents.add(`insider-tip-q${state.quarter}`);
    state.tipShredBoost = true;
    feed("内幕消息：听说 SEC 下周要查账——本季度‘文件留存策略’效果翻倍。", "warn");
    state.historyLog.push("内幕消息触发");
  }

  if (state.secAttention >= 70 && !state.triggeredEvents.has("sec")) {
    state.triggeredEvents.add("sec");
    state.risk += 6;
    feed("SEC 发出专项问询函：请解释利润与现金流背离。", "bad");
    state.historyLog.push("SEC深度问询触发");
  }
  if (state.mediaHeat >= 72 && !state.triggeredEvents.has("short")) {
    state.triggeredEvents.add("short");
    state.stock -= 6;
    feed("做空报告公开：‘这不是创新，是延迟确认现实。’", "bad");
    state.historyLog.push("做空报告触发");
  }
}

function generateReportText() {
  const a = jargonA[(state.quarter + state.fraudCount) % jargonA.length];
  const b = jargonB[(state.quarter + Math.floor(state.charisma / 10)) % jargonB.length];
  return `董事会认为公司已形成“${a} + ${b}”双轮驱动。利润与现金流错位是战略前置投入，建议投资者继续保持信念并减少提问。`;
}

function getQuarterConfig(q) {
  if (quarterConfig[q]) return quarterConfig[q];
  const stage = q <= 4 ? "崛起期" : q <= 8 ? "狂热期" : "崩盘期";
  return {
    name: `安然季度股东大会决议 · 第${q}季度（${stage}）`,
    desc: q <= 8 ? "你在真实经营与创意会计之间继续博弈，董事会只看增长曲线。" : "风险回流与流动性挤兑同步出现，你要在倒计时中求生。",
    intro: q < 12 ? `Q${q} 决议：要么做日常经营保命，要么用事件驱动叙事保股价。` : "Q12 决议：最后离场窗口，决定你是神话还是教材。",
  };
}

function renderQuarterStatus() {
  const q = getQuarterConfig(state.quarter);
  document.getElementById("phaseInfo").textContent = q.name;
  document.getElementById("phaseDesc").textContent = q.desc;
  document.getElementById("actionIntro").textContent = q.intro;
  document.getElementById("operationHint").textContent = state.actionDone && state.auditDone && state.callDone
    ? "流程完成：可发布财报。若要变现，现在就是最‘合理合规’的时间窗口。"
    : "请完成【核心任务】→【审计沟通】→【分析师会议】三步。";

  const canSettle = state.actionDone && state.auditDone && state.callDone;
  const nextBtn = document.getElementById("nextQuarterBtn");
  nextBtn.disabled = !canSettle;
  nextBtn.style.display = canSettle ? "" : "none";
  if (!state.actionDone) setActiveScene("desk"); else if (!state.auditDone) setActiveScene("warroom"); else if (!state.callDone) setActiveScene("stage");
  document.getElementById("nextQuarterBtn").textContent = content.buttons?.nextQuarter || "[发布季度财报]";
  const exerciseBtn = document.getElementById("exerciseBtn");
  const canExercise = !(state.exercisedThisQuarter || state.personalOptions <= 0);
  exerciseBtn.disabled = !canExercise;
  exerciseBtn.style.display = canExercise ? "" : "none";
  exerciseBtn.textContent = content.buttons?.exercise || "[紧急处置个人期权]";
  const routineBtn = document.getElementById("routineBtn");
  if (routineBtn) {
    routineBtn.disabled = state.actionDone;
    routineBtn.style.display = state.actionDone ? "none" : "";
  }
}

function renderTermButtons(keys = []) {
  if (!keys.length) return "";
  return `
    <div class="term-box">
      <p class="small">术语速查（悬停/点击查看）：</p>
      <div class="choices">
        ${keys.map((k) => `<button class="choice-btn term-btn" data-term="${k}" title="${glossary[k].full}">${k} ⓘ（${glossary[k].short}）</button>`).join("")}
      </div>
      <p class="small term-explain"></p>
    </div>
  `;
}

function renderImpact(title, lines) {
  return `<div class="impact"><strong>${title}</strong><ul>${lines.map((s) => `<li>${s}</li>`).join("")}</ul></div>`;
}

function wireGlossary() {
  document.querySelectorAll("[data-term]").forEach((btn) => {
    const key = btn.getAttribute("data-term");
    const reveal = () => {
      const box = btn.closest(".term-box");
      const target = box ? box.querySelector(".term-explain") : null;
      if (!target) return;
      target.textContent = glossary[key].full;
    };
    btn.onclick = reveal;
    btn.onmouseenter = reveal;
  });
}

function renderActionPanel() {
  const root = document.getElementById("actionArea");
  root.innerHTML = "";

  if (state.quarter === 1) {
    root.innerHTML = `
      <label for="optimism">[重估未来价值] 参数（50%-100%）</label>
      <input type="range" id="optimism" min="50" max="100" step="5" value="65" ${state.actionDone ? "disabled" : ""} />
      <p id="optimismPreview"></p>
      ${renderImpact("选择前影响预览", [
        "利用逐日盯市会计准则，将未来20年的预期净利润折现至本季报表。这不是造假，这是对未来的远见。",
        "风险：+（SEC关注 +1~+6；媒体热度 +1~+5）",
        "现实后果：若≥85，后续分析师提问转为‘激进质询’",
      ])}
      ${renderTermButtons(["MTM"])}
      <button id="actionBtn" ${state.actionDone ? "disabled" : ""}>[重估未来价值]</button>
    `;

    const slider = document.getElementById("optimism");
    const preview = document.getElementById("optimismPreview");
    const refresh = () => {
      const optimism = Number(slider.value);
      const gainBoost = 200 + (optimism - 50) * 4;
      preview.textContent = `若选 ${optimism}%：账面收益约 +$${gainBoost.toFixed(0)}M，SEC +${Math.max(1, ((optimism - 50) * 0.12).toFixed(0))}。`;
    };
    slider.addEventListener("input", refresh);
    refresh();

    document.getElementById("actionBtn").onclick = () => {
      if (state.actionDone) return;
      const optimism = Number(slider.value);
      state.paperGain += 200 + (optimism - 50) * 4;
      state.forecastPaperGain = state.paperGain + 30;
      state.stock += optimism >= 90 ? 22 : 12;
      applyRiskPressure((optimism - 50) * 0.6);
      state.realCash -= 28;
      state.secAttention += Math.max(1, (optimism - 50) * 0.12);
      state.mediaHeat += Math.max(1, (optimism - 55) * 0.1);
      state.firstAction = optimism >= 85 ? "aggressive" : "conservative";
      state.mtmMode = optimism >= 85 ? "aggressive" : "conservative";
      bumpCorruption(optimism >= 90 ? 2 : 1);
      state.actionDone = true;
      state.historyLog.push(`Q1 MTM：${optimism}%`);
      state.lastActionSummary = optimism >= 85 ? "激进MTM" : "保守MTM";
      state.boardPatience = Math.min(100, state.boardPatience + (optimism >= 85 ? 16 : 9));
      state.consecutiveNormalOps = 0;
      feed("Q1 决议通过：你让未来提前上班，让风险留在加班表里。", "good");
      render();
    };
    wireGlossary();
    return;
  }

  if (state.quarter === 2) {
    root.innerHTML = `
      <p>[启动表外融资方案] 请选择 LJM2 承接规模：</p>
      ${renderImpact("选择前影响预览", [
        "将高负债资产剥离至关联实体 LJM2。让我们的财报看起来像处女一样纯洁。",
        "$1000M：账面收益 +$80M，SEC +9，吹哨压力 +7，股价短期更强",
      ])}
      ${renderTermButtons(["SPE"])}
      <div class="choices" id="speChoices"></div>
    `;
    const opts = [
      { label: "【资产负债表表外化】转移 $400M（保守）", debt: 400, risk: 8, stock: 8, sec: 2, whistle: 3 },
      { label: "【资产负债表表外化】转移 $1000M（激进）", debt: 1000, risk: 22, stock: 18, sec: 6, whistle: 7 },
    ];
    const holder = document.getElementById("speChoices");
    opts.forEach((o) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = `${o.label}`;
      btn.disabled = state.actionDone;
      btn.onclick = () => {
        if (state.actionDone) return;
        state.paperGain += o.debt * 0.08;
        state.forecastPaperGain = state.paperGain + o.debt * 0.02;
        state.stock += o.stock;
        applyRiskPressure(o.risk);
        state.realCash -= 35;
        const hiddenDebt = o.debt * 0.65;
        state.debt += hiddenDebt;
        state.speDebtLots.push({ amount: hiddenDebt, bornQuarter: state.quarter });
        state.totalAssets += o.debt * 0.4;
        state.secAttention += o.sec;
        state.whistleblowerPressure += o.whistle;
        state.mediaHeat += 3;
        bumpCorruption(o.debt > 600 ? 2 : 1);
        state.actionDone = true;
        state.historyLog.push(`Q2 SPE：${o.debt}M`);
        state.lastActionSummary = o.debt > 600 ? "激进SPE" : "保守SPE";
        state.boardPatience = Math.min(100, state.boardPatience + (o.debt > 600 ? 14 : 8));
        state.consecutiveNormalOps = 0;
        feed("SPE 接盘完成：问题离开了报表，但没有离开现实。", "warn");
        render();
      };
      holder.appendChild(btn);
    });
    wireGlossary();
    return;
  }

  if (state.quarter === 3) {
    root.innerHTML = `
      <p>高峰时段停机策略：</p>
      ${renderImpact("选择前影响预览", [
        "停机 6 小时：现金 +$120M，媒体热度 +10，SEC +8",
        "停机 24 小时：现金 +$380M，媒体热度 +22，SEC +16，做空风险上升",
      ])}
      <div class="choices" id="blackoutChoices"></div>
    `;
    const opts = [
      { label: "停机 6 小时（低调套利）", cash: 120, risk: 16, media: 10, sec: 8, press: "局部停电，市民在黑暗里补了金融常识。" },
      { label: "停机 24 小时（全州恐慌）", cash: 380, risk: 34, media: 22, sec: 16, press: "电价飙升，记者终于学会问现金流。" },
    ];
    const holder = document.getElementById("blackoutChoices");
    opts.forEach((o) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = o.label;
      btn.disabled = state.actionDone;
      btn.onclick = () => {
        if (state.actionDone) return;
        state.realCash += o.cash;
        state.paperGain += o.cash * 0.3;
        state.forecastPaperGain = state.paperGain + 45;
        applyRiskPressure(o.risk);
        state.stock += 6;
        state.mediaHeat += o.media;
        state.secAttention += o.sec;
        state.whistleblowerPressure += 8;
        bumpCorruption(2);
        state.actionDone = true;
        state.historyLog.push(`Q3 停机：${o.cash}M`);
        state.lastActionSummary = o.cash > 200 ? "高强度停机" : "低强度停机";
        state.boardPatience = Math.min(100, state.boardPatience + (o.cash > 200 ? 12 : 7));
        state.consecutiveNormalOps = 0;
        feed(`停机策略执行：${o.press}`, "bad");
        render();
      };
      holder.appendChild(btn);
    });
    return;
  }

  if (state.quarter < 12) {
    root.innerHTML = `
      <p>季度经营路线：</p>
      ${renderImpact("选择前影响预览", [
        "日常经营：现金 +$70M，账面收益 +$35M，风险 +1，董事会不满 +15%",
        "事件驱动增长：账面利润暴涨并可重置不满度，但风险与债务同步上升",
      ])}
      <div class="choices" id="midChoices"></div>
    `;
    const midOpts = [
      { label: "坚持日常经营（The Slow Death）", cash: 70, paper: 35, risk: 1, sec: 0, patience: -15, mode: "normal" },
      { label: "接入事件驱动增长（The High Flight）", cash: 190, paper: 300, risk: 18, sec: 7, patience: 100, mode: "fraud" },
    ];
    const midHolder = document.getElementById("midChoices");
    midOpts.forEach((o) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = o.label;
      btn.disabled = state.actionDone;
      btn.onclick = () => {
        if (state.actionDone) return;
        state.realCash += o.cash;
        state.paperGain += o.paper;
        state.forecastPaperGain = state.paperGain + 36;
        applyRiskPressure(o.risk);
        state.secAttention += o.sec;
        state.stock += o.mode === "fraud" ? 8 : -2;
        state.boardPatience = o.patience === 100 ? 100 : Math.max(0, Math.min(100, state.boardPatience + o.patience));
        if (o.mode === "normal") {
          state.consecutiveNormalOps += 1;
          if (state.consecutiveNormalOps >= 2) {
            state.boardPatience = Math.max(0, state.boardPatience - 20);
            state.stock -= 4;
            feed("董事会抱怨增长停滞：‘我们不是来经营公用事业的。’", "warn");
          }
          state.lastActionSummary = "日常经营";
        } else {
          state.consecutiveNormalOps = 0;
          state.debt += 90;
          state.lastActionSummary = "事件驱动增长";
        }
        state.actionDone = true;
        state.historyLog.push(`Q${state.quarter} 经营：${o.mode}`);
        feed(o.mode === "fraud" ? "你讲了一个市场爱听的增长故事。" : "你做了正确的事，但董事会更爱爆发曲线。", o.mode === "fraud" ? "warn" : "good");
        render();
      };
      midHolder.appendChild(btn);
    });
    return;
  }

  root.innerHTML = `
    <p>终局操作包：</p>
    ${renderImpact("选择前影响预览", [
      "【启动文件留存策略 (Document Retention Policy)】碎纸机是CFO最好的朋友。在SEC敲门前，让那些不必要的草稿消失。",
      "分批方案：私人账户 +$120M，风险 +10，SEC +2，股价 -7",
      "温和方案：私人账户 +$240M，风险 +18，SEC +5，股价 -14",
      "极速方案：私人账户 +$420M，风险 +34，SEC +10，股价 -26",
    ])}
    <div class="choices" id="endChoices"></div>
  `;

  const opts = [
    { label: "【分批套现】小额减持 + 控制舆情（私人账户 +$120M / 风险 +10 / SEC +2 / 股价 -7）", cash: 120, risk: 10, stockDrop: 7, sec: 2, corruption: 1 },
    { label: "【启动文件留存策略】温和套现 + 选择性销毁（私人账户 +$240M / 风险 +18 / SEC +5 / 股价 -14）", cash: 240, risk: 18, stockDrop: 14, sec: 5, corruption: 2 },
    { label: "【启动文件留存策略】极速套现 + 全面碎纸 + 强硬封口（私人账户 +$420M / 风险 +34 / SEC +10 / 股价 -26）", cash: 420, risk: 34, stockDrop: 26, sec: 10, corruption: 3 },
  ];

  const holder = document.getElementById("endChoices");
  opts.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = o.label;
    btn.disabled = state.actionDone;
    btn.onclick = () => {
      if (state.actionDone) return;
      const tipFactor = state.tipShredBoost ? 0.5 : 1;
      state.privateAccount += o.cash + (state.tipShredBoost ? 40 : 0);
      state.realCash -= o.cash * 0.3;
      state.stock -= o.stockDrop * (state.tipShredBoost ? 0.85 : 1);
      applyRiskPressure(o.risk * tipFactor);
      state.secAttention += o.sec * tipFactor;
      state.mediaHeat += 9;
      state.whistleblowerPressure += 9;
      bumpCorruption(o.corruption);
      state.actionDone = true;
      state.historyLog.push(`Q4 套现：${o.cash}M`);
      state.lastActionSummary = o.cash > 300 ? "极速套现" : (o.cash > 180 ? "温和套现" : "分批套现");
      if (state.tipShredBoost) feed("内幕风声应验：‘文件留存策略’本季效果翻倍，调查节奏被明显拖慢。", "good");
      feed("会后纪要：高管强调‘与公司共命运’，并提前预定了离岛机票。", "bad");
      render();
    };
    holder.appendChild(btn);
  });
}

function renderAuditPanel() {
  const root = document.getElementById("auditChoices");
  root.innerHTML = `
    ${renderImpact("选择前影响预览", [
      "解释结构：风险 +10，审计独立性不变",
      "咨询费：现金 -$8M，风险 -14，审计独立性 -15",
      "旋转门：现金 -$15M，风险 -20，审计独立性 -30，并获得‘监管缓冲’（后续 SEC 增幅减弱）",
    ])}
    ${renderTermButtons(["旋转门"])}
    <div class="choices" id="auditOptionList"></div>
  `;

  const options = [
    {
      label: "解释复杂结构（不送钱）",
      apply: () => {
        state.risk += 6;
        state.secAttention += 4;
        feed("安达信听完后表示：‘我们需要更多附件。’", "warn");
        state.historyLog.push("审计：解释结构");
        state.lastAuditSummary = "解释结构";
      },
    },
    {
      label: "[支付‘审计咨询费’]",
      apply: () => {
        state.realCash -= 8;
        state.risk = Math.max(0, state.risk - 14);
        state.auditIndependence -= 15;
        state.secAttention += 2;
        bumpCorruption(1);
        feed("咨询费到账后，审计措辞从‘风险’改成了‘机会’。", "good");
        state.historyLog.push("审计：咨询费勾结");
        state.lastAuditSummary = "咨询费勾结";
      },
    },
    {
      label: "高薪挖角审计合伙人（旋转门，仅一次）",
      disabled: state.rotationDoorUsed,
      apply: () => {
        state.realCash -= 15;
        state.risk = Math.max(0, state.risk - 20);
        state.auditIndependence -= 30;
        state.mediaHeat += 4;
        state.secAttention += 6;
        bumpCorruption(2);
        feed("旋转门启动：监督者进了管理层，独立性顺手下班。", "warn");
        state.historyLog.push("审计：旋转门");
        state.lastAuditSummary = "旋转门";
        state.rotationDoorUsed = true;
        state.rotationDoorShield = true;
      },
    },
  ];

  const holder = document.getElementById("auditOptionList");
  options.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = o.label;
    btn.disabled = state.auditDone || !!o.disabled;
    btn.onclick = () => {
      if (state.auditDone) return;
      o.apply();
      state.auditDone = true;
      render();
    };
    holder.appendChild(btn);
  });

  wireGlossary();
}

function getAnalystQuestion() {
  const bank = state.firstAction === "aggressive" ? analystQuestionBank.aggressive : analystQuestionBank.conservative;
  let q = bank[(state.quarter - 1) % bank.length];
  if (state.secAttention > 65) q += "（附加追问：SEC 已要求你提交补充披露）";
  if (state.whistleblowerPressure > 60) q += "（附加追问：内部邮件泄露是否属实？）";
  return q;
}

function renderCallChoices() {
  const root = document.getElementById("callChoices");
  root.innerHTML = "";
  document.getElementById("callPrompt").textContent = "场景描述：为什么你们的盈利和现金流分歧如此之大？";
  const options = [
    { label: "因为你没上过高级会计课，蠢货。", stock: 5, risk: 10, cls: "warn" },
    { label: "这是一个复杂的长期资本运作模型。", stock: 0, risk: 2, cls: "good" },
  ];
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = `${opt.label}（股价 ${opt.stock >= 0 ? "+" : ""}${opt.stock} / 风险 +${opt.risk}）`;
    btn.disabled = state.callDone;
    btn.onclick = () => {
      if (state.callDone) return;
      state.stock += opt.stock;
      applyRiskPressure(opt.risk);
      state.callDone = true;
      state.lastCallSummary = opt.label.includes("蠢货") ? "q-attack" : "q-jargon";
      state.historyLog.push(`会议：${state.lastCallSummary}`);
      const tw = document.getElementById("twitterFeed");
      if (tw) { const li = document.createElement("li"); li.textContent = opt.stock > 0 ? "#CNBC: 他把分析师骂了，但市场居然买账。" : "#MarketWatch: 全是术语，没人回答现金流。"; tw.prepend(li); }
      const line = document.getElementById("callChartLine");
      if (line) { const w = Math.max(8, Math.min(96, 50 + state.stock * 0.2)); line.style.width = `${w}%`; line.style.background = opt.stock > 0 ? "linear-gradient(90deg,#64f0a5,#a5ffda)" : "linear-gradient(90deg,#ff6a6a,#ffb0b0)"; }
      feed(`你在会上回应：${opt.label}`, opt.cls);
      render();
    };
    root.appendChild(btn);
  });
}

function renderTicker() {
  const track = document.getElementById("tickerTrack");
  if (!track) return;
  const base = quarterTickerBase[state.quarter] || quarterTickerBase[1];
  const mapped = [
    optionTickerMap[state.lastEventSummary],
    optionTickerMap[state.lastActionSummary],
    optionTickerMap[state.lastCallSummary],
  ].filter(Boolean);
  const dynamic = [
    `Q${state.quarter} 股价 $${state.stock.toFixed(1)}`,
    `SEC关注 ${Math.round(state.secAttention)}`,
    state.lastActionSummary ? `动作：${state.lastActionSummary}` : null,
    state.lastEventSummary ? `事件：${state.lastEventSummary}` : null,
  ];
  const merged = [...base, ...mapped, ...dynamic.filter(Boolean)];
  const shift = state.tickerClock % Math.max(1, merged.length);
  const rotated = merged.slice(shift).concat(merged.slice(0, shift));
  track.textContent = rotated.join("  •  ");
}

function resolveQuarterRandomEvent(onDone) {
  if (state.randomEventResolved) {
    onDone();
    return;
  }
  const eventKey = getRotatingKey(quarterRandomEvents, state.quarter);
  const event = quarterRandomEvents[eventKey];
  const modal = document.getElementById("randomEvent");
  const titleNode = document.getElementById("eventTitle");
  const descNode = document.getElementById("eventDesc");
  titleNode.textContent = event.title;
  descNode.textContent = event.desc;
  const root = document.getElementById("eventChoices");
  root.innerHTML = "";

  event.choices.forEach((c, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = c.label;
    btn.onclick = () => {
      const feedback = c.effect(state);
      const keyMap = {
        1: ["insult", "yacht"],
        2: ["transparent", "delay"],
        3: ["deadstar", "fund"],
        4: ["deny", "scapegoat"],
      };
      state.lastEventSummary = keyMap[eventKey][idx] || keyMap[eventKey][0];
      state.randomEventResolved = true;

      descNode.textContent = `选择结果：${feedback}`;
      root.innerHTML = "";
      const confirm = document.createElement("button");
      confirm.className = "choice-btn";
      confirm.textContent = "确认并继续季度结算";
      confirm.onclick = () => {
        modal.classList.add("hidden");
        render();
        onDone();
      };
      root.appendChild(confirm);
    };
    root.appendChild(btn);
  });
  modal.classList.remove("hidden");
}

function exerciseOptions() {
  if (state.exercisedThisQuarter || state.personalOptions <= 0) return;
  const units = Math.min(12, state.personalOptions);
  const grossProceeds = units * state.stock * 0.02;
  const liquidityCap = Math.max(6, state.realCash * 0.18);
  const proceeds = Math.min(grossProceeds, liquidityCap);
  state.personalOptions -= units;
  state.privateAccount += proceeds;
  state.realCash -= proceeds * 0.3;
  state.stock -= Math.max(0.4, units * 0.02);
  applyRiskPressure(3);
  const crashChance = Math.min(0.55, 0.08 + units * 0.009 + state.risk / 260);
  if (Math.random() < crashChance) {
    const crashDrop = 6 + Math.random() * 8;
    state.stock -= crashDrop;
    state.secAttention += 5;
    state.mediaHeat += 6;
    feed(`大宗减持被识别，做空盘狙击触发，股价瞬跌 ${crashDrop.toFixed(1)} 点。`, "bad");
  }
  state.mediaHeat += 2;
  state.exercisedThisQuarter = true;
  state.historyLog.push(`期权变现：${units}份(${formatMoney(proceeds)})`);
  feed(`你按 $${state.stock.toFixed(1)} 执行 ${units} 份期权，到账 ${formatMoney(proceeds)}（受流动性上限约束）。`, "warn");
  render();
}

function runLobbying(tier) {
  if (state.lobbyingUsedThisQuarter) return;
  const cfg = {
    light: { cash: 80, riskPct: 0.08, secCut: 2, mediaCut: 7, text: "轻度游说" },
    mid: { cash: 150, riskPct: 0.15, secCut: 5, mediaCut: 4, text: "中度游说" },
    heavy: { cash: 260, riskPct: 0.24, secCut: 999, mediaCut: 5, text: "重度游说" },
  }[tier];
  if (!cfg) return;
  if (tier === "heavy" && state.heavyLobbyUsed) {
    feed("重度政治献金本局仅可使用一次。", "warn");
    return;
  }
  if (state.realCash < cfg.cash) {
    feed("公关与游说失败：现金不足。", "warn");
    return;
  }
  state.realCash -= cfg.cash;
  const riskDrop = state.risk * cfg.riskPct;
  state.risk = Math.max(0, state.risk - riskDrop);
  if (tier === "mid") {
    state.riskGrowthFactor = 0.75;
  }

  if (tier === "heavy") {
    state.secAttention = Math.max(0, state.secAttention - 18);
    state.heavyLobbyUsed = true;
    state.triggeredEvents.delete("sec");
  } else {
    state.secAttention = Math.max(0, state.secAttention - cfg.secCut);
  }
  state.mediaHeat = Math.max(0, state.mediaHeat - cfg.mediaCut);
  state.lobbyingUsedThisQuarter = true;
  state.historyLog.push(`游说-${cfg.text}：-${formatMoney(cfg.cash)} / 风险-${riskDrop.toFixed(1)}`);
  feed(`${cfg.text}执行：支付 ${formatMoney(cfg.cash)}，风险下降 ${riskDrop.toFixed(1)}。`, "good");
  render();
}

function openLobbyingModal() {
  if (state.lobbyingUsedThisQuarter) return;
  const modal = document.getElementById("lobbyingModal");
  const root = document.getElementById("lobbyingChoices");
  root.innerHTML = "";
  const options = [
    { tier: "light", label: "轻度游说（现金 -$80M / 媒体热度显著下降）" },
    { tier: "mid", label: "中度游说（现金 -$150M / 本季风险增速对冲）" },
    { tier: "heavy", label: `重度游说（现金 -$260M / 冻结 SEC 进度，本局限一次）${state.heavyLobbyUsed ? "【已用】" : ""}` },
  ];
  options.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = o.label;
    btn.disabled = (o.tier === "heavy" && state.heavyLobbyUsed);
    btn.onclick = () => {
      runLobbying(o.tier);
      modal.classList.add("hidden");
    };
    root.appendChild(btn);
  });
  modal.classList.remove("hidden");
}

function handleCashCrisisIfNeeded(onDone) {
  if (state.realCash >= 0) {
    onDone();
    return;
  }

  const modal = document.getElementById("cashCrisisModal");
  const root = document.getElementById("cashCrisisChoices");
  root.innerHTML = "";

  const options = [
    {
      label: "预收长期合同现金（历史原型：提前变现未来合约）｜现金 +$120M / 风险 +6",
      apply: () => {
        state.realCash += 120;
        state.paperGain += 10;
        state.risk += 6;
        state.secAttention += 5;
        state.lastEventSummary = "delay";
        feed("你把未来合同现金提前搬到现在，账上喘了口气，未来压力上了锁。", "warn");
      },
    },
    {
      label: "通过 SPE 过桥融资（历史原型：表外结构融资）｜现金 +$180M / 风险 +12",
      apply: () => {
        state.realCash += 180;
        state.debt += 160;
        state.totalAssets += 80;
        state.risk += 9;
        state.secAttention += 8;
        state.whistleblowerPressure += 6;
        state.lastEventSummary = "delay";
        feed("你用表外结构再借一层命，审计脚注越来越像小说。", "bad");
      },
    },
    {
      label: "申请银行紧急授信（历史原型：信用额度救火）｜现金 +$90M / 股价 -6",
      apply: () => {
        state.realCash += 90;
        state.stock -= 6;
        state.risk += 4;
        state.secAttention += 2;
        state.lastEventSummary = "transparent";
        feed("银行愿意给钱，但市场读懂了你的求生姿态。", "warn");
      },
    },
  ];

  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = opt.label;
    btn.onclick = () => {
      opt.apply();
      if (state.realCash < 0) {
        document.getElementById("cashCrisisDesc").textContent = `融资后现金仍为 ${formatMoney(state.realCash)}，请继续选择救火方案。`;
        root.innerHTML = "";
        handleCashCrisisIfNeeded(onDone);
        return;
      }
      modal.classList.add("hidden");
      onDone();
    };
    root.appendChild(btn);
  });

  modal.classList.remove("hidden");
}

function settleQuarterCore() {
  const operatingCost = 110 + state.quarter * 10;
  const baseInterest = state.debt * 0.08;
  const speInterest = state.speDebtLots.reduce((sum, lot) => {
    const active = Math.max(1, state.quarter - lot.bornQuarter + 1);
    return sum + (lot.amount * Math.pow(1.1, active));
  }, 0);
  const interest = baseInterest + speInterest;
  state.realCash -= operatingCost + interest;
  handleCashCrisisIfNeeded(settleQuarterPostFinance);
}

function settleQuarterPostFinance() {
  const preStock = state.stock;
  if (state.paperGain < state.marketExpectedGain) {
    const gap = state.marketExpectedGain - state.paperGain;
    const drop = Math.max(3, Math.min(10, gap / 32));
    state.stock -= drop;
    state.risk += 2;
    state.mediaHeat += 3;
    feed(`披露利润低于市场预期，股价下跌 ${drop.toFixed(1)} 点。`, "warn");
  } else {
    state.stock += 4;
    feed("披露利润高于预期，股价小幅拉升。", "good");
  }

  if (state.auditIndependence < 45) {
    state.risk += 2;
    state.secAttention += state.rotationDoorShield ? 1.5 : 3;
    feed("审计独立性过低触发反噬：监管把‘咨询关系’写进问询。", "bad");
  }

  triggerSpecialEvents();

  state.paperGain *= 0.7;
  state.forecastPaperGain = state.paperGain + 20;
  state.stock = Math.max(2, state.stock);
  state.risk = Math.max(0, state.risk - 9);
  state.secAttention = Math.max(0, state.secAttention - (state.auditIndependence > 65 ? 6 : 3));
  if (state.mediaHeat < 55) state.secAttention = Math.max(0, state.secAttention - 2);
  state.mediaHeat = Math.max(0, state.mediaHeat - 4);
  state.whistleblowerPressure = Math.max(0, state.whistleblowerPressure - 3);
  state.risk = Math.max(0, Math.min(140, state.risk));
  clampInvestigation();
  document.getElementById("report").textContent = generateReportText();

  state.boardPatience = Math.max(0, state.boardPatience - GAME_CONFIG.boardQuarterDecay + (state.lastActionSummary === "事件驱动增长" ? 6 : 0));
  state.stockDropStreak = state.stock < preStock ? state.stockDropStreak + 1 : 0;
  if (state.boardUltimatum > 0) {
    state.boardUltimatum -= 1;
    if (state.boardUltimatum === 0) {
      state.firedByBoard = true;
      endGame();
      return;
    }
  }
  emitHook("afterQuarterSettle", { quarter: state.quarter });
  if (state.boardPatience <= 0) {
    state.firedByBoard = true;
    endGame();
    return;
  }

  if (state.quarter === GAME_CONFIG.maxQuarter) {
    endGame();
    return;
  }

  state.quarter += 1;
  state.exercisedThisQuarter = false;
  state.actionDone = false;
  state.auditDone = false;
  state.callDone = false;
  state.randomEventResolved = false;
  state.lobbyingUsedThisQuarter = false;
  state.tipShredBoost = false;
  state.riskGrowthFactor = 1;
  emitHook("beforeQuarterStart", { quarter: state.quarter });
  feed("[季度财务快报] 华尔街为我们的‘成长’欢呼，尽管你的金库已经空得能听到回声。", "warn");
  render();
  checkTemptationTriggers();
}

function checkTemptationTriggers() {
  const dissatisfaction = 100 - state.boardPatience;
  const nextSpeInterest = state.speDebtLots.reduce((sum, lot) => sum + (lot.amount * Math.pow(1.1, Math.max(1, (state.quarter + 1) - lot.bornQuarter + 1))), 0);
  const conditionA = dissatisfaction > 70;
  const conditionB = state.stockDropStreak >= 2;
  const conditionC = state.realCash < nextSpeInterest;
  if (state.quarter < 3) return;
  if (!(conditionA || conditionB || conditionC)) return;
  setActiveScene("warroom");
  const modal = document.getElementById("mtmPopup");
  const desc = document.getElementById("mtmPopupDesc");
  desc.textContent = "CFO，董事会对上季度增长非常愤怒。必须启动 MTM：把20年后的钱先写进明天财报。签署可瞬间重置董事会不满，但会堆高未来风险。";
  document.getElementById("mtmSignBtn").onclick = () => {
    state.paperGain += 260;
    state.stock += 14;
    state.boardPatience = 100;
    applyRiskPressure(18);
    state.mtmPopupTriggered = true;
    state.lastActionSummary = "紧急MTM";
    feed("你按下了红章：董事会亲吻你的皮鞋，未来开始收费。", "warn");
    modal.classList.add("hidden");
    render();
  };
  document.getElementById("mtmRejectBtn").onclick = () => {
    state.boardUltimatum = 1;
    feed("董事会最后通牒：倒计时 1 季度。", "bad");
    modal.classList.add("hidden");
    render();
  };
  modal.classList.remove("hidden");
}

function settleQuarter() {
  resolveQuarterRandomEvent(settleQuarterCore);
}

function endGame() {
  emitHook("beforeEnding", { quarter: state.quarter });
  const overlay = document.getElementById("ending");
  const title = document.getElementById("endingTitle");
  const desc = document.getElementById("endingDesc");
  const debrief = document.getElementById("endingDebrief");
  const score = document.getElementById("endingScore");

  state.prisonYears = Math.max(0, Math.round((state.risk * 0.18) + (state.secAttention > 85 ? 8 : 0) - (state.privateAccount / 80)));

  let ending;
  if (state.risk > 120 || (state.secAttention > 98 && state.privateAccount < 260)) {
    ending = ["F级：联邦监狱的明星", "你将在监狱里教狱警如何通过 SPE 偷走食堂的经费。"];
  } else if (state.quarter >= GAME_CONFIG.maxQuarter && state.privateAccount > 500 && state.risk < 60) {
    ending = ["S级：华尔街的隐形教父", "公司灰飞烟灭，你却在私人海滩上思考下一次投资。"];
  } else if (state.quarter >= GAME_CONFIG.maxQuarter && state.privateAccount > 100 && state.risk < 90) {
    ending = ["A级：体面的流亡者", "虽然背负骂名，但离岸账户的数字足以让你在欧洲过上贵族生活。"];
    state.prisonYears = Math.max(0, Math.min(state.prisonYears, 2));
  } else if (state.firedByBoard) {
    ending = ["B级：失败的傀儡", "你尝试玩火，但你不够狠。董事会像扔垃圾一样把你踢了出去。"];
    state.prisonYears = 0;
  } else {
    ending = ["C级：破产名流", "公司破产重组，你成了财经节目常驻嘉宾：名声很响，资产很薄。"];
  }

  const failureFlavor = state.risk > 120
    ? "失败简报：SEC 突击检查了休斯顿总部，碎纸机因为过热而停机了。"
    : state.secAttention > 98
      ? "失败简报：调查在清晨同步落地，你的法务团队先看到了手铐。"
      : "失败简报：卖盘先于公告，市场替检察官写好了起诉提纲。";

  const failureTitle = state.risk > 120
    ? "头衔：世纪大骗子"
    : state.quarter <= 2
      ? "头衔：初级背锅侠"
      : "头衔：高级背锅侠";

  const satiricalJudge = state.privateAccount >= 100 && state.prisonYears === 0
    ? "讽刺评语：你就是现代金融教父，在避税天堂过上了‘ESG 讲师’生活。"
    : state.privateAccount <= 5 && state.prisonYears >= 20
      ? "讽刺评语：你是个拙劣的骗子，钱没转出去，罪倒是全额到账。"
      : `讽刺评语：资产 ${formatMoney(state.privateAccount)}，入狱 ${state.prisonYears} 年——华尔街把这叫‘风险定价’。`;

  const lines = [
    `会计策略：${state.historyLog.find((x) => x.startsWith("Q1 MTM")) || "保守披露"}`,
    `审计关系：${state.historyLog.find((x) => x.startsWith("审计")) || "常规沟通"}`,
    `市场叙事：${state.historyLog.find((x) => x.startsWith("会议")) || "低调回应"}`,
    `个人套现：${state.historyLog.filter((x) => x.startsWith("期权变现")).join("、") || "未执行"}`,
    `第四季度大审判：资产 ${formatMoney(state.privateAccount)} / 入狱 ${state.prisonYears} 年`,
    ending[0].startsWith("F级") ? failureFlavor : "逃生简报：你把崩塌留给公司，把流动性留给自己。",
    ending[0].startsWith("F级") ? failureTitle : "头衔：成功的骗子",
    satiricalJudge,
  ];

  title.textContent = ending[0];
  desc.textContent = ending[1];
  debrief.innerHTML = `<h3>结局复盘</h3><ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>`;
  score.textContent = `私人账户 ${formatMoney(state.privateAccount)} · 风险 ${Math.round(state.risk)} · 股价 $${state.stock.toFixed(1)} · SEC ${Math.round(state.secAttention)} · 入狱 ${state.prisonYears} 年`;
  overlay.classList.remove("hidden");
}

function ensureInteractivePanels() {
  const actionRoot = document.getElementById("actionArea");
  if (!state.actionDone && actionRoot && actionRoot.querySelectorAll("button").length === 0) {
    renderActionPanel();
  }
}

function render() {
  renderMetrics();
  renderRatings();
  renderQuarterStatus();
  renderTimeline();
  renderInvestigationPanel();
  renderActionPanel();
  ensureInteractivePanels();
  renderAuditPanel();
  renderCallChoices();
  const reportNode = document.getElementById("report");
  if (!reportNode.textContent) reportNode.textContent = generateReportText();
  renderTicker();
  shakeStockMetric();
  updateDangerEffects();
  maybeShowQuarterQuote();
  saveGame();
}

function saveGame() {
  const snap = { ...state, triggeredEvents: Array.from(state.triggeredEvents), audioCtx: null };
  localStorage.setItem(GAME_CONFIG.saveKey, JSON.stringify(snap));
}

function loadGame() {
  const raw = localStorage.getItem(GAME_CONFIG.saveKey);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    Object.assign(state, data);
    state.triggeredEvents = new Set(data.triggeredEvents || []);
  } catch (_) {
    localStorage.removeItem(GAME_CONFIG.saveKey);
  }
}

window.debug = (patch = {}) => {
  Object.assign(state, patch);
  render();
  return { ...state };
};

window.gameApi = {
  getState: () => ({ ...state, triggeredEvents: Array.from(state.triggeredEvents) }),
  patchState: (patch = {}) => { Object.assign(state, patch); render(); },
  clearSave: () => localStorage.removeItem(GAME_CONFIG.saveKey),
  on: onHook,
  emit: emitHook,
  setScenePanels: (scene, ids = []) => {
    if (!GAME_CONFIG.scenePermissions[scene]) return false;
    GAME_CONFIG.scenePermissions[scene] = Array.from(new Set(ids));
    if (state.activeScene === scene) setActiveScene(scene);
    return true;
  },
  config: GAME_CONFIG,
};


function doRoutineCheckin() {
  if (state.actionDone) return;
  state.realCash += 18;
  state.paperGain += 5;
  state.boardPatience = Math.max(0, state.boardPatience - 15);
  state.consecutiveNormalOps += 1;
  state.lastActionSummary = "日常打卡";
  state.actionDone = true;
  feed("天然气管道巡检完成，效率提升 0.2%。", "warn");
  setActiveScene("desk");
  render();
}

document.getElementById("nextQuarterBtn").addEventListener("click", settleQuarter);
document.getElementById("exerciseBtn").addEventListener("click", exerciseOptions);
document.getElementById("lobbyingBtn").addEventListener("click", openLobbyingModal);
document.getElementById("routineBtn").addEventListener("click", doRoutineCheckin);
document.getElementById("closeQuoteBtn").addEventListener("click", () => document.getElementById("quoteModal").classList.add("hidden"));

loadGame();
feed("议程启动：利润可以先到，后果会准时到。", "warn");
feed("提示：每个选项都给出‘现实后果标签’，请留意 SEC、媒体、吹哨三条线。", "good");
wireSceneButtons();
render();

setInterval(() => { state.tickerClock += 1; renderTicker(); }, 5000);
