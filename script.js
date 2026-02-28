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
  actionDone: false,
  auditDone: false,
  callDone: false,
};

const quarterConfig = {
  1: {
    name: "安然季度股东大会决议 · 第一季度",
    desc: "主营业务稳健但不性感。你需要决定本季度叙事是否激进。",
    intro: "Q1 决议：启用 MTM 并设定乐观系数，决定虚假利润的起点。",
  },
  2: {
    name: "安然季度股东大会决议 · 第二季度",
    desc: "债务与亏损资产侵蚀报表，必须动用 SPE 洗表。",
    intro: "Q2 决议：Chewco 接盘规模决定你的报表洁净度与担保风险。",
  },
  3: {
    name: "安然季度股东大会决议 · 第三季度",
    desc: "现金流紧绷，你考虑利用电力市场漏洞制造波动利润。",
    intro: "Q3 决议：停机策略越激进，现金回流越快但舆情越危险。",
  },
  4: {
    name: "安然季度股东大会决议 · 第四季度",
    desc: "股价回撤触发担保链危机，你进入套现与灭证窗口。",
    intro: "Q4 决议：决定套现速度、碎纸机强度与吹哨者处理策略。",
  },
};

const analystQuestionBank = {
  conservative: [
    "你在 Q1 采用保守 MTM，为什么 Q2 开始利润突然陡增？",
    "如果你的预测谨慎，为什么现金流仍持续背离利润？",
    "保守模型是否说明公司真实增长其实并不支持当前估值？",
  ],
  aggressive: [
    "你在 Q1 激进拉高了未来电价假设，参数依据是什么？",
    "你的高增长是否建立在无法持续签新合同的前提上？",
    "如果 MTM 假设回调 10%，当季利润会不会直接失真？",
  ],
};

const jargonA = ["协同效应", "价值共生", "范式转移", "资产轻量化", "动态风险中台", "结构性增长飞轮"];
const jargonB = ["全链路赋能", "战略解耦", "现金流再造", "监管友好优化", "跨周期韧性", "生态反脆弱化"];

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
  state.marketCap = (state.stock * 1.2);
  state.marketExpectedGain = 110 + state.quarter * 18 + state.fraudCount * 4;
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
    ["自信心 Charisma", `${Math.round(state.charisma)} / 100`],
    ["道德值 Morality", `${Math.round(state.morality)} / 100`],
  ];

  document.getElementById("metrics").innerHTML = list
    .map(([k, v]) => `<article class="metric"><h3>${k}</h3><strong>${v}</strong></article>`)
    .join("");

  const gap = state.forecastPaperGain - state.marketExpectedGain;
  const compareEl = document.getElementById("forecastCompare");
  const tone = gap >= 0 ? "good" : "bad";
  compareEl.className = `small ${tone}`;
  compareEl.textContent = `对比：你承诺的利润 ${formatMoney(state.forecastPaperGain)}，市场预期 ${formatMoney(state.marketExpectedGain)}，差额 ${formatMoney(gap)}。`;

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
  return `董事会认为，本季度公司通过“${a}”与“${b}”，实现结构性增长。利润与现金流错位是战略投资结果，管理层对长期回报保持坚定信心。`;
}

function renderQuarterStatus() {
  const q = quarterConfig[state.quarter];
  document.getElementById("phaseInfo").textContent = q.name;
  document.getElementById("phaseDesc").textContent = q.desc;
  document.getElementById("actionIntro").textContent = q.intro;
  const hint = state.actionDone && state.auditDone && state.callDone
    ? "本季度决议流程完成：可发布财报并进入下一季度。"
    : "需依次完成【核心任务】、【审计沟通】、【分析师会议】三项流程。";
  document.getElementById("operationHint").textContent = hint;
  document.getElementById("nextQuarterBtn").disabled = !(state.actionDone && state.auditDone && state.callDone);
}

