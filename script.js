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
  state.secAttention += level * 3;
  state.mediaHeat += level * 2;
  state.whistleblowerPressure += level * 2;
}

function updateMarketDerived() {
  state.marketCap = state.stock * 1.2;
  state.marketExpectedGain = 108 + state.quarter * 20 + state.fraudCount * 4;
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
    state.risk += 8;
    feed("匿名内部备忘录外泄：‘我们正在把亏损藏在叙事里。’", "warn");
    state.historyLog.push("吹哨者事件触发");
  }
  if (state.secAttention >= 70 && !state.triggeredEvents.has("sec")) {
    state.triggeredEvents.add("sec");
    state.risk += 10;
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
      bumpCorruption(optimism >= 90 ? 2 : 1);
      state.actionDone = true;
      state.historyLog.push(`Q1 MTM：${optimism}%`);
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
      { label: "转移 $400M（保守洗表）", debt: 400, risk: 10, stock: 8, sec: 4, whistle: 3 },
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
        state.risk += 10;
        state.secAttention += 4;
        feed("安达信听完后表示：‘我们需要更多附件。’", "warn");
        state.historyLog.push("审计：解释结构");
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

  const options = [
    {
      label: `术语烟雾弹（股价 +${5 + charmBonus}，SEC +3，风险 +6）`,
      apply: () => {
        state.stock += 5 + charmBonus;
        state.risk += 6;
        state.secAttention += 3;
        feed("你用术语替代答案，市场短暂满意，调查组长期记忆。", "good");
        state.historyLog.push("会议：术语烟雾弹");
      },
    },
    {
      label: `情绪反击（股价 +${2 + charmBonus}，媒体 +6，风险 +10）`,
      apply: () => {
        state.stock += 2 + charmBonus;
        state.risk += 10;
        state.mediaHeat += 6;
        state.charisma += 2;
        feed("你质疑提问者专业性，直播热度上涨，证据链也在上涨。", "warn");
        state.historyLog.push("会议：情绪反击");
      },
    },
    {
      label: `加码承诺（股价 +${10 + charmBonus}，吹哨压力 +5，风险 +14）`,
      apply: () => {
        state.stock += 10 + charmBonus;
        state.paperGain += 35;
        state.forecastPaperGain += 40;
        state.risk += 14;
        state.whistleblowerPressure += 5;
        bumpCorruption(1);
        feed("你给未来再开一张支票，掌声和利息一起到账。", "good");
        state.historyLog.push("会议：加码承诺");
      },
    },
  ];

  options.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = o.label;
    btn.disabled = state.callDone;
    btn.onclick = () => {
      if (state.callDone) return;
      o.apply();
      state.callDone = true;
      render();
    };
    root.appendChild(btn);
  });
}

function exerciseOptions() {
  if (state.exercisedThisQuarter || state.personalOptions <= 0) return;
  const units = Math.min(30, state.personalOptions);
  const proceeds = units * state.stock * 0.45;
  state.personalOptions -= units;
  state.privateAccount += proceeds;
  state.stock -= 1.2;
  state.risk += 4;
  state.mediaHeat += 3;
  state.exercisedThisQuarter = true;
  state.historyLog.push(`期权变现：${units}份`);
  feed(`你按 $${state.stock.toFixed(1)} 执行 ${units} 份期权，私人账户 +${formatMoney(proceeds)}。`, "warn");
  render();
}

function settleQuarter() {
  const operatingCost = 110 + state.quarter * 10;
  const interest = 120 + state.quarter * 15;
  state.realCash -= operatingCost + interest;

  if (state.paperGain < state.marketExpectedGain) {
    state.stock -= 8;
    state.risk += 8;
    state.mediaHeat += 4;
    feed("披露利润低于市场预期，主持人开始反复强调‘长期价值’。", "warn");
  } else {
    state.stock += 5;
    feed("披露利润高于预期，市场奖励了你的叙事效率。", "good");
  }

  if (state.auditIndependence < 45) {
    state.risk += 5;
    state.secAttention += 5;
    feed("审计独立性过低触发反噬：监管把‘咨询关系’写进问询。", "bad");
  }

  triggerSpecialEvents();

  state.paperGain *= 0.7;
  state.forecastPaperGain = state.paperGain + 20;
  state.stock = Math.max(2, state.stock);
  state.risk = Math.max(0, Math.min(130, state.risk));
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
  feed("会后总结：董事会一致认为‘透明度是个可以分期实现的目标’。", "warn");
  render();
}

function endGame() {
  const overlay = document.getElementById("ending");
  const title = document.getElementById("endingTitle");
  const desc = document.getElementById("endingDesc");
  const debrief = document.getElementById("endingDebrief");
  const score = document.getElementById("endingScore");

  let ending;
  if (state.risk >= 95 || state.stock < 25 || state.secAttention > 85) {
    ending = ["结局A：历史线", "股价崩塌、调查落地、法庭直播。你终于获得稳定作息——在司法系统里。"];
  } else if (state.privateAccount >= 320 && state.risk < 90 && state.secAttention < 80) {
    ending = ["结局B：完美犯罪", "你在风暴前完成离场，朋友圈只剩海岛、雪茄和合规声明。"];
  } else {
    ending = ["结局C：行业精英", "公司倒下了，但你把锅精确分配给他人，并成功转任治理顾问。"];
  }

  const lines = [
    `会计策略：${state.historyLog.find((x) => x.startsWith("Q1 MTM")) || "保守披露"}`,
    `审计关系：${state.historyLog.find((x) => x.startsWith("审计")) || "常规沟通"}`,
    `市场叙事：${state.historyLog.find((x) => x.startsWith("会议")) || "低调回应"}`,
    `个人套现：${state.historyLog.filter((x) => x.startsWith("期权变现")).join("、") || "未执行"}`,
    `历史映射：你最接近 ${state.auditIndependence < 40 ? "安达信独立性失守线" : state.firstAction === "aggressive" ? "Skilling式激进叙事线" : "Fastow式结构化延迟线"}`,
  ];

  title.textContent = ending[0];
  desc.textContent = ending[1];
  debrief.innerHTML = `<h3>结局复盘</h3><ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>`;
  score.textContent = `私人账户 ${formatMoney(state.privateAccount)} · 风险 ${Math.round(state.risk)} · 股价 $${state.stock.toFixed(1)} · SEC ${Math.round(state.secAttention)} · 剩余期权 ${state.personalOptions.toFixed(0)}份`;
  overlay.classList.remove("hidden");
}

function render() {
  renderMetrics();
  renderQuarterStatus();
  renderTimeline();
  renderInvestigationPanel();
  renderActionPanel();
  renderAuditPanel();
  renderCallChoices();
  const reportNode = document.getElementById("report");
  if (!reportNode.textContent) reportNode.textContent = generateReportText();
}

document.getElementById("nextQuarterBtn").addEventListener("click", settleQuarter);
document.getElementById("exerciseBtn").addEventListener("click", exerciseOptions);

feed("议程启动：利润可以先到，后果会准时到。", "warn");
feed("提示：每个选项都给出‘现实后果标签’，请留意 SEC、媒体、吹哨三条线。", "good");
render();
