window.GAME_CONTENT = {
  statusLabels: {
    price: "华尔街估值 (Market Cap/Price)",
    cash: "金库头寸 (Actual Liquidity)",
    paper: "叙事利润 (Narrative Earnings)",
    risk: "SEC 绞索 (Regulatory Noose)",
    quarter: "生存周期 (Fiscal Quarter)",
  },
  buttons: {
    mtm: "[重估未来价值]",
    spe: "[启动表外融资方案]",
    auditFee: "[支付‘审计咨询费’]",
    nextQuarter: "[发布季度财报]",
    exercise: "[紧急处置个人期权]",
    routine: "[日常业务打卡]",
  },
  events: {
    1: {
      title: "【时间的炼金术】",
      desc: "为什么要等20年才能拿到那笔天然气款项？那是穷人的思维。现在只要在Excel里改一个折现率，我们就是本年度全美最赚钱的公司。",
      choices: [
        { label: "[执行激进 MTM]（账面利润+$300M，股价+$10，风险+15）", effect: (st, feed) => { st.paperGain += 300; st.stock += 10; st.risk += 15; const msg = "你把未来收益提前端上桌，董事会鼓掌，审计沉默。"; feed(msg, "warn"); return msg; } },
        { label: "[维持传统会计]（董事会耐心-30，现金+$50M）", effect: (st, feed) => { st.boardPatience = Math.max(0, st.boardPatience - 30); st.realCash += 50; const msg = "你守住了真实经营，市场却只看隔壁的增长故事。"; feed(msg, "good"); return msg; } },
      ],
    },
    2: {
      title: "【切科（Chewco）的诞生】",
      desc: "资产负债表就像裙摆，太长了会显得笨重。让我们把那些该死的债务挪到一个只有我们知道的‘抽屉’里去。",
      choices: [
        { label: "[建立离岸壳公司]（隐藏债务$500M，股价+$15，风险+20）", effect: (st, feed) => { st.debt += 500; st.speDebtLots.push({ amount: 500, bornQuarter: st.quarter }); st.stock += 15; st.risk += 20; const msg = "抽屉关上了，问题被挪走了，利息只是未来的事。"; feed(msg, "warn"); return msg; } },
        { label: "[如实披露债务]（股价下跌，触发董事会罢免预警）", effect: (st, feed) => { st.stock -= 12; st.boardPatience = Math.max(0, st.boardPatience - 22); const msg = "你选择说真话，市场先惩罚了你。"; feed(msg, "bad"); return msg; } },
      ],
    },
    3: {
      title: "【死星计划 (Project Death Star)】",
      desc: "加州人不需要24小时吹空调，但我们需要24小时的利润。告诉电厂：‘今天设备由于天气原因需要带薪休假’。",
      choices: [
        { label: "[人为制造断电]（现金+$600M，SEC+40，股价暴涨）", effect: (st, feed) => { st.realCash += 600; st.secAttention += 40; st.stock += 20; st.risk += 25; const msg = "市场欢呼利润，州政府准备追责。"; feed(msg, "bad"); return msg; } },
        { label: "[正常供电]（现金流压力增加，错过暴利期）", effect: (st, feed) => { st.realCash -= 60; st.boardPatience = Math.max(0, st.boardPatience - 10); const msg = "你保住了底线，也错过了暴利窗口。"; feed(msg, "good"); return msg; } },
      ],
    },
    4: {
      title: "【审计师的‘退休金’】",
      desc: "那个安达信的合伙人最近眼神不对。别紧张，给他一个安然高级副总裁的职位，他就会明白：数字的定义权掌握在朋友手里。",
      choices: [
        { label: "[提供旋转门职位]（现金-100M，风险-40，审计独立性永久下降）", effect: (st, feed) => { st.realCash -= 100; st.risk = Math.max(0, st.risk - 40); st.auditIndependence = Math.max(0, st.auditIndependence - 35); st.rotationDoorShield = true; const msg = "你买下了安静，也买下了更深的不透明。"; feed(msg, "warn"); return msg; } },
        { label: "[硬杠审计]（保留意见，股价雪崩）", effect: (st, feed) => { st.stock -= 25; st.secAttention += 12; st.risk += 12; const msg = "保留意见落地，卖盘先于公告出门。"; feed(msg, "bad"); return msg; } },
      ],
    },
    6: {
      title: "【光纤里的海市蜃楼】",
      desc: "谁在乎有没有人用我们的宽带？只要我们和百视通签一份20年的空头合同，华尔街就会觉得我们是下一个谷歌。",
      choices: [
        { label: "[虚构长期合同]（账面利润+$800M，股价+$30，利息成本激增）", effect: (st, feed) => { st.paperGain += 800; st.stock += 30; st.debt += 260; st.speDebtLots.push({ amount: 260, bornQuarter: st.quarter }); st.risk += 24; const msg = "故事足够大时，脚注没人读。"; feed(msg, "warn"); return msg; } },
      ],
    },
    9: {
      title: "【多米诺骨牌的颤抖】",
      desc: "股价跌了。那些作为债务担保的股票现在成了勒死我们的绳索。我们需要更多的假账，或者……更多的现金。",
      choices: [
        { label: "[加大 SPE 杠杆]（续命一季，风险+50，利息翻倍）", effect: (st, feed) => { st.realCash += 180; st.debt += 380; st.speDebtLots.push({ amount: 380, bornQuarter: st.quarter }); st.risk += 50; const msg = "你续命了一个季度，也把后路点着了。"; feed(msg, "bad"); return msg; } },
        { label: "[宣布坏账减值]（股价腰斩，游戏提前结束）", effect: (st, feed) => { st.stock *= 0.5; st.boardPatience = 0; const msg = "减值公告落地，董事会当场切割你。"; feed(msg, "bad"); return msg; } },
      ],
    },
    12: {
      title: "【碎纸机的绝唱】",
      desc: "FBI已经在楼下了。碎纸机因为过热已经冒烟了。你是选择把最后一份文件塞进去，还是点火抽最后一根雪茄？",
      choices: [
        { label: "[极速套现离场]（个人资产+$200M，风险+100）", effect: (st, feed) => { st.privateAccount += 200; st.risk += 100; const msg = "你把最后一张船票塞进了口袋。"; feed(msg, "warn"); return msg; } },
        { label: "[等待法槌敲响]（F判定）", effect: (st, feed) => { st.risk = 140; st.secAttention = 100; const msg = "你留在原地，等待门外的脚步声。"; feed(msg, "bad"); return msg; } },
      ],
    },
  },
};
