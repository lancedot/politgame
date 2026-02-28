const state = {
  quarter: 1,
  maxQuarter: 18,
  paperGain: 120,
  realCash: 500,
  risk: 18,
  privateAccount: 0,
  stock: 100,
  auditorFavor: 70,
  stage: 1,
  fraudCount: 0,
  mtmApplied: false,
  auditDone: false,
  callDone: false,
};

const auditOptions = [
  {
    label: "A. 解释业务逻辑（可能翻车）",
    apply: () => {
      const fail = Math.random() < 0.65;
      state.risk += fail ? 12 : 4;
      state.auditorFavor -= fail ? 12 : 4;
      feed(fail ? "审计师没有听懂，怀疑度上升。" : "审计师勉强接受你的解释。", "warn");
    },
  },
  {
    label: "B. 支付 $5M 咨询费",
    apply: () => {
      state.realCash -= 5;
      state.risk -= 16;
      state.auditorFavor += 8;
      state.fraudCount += 1;
      feed("‘咨询费’到账，审计报告语气突然柔和。", "good");
    },
  },
  {
    label: "C. 挖角审计合伙人",
    apply: () => {
      state.realCash -= 12;
      state.risk = Math.max(0, state.risk - 22);
      state.auditorFavor = 95;
      state.fraudCount += 2;
      feed("审计合伙人转岗为副总裁。短期安全，长期隐患被埋下。", "warn");
    },
  },
];

const callOptions = [
  {
    label: "专业术语糊弄",
    apply: () => {
      state.stock += 5;
      state.risk += 6;
      feed("华尔街鼓掌：‘我们虽然没听懂，但这很高级。’");
    },
  },
  {
    label: "愤怒反击空头",
    apply: () => {
      state.stock += 2;
      state.risk += 10;
      feed("你怒斥‘愚蠢问题’，社媒热度暴涨。", "warn");
    },
  },
  {
    label: "给出虚假承诺",
    apply: () => {
      state.stock += 12;
      state.risk += 14;
      state.paperGain += 25;
      state.fraudCount += 2;
      feed("你承诺下季度再增长 30%，掌声如雷。", "good");
    },
  },
];

function feed(text, type = "") {
  const li = document.createElement("li");
  li.textContent = `[Q${state.quarter}] ${text}`;
  if (type) li.classList.add(type);
  document.getElementById("feed").prepend(li);
}

function formatMoney(v) {
  const sign = v >= 0 ? "$" : "-$";
  return `${sign}${Math.abs(v).toFixed(1)}M`;
}

function stageName() {
  if (state.quarter <= 4) return "第一阶段：黄金时代";
  if (state.quarter <= 12) return "第二阶段：膨胀与虚假繁荣";
  if (state.quarter <= 18) return "第三阶段：拆东墙补西墙";
  return "第四阶段：大崩溃";
}

function renderMetrics() {
  const data = [
    ["账面收益 Paper Gain", formatMoney(state.paperGain)],
    ["真实头寸 Real Cash", formatMoney(state.realCash)],
    ["合规风险 Risk Meter", `${Math.max(0, state.risk).toFixed(0)} / 100`],
    ["个人账户 Private Account", formatMoney(state.privateAccount)],
    ["安然股价 Stock", `${state.stock.toFixed(1)}`],
  ];
  document.getElementById("metrics").innerHTML = data
    .map(([k, v]) => `<article class="metric"><h3>${k}</h3><strong>${v}</strong></article>`)
    .join("");

  const decay = Math.min(1, state.fraudCount / 12);
  const motto = document.getElementById("motto");
  motto.style.opacity = `${1 - decay * 0.6}`;
  motto.style.letterSpacing = `${0.3 - decay * 0.22}em`;
  motto.style.filter = `hue-rotate(${decay * 80}deg)`;
  if (state.fraudCount > 8) motto.textContent = "沟 通 // 诚? // 尊X // 卓越";
}

function renderStatus() {
  document.getElementById("phaseInfo").textContent = `当前：第 ${state.quarter} 季度 · ${stageName()}`;
  const pressure = Math.max(15, state.quarter * 3);
  document.getElementById("pressureInfo").textContent = `华尔街增长压力：${pressure}%（如果利润低于预期，股价将受打击）`;
  document.getElementById("nextQuarterBtn").disabled = !(state.mtmApplied && state.auditDone && state.callDone);
}

function renderMTMPreview() {
  const val = Number(document.getElementById("optimism").value);
  const gain = ((val - 40) * 2.8).toFixed(0);
  const stress = ((val - 50) * 0.7).toFixed(0);
  document.getElementById("optimismText").textContent = `当季可确认利润约 +$${gain}M；下季增长压力额外 +${stress}%`;
}

