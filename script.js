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
  actionDone: false,
  auditDone: false,
  callDone: false,
};

const quarterConfig = {
  1: {
    name: "安然季度股东大会决议 · 第一季度",
    desc: "真实业务增长太慢，华尔街把你当成励志演讲而不是能源公司。",
    intro: "Q1 决议：是否激进使用 MTM（逐日盯市）把未来收益搬到今天。",
  },
  2: {
    name: "安然季度股东大会决议 · 第二季度",
    desc: "债务像地毯下的灰尘，你决定把灰尘扫进 SPE 这间黑屋。",
    intro: "Q2 决议：Chewco 接盘规模决定报表颜值与担保炸弹。",
  },
  3: {
    name: "安然季度股东大会决议 · 第三季度",
    desc: "现金流咳血，交易部门建议‘制造一点市场波动’来疗伤。",
    intro: "Q3 决议：停机套利力度越大，利润越漂亮，社会新闻越精彩。",
  },
  4: {
    name: "安然季度股东大会决议 · 第四季度",
    desc: "股价回撤触发连锁担保，会议主题从增长变成‘如何优雅离场’。",
    intro: "Q4 决议：套现、灭证、封口三件套如何配比。",
  },
};

const analystQuestionBank = {
  conservative: [
    "你在 Q1 说自己‘稳健’，那为何 Q2 的利润忽然像打鸡血？",
    "如果模型保守，为什么现金流和利润仍像两条平行宇宙？",
    "你是低估风险，还是高估了投资者的睡眠质量？",
  ],
  aggressive: [
    "Q1 你用了激进 MTM，电价假设背后的证据是什么？",
    "若你签不到新合同，增长故事是否会当场穿帮？",
    "若模型回调 10%，你们本季利润还剩几层滤镜？",
  ],
};

const jargonA = ["协同效应", "价值共生", "范式转移", "资产轻量化", "动态风险中台", "结构性增长飞轮"];
const jargonB = ["全链路赋能", "战略解耦", "现金流再造", "监管友好优化", "跨周期韧性", "生态反脆弱化"];

const glossary = {
  MTM: "MTM（Mark-to-Market，逐日盯市）：把未来预估利润提前计入当期，短期好看，长期压力陡增。",
  SPE: "SPE（Special Purpose Entity，特殊目的实体）：把债务/亏损资产转移到壳公司，让主表看起来更干净。",
  "旋转门": "旋转门：审计、监管与公司高层互相流动，形成利益绑定，独立性被稀释。",
};

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

function bumpCorruption(level) {
  state.fraudCount += level;
  state.morality = Math.max(0, state.morality - 9 * level);
  state.charisma = Math.min(100, state.charisma + 7 * level);
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
    ["个人账户 Private Account", formatMoney(state.privateAccount)],
    ["股价 Stock Price", `$${state.stock.toFixed(1)}`],
    ["市值 Market Cap", formatBillion(state.marketCap)],
    ["市场预期利润", formatMoney(state.marketExpectedGain)],
    ["你本季虚假预测", formatMoney(state.forecastPaperGain)],
    ["可变现期权", `${state.personalOptions.toFixed(0)} 份`],
  ];

  document.getElementById("metrics").innerHTML = list
    .map(([k, v]) => `<article class="metric"><h3>${k}</h3><strong>${v}</strong></article>`)
    .join("");

  const gap = state.forecastPaperGain - state.marketExpectedGain;
  const compareEl = document.getElementById("forecastCompare");
  compareEl.className = `small ${gap >= 0 ? "good" : "bad"}`;
  compareEl.textContent = `预期对比：你承诺 ${formatMoney(state.forecastPaperGain)} vs 市场要求 ${formatMoney(state.marketExpectedGain)}（差额 ${formatMoney(gap)}）。`;

  const optionInfo = document.getElementById("optionInfo");
  optionInfo.textContent = state.exercisedThisQuarter
    ? "本季度已完成个人期权变现。"
    : "可在本季度末按当前股价进行一次个人期权变现。";

  const decay = Math.min(1, (100 - state.morality) / 100);
  const motto = document.getElementById("motto");
  motto.style.opacity = `${1 - decay * 0.65}`;
  motto.style.letterSpacing = `${0.28 - decay * 0.21}em`;
  motto.style.filter = `hue-rotate(${decay * 95}deg)`;
  motto.textContent = state.morality < 40 ? "沟 通 // 诚? // 尊X // 卓越" : "沟通 · 诚信 · 尊重 · 卓越";
}

