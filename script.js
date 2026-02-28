const state = {
  quarter: 1,
  paperGain: 95,
  realCash: 500,
  risk: 20,
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

const quarterRandomEvents = {
  1: {
    title: "季度突发：分析师灵魂拷问",
    desc: "高盛分析师当众追问：为什么你们现金流和利润像两家公司？",
    choices: [
      { label: "A. 当场怒喷：‘你连现金流量表都看不懂’", effect: (st) => { st.stock -= 4; st.charisma += 4; st.mediaHeat += 6; st.risk += 3; const msg = "你在电话会上怒喷分析师，股价短线回落，但社媒把你捧成‘暴君天才’。"; feed(msg, "warn"); return msg; } },
      { label: "B. 邀请游艇晚宴，顺便‘再解释一次’", effect: (st) => { st.realCash -= 12; st.secAttention = Math.max(0, st.secAttention - 5); st.mediaHeat = Math.max(0, st.mediaHeat - 2); st.risk = Math.max(0, st.risk - 3); const msg = "香槟与海风成功降温，质疑暂缓，但现金悄悄蒸发。"; feed(msg, "good"); return msg; } },
    ],
  },
  2: {
    title: "季度突发：评级机构来电",
    desc: "评级机构要求你解释 SPE 担保链的真实敞口。",
    choices: [
      { label: "A. 递交部分底稿，换取喘息", effect: (st) => { st.stock -= 2; st.secAttention = Math.max(0, st.secAttention - 3); st.risk = Math.max(0, st.risk - 2); const msg = "你勉强透明一次，市场嫌难看，但监管火气暂时下降。"; feed(msg, "good"); return msg; } },
      { label: "B. 用‘结构优化’术语继续拖延", effect: (st) => { st.stock += 2; st.secAttention += 5; st.risk += 4; const msg = "你又赢下一场电话会，也又输掉一截未来。"; feed(msg, "warn"); return msg; } },
    ],
  },
  3: {
    title: "季度突发：州政府问责",
    desc: "停电影响扩大，州政府要求公开交易记录。",
    choices: [
      { label: "A. 甩锅天气与电网老化", effect: (st) => { st.stock += 1; st.mediaHeat += 6; st.whistleblowerPressure += 4; const msg = "甩锅话术奏效半天，媒体决定连夜开源你的邮件。"; feed(msg, "warn"); return msg; } },
      { label: "B. 设立补偿基金平息舆情", effect: (st) => { st.realCash -= 25; st.mediaHeat = Math.max(0, st.mediaHeat - 5); st.secAttention = Math.max(0, st.secAttention - 2); const msg = "你花钱买了宁静，但 CFO 最怕的从来不是热搜，而是现金。"; feed(msg, "good"); return msg; } },
    ],
  },
  4: {
    title: "季度突发：内部邮件泄露",
    desc: "员工邮件外泄：‘我们只是把风险推迟到下个季度。’",
    choices: [
      { label: "A. 全面否认并威胁起诉", effect: (st) => { st.stock += 1; st.secAttention += 7; st.risk += 6; const msg = "你成功把语气拉满，也把检察官的兴趣拉满。"; feed(msg, "bad"); return msg; } },
      { label: "B. 牺牲一位高管止血", effect: (st) => { st.stock -= 2; st.risk = Math.max(0, st.risk - 3); st.secAttention = Math.max(0, st.secAttention - 2); const msg = "替罪羊出列，风暴短暂停顿，董事会掌声稀稀拉拉。"; feed(msg, "warn"); return msg; } },
    ],
  },
};

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

function updateMarketDerived() {
  state.marketCap = state.stock * 1.2;
  // 调低市场一致预期斜率，避免几乎每局都因“必然 miss”触发股价雪崩。
  state.marketExpectedGain = 88 + state.quarter * 14 + state.fraudCount * 3;
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
  const quotes = quarterQuotes[state.quarter] || quarterQuotes[1];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const modal = document.getElementById("quoteModal");
  document.getElementById("quoteText").textContent = quote;
  modal.classList.remove("hidden");
  state.quoteShownForQuarter = state.quarter;
}

function renderMetrics() {
  updateMarketDerived();
  const list = [
    ["账面收益 Paper Gain", formatMoney(state.paperGain)],
    ["真实头寸 Real Cash", formatMoney(state.realCash)],
    ["合规风险 Risk Meter", `${Math.round(state.risk)} / 100`],
    ["股价 Stock Price", `$${state.stock.toFixed(1)}`],
    ["市值 Market Cap", formatBillion(state.marketCap)],
    ["市场预期利润", formatMoney(state.marketExpectedGain)],
    ["你本季虚假预测", formatMoney(state.forecastPaperGain)],
    ["个人账户", formatMoney(state.privateAccount)],
    ["可变现期权", `${state.personalOptions.toFixed(0)} 份`],
  ];

  document.getElementById("metrics").innerHTML = list
    .map(([k, v]) => `<article class="metric"><h3>${k}</h3><strong>${v}</strong></article>`)
    .join("");

  const gap = state.forecastPaperGain - state.marketExpectedGain;
  const compareEl = document.getElementById("forecastCompare");
  compareEl.className = `small ${gap >= 0 ? "good" : "bad"}`;
  compareEl.textContent = `预期对比：你承诺 ${formatMoney(state.forecastPaperGain)}，市场要求 ${formatMoney(state.marketExpectedGain)}，差额 ${formatMoney(gap)}。`;

  document.getElementById("optionInfo").textContent = state.exercisedThisQuarter
    ? "本季度已完成期权变现。"
    : "可在季度末按当前股价执行一次期权变现。";

  const decay = Math.min(1, (100 - state.morality) / 100);
  const motto = document.getElementById("motto");
  motto.style.opacity = `${1 - decay * 0.65}`;
  motto.style.letterSpacing = `${0.28 - decay * 0.21}em`;
  motto.style.filter = `hue-rotate(${decay * 95}deg)`;
  motto.textContent = state.morality < 40 ? "沟 通 // 诚? // 尊X // 卓越" : "沟通 · 诚信 · 尊重 · 卓越";
}

function renderTimeline() {
  const t = timelineData[state.quarter];
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
    state.risk += 3;
    feed("匿名内部备忘录外泄：‘我们正在把亏损藏在叙事里。’", "warn");
    state.historyLog.push("吹哨者事件触发");
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

function renderQuarterStatus() {
  const q = quarterConfig[state.quarter];
  document.getElementById("phaseInfo").textContent = q.name;
  document.getElementById("phaseDesc").textContent = q.desc;
  document.getElementById("actionIntro").textContent = q.intro;
  document.getElementById("operationHint").textContent = state.actionDone && state.auditDone && state.callDone
    ? "流程完成：可发布财报。若要变现，现在就是最‘合理合规’的时间窗口。"
    : "请完成【核心任务】→【审计沟通】→【分析师会议】三步。";

  document.getElementById("nextQuarterBtn").disabled = !(state.actionDone && state.auditDone && state.callDone);
  document.getElementById("exerciseBtn").disabled = state.exercisedThisQuarter || state.personalOptions <= 0;
}

function renderTermButtons(keys) {
  return `
    <div class="term-box">
      <p class="small">术语速查：</p>
      <div class="choices">
        ${keys.map((k) => `<button class="choice-btn term-btn" data-term="${k}">${k} ⓘ（${glossary[k].short}）</button>`).join("")}
      </div>
      <p class="small" id="termExplain"></p>
    </div>
  `;
}

function renderImpact(title, lines) {
  return `<div class="impact"><strong>${title}</strong><ul>${lines.map((s) => `<li>${s}</li>`).join("")}</ul></div>`;
}

function wireGlossary() {
  document.querySelectorAll("[data-term]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-term");
      document.getElementById("termExplain").textContent = glossary[key].full;
    });
  });
}

