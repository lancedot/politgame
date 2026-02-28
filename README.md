# politgame - CFO Roguelike MVP

一个以 **CFO 决策** 为核心的肉鸽式经营模拟原型。每回合（季度）玩家需要阅读三大报表，识别财务问题，并在现金、增长、合规三角压力下推进公司冲击 IPO。

## MVP 设计摘要

- 核心循环：看报表 → 做决策（AP）→ 触发季度漂移/事件 → 三表重算 → 解锁高级决策。
- 三表联动：利润表（P&L）、资产负债表（BS）、现金流量表（CF）通过同一套状态计算，保证一致性。
- 决策分层：
  - 常规决策：融资、收款、应付、营销、内控等
  - 洞察解锁：例如“利润为正但经营现金流为负 + DSO 偏高”解锁应收专项治理
- 背景差异：投行 / 国企 / 四大三种开局，影响季度漂移与风险压力。

## 当前已实现（代码）

- `createInitialState`：创建可直接游玩的初始局面。
- `playTurn`：按行动点执行决策，应用季度漂移，重算三表和指标，执行解锁规则。
- `getAvailableDecisions`：返回当前可用决策。
- `getGameOutcome`：判定 ongoing / ipo / cash_crash / compliance_blowup。
- 财务校验：每回合检查 `Assets = Liabilities + Equity`。

## 目录结构

```text
src/
  core/
    content/      # 背景与决策配置
    engine/       # 回合推进、解锁逻辑
    finance/      # 三表与指标计算
    models/       # 类型定义
tests/
  engine.spec.ts  # 核心回合与校验测试
```

## 快速开始

```bash
npm install
npm test
npm run build
```

## 下一步建议

1. 增加事件卡池（通用/背景/行业）并引入多选项分支。
2. 增加董事会目标系统，将 KPI 失败作为独立失败条件。
3. 接入前端 UI（报表面板、趋势图、决策卡）与回合日志可视化。