function buildChoices() {
  const auditRoot = document.getElementById("auditChoices");
  auditRoot.innerHTML = "";
  auditOptions.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = opt.label;
    btn.disabled = state.auditDone;
    btn.onclick = () => {
      if (state.auditDone) return;
      opt.apply();
      state.auditDone = true;
      render();
    };
    auditRoot.appendChild(btn);
  });

  const callRoot = document.getElementById("callChoices");
  callRoot.innerHTML = "";
  callOptions.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = opt.label;
    btn.disabled = state.callDone;
    btn.onclick = () => {
      if (state.callDone) return;
      opt.apply();
      state.callDone = true;
      render();
    };
    callRoot.appendChild(btn);
  });
}

function applyMTM() {
  if (state.mtmApplied) return;
  const optimism = Number(document.getElementById("optimism").value);
  const gain = (optimism - 40) * 2.8;
  const futureDebt = (optimism - 50) * 1.6;
  state.paperGain += gain;
  state.realCash -= 30 + Math.max(0, futureDebt);
  state.risk += (optimism - 50) * 0.9;
  if (optimism >= 85) {
    state.stock += 20;
    state.fraudCount += 2;
    feed("激进 MTM 触发：股价暴涨，未来被你提前透支。", "good");
  } else {
    state.stock += 8;
    state.fraudCount += 1;
    feed("保守 MTM：盈利达标，但你知道只是时间换空间。", "warn");
  }
  state.mtmApplied = true;
  render();
}

function settleQuarter() {
  const operatingCost = 55 + state.quarter * 4;
  const interest = Math.max(80, 450 - state.quarter * 8);
  const shortfall = state.paperGain - (operatingCost + interest);

  state.realCash -= operatingCost + interest;
  if (shortfall > 0) state.stock += Math.min(10, shortfall / 35);
  else {
    state.stock += shortfall / 22;
    state.risk += 8;
  }

  if (state.realCash < 160 && state.stock > 35) {
    const siphon = Math.min(42, state.stock * 0.3);
    state.privateAccount += siphon;
    state.realCash -= siphon * 0.6;
    state.fraudCount += 1;
    feed("你悄悄减持套现，私人账户充实了一点。", "warn");
  }

  state.paperGain *= 0.72;
  state.risk += Math.max(0, (state.quarter - 8) * 1.4);
  state.auditorFavor -= 2 + state.fraudCount * 0.2;

  feed("季度结算完成：分析师继续狂欢，现金流继续恶化。");

  state.quarter += 1;
  state.mtmApplied = false;
  state.auditDone = false;
  state.callDone = false;

  if (state.quarter > state.maxQuarter || state.stock < 12 || state.risk >= 100 || state.realCash <= -120) {
    endGame();
    return;
  }

  if (state.quarter === 13) feed("匿名吹哨信流入媒体，SEC 开始深挖你的报表。", "warn");
  render();
}

function endGame() {
  const overlay = document.getElementById("ending");
  const title = document.getElementById("endingTitle");
  const desc = document.getElementById("endingDesc");
  const score = document.getElementById("endingScore");

  let ending;
  if (state.privateAccount >= 280 && state.stock > 25 && state.risk < 95) {
    ending = ["结局B：完美犯罪", "你在崩盘前退休，乘私人飞机离开，留下千万人追债。"];
  } else if (state.risk >= 100 || state.stock < 8) {
    ending = ["结局A：历史线", "骗局塌方，你与公司一起上了法庭头条。"];
  } else {
    ending = ["结局C：行业精英", "公司倒闭了，但你把责任导向 CEO 与审计机构，自己全身而退。"];
  }

  title.textContent = ending[0];
  desc.textContent = ending[1];
  score.textContent = `最终私人账户：${formatMoney(state.privateAccount)} · 风险值：${Math.round(state.risk)} · 季度：${state.quarter - 1}`;
  overlay.classList.remove("hidden");
}

function render() {
  renderMetrics();
  renderStatus();
  buildChoices();
  renderMTMPreview();
}

document.getElementById("optimism").addEventListener("input", renderMTMPreview);
document.getElementById("applyMtmBtn").addEventListener("click", applyMTM);
document.getElementById("nextQuarterBtn").addEventListener("click", settleQuarter);

feed("第一季度开始：华尔街要求至少 15% 增长，否则股价重挫。", "warn");
feed("‘安然是不可思议的盈利机器！’ —— 高盛分析师", "good");
feed("‘利润来源模糊，我看不懂。’ —— 不知名做空者", "warn");
render();