function generateReportText() {
  const a = jargonA[(state.quarter + state.fraudCount) % jargonA.length];
  const b = jargonB[(state.quarter + Math.floor(state.charisma / 10)) % jargonB.length];
  return `董事会认为，公司通过“${a}”与“${b}”实现高质量增长。利润与现金流错位并非问题，而是‘前置战略投入’。建议投资者继续保持耐心与选择性失忆。`;
}

function renderQuarterStatus() {
  const q = quarterConfig[state.quarter];
  document.getElementById("phaseInfo").textContent = q.name;
  document.getElementById("phaseDesc").textContent = q.desc;
  document.getElementById("actionIntro").textContent = q.intro;
  document.getElementById("operationHint").textContent = state.actionDone && state.auditDone && state.callDone
    ? "流程完成：可发布财报。若你还没变现，现在是‘最后一口甜点’。"
    : "请完成【核心任务】、【审计沟通】、【分析师会议】三项流程。";

  document.getElementById("nextQuarterBtn").disabled = !(state.actionDone && state.auditDone && state.callDone);
  document.getElementById("exerciseBtn").disabled = state.exercisedThisQuarter || state.personalOptions <= 0;
}

function renderTermButtons(keys) {
  return `
    <div class="term-box">
      <p class="small">术语解释：</p>
      <div class="choices">
        ${keys.map((k) => `<button class="choice-btn" data-term="${k}">解释 ${k}</button>`).join("")}
      </div>
      <p class="small" id="termExplain"></p>
    </div>
  `;
}

function renderImpact(lines) {
  return `<div class="impact"><strong>选择前影响预览</strong><ul>${lines.map((s) => `<li>${s}</li>`).join("")}</ul></div>`;
}