function renderActionPanel() {
  const root = document.getElementById("actionArea");
  root.innerHTML = "";

  if (state.quarter === 1) {
    root.innerHTML = `
      <label for="optimism">MTM 乐观预测（50%-100%）</label>
      <input type="range" id="optimism" min="50" max="100" step="5" value="65" />
      <p id="optimismPreview"></p>
      <button id="actionBtn" ${state.actionDone ? "disabled" : ""}>提交 Q1 决议</button>
    `;
    const slider = document.getElementById("optimism");
    const preview = document.getElementById("optimismPreview");
    const refresh = () => {
      const optimism = Number(slider.value);
      const gain = Math.round((optimism - 45) * 5.5);
      preview.textContent = `预计本季可宣称利润 +$${gain}M（高乐观值会带来高估值压力）`;
    };
    slider.addEventListener("input", refresh);
    refresh();

    document.getElementById("actionBtn").onclick = () => {
      if (state.actionDone) return;
      const optimism = Number(slider.value);
      const gain = (optimism - 45) * 5.5;
      state.paperGain += gain;
      state.forecastPaperGain = state.paperGain + 30;
      state.stock += optimism >= 90 ? 22 : 12;
      state.risk += (optimism - 50) * 0.6;
      state.realCash -= 28;
      state.firstAction = optimism >= 85 ? "aggressive" : "conservative";
      bumpCorruption(optimism >= 90 ? 2 : 1);
      state.actionDone = true;
      feed("Q1 决议通过：MTM 预测已录入董事会摘要。", "good");
      render();
    };
    return;
  }

  if (state.quarter === 2) {
    root.innerHTML = `
      <p>选择转移至 Chewco 的债务规模：</p>
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
      btn.textContent = o.label;
      btn.disabled = state.actionDone;
      btn.onclick = () => {
        if (state.actionDone) return;
        state.paperGain += o.debt * 0.08;
        state.forecastPaperGain = state.paperGain + o.debt * 0.02;
        state.stock += o.stock;
        state.risk += o.risk;
        state.realCash -= 35;
        bumpCorruption(o.debt > 600 ? 2 : 1);
        feed(`Chewco 已接收 ${formatMoney(o.debt)} 债务，主报表负债率显著下降。`, "warn");
        state.actionDone = true;
        render();
      };
      holder.appendChild(btn);
    });
    return;
  }

  if (state.quarter === 3) {
    root.innerHTML = `
      <p>高峰时段停机策略：</p>
      <div class="choices" id="blackoutChoices"></div>
    `;
    const opts = [
      { label: "停机 6 小时（低调套利）", cash: 120, risk: 16, press: "局部停电，舆论升温。" },
      { label: "停机 24 小时（全州恐慌）", cash: 380, risk: 34, press: "电价飙升，监管紧盯。" },
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
        bumpCorruption(2);
        feed(`停机策略执行：${o.press}`, "bad");
        state.actionDone = true;
        render();
      };
      holder.appendChild(btn);
    });
    return;
  }

  if (state.quarter === 4) {
    root.innerHTML = `
      <p>终局操作包：</p>
      <div class="choices" id="endChoices"></div>
    `;
    const opts = [
      {
        label: "极速套现 + 全面碎纸 + 强硬封口",
        apply: () => {
          state.privateAccount += 360;
          state.realCash -= 120;
          state.stock -= 30;
          state.forecastPaperGain = state.paperGain + 60;
          state.risk += 42;
          bumpCorruption(3);
          feed("你公开喊多，私下抛售并启动全面碎纸流程。", "bad");
        },
      },
      {
        label: "温和套现 + 选择性销毁 + 收买吹哨者",
        apply: () => {
          state.privateAccount += 210;
          state.realCash -= 60;
          state.stock -= 18;
          state.forecastPaperGain = state.paperGain + 25;
          state.risk += 28;
          bumpCorruption(2);
          feed("你分批离场并完成关键证据抽离。", "warn");
        },
      },
    ];
    const holder = document.getElementById("endChoices");
    opts.forEach((o) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = o.label;
      btn.disabled = state.actionDone;
      btn.onclick = () => {
        if (state.actionDone) return;
        o.apply();
        state.actionDone = true;
        render();
      };
      holder.appendChild(btn);
    });
  }
}

function renderAuditPanel() {
  const root = document.getElementById("auditChoices");
  root.innerHTML = "";

  const options = [
    {
      label: "解释业务逻辑（高概率激怒审计）",
      apply: () => {
        state.risk += 10;
        feed("安达信记录了更多‘待解释事项’，怀疑度上升。", "warn");
      },
    },
    {
      label: "支付 $8M 咨询费（典型勾结）",
      apply: () => {
        state.realCash -= 8;
        state.risk = Math.max(0, state.risk - 14);
        state.paperGain += 12;
        state.forecastPaperGain += 18;
        bumpCorruption(1);
        feed("咨询费到账后，审计口径与管理层叙述‘高度一致’。", "good");
      },
    },
    {
      label: "向审计合伙人提供高管职位（旋转门）",
      apply: () => {
        state.realCash -= 15;
        state.risk = Math.max(0, state.risk - 20);
        state.paperGain += 20;
        state.forecastPaperGain += 25;
        bumpCorruption(2);
        feed("审计合伙人接受岗位邀约，审计意见明显软化。", "warn");
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
  const charmBonus = Math.floor(state.charisma / 25);

  document.getElementById("callPrompt").textContent = `分析师提问：${getAnalystQuestion()}`;

  const options = [
    {
      label: `用会计术语回避（Charisma +${charmBonus}）`,
      apply: () => {
        state.stock += 5 + charmBonus;
        state.risk += 6;
        feed("你用术语堆砌回答，提问被迫结束。", "good");
      },
    },
    {
      label: "强硬质疑提问动机",
      apply: () => {
        state.stock += 2 + charmBonus;
        state.risk += 10;
        state.charisma += 2;
        feed("你把会议引向情绪对抗，支持者鼓掌，监管记笔记。", "warn");
      },
    },
    {
      label: "给出更激进增长承诺",
      apply: () => {
        state.stock += 10 + charmBonus;
        state.paperGain += 35;
        state.forecastPaperGain += 40;
        state.risk += 14;
        bumpCorruption(1);
        feed("你承诺更高目标，短线资金继续追涨。", "good");
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

function settleQuarter() {
  const operatingCost = 110 + state.quarter * 10;
  const interest = 120 + state.quarter * 15;
  state.realCash -= operatingCost + interest;

  if (state.paperGain < state.marketExpectedGain) {
    state.stock -= 8;
    state.risk += 8;
    feed("披露利润低于市场预期，股价下挫。", "warn");
  } else {
    state.stock += 5;
    feed("披露利润高于市场预期，股价短线拉升。", "good");
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
  state.actionDone = false;
  state.auditDone = false;
  state.callDone = false;
  feed("季度财报已发布，董事会进入下一轮操盘讨论。", "warn");
  render();
}

function endGame() {
  const overlay = document.getElementById("ending");
  const title = document.getElementById("endingTitle");
  const desc = document.getElementById("endingDesc");
  const score = document.getElementById("endingScore");

  let ending;
  if (state.privateAccount >= 300 && state.risk < 95) {
    ending = ["决议结论 A：管理层离场", "你在监管全面行动前完成套现并离开。"];
  } else {
    ending = ["决议结论 B：责任追索", "你未能在流动性断裂前撤离，进入司法追责流程。"];
  }

  title.textContent = ending[0];
  desc.textContent = ending[1];
  score.textContent = `私人账户 ${formatMoney(state.privateAccount)} · 风险 ${Math.round(state.risk)} · 股价 $${state.stock.toFixed(1)} · 市值 ${formatBillion(state.marketCap)}`;
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

feed("议程启动：本季目标是让利润叙事高于市场预期。", "warn");
feed("提醒：你的第一步 MTM 选择会改变后续分析师提问方向。", "good");
render();