function renderActionPanel() {
  const root = document.getElementById("actionArea");
  root.innerHTML = "";

  if (state.quarter === 1) {
    root.innerHTML = `
      <label for="optimism">MTM 乐观系数（50%-100%）</label>
      <input type="range" id="optimism" min="50" max="100" step="5" value="65" ${state.actionDone ? "disabled" : ""} />
      <p id="optimismPreview"></p>
      ${renderImpact("选择前影响预览", [
        "账面收益：+（与乐观系数正相关）",
        "风险：+（SEC关注 +1~+6；媒体热度 +1~+5）",
        "现实后果：若≥85，后续分析师提问转为‘激进质询’",
      ])}
      ${renderTermButtons(["MTM"])}
      <button id="actionBtn" ${state.actionDone ? "disabled" : ""}>提交 Q1 决议</button>
    `;

    const slider = document.getElementById("optimism");
    const preview = document.getElementById("optimismPreview");
    const refresh = () => {
      const optimism = Number(slider.value);
      preview.textContent = `若选 ${optimism}%：账面收益约 +$${((optimism - 45) * 5.5).toFixed(0)}M，SEC +${Math.max(1, ((optimism - 50) * 0.12).toFixed(0))}。`;
    };
    slider.addEventListener("input", refresh);
    refresh();

    document.getElementById("actionBtn").onclick = () => {
      if (state.actionDone) return;
      const optimism = Number(slider.value);
      state.paperGain += (optimism - 45) * 5.5;
      state.forecastPaperGain = state.paperGain + 30;
      state.stock += optimism >= 90 ? 22 : 12;
      state.risk += (optimism - 50) * 0.6;
      state.realCash -= 28;
      state.secAttention += Math.max(1, (optimism - 50) * 0.12);
      state.mediaHeat += Math.max(1, (optimism - 55) * 0.1);
      state.firstAction = optimism >= 85 ? "aggressive" : "conservative";
      state.mtmMode = optimism >= 85 ? "aggressive" : "conservative";
      bumpCorruption(optimism >= 90 ? 2 : 1);
      state.actionDone = true;
      state.historyLog.push(`Q1 MTM：${optimism}%`);
      state.lastActionSummary = optimism >= 85 ? "激进MTM" : "保守MTM";
      feed("Q1 决议通过：你让未来提前上班，让风险留在加班表里。", "good");
      render();
    };
    wireGlossary();
    return;
  }

  if (state.quarter === 2) {
    root.innerHTML = `
      <p>选择转移至 Chewco/LJM 的债务规模：</p>
      ${renderImpact("选择前影响预览", [
        "$400M：账面收益 +$32M，SEC +4，吹哨压力 +3",
        "$1000M：账面收益 +$80M，SEC +9，吹哨压力 +7，股价短期更强",
      ])}
      ${renderTermButtons(["SPE"])}
      <div class="choices" id="speChoices"></div>
    `;
    const opts = [
      { label: "转移 $400M（保守洗表）", debt: 400, risk: 8, stock: 8, sec: 4, whistle: 3 },
      { label: "转移 $1000M（激进洗表）", debt: 1000, risk: 22, stock: 18, sec: 9, whistle: 7 },
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
        state.risk += o.risk;
        state.realCash -= 35;
        state.secAttention += o.sec;
        state.whistleblowerPressure += o.whistle;
        state.mediaHeat += 3;
        bumpCorruption(o.debt > 600 ? 2 : 1);
        state.actionDone = true;
        state.historyLog.push(`Q2 SPE：${o.debt}M`);
        state.lastActionSummary = o.debt > 600 ? "激进SPE" : "保守SPE";
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
        state.risk += o.risk;
        state.stock += 6;
        state.mediaHeat += o.media;
        state.secAttention += o.sec;
        state.whistleblowerPressure += 8;
        bumpCorruption(2);
        state.actionDone = true;
        state.historyLog.push(`Q3 停机：${o.cash}M`);
        state.lastActionSummary = o.cash > 200 ? "高强度停机" : "低强度停机";
        feed(`停机策略执行：${o.press}`, "bad");
        render();
      };
      holder.appendChild(btn);
    });
    return;
  }

  root.innerHTML = `
    <p>终局操作包：</p>
    ${renderImpact("选择前影响预览", [
      "极速方案：私人账户 +$360M，风险 +42，SEC +12，股价 -30",
      "温和方案：私人账户 +$210M，风险 +28，SEC +7，股价 -18",
    ])}
    <div class="choices" id="endChoices"></div>
  `;

  const opts = [
    { label: "极速套现 + 全面碎纸 + 强硬封口", cash: 360, risk: 42, stockDrop: 30, sec: 12, corruption: 3 },
    { label: "温和套现 + 选择性销毁 + 叙事控场", cash: 210, risk: 28, stockDrop: 18, sec: 7, corruption: 2 },
  ];

  const holder = document.getElementById("endChoices");
  opts.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = o.label;
    btn.disabled = state.actionDone;
    btn.onclick = () => {
      if (state.actionDone) return;
      state.privateAccount += o.cash;
      state.realCash -= o.cash * 0.33;
      state.stock -= o.stockDrop;
      state.risk += o.risk;
      state.secAttention += o.sec;
      state.mediaHeat += 9;
      state.whistleblowerPressure += 9;
      bumpCorruption(o.corruption);
      state.actionDone = true;
      state.historyLog.push(`Q4 套现：${o.cash}M`);
      state.lastActionSummary = o.cash > 300 ? "极速套现" : "温和套现";
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
      "旋转门：现金 -$15M，风险 -20，审计独立性 -30，爆雷惩罚加剧",
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
      label: "支付 $8M 咨询费（勾结）",
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
      label: "高薪挖角审计合伙人（旋转门）",
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
      },
    },
  ];

  const holder = document.getElementById("auditOptionList");
  options.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = o.label;
    btn.disabled = state.auditDone;
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
  document.getElementById("callPrompt").textContent = `分析师提问：${getAnalystQuestion()}`;
  const charmBonus = Math.floor(state.charisma / 25);
  const options = analystOptionBank[state.quarter] || analystOptionBank[1];

  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = `${opt.label}（股价 +${opt.stock + charmBonus} / 风险 +${opt.risk}）`;
    btn.disabled = state.callDone;
    btn.onclick = () => {
      if (state.callDone) return;
      state.stock += opt.stock + charmBonus;
      state.risk += opt.risk;
      state.secAttention += opt.sec || 0;
      state.mediaHeat += opt.media || 0;
      state.whistleblowerPressure += opt.whistle || 0;
      state.charisma += opt.charisma || 0;
      if (opt.paper) state.paperGain += opt.paper;
      if (opt.forecast) state.forecastPaperGain += opt.forecast;
      if (opt.corruption) bumpCorruption(opt.corruption);
      state.lastCallSummary = opt.key;
      feed(`你在会中表态：${opt.label}`, opt.key.includes("attack") ? "warn" : "good");
      state.historyLog.push(`会议：${opt.key}`);
      state.callDone = true;
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
    state.lastActionSummary ? `动作：${state.lastActionSummary}` : "动作：待决策",
    state.lastEventSummary ? `事件：${state.lastEventSummary}` : "事件：待触发",
  ];
  const merged = [...base, ...mapped, ...dynamic];
  const shift = state.tickerClock % Math.max(1, merged.length);
  const rotated = merged.slice(shift).concat(merged.slice(0, shift));
  track.textContent = rotated.join("  •  ");
}