function wireGlossary() {
  document.querySelectorAll("[data-term]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-term");
      document.getElementById("termExplain").textContent = glossary[key];
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
      ${renderImpact([
        "乐观系数越高：账面收益 +，风险 +，下季预期压力 +",
        "激进阈值（≥85）：后续分析师提问将更尖锐",
      ])}
      ${renderTermButtons(["MTM"])}
      <button id="actionBtn" ${state.actionDone ? "disabled" : ""}>提交 Q1 决议</button>
    `;

    const slider = document.getElementById("optimism");
    const preview = document.getElementById("optimismPreview");
    const refresh = () => {
      const optimism = Number(slider.value);
      preview.textContent = `若选择 ${optimism}%：预计账面收益 +$${((optimism - 45) * 5.5).toFixed(0)}M，风险 +${((optimism - 50) * 0.6).toFixed(0)}。`;
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
      state.firstAction = optimism >= 85 ? "aggressive" : "conservative";
      bumpCorruption(optimism >= 90 ? 2 : 1);
      state.actionDone = true;
      feed("Q1 决议通过：你把未来利润请到了今天，并给明天留了账单。", "good");
      render();
    };
    wireGlossary();
    return;
  }

  if (state.quarter === 2) {
    root.innerHTML = `
      <p>选择转移至 Chewco 的债务规模：</p>
      ${renderImpact([
        "$400M：风险上升较少，报表修饰有限",
        "$1000M：报表更漂亮，但担保链更脆弱",
      ])}
      ${renderTermButtons(["SPE"])}
      <div class="choices" id="speChoices"></div>
    `;
    const opts = [
      { label: "转移 $400M（保守洗表）", debt: 400, risk: 10, stock: 8 },
      { label: "转移 $1000M（激进洗表）", debt: 1000, risk: 22, stock: 18 },
    ];
    const holder = document.getElementById("speChoices");
    opts.forEach((o) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = `${o.label}｜预估：账面 +${formatMoney(o.debt * 0.08)}，风险 +${o.risk}`;
      btn.disabled = state.actionDone;
      btn.onclick = () => {
        if (state.actionDone) return;
        state.paperGain += o.debt * 0.08;
        state.forecastPaperGain = state.paperGain + o.debt * 0.02;
        state.stock += o.stock;
        state.risk += o.risk;
        state.realCash -= 35;
        bumpCorruption(o.debt > 600 ? 2 : 1);
        state.actionDone = true;
        feed(`Chewco 开始吞债务，报表突然变得‘适合做路演’。`, "warn");
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
      ${renderImpact([
        "停机 6 小时：现金回流中等，舆情升温",
        "停机 24 小时：现金回流高，监管关注显著提升",
      ])}
      <div class="choices" id="blackoutChoices"></div>
    `;
    const opts = [
      { label: "停机 6 小时（低调套利）", cash: 120, risk: 16, press: "局部停电，市民在黑暗中学会了金融学。" },
      { label: "停机 24 小时（全州恐慌）", cash: 380, risk: 34, press: "电价飙升，新闻主播开始会计入门课。" },
    ];
    const holder = document.getElementById("blackoutChoices");
    opts.forEach((o) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = `${o.label}｜预估：现金 +${formatMoney(o.cash)}，风险 +${o.risk}`;
      btn.disabled = state.actionDone;
      btn.onclick = () => {
        if (state.actionDone) return;
        state.realCash += o.cash;
        state.paperGain += o.cash * 0.3;
        state.forecastPaperGain = state.paperGain + 45;
        state.risk += o.risk;
        state.stock += 6;
        bumpCorruption(2);
        state.actionDone = true;
        feed(`停机策略执行：${o.press}`, "bad");
        render();
      };
      holder.appendChild(btn);
    });
    return;
  }

  root.innerHTML = `
    <p>终局操作包：</p>
    ${renderImpact([
      "极速方案：套现高，风险飙升，股价承压",
      "温和方案：套现中等，风险增幅可控",
    ])}
    <div class="choices" id="endChoices"></div>
  `;

  const opts = [
    { label: "极速套现 + 全面碎纸 + 强硬封口", cash: 360, risk: 42, stockDrop: 30, corruption: 3 },
    { label: "温和套现 + 选择性销毁 + 收买吹哨者", cash: 210, risk: 28, stockDrop: 18, corruption: 2 },
  ];
  const holder = document.getElementById("endChoices");
  opts.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = `${o.label}｜预估：私人账户 +${formatMoney(o.cash)}，风险 +${o.risk}`;
    btn.disabled = state.actionDone;
    btn.onclick = () => {
      if (state.actionDone) return;
      state.privateAccount += o.cash;
      state.realCash -= o.cash * 0.33;
      state.stock -= o.stockDrop;
      state.forecastPaperGain = state.paperGain + (o.cash > 300 ? 60 : 25);
      state.risk += o.risk;
      bumpCorruption(o.corruption);
      state.actionDone = true;
      feed("会后纪要：高管集体强调‘长期主义’，同时把短期现金装进口袋。", "bad");
      render();
    };
    holder.appendChild(btn);
  });
}

function renderAuditPanel() {
  const root = document.getElementById("auditChoices");
  root.innerHTML = "";

  const options = [
    {
      label: "解释复杂结构（不送钱）｜预估：风险 +10",
      apply: () => {
        state.risk += 10;
        feed("安达信听完汇报后说：‘我们建议再开三次会。’", "warn");
      },
    },
    {
      label: "支付 $8M 咨询费（勾结）｜预估：现金 -$8M，风险 -14",
      apply: () => {
        state.realCash -= 8;
        state.risk = Math.max(0, state.risk - 14);
        bumpCorruption(1);
        feed("咨询费一到位，审计意见突然变得诗意而宽容。", "good");
      },
    },
    {
      label: "高薪挖角审计合伙人（旋转门）｜预估：现金 -$15M，风险 -20",
      apply: () => {
        state.realCash -= 15;
        state.risk = Math.max(0, state.risk - 20);
        bumpCorruption(2);
        feed("审计合伙人顺利‘转岗’，独立性与良心同时离职。", "warn");
      },
    },
  ];

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
    root.appendChild(btn);
  });
}

function getAnalystQuestion() {
  const bank = state.firstAction === "aggressive" ? analystQuestionBank.aggressive : analystQuestionBank.conservative;
  return bank[(state.quarter - 1) % bank.length];
}

