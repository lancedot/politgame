# 安然：炼金术士的账本 (ENRON: The Alchemist's Ledger)

## 运行
直接打开 `index.html`。

## 已修复与当前行为
- 重新开始游戏会清除本地存档（`enron_save_v2`），确保从 Q1 重新开始。
- 历史事件对照按季度数据逐步解锁，不再无条件循环显示。
- “季度战情”统一在三个标签页内展示：
  - 战情总览
  - 行动规则
  - 发布季报

## 阶段化开启逻辑（The Gated Progression）
- 第一阶段（Q1-Q3）：Office + Press。
- 第二阶段（Q4-Q8）：War Room 开启。
- 第三阶段（Q9-Q12）：审计/游说/Chewco 按风险与现金条件逐步解锁。

## 调试
- `window.debug(patch)`
- `window.gameApi`
