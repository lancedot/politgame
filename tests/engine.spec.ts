import { describe, expect, it } from "vitest";
import { createInitialState, getAvailableDecisions, playTurn } from "../src/core/engine/turnEngine";

describe("financial engine", () => {
  it("keeps balance sheet balanced after a turn", () => {
    const state = createInitialState("big_four");
    const next = playTurn(state, ["compliance_audit", "tighten_collection"]);
    const diff = Math.abs(next.statements.bs.assets - (next.statements.bs.liabilities + next.statements.bs.equity));
    expect(diff).toBeLessThan(1e-6);
  });

  it("unlocks AR task force when profit-cash mismatch + high dso appears", () => {
    let state = createInitialState("investment_banker");
    state = playTurn(state, ["increase_marketing", "delay_payables"]);
    state = playTurn(state, ["increase_marketing", "delay_payables"]);

    const ids = getAvailableDecisions(state).map((d) => d.id);
    expect(ids).toContain("ar_task_force");
  });
});