function renderCallChoices() {
  const root = document.getElementById("callChoices");
  root.innerHTML = "";
  document.getElementById("callPrompt").textContent = `分析师提问：${getAnalystQuestion()}`;
  const charmBonus = Math.floor(state.charisma / 25);

  const options = [
    {
      label: `术语烟雾弹（Charisma +${charmBonus}）｜预估：股价 +${5 + charmBonus}，风险 +6`,
      apply: () => {
        state.stock += 5 + charmBonus;
        state.risk += 6;
        feed("你说了 4 分钟‘协同范式’，没人敢承认没听懂。", "good");
      },
    },
    {
      label: `情绪反击｜预估：股价 +${2 + charmBonus}，风险 +10`,
      apply: () => {
        state.stock += 2 + charmBonus;
        state.risk += 10;
        state.charisma += 2;
        feed("你质疑提问者专业性，支持者叫好，SEC 默默截图。", "warn");
      },
    },
    {
      label: `再加一层增长承诺｜预估：股价 +${10 + charmBonus}，风险 +14`,
      apply: () => {
        state.stock += 10 + charmBonus;
        state.paperGain += 35;
        state.forecastPaperGain += 40;
        state.risk += 14;
        bumpCorruption(1);
        feed("你给未来开了新支票，掌声和隐患一起到账。", "good");
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
  state.exercisedThisQuarter = true;
  feed(`你按 $${state.stock.toFixed(1)} 股价变现 ${units} 份期权，私人账户 +${formatMoney(proceeds)}。`, "warn");
  render();
}

function settleQuarter() {
  const operatingCost = 110 + state.quarter * 10;
  const interest = 120 + state.quarter * 15;
  state.realCash -= operatingCost + interest;

  if (state.paperGain < state.marketExpectedGain) {
    state.stock -= 8;
    state.risk += 8;
    feed("披露利润低于市场预期，主持人把‘长期价值’说了七遍。", "warn");
  } else {
    state.stock += 5;
    feed("披露利润高于预期，分析师短暂忘记了现金流这件事。", "good");
  }

  state.paperGain *= 0.7;
  state.forecastPaperGain = state.paperGain + 20;
  state.stock = Math.max(2, state.stock);
  state.risk = Math.max(0, Math.min(130, state.risk));
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
  feed("会后总结：董事会一致同意‘继续优化叙事结构’。", "warn");
  render();
}

function endGame() {
  const overlay = document.getElementById("ending");
  const title = document.getElementById("endingTitle");
  const desc = document.getElementById("endingDesc");
  const score = document.getElementById("endingScore");

  let ending;
  if (state.risk >= 95 || state.stock < 25) {
    ending = ["结局A：历史线", "股价崩塌、证据回流、法庭直播。你终于拥有了长期稳定——在监狱里。"];
  } else if (state.privateAccount >= 320 && state.risk < 90) {
    ending = ["结局B：完美犯罪", "你在风暴前离场，朋友圈里只剩海岛落日与律师电话。"];
  } else {
    ending = ["结局C：行业精英", "公司倒了，但你把责任导向他人，最后出现在另一家公司的治理委员会。"];
  }

  title.textContent = ending[0];
  desc.textContent = ending[1];
  score.textContent = `私人账户 ${formatMoney(state.privateAccount)} · 风险 ${Math.round(state.risk)} · 股价 $${state.stock.toFixed(1)} · 剩余期权 ${state.personalOptions.toFixed(0)} 份`;
  overlay.classList.remove("hidden");
}

function render() {
  renderMetrics();
  renderQuarterStatus();
  renderActionPanel();
  renderAuditPanel();
  renderCallChoices();
  const reportNode = document.getElementById("report");
  if (!reportNode.textContent) reportNode.textContent = generateReportText();
}

document.getElementById("nextQuarterBtn").addEventListener("click", settleQuarter);
document.getElementById("exerciseBtn").addEventListener("click", exerciseOptions);

feed("议程启动：利润是故事，现金流是脚注，责任是可转移资产。", "warn");
feed("提示：每个关键选项都可先看影响预估，再决定要不要把灵魂折现。", "good");
render();
