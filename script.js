const state = {
  quarter: 1,
  paperGain: 95,
  realCash: 500,
  risk: 20,
  privateAccount: 0,
  stock: 78,
  charisma: 40,
  morality: 80,
  fraudCount: 0,
  actionDone: false,
  callDone: false,
};

const quarterConfig = {
  1: {
    name: "第一季度：虚假黎明（The MTM Magic）",
    desc: "天然气业务增长太慢。华尔街不爱真实利润，只爱故事。",
    intro: "签下 20 年能源合同，用 MTM 把未来收益一次性搬到当季。",
    action: "mtm",
  },
  2: {
    name: "第二季度：影子帝国（The SPE Labyrinth）",
    desc: "债务压顶。你需要把烂资产和债务‘卖给’壳公司 Chewco。",
    intro: "建立 SPE 并转移债务，用安然股价做担保。",
    action: "spe",
  },
  3: {
    name: "第三季度：疯狂收割（Market Manipulation）",
    desc: "现金流快断了。你盯上了电力市场漏洞与人为停机。",
    intro: "触发‘加州停电计划’，用恐慌收割交易利润。",
    action: "blackout",
  },
  4: {
    name: "第四季度：纸牌屋倒塌（The Endgame）",
    desc: "股价下跌触发担保连锁爆炸。你必须边喊多边套现。",
    intro: "选择内幕套现速度、碎纸机行动与吹哨者处理方式。",
    action: "endgame",
  },
};

const jargonA = ["协同效应", "价值共生", "范式转移", "资产轻量化", "动态风险中台", "结构性增长飞轮"];
const jargonB = ["全链路赋能", "战略解耦", "现金流再造", "监管友好优化", "跨周期韧性", "生态反脆弱化"];

