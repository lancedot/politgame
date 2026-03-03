const content = window.GAME_CONTENT || {};

window.startTerminal = function startTerminal() {
  state.bootCompleted = true;
  document.getElementById("bootModal")?.classList.add("hidden");
  render();
};

const GAME_CONFIG = {
  maxQuarter: 12,
  riskDangerLine: 80,
  boardQuarterDecay: 15,
  saveKey: "enron_save_v2",
  scenePermissions: {
    desk: ["exerciseBtn", "routineBtn", "nextQuarterBtn", "ledgerPanel", "reportPanel", "investigationPanel"],
    warroom: ["mtmPanel", "chewcoPanel", "auditPanel", "lobbyPanel", "investigationPanel"],
  },
};

const lifecycleHooks = {
  beforeQuarterStart: [],
  afterQuarterSettle: [],
  beforeEnding: [],
};

const telemetry = [];

function track(event, payload = {}) {
  telemetry.push({
    event,
    ts: Date.now(),
    quarter: state.quarter,
    risk: Math.round(state.risk),
    offshore: Number(state.privateAccount.toFixed(2)),
    stock: Number(state.stock.toFixed(2)),
    ...payload,
  });
}

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

function showUnlockModal(title, desc) {
  const modal = document.getElementById("unlockModal");
  const titleNode = document.getElementById("unlockTitle");
  const descNode = document.getElementById("unlockDesc");
  const confirmBtn = document.getElementById("unlockConfirmBtn");
  if (!modal || !titleNode || !descNode || !confirmBtn) return;
  titleNode.textContent = title;
  descNode.textContent = desc;
  confirmBtn.onclick = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
}