function resolveQuarterRandomEvent(onDone) {
  if (state.randomEventResolved) {
    onDone();
    return;
  }
  const event = quarterRandomEvents[state.quarter];
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
        3: ["blame", "fund"],
        4: ["deny", "scapegoat"],
      };
      state.lastEventSummary = keyMap[state.quarter][idx];
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
  const units = Math.min(20, state.personalOptions);
  const grossProceeds = units * state.stock * 0.02;
  const liquidityCap = Math.max(6, state.realCash * 0.18);
  const proceeds = Math.min(grossProceeds, liquidityCap);
  state.personalOptions -= units;
  state.privateAccount += proceeds;
  state.realCash -= proceeds * 0.3;
  state.stock -= Math.max(0.4, units * 0.02);
  state.risk += 3;
  state.mediaHeat += 2;
  state.exercisedThisQuarter = true;
  state.historyLog.push(`期权变现：${units}份(${formatMoney(proceeds)})`);
  feed(`你按 $${state.stock.toFixed(1)} 执行 ${units} 份期权，到账 ${formatMoney(proceeds)}（受流动性上限约束）。`, "warn");
  render();
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
  const interest = 120 + state.quarter * 15;
  state.realCash -= operatingCost + interest;
  handleCashCrisisIfNeeded(settleQuarterPostFinance);
}

