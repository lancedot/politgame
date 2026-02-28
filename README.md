# politgame - CFO Roguelike MVP

一个可直接在浏览器运行的 **CFO 肉鸽网页原型**：
玩家通过阅读三大报表（利润表 / 资产负债表 / 现金流量表）识别财务问题，并在现金、增长、合规三角压力下推进公司冲击 IPO。

## 已实现内容

- **网页可玩版本**（`index.html` + `app.js` + `styles.css`）：
  - 背景选择：投行 / 国企 / 四大
  - 回合推进：每回合 2 AP 选择决策后结算
  - 三表展示：P&L、BS、CF + 财务诊断指标
  - 决策解锁：根据报表问题解锁高级决策（如应收专项治理、债务重组）
  - 结局判断：IPO / 现金流断裂 / 合规爆雷
- **核心引擎 TypeScript 版本**（`src/core/**`）保留用于后续工程化迁移。

## 前端风格

采用深色玻璃拟态（Glassmorphism）+ 霓虹渐变点缀，保证“高级感”的管理驾驶舱观感。

## 快速运行

```bash
python3 -m http.server 4173
# 浏览器访问 http://localhost:4173
```

## 工程目录

```text
index.html        # 网页 UI 结构
styles.css        # 高级感视觉样式
app.js            # 前端游戏逻辑（可直接运行）
src/core/**       # TypeScript 引擎与数据结构（后续可接 React）
```

## 下一步建议

1. 把 `app.js` 的逻辑迁移到 `src/core`，再接入 React 面板。
2. 增加事件卡池（行业池 / 背景池）与业务沟通解锁链。
3. 增加董事会目标系统与局内复盘页面。