function runChewcoBridge() {
  const before = snapshotCore();
  state.realCash += 160;
  state.debt += 140;
  state.risk += 10;
  state.secAttention += 6;
  state.whistleblowerPressure += 4;
  state.lastActionSummary = "Chewco过桥";
  feed("Chewco 把坏账塞进口袋：现金回来了，证据链也回来了。", "warn");
  showDelta(before, "Chewco结果");
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
  bootCompleted: false,
  forcedWarRoomThisQuarter: false,
  shareholderPressure: 50,
  isMTMUnlocked: false,
  isAuditUnlocked: false,
  isLobbyUnlocked: false,
  isChewcoUnlocked: false,
  mtmRatio: 0,
  mtmDoneThisQuarter: false,
  phaseTab: "overview",
  isSettlingQuarter: false,
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

const quarterRandomEvents = Object.assign({}, content.events || {}, {
  1: {
    title: "季度突发：董事会冷笑审阅",
    desc: "董事会盯着增长曲线问：‘这条线这么平，是你画图手抖了吗？’",
    choices: [
      { label: "A. 夸下海口（股东压力 -12，风险 +4）", effect: (st) => { st.shareholderPressure = Math.max(0, st.shareholderPressure - 12); st.risk += 4; const msg = "你把 PPT 说成了史诗，董事会先鼓掌，合规先记仇。"; feed(msg, "warn"); return msg; } },
      { label: "B. 保守解释（股东压力 +10，风险 -2）", effect: (st) => { st.shareholderPressure = Math.min(100, st.shareholderPressure + 10); st.risk = Math.max(0, st.risk - 2); const msg = "你说了人话，董事会觉得你不会讲故事。"; feed(msg, "good"); return msg; } },
    ],
  },
  2: {
    title: "季度突发：管理层增长军令状",
    desc: "COO 提议签下激进 KPI：‘增长不够，就让现实配合报表。’",
    choices: [
      { label: "A. 签字冲刺（账面利润 +$80M，股东压力 -10，风险 +8）", effect: (st) => { st.paperGain += 80; st.shareholderPressure = Math.max(0, st.shareholderPressure - 10); st.risk += 8; const msg = "你签了军令状，增长看起来更像神迹。"; feed(msg, "warn"); return msg; } },
      { label: "B. 拒绝拔苗（现金 +$20M，股东压力 +12）", effect: (st) => { st.realCash += 20; st.shareholderPressure = Math.min(100, st.shareholderPressure + 12); const msg = "你保住了睡眠质量，没保住董事会好脸色。"; feed(msg, "good"); return msg; } },
    ],
  },
  3: {
    title: "季度突发：董事会二次盘问",
    desc: "有人敲着桌子：‘隔壁增长 30%，你这里只有借口？’",
    choices: [
      { label: "A. 继续画饼（股价 +4，股东压力 -14，风险 +9）", effect: (st) => { st.stock += 4; st.shareholderPressure = Math.max(0, st.shareholderPressure - 14); st.risk += 9; const msg = "你把未来讲成今晚到账，掌声和风险一起上涨。"; feed(msg, "warn"); return msg; } },
      { label: "B. 承认困难（股价 -5，股东压力 +15，风险 -3）", effect: (st) => { st.stock -= 5; st.shareholderPressure = Math.min(100, st.shareholderPressure + 15); st.risk = Math.max(0, st.risk - 3); const msg = "你诚实得像个异端，股价先给你上一课。"; feed(msg, "bad"); return msg; } },
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
  7: {
    title: "季度突发：路演过度承诺",
    desc: "投资者见面会上，你把‘谨慎指引’讲成了‘神迹时间表’。",
    choices: [
      { label: "A. 继续加码承诺（股价 +6，风险 +9，压力 -8）", effect: (st) => { st.stock += 6; st.risk += 9; st.shareholderPressure = Math.max(0, st.shareholderPressure - 8); const msg = "掌声像利好，脚注像炸药。"; feed(msg, "warn"); return msg; } },
      { label: "B. 当场降温预期（股价 -4，风险 -3，压力 +10）", effect: (st) => { st.stock -= 4; st.risk = Math.max(0, st.risk - 3); st.shareholderPressure = Math.min(100, st.shareholderPressure + 10); const msg = "你救了未来，得罪了今天。"; feed(msg, "good"); return msg; } },
    ],
  },
  8: {
    title: "季度突发：审计抽样扩大",
    desc: "审计团队突然想看更多底稿，称这是‘常规增强程序’。",
    choices: [
      { label: "A. 配合但精挑细选（SEC -3，风险 -2，股价 -1）", effect: (st) => { st.secAttention = Math.max(0, st.secAttention - 3); st.risk = Math.max(0, st.risk - 2); st.stock -= 1; const msg = "透明了一点点，股价先不高兴。"; feed(msg, "good"); return msg; } },
      { label: "B. 拖字诀到底（SEC +6，风险 +5，股价 +2）", effect: (st) => { st.secAttention += 6; st.risk += 5; st.stock += 2; const msg = "你又赢了今天，明天写进了案卷。"; feed(msg, "warn"); return msg; } },
    ],
  },
  9: {
    title: "季度突发：安达信旋转门",
    desc: "那个审计员挺聪明，给他个 VP 当当，他就会忘了那笔坏账。",
    choices: [
      { label: "A. 立即挖角（结果：风险 -16，现金 -22，SEC +4）", effect: (st) => { st.risk = Math.max(0, st.risk - 16); st.realCash -= 22; st.secAttention += 4; st.rotationDoorShield = true; const msg = "人事公告发布后，审计脚注立刻变得温柔。"; feed(msg, "warn"); return msg; } },
      { label: "B. 保持距离（结果：风险 +6，现金 0，审计独立性 +8）", effect: (st) => { st.risk += 6; st.auditIndependence = Math.min(100, st.auditIndependence + 8); const msg = "你选择合规，短期日子更难，长期睡眠更好。"; feed(msg, "good"); return msg; } },
    ],
  },
  10: {
    title: "季度突发：内部群聊截图外泄",
    desc: "截图里写着：‘先把故事讲圆，现金以后再找。’",
    choices: [
      { label: "A. 甩锅给中层（股价 +1，媒体 +6，风险 +4）", effect: (st) => { st.stock += 1; st.mediaHeat += 6; st.risk += 4; const msg = "公关控场成功，良心离职率上升。"; feed(msg, "warn"); return msg; } },
      { label: "B. 承认管理失误（股价 -3，风险 -2，SEC -2）", effect: (st) => { st.stock -= 3; st.risk = Math.max(0, st.risk - 2); st.secAttention = Math.max(0, st.secAttention - 2); const msg = "你换来一点信任，顺便损失一点估值。"; feed(msg, "good"); return msg; } },
    ],
  },
  11: {
    title: "季度突发：融资窗口骤冷",
    desc: "银行说市场波动太大，授信要加条件。翻译：他们开始怕你了。",
    choices: [
      { label: "A. 接受苛刻条款（现金 +90，风险 +6，股价 -2）", effect: (st) => { st.realCash += 90; st.risk += 6; st.stock -= 2; const msg = "你买到了一口氧气，价格写在耻辱柱上。"; feed(msg, "warn"); return msg; } },
      { label: "B. 硬撑不融资（现金 -40，风险 +2，压力 +8）", effect: (st) => { st.realCash -= 40; st.risk += 2; st.shareholderPressure = Math.min(100, st.shareholderPressure + 8); const msg = "体面保住了，账上先流血。"; feed(msg, "bad"); return msg; } },
    ],
  },
  12: {
    title: "季度突发：最后的电话会彩排",
    desc: "IR 问你：‘今晚是讲增长神话，还是准备善后词典？’",
    choices: [
      { label: "A. 继续神话叙事（股价 +4，风险 +8）", effect: (st) => { st.stock += 4; st.risk += 8; const msg = "你把 Titanic 讲成了邮轮首航。"; feed(msg, "warn"); return msg; } },
      { label: "B. 提前承认问题（股价 -6，风险 -4）", effect: (st) => { st.stock -= 6; st.risk = Math.max(0, st.risk - 4); const msg = "你终于诚实，市场终于不体面。"; feed(msg, "bad"); return msg; } },
    ],
  },

});

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


const analystQuarterDeck = {
  1: {
    prompt: "分析师刻薄提问：你们的增长是卖天然气，还是卖想象力？",
    choices: [
      { label: "A. ‘我们是能源界的微软。’（股价 +5，风险 +4）", ok: true, effect: (st) => { st.stock += 5; st.risk += 4; } },
      { label: "B. ‘请看口径调整后同比’（股价 +3，SEC +3）", ok: true, effect: (st) => { st.stock += 3; st.secAttention += 3; } },
      { label: "C. ‘本季增长确实乏力’（股价 -8，压力 +18）", ok: false, effect: (st) => { st.stock -= 8; st.shareholderPressure = Math.min(100, st.shareholderPressure + 18); } },
    ],
  },
  2: {
    prompt: "分析师刻薄提问：利润这么好看，为什么现金流看起来像病历单？",
    choices: [
      { label: "A. ‘现金流是战略性滞后’（股价 +4，风险 +5）", ok: true, effect: (st) => { st.stock += 4; st.risk += 5; } },
      { label: "B. ‘我们正优化资本结构’（股价 +2，SEC +4）", ok: true, effect: (st) => { st.stock += 2; st.secAttention += 4; } },
      { label: "C. ‘你问得对，我们也很紧张’（股价 -9，压力 +22）", ok: false, effect: (st) => { st.stock -= 9; st.shareholderPressure = Math.min(100, st.shareholderPressure + 22); } },
    ],
  },
  3: {
    prompt: "分析师刻薄提问：除了幻灯片动画，你们到底有什么护城河？",
    choices: [
      { label: "A. ‘护城河是我们的估值共识’（股价 +6，风险 +6）", ok: true, effect: (st) => { st.stock += 6; st.risk += 6; } },
      { label: "B. ‘我们领先行业三年’（股价 +3，SEC +2）", ok: true, effect: (st) => { st.stock += 3; st.secAttention += 2; } },
      { label: "C. ‘护城河还在施工中’（股价 -10，压力 +20）", ok: false, effect: (st) => { st.stock -= 10; st.shareholderPressure = Math.min(100, st.shareholderPressure + 20); } },
    ],
  },
  4: {
    prompt: "分析师刻薄提问：你们是能源公司，还是会计文学社？",
    choices: [
      { label: "A. ‘我们是新经济基础设施’（股价 +5，风险 +5）", ok: true, effect: (st) => { st.stock += 5; st.risk += 5; } },
      { label: "B. ‘请聚焦长期价值创造’（股价 +2，SEC +3）", ok: true, effect: (st) => { st.stock += 2; st.secAttention += 3; } },
      { label: "C. ‘短期确实有噪音’（股价 -7，压力 +16）", ok: false, effect: (st) => { st.stock -= 7; st.shareholderPressure = Math.min(100, st.shareholderPressure + 16); } },
    ],
  },
  5: {
    prompt: "分析师刻薄提问：你们的利润像火箭，现金像地铁晚点，解释一下？",
    choices: [
      { label: "A. ‘我们在前置布局未来’（股价 +4，风险 +6）", ok: true, effect: (st) => { st.stock += 4; st.risk += 6; } },
      { label: "B. ‘请看我们自定义口径’（股价 +3，SEC +4）", ok: true, effect: (st) => { st.stock += 3; st.secAttention += 4; } },
      { label: "C. ‘现金确实紧’（股价 -8，压力 +18）", ok: false, effect: (st) => { st.stock -= 8; st.shareholderPressure = Math.min(100, st.shareholderPressure + 18); } },
    ],
  },
  6: {
    prompt: "分析师刻薄提问：你们是能源公司，还是用脚注发电的公司？",
    choices: [
      { label: "A. ‘脚注是高级透明’（股价 +5，风险 +5）", ok: true, effect: (st) => { st.stock += 5; st.risk += 5; } },
      { label: "B. ‘复杂是竞争优势’（股价 +2，SEC +5）", ok: true, effect: (st) => { st.stock += 2; st.secAttention += 5; } },
      { label: "C. ‘你说得对我们有点飘’（股价 -9，压力 +20）", ok: false, effect: (st) => { st.stock -= 9; st.shareholderPressure = Math.min(100, st.shareholderPressure + 20); } },
    ],
  },
  7: {
    prompt: "分析师刻薄提问：你们的增长计划是商业计划书，还是悬疑小说？",
    choices: [
      { label: "A. ‘我们是叙事驱动企业’（股价 +4，风险 +6）", ok: true, effect: (st) => { st.stock += 4; st.risk += 6; } },
      { label: "B. ‘市场会理解我们的前瞻性’（股价 +3，SEC +3）", ok: true, effect: (st) => { st.stock += 3; st.secAttention += 3; } },
      { label: "C. ‘先活下来再解释’（股价 -7，压力 +16）", ok: false, effect: (st) => { st.stock -= 7; st.shareholderPressure = Math.min(100, st.shareholderPressure + 16); } },
    ],
  },
  8: {
    prompt: "分析师刻薄提问：请问你们现在最充足的是现金、信心，还是借口？",
    choices: [
      { label: "A. ‘最充足的是战略定力’（股价 +3，风险 +5）", ok: true, effect: (st) => { st.stock += 3; st.risk += 5; } },
      { label: "B. ‘资金面完全可控’（股价 +2，SEC +4）", ok: true, effect: (st) => { st.stock += 2; st.secAttention += 4; } },
      { label: "C. ‘借口可能最充足’（股价 -10，压力 +22）", ok: false, effect: (st) => { st.stock -= 10; st.shareholderPressure = Math.min(100, st.shareholderPressure + 22); } },
    ],
  },
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
    full: "把明天的饼，现在就吃掉。如果明天没饼了？那就再画一个更大的。",
  },
  SPE: {
    short: "SPE：把债务放到‘表外房间’。",
    full: "这就是公司报表上的‘黑洞’。把坏消息丢进去，连光都逃不出来，更别说审计师了。",
  },
  "旋转门": {
    short: "旋转门：监督者变同事。",
    full: "今天他是查你的监管员，明天他就是你手下年薪百万的副总裁。你猜他今天会写什么报告？",
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
  document.body.classList.toggle("danger-mode", false);
  document.body.classList.toggle("risk-shake", false);
  document.body.classList.toggle("cash-negative", state.realCash < 0);
  if (!dangerOn && state.audioCtx && state.audioCtx.state !== "closed") {
    state.audioCtx.close();
    state.audioCtx = null;
  }
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


function syncBootModalVisibility() {
  const boot = document.getElementById("bootModal");
  if (!boot) return;
  boot.classList.toggle("hidden", state.bootCompleted);
}

function maybeShowQuarterQuote() {
  if (!state.bootCompleted) return;
  if (state.isSettlingQuarter) return;
  if (state.quoteShownForQuarter === state.quarter) return;
  const modal = document.getElementById("quoteModal");
  const text = document.getElementById("quoteText");
  if (!modal || !text) return;
  if (!modal.classList.contains("hidden")) return;
  const quoteKey = getRotatingKey(quarterQuotes, state.quarter);
  const quotes = quarterQuotes[quoteKey] || quarterQuotes[1];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  text.textContent = quote;
  modal.classList.remove("hidden");
  state.quoteShownForQuarter = state.quarter;
}

function setActiveScene(scene) {
  if (scene === "warroom" && !isWarroomUnlocked()) {
    scene = "desk";
  }
  state.activeScene = scene;
  document.body.classList.remove("scene-desk", "scene-warroom", "scene-stage");
  document.body.classList.add(`scene-${scene}`);
  document.querySelectorAll(".scene-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-scene") === scene);
  });
  const hints = {
    desk: "【权力核心：CFO 办公室】处理日常经营、现金与邮件压力。",
    warroom: "【密室决策：暗箱实验室】决定增长叙事与结构化动作。",
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

function isWarroomUnlocked() {
  return state.isMTMUnlocked || state.isChewcoUnlocked || state.isLobbyUnlocked || state.isAuditUnlocked;
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


function snapshotCore() {
  return {
    cash: state.realCash,
    stock: state.stock,
    risk: state.risk,
    pressure: state.shareholderPressure,
  };
}

function showDelta(before, title = "行动结果") {
  const dc = state.realCash - before.cash;
  const ds = state.stock - before.stock;
  const dr = state.risk - before.risk;
  const dp = state.shareholderPressure - before.pressure;
  feed(`${title}：现金 ${formatMoney(dc)}｜股价 ${ds >= 0 ? '+' : ''}${ds.toFixed(1)}｜风险 ${dr >= 0 ? '+' : ''}${dr.toFixed(1)}｜股东压力 ${dp >= 0 ? '+' : ''}${dp.toFixed(1)}`, dr > 0 || dp > 0 ? "warn" : "good");
}

function renderMetrics() {
  updateMarketDerived();
  const metrics = [
    { key: "stock", label: content.statusLabels?.price || "华尔街估值 (Market Cap/Price)", value: state.stock, fmt: (v) => `$${v.toFixed(1)}` },
    { key: "cash", label: content.statusLabels?.cash || "金库头寸 (Actual Liquidity)", value: state.realCash, fmt: (v) => formatMoney(v) },
    { key: "paper", label: content.statusLabels?.paper || "叙事利润 (Narrative Earnings)", value: state.paperGain, fmt: (v) => formatMoney(v) },
    { key: "risk", label: "SEC 绞索紧度 (Noose Tightness)", value: state.risk, fmt: (v) => `${Math.round(v)} / 120` },
    { key: "offshore", label: "避税天堂余额 (Offshore Account)", value: state.privateAccount, fmt: (v) => formatMoney(v) },
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

  const gap = state.paperGain - state.marketExpectedGain;
  const compareEl = document.getElementById("forecastCompare");
  compareEl.className = `small ${gap >= 0 ? "good" : "bad"}`;
  compareEl.textContent = `预期对比（实时）：叙事利润 ${formatMoney(state.paperGain)}，市场要求 ${formatMoney(state.marketExpectedGain)}，差额 ${formatMoney(gap)}。`;

  const previewUnits = Math.min(12, state.personalOptions);
  const previewGross = previewUnits * state.stock * 0.02;
  const previewCap = Math.max(6, state.realCash * 0.18);
  const previewProceeds = Math.min(previewGross, previewCap);
  document.getElementById("optionInfo").textContent = state.exercisedThisQuarter
    ? "本季度已完成期权变现。"
    : `个人期权变现预览：${previewUnits} 份，预计到账 ${formatMoney(previewProceeds)}，基础风险 +3。`;

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

function renderInvestigationPanel() {
  clampInvestigation();
  document.getElementById("secBar").value = state.secAttention;
  document.getElementById("mediaBar").value = state.mediaHeat;
  document.getElementById("whistleBar").value = state.whistleblowerPressure;
  document.getElementById("auditBar").value = 100 - state.auditIndependence;
  const boardBar = document.getElementById("boardBar");
  if (boardBar) boardBar.value = state.shareholderPressure;

  const hint = [];
  if (state.secAttention > 65) hint.push("SEC 已进入深度问询");
  if (state.mediaHeat > 60) hint.push("媒体头条密集跟进");
  if (state.whistleblowerPressure > 58) hint.push("内部吹哨风险升高");
  if (state.auditIndependence < 40) hint.push("审计独立性接近失效");
  const boardLine = state.shareholderPressure <= 33
    ? "压力尚可：他们还愿意为你买下整条街的香槟。"
    : state.shareholderPressure <= 66
      ? "压力上升：董事会开始查阅你的午餐账单了。"
      : "压力爆表：HR 已经在打印你的辞退信。";
  document.getElementById("investigationHint").textContent = hint.length
    ? `警报：${hint.join("；")}｜股东压力 ${Math.round(state.shareholderPressure)}%：${boardLine}`
    : `股东压力 ${Math.round(state.shareholderPressure)}%：${boardLine}`;
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
  const gap = state.paperGain - state.marketExpectedGain;
  const stress = state.shareholderPressure >= 78 ? "董事会情绪：接近失控，要求下季度必须给出更‘性感’的增长曲线。" : state.shareholderPressure >= 55 ? "董事会情绪：焦躁，允许你继续讲故事，但不允许你讲慢故事。" : "董事会情绪：暂时满意，掌声里还听不见清算。";
  const secLine = state.secAttention >= 70 ? "监管雷达：SEC 已从‘关注名单’升级为‘重点观察’，任何脚注都可能被放大。" : "监管雷达：暂未触发全面问询，但你留下的每个结构都会在未来回访。";
  const auditLine = state.auditIndependence < 45 ? "审计状态：独立性显著下降，‘咨询服务’与‘监督职责’已经混成一杯鸡尾酒。" : "审计状态：仍有形式上的边界，但边界正在被预算表温柔腐蚀。";
  const narrative = gap >= 0
    ? `本季叙事完成度超预期 ${formatMoney(gap)}。你把未来挪到今天，市场暂时愿意把它叫做‘前瞻性能力’。`
    : `本季叙事缺口 ${formatMoney(Math.abs(gap))}。华尔街把沉默翻译成恐慌，股东把恐慌翻译成问责。`;
  return `【商业黑话快报】
${narrative}
${stress}
${secLine}
${auditLine}
CFO 内部备注：在这家公司，数字先决定道德，再决定法律。`;
}

function updateUnlockFlags() {
  if (state.shareholderPressure >= 70 && !state.isMTMUnlocked) {
    state.isMTMUnlocked = true;
    track("unlock_triggered", { unlock_type: "mtm", shareholder_pressure: Math.round(state.shareholderPressure) });
    if (!state.triggeredEvents.has("mtm-invite-shown")) {
      state.triggeredEvents.add("mtm-invite-shown");
      showUnlockModal("【密室议程：恶魔的邀约】", "股东会把增长目标拍在你桌上：‘数字要立刻好看。’你想到 MTM（把未来利润搬到今天），但是否执行仍由你在暗箱实验室手动决定。传说里，和恶魔签约后，抽象的代价会显形——SEC关注、审计独立性、媒体热度、吹哨压力，都被量化成了你眼前的仪表盘。 ");
    }
    feed("股东会压力突破阈值：你想到了 MTM 这把刀，但刀柄仍在你手里。", "warn");
  }

  if (state.isMTMUnlocked && state.mtmRatio >= 55 && !state.isChewcoUnlocked) {
    state.isChewcoUnlocked = true;
    track("unlock_triggered", { unlock_type: "chewco", mtm_ratio: state.mtmRatio });
    showUnlockModal("Chewco 解锁", "MTM 比例抬高后，报表开始‘过热’。你需要一个更深的口袋安置坏账与债务——Chewco 就是这只口袋。它能续命，也会加厚证据链。 ");
    feed("Chewco 解锁：MTM 拉得越高，越需要表外结构来托底。", "bad");
  }

  if (state.risk > 70 && !state.isLobbyUnlocked) {
    state.isLobbyUnlocked = true;
    track("unlock_triggered", { unlock_type: "lobby", risk: Math.round(state.risk) });
    showUnlockModal("Lobby 解锁", "风险已经高到走廊里都能闻到焦味。你现在可以启动游说：花真金白银去换几周安静，代价是更深的道德透支。 ");
    feed("新功能解锁：Lobby 游说（风险过高触发）。", "warn");
  }

  const auditRiskThreshold = 78;
  if (state.risk >= auditRiskThreshold && !state.triggeredEvents.has("audit-inquiry-triggered")) {
    state.triggeredEvents.add("audit-inquiry-triggered");
    state.isAuditUnlocked = true;
    track("unlock_triggered", { unlock_type: "audit", risk: Math.round(state.risk) });
    showUnlockModal("审计师问询触发", `风险值达到 ${auditRiskThreshold}：审计师启动专项问询。该事件只会在首次越线时触发一次，后续请在“审计沟通”面板中选择应对策略。`);
    feed(`审计师问询触发：风险达到 ${auditRiskThreshold}，审计沟通已开放。`, "warn");
  }
}

function getGameStage() {
  if (state.quarter <= 4) return 1;
  if (state.quarter <= 8) return 2;
  return 3;
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


function wirePhaseTabs() {
  document.querySelectorAll('.phase-tab').forEach((btn) => {
    btn.onclick = () => {
      state.phaseTab = btn.getAttribute('data-tab') || 'overview';
      renderQuarterStatus();
    };
  });
}

function applyPhaseTabView(q) {
  const tab = 'overview';
  document.querySelectorAll('.phase-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
  });
  document.getElementById("phaseInfo").textContent = q.name;
  document.getElementById("phaseDesc").textContent = q.desc;
  document.getElementById("operationHint").textContent = `阶段 ${getGameStage()}/3 · 处理当季经营动作与密室策略，平衡增长叙事与监管风险。`;
}

function renderQuarterStatus() {
  const q = getQuarterConfig(state.quarter);
  const stage = getGameStage();
  applyPhaseTabView(q);

  const nextBtn = document.getElementById("nextQuarterBtn");
  nextBtn.disabled = false;
  nextBtn.style.display = "";
  nextBtn.title = "可随时发布季报进入季度结算。";
  if (state.shareholderPressure >= 70 && !state.forcedWarRoomThisQuarter) {
    state.forcedWarRoomThisQuarter = true;
    checkTemptationTriggers();
  }
  document.getElementById("nextQuarterBtn").textContent = "[向华尔街撒谎 (Publish Earnings)]";
  const warroomUnlocked = isWarroomUnlocked();
  const sceneMap = {
    1: ["desk"],
    2: warroomUnlocked ? ["desk", "warroom"] : ["desk"],
    3: warroomUnlocked ? ["desk", "warroom"] : ["desk"],
  };
  document.querySelectorAll('.scene-btn').forEach((btn) => {
    const sc = btn.getAttribute('data-scene');
    btn.style.display = sceneMap[stage].includes(sc) ? '' : 'none';
  });
  if (!sceneMap[stage].includes(state.activeScene)) setActiveScene("desk");

  const exerciseBtn = document.getElementById("exerciseBtn");
  const canExercise = !(state.exercisedThisQuarter || state.personalOptions <= 0);
  exerciseBtn.disabled = !canExercise;
  exerciseBtn.style.display = "";
  exerciseBtn.textContent = "[内幕变现]";
  const routineBtn = document.getElementById("routineBtn");
  if (routineBtn) {
    routineBtn.disabled = state.actionDone;
    routineBtn.style.display = "";
    routineBtn.textContent = state.actionDone ? "[平庸的日常（本季度已执行）]" : "[平庸的日常 (Honest Grinding)]";
  }
  updateUnlockFlags();
  setActiveScene(state.activeScene);
}


function spendAction(reason = "行动") {
  if (state.actionDone) {
    feed(`${reason}失败：本季度核心经营动作已执行。`, "warn");
    return false;
  }
  track("action_taken", { action_type: reason });
  state.actionDone = true;
  return true;
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
  const mtmRoot = document.getElementById("mtmArea");
  const chewcoRoot = document.getElementById("chewcoArea");
  const lobbyRoot = document.getElementById("lobbyArea");
  const mtmIntro = document.getElementById("mtmIntro");
  const chewcoIntro = document.getElementById("chewcoIntro");
  const lobbyIntro = document.getElementById("lobbyIntro");
  if (!mtmRoot || !chewcoRoot || !lobbyRoot) return;

  mtmIntro.textContent = state.mtmDoneThisQuarter || state.mtmRatio > 0
    ? "MTM 不是按钮，而是一份契约：你把未来现金流的想象提前兑现成今天的荣耀。签约后，系统会把原本抽象的代价翻译成可量化仪表盘：SEC 关注、审计独立性、媒体热度与吹哨压力。"
    : "MTM 不是按钮，而是一份契约：你把未来现金流的想象提前兑现成今天的荣耀。它会让董事会短暂安静，也会让监管者在下一季更认真地翻脚注。";
  chewcoIntro.textContent = state.isChewcoUnlocked
    ? "把亏损资产塞进结构化口袋：现金会短暂回暖，证据链会永久增厚。"
    : "Chewco 尚未开启：先把 MTM 比例推高到危险区，系统才会允许你把坏账塞进更深的口袋。";
  lobbyIntro.textContent = state.isLobbyUnlocked
    ? "在规则边缘打蜡抛光：付现金、降热度、买时间。"
    : "Lobby 未解锁：先让风险爬到董事会也开始冒汗，电话簿上的‘老朋友’才会回你消息。";

  mtmRoot.innerHTML = `
    <label for="mtmRatio">MTM 比例：0%（诚实） ↔ 100%（疯狂）</label>
    <input type="range" id="mtmRatio" min="0" max="100" step="5" value="${state.mtmRatio}" />
    <p id="mtmPreview" class="small"></p>
    <p class="small">恶魔邀约·详细条款：你将未来合同的远期利润提前确认为本季收益。短期效果：股价与董事会满意度上升；中期副作用：风险、SEC关注、媒体热度、吹哨压力同步抬升；长期结局：每个漂亮数字都可能在法庭上变成证词。</p>
    <button id="mtmApplyBtn" class="choice-btn" style="background:#7e1e1e;border-color:#d65a5a" ${state.mtmDoneThisQuarter ? "disabled" : ""}>${state.mtmDoneThisQuarter ? "[本季度已签署 MTM]" : "[签署 MTM 方案]"}</button>
  `;

  chewcoRoot.innerHTML = `
    <p class="small">Chewco 分支：典型表外融资动作，适合在现金紧绷但你还想继续讲增长故事时使用。</p>
    <button id="chewcoBtn" class="choice-btn" ${state.isChewcoUnlocked ? "" : "disabled"}>[Chewco 过桥融资]</button>
  `;

  lobbyRoot.innerHTML = `
    <p class="small">Lobby 分支：游说/公关不再与其他行动互斥。你可以在同一季度里既变现、又打卡、再去润滑关系——黑色幽默在于，这确实很像现实。</p>
    <button id="warLobbyBtn" class="choice-btn" ${state.isLobbyUnlocked ? "" : "disabled"}>[Lobby 政策润滑]</button>
  `;

  const slider = document.getElementById("mtmRatio");
  const btn = document.getElementById("mtmApplyBtn");
  const preview = document.getElementById("mtmPreview");
  const renderPreview = () => {
    const ratio = Number(slider.value);
    const lift = ratio / 100;
    preview.textContent = `预计结果：账面利润 +${(120 * lift).toFixed(1)}M｜股价 +${(12 * lift).toFixed(1)}｜风险 +${(14 * lift).toFixed(1)}｜股东压力 -${(20 * lift).toFixed(1)}｜SEC关注 +${(8 * lift).toFixed(1)}`;
  };
  slider.oninput = renderPreview;
  renderPreview();

  document.getElementById("chewcoBtn").onclick = () => { runChewcoBridge(); render(); };
  document.getElementById("warLobbyBtn").onclick = () => openLobbyingModal();

  btn.onclick = () => {
    if (state.mtmDoneThisQuarter) {
      feed("MTM 本季度已执行过一次，请下季度再签。", "warn");
      return;
    }
    const before = snapshotCore();
    state.mtmRatio = Number(slider.value);
    state.isMTMUnlocked = true;
    const lift = state.mtmRatio / 100;
    state.paperGain += 120 * lift;
    state.stock += 12 * lift;
    state.risk += 14 * lift;
    state.secAttention += 8 * lift;
    state.mediaHeat += 5 * lift;
    state.whistleblowerPressure += 4 * lift;
    state.shareholderPressure = Math.max(0, state.shareholderPressure - (20 * lift));
    track("mtm_ratio_set", { ratio: state.mtmRatio });
    state.lastActionSummary = `MTM-${state.mtmRatio}%`;
    state.mtmDoneThisQuarter = true;
    feed(`MTM 已签署：比例 ${state.mtmRatio}%，董事会很满意，未来的你很危险。`, "warn");
    showDelta(before, "MTM 执行结果");
    render();
  };
}

function renderAuditPanel() {
  const root = document.getElementById("auditChoices");
  if (!state.isAuditUnlocked) {
    root.innerHTML = "<p class=\"small\">审计沟通将在风险首次达到 78 时触发一次审计师专项问询并解锁。届时你必须决定：解释、收买，还是启动旋转门。</p>";
    return;
  }
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
    if (state.auditDone || !!o.disabled) return;
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
  if (!root) return;
  root.innerHTML = "";
  const prompt = document.getElementById("callPrompt");
  const deck = analystQuarterDeck[getRotatingKey(analystQuarterDeck, state.quarter)] || analystQuarterDeck[1];
  if (prompt) prompt.textContent = deck.prompt;
  deck.choices.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = opt.label;
    btn.disabled = state.callDone || !state.isSettlingQuarter;
    btn.onclick = () => {
      if (state.callDone) return;
      const before = snapshotCore();
      state.callDone = true;
      opt.effect(state);
      if (opt.ok) {
        state.shareholderPressure = Math.max(0, state.shareholderPressure - 12);
        feed("分析师会后点评：‘故事讲得漂亮，风险也写得漂亮。’", "warn");
      } else {
        state.firedByBoard = state.shareholderPressure >= 95;
        feed("分析师会后点评：‘终于有人说了真话，市场先给了你耳光。’", "bad");
      }
      state.lastCallSummary = opt.label;
      showDelta(before, "分析师问询结果");
      render();
    };
    root.appendChild(btn);
  });
}

function openMandatoryCallModal(onDone) {
  if (state.callDone) {
    onDone();
    return;
  }
  const modal = document.getElementById("callMandatoryModal");
  const prompt = document.getElementById("callMandatoryPrompt");
  const root = document.getElementById("callMandatoryChoices");
  if (!modal || !prompt || !root) {
    onDone();
    return;
  }
  const deck = analystQuarterDeck[getRotatingKey(analystQuarterDeck, state.quarter)] || analystQuarterDeck[1];
  if (!deck || !Array.isArray(deck.choices) || deck.choices.length === 0) {
    feed("分析师会脚本缺失：已跳过问询，继续季度结算。", "warn");
    onDone();
    return;
  }
  prompt.textContent = deck.prompt;
  root.innerHTML = "";
  deck.choices.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = opt.label;
    btn.onclick = () => {
      if (state.callDone) return;
      const before = snapshotCore();
      state.callDone = true;
      opt.effect(state);
      if (opt.ok) {
        state.shareholderPressure = Math.max(0, state.shareholderPressure - 12);
        feed("你完成了华尔街布道：掌声和问询函一起到货。", "warn");
      } else {
        feed("你在华尔街直播了诚实，股价直播了下跌。", "bad");
      }
      state.lastCallSummary = opt.label;
      showDelta(before, "华尔街布道结果");
      modal.classList.add("hidden");
      render();
      onDone();
    };
    root.appendChild(btn);
  });
  modal.classList.remove("hidden");
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
  const stageBucket = state.quarter <= 3 ? "early" : state.quarter <= 8 ? "mid" : "late";
  const eventGuardKey = `evt-${stageBucket}-q${state.quarter}`;
  if (state.triggeredEvents.has(eventGuardKey)) {
    state.randomEventResolved = true;
    onDone();
    return;
  }
  const event = quarterRandomEvents[eventKey];
  const modal = document.getElementById("randomEvent");
  const titleNode = document.getElementById("eventTitle");
  const descNode = document.getElementById("eventDesc");
  const root = document.getElementById("eventChoices");
  if (!event || !modal || !titleNode || !descNode || !root || !Array.isArray(event.choices) || event.choices.length === 0) {
    state.randomEventResolved = true;
    state.triggeredEvents.add(eventGuardKey);
    feed("季度突发事件面板异常：已自动跳过并继续结算。", "warn");
    onDone();
    return;
  }
  titleNode.textContent = event.title;
  descNode.textContent = event.desc;
  root.innerHTML = "";

  event.choices.forEach((c, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = c.label;
    btn.onclick = () => {
      const before = snapshotCore();
      let feedback = "决策已执行，季度将继续推进。";
      try {
        feedback = c.effect.length >= 2 ? c.effect(state, feed) : c.effect(state);
      } catch (err) {
        console.warn("[random-event-choice]", err);
        feed("该决策已记录，但系统反馈渲染异常；流程继续推进。", "warn");
      }
      const keyMap = {
        1: ["insult", "yacht"],
        2: ["transparent", "delay"],
        3: ["deadstar", "fund"],
        4: ["deny", "scapegoat"],
      };
      const summaryKeys = keyMap[eventKey] || ["event-choice-a", "event-choice-b"];
      state.lastEventSummary = summaryKeys[idx] || summaryKeys[0];
      track("random_event_choice", {
        event_title: event.title,
        choice_label: c.label,
      });
      state.randomEventResolved = true;
      state.triggeredEvents.add(eventGuardKey);
      showDelta(before, "季度突发结果");

      descNode.textContent = `选择结果：${feedback || "已执行。"} 已自动进入季度结算。`;
      root.innerHTML = "";
      setTimeout(() => {
        modal.classList.add("hidden");
        render();
        onDone();
      }, 260);
    };
    root.appendChild(btn);
  });
  modal.classList.remove("hidden");
}

function exerciseOptions() {
  if (state.exercisedThisQuarter || state.personalOptions <= 0) {
    feed("本季度期权策略已执行，华尔街也不会给你第二次后悔药。", "warn");
    return;
  }
  const modal = document.getElementById("optionsModal");
  const root = document.getElementById("optionsChoices");
  if (!modal || !root) return;
  root.innerHTML = "";
  const options = [
    { key: "none", label: "A. 不变现（风险 +0，到账 $0）", ratio: 0 },
    { key: "small", label: "B. 小额变现（约 4 份，风险 +2）", ratio: 0.33 },
    { key: "full", label: "C. 大额变现（约 12 份，风险 +5）", ratio: 1 },
  ];
  options.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = o.label;
    btn.onclick = () => {
      if (o.ratio <= 0) {
        state.exercisedThisQuarter = true;
        state.privateAccount += 1;
        state.historyLog.push("期权策略：本季不变现");
        feed("你决定暂不变现：道德感保住了，但你还是悄悄优化了 1M 的离岸税务结构。", "good");
        modal.classList.add("hidden");
        render();
        return;
      }
      const units = Math.max(1, Math.floor(Math.min(12, state.personalOptions) * o.ratio));
      const grossProceeds = units * state.stock * 0.05;
      const liquidityCap = Math.max(20, state.realCash * 0.35);
      const proceeds = Math.min(grossProceeds, liquidityCap);
      state.personalOptions -= units;
      state.privateAccount += proceeds;
      state.realCash -= proceeds * 0.3;
      state.stock -= Math.max(0.3, units * 0.018);
      state.risk += o.key === "full" ? 5 : 2;
      state.mediaHeat += o.key === "full" ? 4 : 2;
      state.exercisedThisQuarter = true;
      state.historyLog.push(`期权变现：${units}份(${formatMoney(proceeds)})`);
      feed(`期权策略执行：${units} 份，到账 ${formatMoney(proceeds)}，风险 +${o.key === "full" ? 5 : 2}。`, "warn");
      modal.classList.add("hidden");
      render();
    };
    root.appendChild(btn);
  });
  modal.classList.remove("hidden");
}

