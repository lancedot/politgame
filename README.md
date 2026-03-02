# 安然：炼金术士的账本 (ENRON: The Alchemist's Ledger)

“利润是伟大的虚构，现金是凡人的诅咒，而法律，是我们早已对冲掉的风险。”

## 运行
直接打开 `index.html` 即可。

## 本次重构（回合驱动）
- 每季度引入 **2 点行动点（AP）**。
- Office 常驻动作（打卡/游说/内幕变现）会消耗 AP。
- 点击 **[向华尔街撒谎 (Publish Earnings)]** 进入季报结算；AP 也会在季度推进时重置。
- 当董事会绞索过低（<30）时，会自动诱导进入 War Room 决策弹窗。

## 场景划分
- 【权力核心：CFO 办公室】
- 【密室决策：暗箱实验室】
- 【聚光灯下：华尔街布道】

## 文案替换
- 风险值：`SEC 绞索紧度 (Noose Tightness)`
- 个人资产：`避税天堂余额 (Offshore Account)`
- 结束季度按钮：`[向华尔街撒谎 (Publish Earnings)]`
- 日常经营按钮：`[平庸的日常 (Honest Grinding)]`

## 视觉与交互
- MTM 按钮新增悬停 Cheat Sheet 提示。
- 结局页改为黑底金字风格，并按成败显示不同视觉提示（破碎支票 / 开曼机票）。

## 调试
- `window.debug(patch)`
- `window.gameApi`
