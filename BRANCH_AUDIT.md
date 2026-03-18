# Branch Audit

## Baseline
- `codex/check-and-fix-game-state-consistency`
- Reason: this is the latest playable implementation and contains the full static game.

## Disposition
- `main`: replace with the baseline branch content because the current `main` is only the initial commit.
- `codex/update-game-per-prd-specifications`: keep as historical reference only; already contained in the baseline history.
- `codex/design-digital-horror-game-on-enron`: keep as historical reference only; already contained in the baseline history.
- `codex/design-arg-game-mechanics`: keep as a separate exploratory rewrite branch; do not merge into the current baseline.

## Verification Notes
- The current baseline loads from `index.html` without a build step.
- Browser verification reached the boot flow and post-login quote modal, confirming the game initializes successfully.