function runLobbying(tier) {
  const before = snapshotCore();
  const cfg = {
    light: { cash: 35, riskPct: 0.14, secCut: 4, mediaCut: 9, text: "轻度游说" },
    mid: { cash: 75, riskPct: 0.22, secCut: 8, mediaCut: 6, text: "中度游说" },
    heavy: { cash: 120, riskPct: 0.32, secCut: 999, mediaCut: 8, text: "重度游说" },
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
  state.historyLog.push(`游说-${cfg.text}：-${formatMoney(cfg.cash)} / 风险-${riskDrop.toFixed(1)}`);
  feed(`${cfg.text}执行：支付 ${formatMoney(cfg.cash)}，风险下降 ${riskDrop.toFixed(1)}。`, "good");
  showDelta(before, `${cfg.text}结果`);
  render();
}

function openLobbyingModal() {
  if (!state.isLobbyUnlocked) {
    feed("Lobby 尚未解锁：风险超过 70 后可使用。", "warn");
    return;
  }
  const modal = document.getElementById("lobbyingModal");
  const root = document.getElementById("lobbyingChoices");
  root.innerHTML = "";
  const options = [
    { tier: "light", label: "轻度游说（现金 -$35M / 风险明显回落）" },
    { tier: "mid", label: "中度游说（现金 -$75M / 风险与SEC双降）" },
    { tier: "heavy", label: `重度游说（现金 -$120M / 冻结 SEC 进度，本局限一次）${state.heavyLobbyUsed ? "【已用】" : ""}` },
  ];
  options.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = o.label;
    if (o.tier === "heavy" && state.heavyLobbyUsed) return;
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
  if (state.risk >= 120) {
    feed("SEC 绞索已收紧到临界值，市场在结算前已触发踩踏。", "bad");
    state.isSettlingQuarter = false;
    endGame();
    return;
  }
  const preStock = state.stock;
  state.secAttention += Math.min(10, 2 + state.risk * 0.05 + state.mediaHeat * 0.015);
  if (state.paperGain < state.marketExpectedGain) {
    const gap = state.marketExpectedGain - state.paperGain;
    const missRatio = gap / Math.max(1, state.marketExpectedGain);
    const drop = Math.max(4, Math.min(16, 3.5 + gap / 24));
    state.stock -= drop;
    state.risk += 3 + Math.min(3, missRatio * 10);
    state.mediaHeat += 4 + Math.min(4, missRatio * 10);
    state.shareholderPressure = Math.min(100, state.shareholderPressure + 8 + Math.min(12, missRatio * 30));
    feed(`披露利润低于市场预期，股价下跌 ${drop.toFixed(1)} 点，董事会要求你下季度‘必须交答案’。`, "warn");
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

  const growthRate = (state.stock - preStock) / Math.max(1, preStock) * 100;
  let pressureDelta = -10;
  if (growthRate < 0) pressureDelta = 16;
  else if (growthRate < 5) pressureDelta = 13;
  else if (growthRate < 10) pressureDelta = 10;
  state.shareholderPressure = Math.min(100, Math.max(0, state.shareholderPressure + pressureDelta));
  if (state.mtmRatio > 0) state.risk += (state.mtmRatio / 100) * 8;
  state.boardPatience = Math.max(0, 100 - state.shareholderPressure);
  state.stockDropStreak = state.stock < preStock ? state.stockDropStreak + 1 : 0;
  if (state.stockDropStreak >= 2 && state.stock <= 26) {
    state.firedByBoard = true;
    endGame();
    return;
  }
  if (state.boardUltimatum > 0) {
    state.boardUltimatum -= 1;
    if (state.boardUltimatum === 0) {
      state.firedByBoard = true;
      endGame();
      return;
    }
  }
  emitHook("afterQuarterSettle", { quarter: state.quarter });
  if (state.shareholderPressure >= 100 || state.boardPatience <= 0) {
    state.isSettlingQuarter = false;
    state.firedByBoard = true;
    endGame();
    return;
  }

  if (state.quarter === GAME_CONFIG.maxQuarter) {
    state.isSettlingQuarter = false;
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
  state.forcedWarRoomThisQuarter = false;
  state.mtmDoneThisQuarter = false;
  emitHook("beforeQuarterStart", { quarter: state.quarter });
  track("quarter_start", { quarter: state.quarter });
  feed("[季度财务快报] 华尔街为我们的‘成长’欢呼，尽管你的金库已经空得能听到回声。", "warn");
  state.isSettlingQuarter = false;
  render();
  checkTemptationTriggers();
}

function checkTemptationTriggers() {
  const dissatisfaction = 100 - state.boardPatience;
  const nextSpeInterest = state.speDebtLots.reduce((sum, lot) => sum + (lot.amount * Math.pow(1.1, Math.max(1, (state.quarter + 1) - lot.bornQuarter + 1))), 0);
  const conditionA = dissatisfaction > 70;
  const conditionB = state.stockDropStreak >= 2;
  const conditionC = state.realCash < nextSpeInterest;
  if (state.quarter < 4) return;
  if (!state.isMTMUnlocked) return;
  if (!(conditionA || conditionB || conditionC || state.boardPatience < 30)) return;
  if (state.mtmPopupTriggered) return;
  if (!isWarroomUnlocked()) return;
  state.mtmPopupTriggered = true;
  setActiveScene("warroom");
  const modal = document.getElementById("mtmPopup");
  const desc = document.getElementById("mtmPopupDesc");
  desc.textContent = "董事会把你推进密室：‘要么增长，要么离职。’你想到 MTM，但这一步不会自动执行。你需要去 MTM 分支手动选择比例并签字。顺带一提——当你决定和恶魔签契约后，系统会把原本抽象的代价可视化：SEC 关注、审计独立性、媒体热度与吹哨压力，都会变成可量化的数字。";
  document.getElementById("mtmSignBtn").onclick = () => {
    feed("你接受了‘考虑 MTM’这件事，但还没签字。真正执行请在 MTM 分支手动选择比例。", "warn");
    modal.classList.add("hidden");
    setActiveScene("warroom");
    render();
  };
  document.getElementById("mtmRejectBtn").onclick = () => {
    state.boardUltimatum = Math.max(state.boardUltimatum, 1);
    feed("你暂时拒绝密室方案：董事会给出最后通牒（1 季度内给增长答案）。", "bad");
    modal.classList.add("hidden");
    setActiveScene("desk");
    render();
  };
  modal.classList.remove("hidden");
}

function progressQuarter() {
  if (state.isSettlingQuarter) return;
  state.isSettlingQuarter = true;
  track("publish_clicked", { action_done: state.actionDone });
  if (!state.actionDone) feed("你提前发布了季报：华尔街喜欢速度，不喜欢真相。", "warn");
  const settleOnce = (() => {
    let done = false;
    return () => {
      if (done) return;
      done = true;
      settleQuarterCore();
    };
  })();
  const callOnce = (() => {
    let done = false;
    return () => {
      if (done) return;
      done = true;
      openMandatoryCallModal(settleOnce);
    };
  })();
  try {
    resolveQuarterRandomEvent(callOnce);
  } catch (err) {
    console.warn("[progress-quarter]", err);
    feed("季度推进遇到异常：已跳过突发事件并继续结算。", "warn");
    callOnce();
  }
}

function settleQuarter() {
  progressQuarter();
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
  let endingGrade = "C";
  if (state.risk >= 120 || (state.secAttention > 98 && state.privateAccount < 260)) {
    ending = ["F级：联邦监狱的明星", "你将在监狱里教狱警如何通过 SPE 偷走食堂的经费。"];
    endingGrade = "F";
  } else if (state.quarter >= GAME_CONFIG.maxQuarter && state.privateAccount > 320 && state.risk < 65) {
    ending = ["S级：华尔街的隐形教父", "公司灰飞烟灭，你却在私人海滩上思考下一次投资。"];
    endingGrade = "S";
  } else if (state.quarter >= GAME_CONFIG.maxQuarter && state.privateAccount > 60 && state.risk < 95) {
    ending = ["A级：体面的流亡者", "虽然背负骂名，但离岸账户的数字足以让你在欧洲过上贵族生活。"];
    endingGrade = "A";
    state.prisonYears = Math.max(0, Math.min(state.prisonYears, 2));
  } else if (state.firedByBoard) {
    if (state.privateAccount >= 140 && state.prisonYears === 0) {
      ending = ["B级：明智下船", "你在董事会投票前完成了体面离场：公司留下烂账，你带着现金和律师团队先走。"];
    } else {
      ending = ["B级：安全被解雇", "HR 把你的工牌收走了，但联邦执法还没来敲门。你失去了头衔，保住了自由。"];
    }
    endingGrade = "B";
    state.prisonYears = 0;
  } else {
    ending = ["C级：破产名流", "公司破产重组，你成了财经节目常驻嘉宾：名声很响，资产很薄。"];
    endingGrade = "C";
    if (state.risk < 45 && state.secAttention < 55) {
      state.prisonYears = 0;
    }
  }

  const failureFlavor = state.risk >= 120
    ? "失败简报：SEC 突击检查了休斯顿总部，碎纸机因为过热而停机了。"
    : state.secAttention > 98
      ? "失败简报：调查在清晨同步落地，你的法务团队先看到了手铐。"
      : "失败简报：卖盘先于公告，市场替检察官写好了起诉提纲。";

  const failureTitle = state.risk >= 120
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
    ending[0].startsWith("F级") ? failureFlavor : (endingGrade === "B" ? "离场简报：你没有赢下神话，但成功把沉船时点调到了自己之后。" : "逃生简报：你把崩塌留给公司，把流动性留给自己。"),
    ending[0].startsWith("F级") ? failureTitle : (endingGrade === "B" ? "头衔：幸存主义职业经理人" : "头衔：成功的骗子"),
    satiricalJudge,
  ];

  title.textContent = ending[0];
  desc.textContent = ending[1];
  debrief.innerHTML = `<h3>结局复盘</h3><ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>`;
  score.textContent = `私人账户 ${formatMoney(state.privateAccount)} · 风险 ${Math.round(state.risk)} · 股价 $${state.stock.toFixed(1)} · SEC ${Math.round(state.secAttention)} · 入狱 ${state.prisonYears} 年`;
  overlay.classList.remove("hidden");
  overlay.classList.remove("ending-success", "ending-fail");
  overlay.classList.add(ending[0].startsWith("S级") ? "ending-success" : "ending-fail");
  track("ending_reached", {
    grade: endingGrade,
    quarter: state.quarter,
    risk: Math.round(state.risk),
    offshore: Number(state.privateAccount.toFixed(2)),
  });
  state.isSettlingQuarter = false;
}

function ensureInteractivePanels() {
  const mtmRoot = document.getElementById("mtmArea");
  if (mtmRoot && mtmRoot.querySelectorAll("button").length === 0) renderActionPanel();
}

function render() {
  renderMetrics();
  renderQuarterStatus();
  renderInvestigationPanel();
  renderActionPanel();
  ensureInteractivePanels();
  renderAuditPanel();
  const reportNode = document.getElementById("report");
  if (!reportNode.textContent) reportNode.textContent = generateReportText();
  renderTicker();
  shakeStockMetric();
  updateDangerEffects();
  syncBootModalVisibility();
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
    state.quarter = Math.max(1, Math.min(GAME_CONFIG.maxQuarter, Number(state.quarter) || 1));
    state.forcedWarRoomThisQuarter = !!data.forcedWarRoomThisQuarter;
    state.shareholderPressure = typeof data.shareholderPressure === "number" ? data.shareholderPressure : 50;
    state.isMTMUnlocked = !!data.isMTMUnlocked;
    state.isAuditUnlocked = !!data.isAuditUnlocked;
    state.isLobbyUnlocked = !!data.isLobbyUnlocked;
    state.isChewcoUnlocked = !!data.isChewcoUnlocked;
    state.mtmRatio = data.mtmRatio || 0;
    state.mtmDoneThisQuarter = !!data.mtmDoneThisQuarter;
    state.phaseTab = data.phaseTab || "overview";
    state.isSettlingQuarter = false;
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
  getTelemetry: () => [...telemetry],
  clearTelemetry: () => { telemetry.length = 0; },
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
  if (!spendAction("平庸的日常")) return;
  state.realCash *= 1.05;
  state.stock *= 1.02;
  state.paperGain += 5;
  state.privateAccount += 1;
  state.shareholderPressure = Math.min(100, state.shareholderPressure + 4);
  state.consecutiveNormalOps += 1;
  state.lastActionSummary = "日常打卡";
  feed("天然气管道巡检完成，效率提升 0.2%。", "warn");
  setActiveScene("desk");
  render();
}

document.getElementById("nextQuarterBtn").addEventListener("click", settleQuarter);
document.getElementById("exerciseBtn").addEventListener("click", exerciseOptions);
document.getElementById("routineBtn").addEventListener("click", doRoutineCheckin);
function dismissQuarterQuote() {
  const modal = document.getElementById("quoteModal");
  if (!modal) return;
  modal.classList.add("hidden");
  state.quoteShownForQuarter = state.quarter;
  saveGame();
}

const closeQuoteBtn = document.getElementById("closeQuoteBtn");
if (closeQuoteBtn) closeQuoteBtn.addEventListener("click", dismissQuarterQuote);

const quoteModal = document.getElementById("quoteModal");
if (quoteModal) {
  quoteModal.addEventListener("click", (e) => {
    if (e.target === quoteModal) dismissQuarterQuote();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const modal = document.getElementById("quoteModal");
  if (modal && !modal.classList.contains("hidden")) dismissQuarterQuote();
});

loadGame();
feed("议程启动：利润可以先到，后果会准时到。", "warn");
feed("提示：每个选项都给出‘现实后果标签’，请留意 SEC、媒体、吹哨三条线。", "good");
wireSceneButtons();
wirePhaseTabs();
render();

const bootBtn = document.getElementById("bootEnterBtn");
if (bootBtn) {
  bootBtn.addEventListener("click", window.startTerminal);
}


const restartBtn = document.getElementById("restartGameBtn");
if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    localStorage.removeItem(GAME_CONFIG.saveKey);
    location.reload();
  });
}

const quickRestartBtn = document.getElementById("quickRestartBtn");
if (quickRestartBtn) {
  quickRestartBtn.addEventListener("click", () => {
    localStorage.removeItem(GAME_CONFIG.saveKey);
    location.reload();
  });
}

setInterval(() => { state.tickerClock += 1; renderTicker(); }, 5000);