function formatMoney(v) {
  const sign = v >= 0 ? "$" : "-$";
  return `${sign}${Math.abs(v).toFixed(1)}M`;
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

function renderMetrics() {
  const list = [
    ["账面收益 Paper Gain", formatMoney(state.paperGain)],
    ["真实头寸 Real Cash", formatMoney(state.realCash)],
    ["合规风险 Risk Meter", `${Math.round(state.risk)} / 100`],
    ["个人账户 Private Account", formatMoney(state.privateAccount)],
    ["安然股价 Stock", state.stock.toFixed(1)],
    ["自信心 Charisma", `${Math.round(state.charisma)} / 100`],
    ["道德值 Morality", `${Math.round(state.morality)} / 100`],
  ];

  document.getElementById("metrics").innerHTML = list
    .map(([k, v]) => `<article class="metric"><h3>${k}</h3><strong>${v}</strong></article>`)
    .join("");

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
  return `董事会认为，本季度公司通过“${a}”与“${b}”，实现了高质量增长。当前利润与现金流的‘错配’属于战略前置投入，管理层对长期价值释放保持绝对信心。`;
}

function renderQuarterStatus() {
  const q = quarterConfig[state.quarter];
  document.getElementById("phaseInfo").textContent = q.name;
  document.getElementById("phaseDesc").textContent = q.desc;
  document.getElementById("actionIntro").textContent = q.intro;
  document.getElementById("nextQuarterBtn").disabled = !(state.actionDone && state.callDone);
}

function renderActionPanel() {
  const root = document.getElementById("actionArea");
  root.innerHTML = "";

  if (state.quarter === 1) {
    root.innerHTML = `
      <label for="optimism">乐观预测滑块（50%-100%）</label>
      <input type="range" id="optimism" min="50" max="100" step="5" value="65" />
      <p id="optimismPreview"></p>
      <button id="actionBtn">执行 MTM 魔法</button>
    `;
    const slider = document.getElementById("optimism");
    const preview = document.getElementById("optimismPreview");
    const refresh = () => {
      const optimism = Number(slider.value);
      const gain = Math.round((optimism - 45) * 5.5);
      preview.textContent = `预计当季利润 +$${gain}M（最高可接近 +500% 账面增幅）`;
    };
    slider.addEventListener("input", refresh);
    refresh();
    document.getElementById("actionBtn").onclick = () => {
      if (state.actionDone) return;
      const optimism = Number(slider.value);
      const gain = (optimism - 45) * 5.5;
      state.paperGain += gain;
      state.stock += optimism >= 90 ? 23 : 12;
      state.risk += (optimism - 50) * 0.6;
      state.realCash -= 28;
      bumpCorruption(optimism >= 90 ? 2 : 1);
      state.actionDone = true;
      feed("MTM 释放魔法：未来 20 年利润被你拖进了本季度。", "good");
      render();
    };
    return;
  }

  if (state.quarter === 2) {
    root.innerHTML = `
      <p>请选择本季度转移至 Chewco 的债务规模：</p>
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
        state.stock += o.stock;
        state.risk += o.risk;
        state.realCash -= 35;
        bumpCorruption(o.debt > 600 ? 2 : 1);
        feed(`Chewco 已吞下 ${formatMoney(o.debt)} 债务，主表瞬间‘变干净’。`, "warn");
        state.actionDone = true;
        render();
      };
      holder.appendChild(btn);
    });
    return;
  }

  if (state.quarter === 3) {
    root.innerHTML = `
      <p>加州高峰期，你要让电厂“维修”多久？</p>
      <div class="choices" id="blackoutChoices"></div>
    `;
    const opts = [
      { label: "停机 6 小时（低调套利）", cash: 120, risk: 16, press: "部分地区停电引发抱怨。" },
      { label: "停机 24 小时（全州恐慌）", cash: 380, risk: 34, press: "电价飙升 1000%，舆论爆炸。" },
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
        state.risk += o.risk;
        state.stock += 6;
        bumpCorruption(2);
        feed(`加州停电计划执行：${o.press}`, "bad");
        feed("SEC 开始询问：为何你们利润总与灾难同步？", "warn");
        state.actionDone = true;
        render();
      };
      holder.appendChild(btn);
    });
    return;
  }

  if (state.quarter === 4) {
    root.innerHTML = `
      <p>终局三连：选择你的逃生配置。</p>
      <div class="choices" id="endChoices"></div>
    `;
    const opts = [
      {
        label: "极速套现 + 全面碎纸 + 强硬封口（高收益高风险）",
        apply: () => {
          state.privateAccount += 360;
          state.realCash -= 120;
          state.stock -= 30;
          state.risk += 42;
          bumpCorruption(3);
          feed("你在电视上喊‘基本面坚不可摧’，同时后台疯狂抛售。", "bad");
          feed("安达信深夜碎纸机不停，内部会计主管被边缘化。", "warn");
        },
      },
      {
        label: "温和套现 + 选择性销毁 + 收买吹哨者（中风险）",
        apply: () => {
          state.privateAccount += 210;
          state.realCash -= 60;
          state.stock -= 18;
          state.risk += 28;
          bumpCorruption(2);
          feed("你维持公开乐观，私下分批离场。", "warn");
          feed("吹哨者被调岗并签下保密协议。", "warn");
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

function renderCallChoices() {
  const root = document.getElementById("callChoices");
  root.innerHTML = "";
  const charmBonus = Math.floor(state.charisma / 25);
  const options = [
    {
      label: `专业术语糊弄（受 Charisma +${charmBonus} 加成）`,
      apply: () => {
        state.stock += 5 + charmBonus;
        state.risk += 6;
        feed("‘这是前瞻性的范式转移。’ 分析师点头假装听懂。", "good");
      },
    },
    {
      label: `怒斥提问者：你连会计准则都不懂吗？（Skilling 名场面）`,
      apply: () => {
        state.stock += 2 + charmBonus;
        state.risk += 10;
        state.charisma += 2;
        feed("你的傲慢被部分投资者视作‘天才气场’。", "warn");
      },
    },
    {
      label: `给出虚假承诺：下季再增长 30%`,
      apply: () => {
        state.stock += 10 + charmBonus;
        state.paperGain += 40;
        state.risk += 14;
        bumpCorruption(1);
        feed("掌声如雷，但你把未来又透支了一层。", "good");
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

  if (state.paperGain < 120 + state.quarter * 35) {
    state.stock -= 8;
    state.risk += 8;
    feed("增长未达市场预期，股价和情绪同步下挫。", "warn");
  }

  state.paperGain *= 0.7;
  state.stock = Math.max(2, state.stock);
  state.risk = Math.max(0, Math.min(130, state.risk));
  document.getElementById("report").textContent = generateReportText();

  if (state.quarter === 4) {
    endGame();
    return;
  }

  state.quarter += 1;
  state.actionDone = false;
  state.callDone = false;
  feed("季度已封账：董事会批准你继续‘创新’。", "warn");
  render();
}

function endGame() {
  const overlay = document.getElementById("ending");
  const title = document.getElementById("endingTitle");
  const desc = document.getElementById("endingDesc");
  const score = document.getElementById("endingScore");

  let ending;
  if (state.privateAccount >= 300 && state.risk < 95) {
    ending = ["结局 A：逃往小岛", "你在 FBI 破门前完成套现，飞往无引渡条约海岛。"];
  } else {
    ending = ["结局 B：法庭清算", "你动作慢了一拍，股价跌穿平仓线，昔日同僚在庭上轮流指认你。"];
  }

  title.textContent = ending[0];
  desc.textContent = ending[1];
  score.textContent = `私人账户 ${formatMoney(state.privateAccount)} · 风险 ${Math.round(state.risk)} · Charisma ${Math.round(state.charisma)} · Morality ${Math.round(state.morality)}`;
  overlay.classList.remove("hidden");
}

function render() {
  renderMetrics();
  renderQuarterStatus();
  renderActionPanel();
  renderCallChoices();
  document.getElementById("report").textContent ||= generateReportText();
  document.getElementById("nextQuarterBtn").disabled = !(state.actionDone && state.callDone);
}

document.getElementById("nextQuarterBtn").addEventListener("click", settleQuarter);

feed("第一季度：华尔街嫌 5% 增长太慢，要求你立刻制造奇迹。", "warn");
feed("欢迎来到数字恐怖游戏：这里每次舞弊都能换来更高的 Charisma。", "bad");
render();