function settleQuarterPostFinance() {
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
    state.secAttention += 3;
    feed("审计独立性过低触发反噬：监管把‘咨询关系’写进问询。", "bad");
  }

  triggerSpecialEvents();

  state.paperGain *= 0.7;
  state.forecastPaperGain = state.paperGain + 20;
  state.stock = Math.max(2, state.stock);
  state.risk = Math.max(0, state.risk - 10);
  state.risk = Math.max(0, Math.min(115, state.risk));
  clampInvestigation();
  document.getElementById("report").textContent = generateReportText();

  if (state.quarter === 4) {
    endGame();
    return;
  }

  state.quarter += 1;
  state.exercisedThisQuarter = false;
  state.actionDone = false;
  state.auditDone = false;
  state.callDone = false;
  state.randomEventResolved = false;
  feed("会后总结：董事会一致认为‘透明度是个可以分期实现的目标’。", "warn");
  render();
}

function settleQuarter() {
  resolveQuarterRandomEvent(settleQuarterCore);
}

function endGame() {
  const overlay = document.getElementById("ending");
  const title = document.getElementById("endingTitle");
  const desc = document.getElementById("endingDesc");
  const debrief = document.getElementById("endingDebrief");
  const score = document.getElementById("endingScore");

  state.prisonYears = Math.max(0, Math.round((state.risk * 0.18) + (state.secAttention > 85 ? 8 : 0) - (state.privateAccount / 80)));

  let ending;
  if (state.risk >= 112 || state.stock < 12 || state.secAttention > 95) {
    ending = ["结局A：历史线", "股价崩塌、调查落地、法庭直播。你终于获得稳定作息——在司法系统里。"];
  } else if (state.privateAccount >= 150 && state.risk < 95 && state.secAttention < 86) {
    ending = ["结局B：完美犯罪", "你在风暴前完成离场，朋友圈只剩海岛、雪茄和合规声明。"];
  } else {
    ending = ["结局C：行业精英", "公司倒下了，但你把锅精确分配给他人，并成功转任治理顾问。"];
  }

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
  maybeShowQuarterQuote();
}

document.getElementById("nextQuarterBtn").addEventListener("click", settleQuarter);
document.getElementById("exerciseBtn").addEventListener("click", exerciseOptions);
document.getElementById("closeQuoteBtn").addEventListener("click", () => document.getElementById("quoteModal").classList.add("hidden"));

feed("议程启动：利润可以先到，后果会准时到。", "warn");
feed("提示：每个选项都给出‘现实后果标签’，请留意 SEC、媒体、吹哨三条线。", "good");
render();

setInterval(() => { state.tickerClock += 1; renderTicker(); }, 5000);
