# politgame

Single-page browser narrative strategy prototype: play as a CFO across quarterly cycles balancing growth optics, regulatory risk, and personal gain.

## Run

Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Loop

- Each quarter presents one event with three decisions.
- Decisions update four metrics: Growth, Risk, Integrity, Personal.
- Game settles at year-end (Q4) or earlier under crisis conditions.
- Save/load uses browser `localStorage`.
