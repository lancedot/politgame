(() => {
  const STORAGE_KEY = "politgame-save-v1";

  const elements = {
    hud: document.getElementById("hud"),
    roundNarrative: document.getElementById("roundNarrative"),
    eventCard: document.getElementById("eventCard"),
    decisionActions: document.getElementById("decisionActions"),
    logList: document.getElementById("logList"),
    saveBtn: document.getElementById("saveBtn"),
    loadBtn: document.getElementById("loadBtn"),
    newGameBtn: document.getElementById("newGameBtn"),
    summaryDialog: document.getElementById("summaryDialog"),
    summaryText: document.getElementById("summaryText"),
    restartBtn: document.getElementById("restartBtn")
  };

  const createInitialState = () => ({
    quarter: 1,
    growth: 50,
    risk: 20,
    integrity: 60,
    personal: 35,
    log: ["The year begins. Board expects both growth and discipline."],
    usedEventIds: [],
    currentEventId: null,
    gameOver: false
  });

  let state = createInitialState();

  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  function pickEvent() {
    const available = window.GAME_CONTENT.eventPool.filter(
      (event) => !state.usedEventIds.includes(event.id)
    );
    if (available.length === 0) {
      return null;
    }
    const event = available[Math.floor(Math.random() * available.length)];
    state.currentEventId = event.id;
    return event;
  }

  function getCurrentEvent() {
    return (
      window.GAME_CONTENT.eventPool.find((event) => event.id === state.currentEventId) ||
      null
    );
  }

  function renderHud() {
    elements.hud.innerHTML = `
      <div class="metric"><span>Quarter</span><strong>${state.quarter}/${window.GAME_CONTENT.maxQuarter}</strong></div>
      <div class="metric"><span>Growth Narrative</span><strong>${state.growth}</strong></div>
      <div class="metric"><span>Regulatory Risk</span><strong>${state.risk}</strong></div>
      <div class="metric"><span>Governance Integrity</span><strong>${state.integrity}</strong></div>
      <div class="metric"><span>Personal Gain</span><strong>${state.personal}</strong></div>
    `;
  }

  function renderLog() {
    elements.logList.innerHTML = "";
    state.log.slice(-8).reverse().forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = entry;
      elements.logList.appendChild(li);
    });
  }

  function renderEvent() {
    const event = getCurrentEvent();
    if (!event) {
      elements.eventCard.innerHTML = "<p>No event loaded.</p>";
      elements.decisionActions.innerHTML = "";
      return;
    }

    elements.eventCard.innerHTML = `
      <h3>${event.title}</h3>
      <p>${event.description}</p>
    `;

    elements.decisionActions.innerHTML = "";
    event.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${index + 1}. ${choice.text}`;
      button.addEventListener("click", () => applyChoice(choice));
      elements.decisionActions.appendChild(button);
    });
  }

  function render() {
    renderHud();
    renderEvent();
    renderLog();
  }

  function advanceQuarter() {
    if (state.quarter >= window.GAME_CONTENT.maxQuarter) {
      state.gameOver = true;
      showSummary();
      return;
    }

    state.quarter += 1;
    state.currentEventId = null;
    const nextEvent = pickEvent();
    if (!nextEvent) {
      state.gameOver = true;
      showSummary();
      return;
    }
    elements.roundNarrative.textContent = `Quarter ${state.quarter}: Investor pressure rises while investigators connect more dots.`;
    render();
  }

  function applyChoice(choice) {
    if (state.gameOver) {
      return;
    }

    state.growth = clamp(state.growth + choice.effects.growth);
    state.risk = clamp(state.risk + choice.effects.risk);
    state.integrity = clamp(state.integrity + choice.effects.integrity);
    state.personal = clamp(state.personal + choice.effects.personal);

    if (state.currentEventId) {
      state.usedEventIds.push(state.currentEventId);
    }

    state.log.push(`Q${state.quarter}: ${choice.log}`);

    if (state.risk >= 85 && state.integrity <= 25) {
      state.gameOver = true;
      state.log.push("Emergency filing triggered. The board launches a crisis investigation.");
      showSummary();
      return;
    }

    advanceQuarter();
  }

  function getEnding() {
    const score = state.growth + state.personal - state.risk + state.integrity;
    if (state.risk >= 85) {
      return "Regulators intervene. Short-term wins collapse under legal pressure.";
    }
    if (score >= 180) {
      return "You delivered durable performance: moderate growth, low risk, and strong governance credibility.";
    }
    if (state.personal >= 75 && state.integrity < 40) {
      return "You got rich, but audit flags define your legacy.";
    }
    return "You survived the year, but unresolved tensions suggest future instability.";
  }

  function showSummary() {
    renderHud();
    renderLog();
    elements.eventCard.innerHTML = "<p>Year concluded.</p>";
    elements.decisionActions.innerHTML = "";
    elements.summaryText.textContent = `${getEnding()} Final metrics — Growth ${state.growth}, Risk ${state.risk}, Integrity ${state.integrity}, Personal ${state.personal}.`;
    elements.summaryDialog.showModal();
  }

  function newGame() {
    state = createInitialState();
    const event = pickEvent();
    elements.roundNarrative.textContent = window.GAME_CONTENT.openingNarrative;
    if (!event) {
      state.gameOver = true;
      elements.roundNarrative.textContent = "No events configured.";
    }
    if (elements.summaryDialog.open) {
      elements.summaryDialog.close();
    }
    render();
  }

  function saveGame() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    state.log.push("Progress saved locally.");
    renderLog();
  }

  function loadGame() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.log.push("No save data found.");
      renderLog();
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      state = { ...createInitialState(), ...parsed };
      if (!state.currentEventId && !state.gameOver) {
        pickEvent();
      }
      elements.roundNarrative.textContent = `Quarter ${state.quarter}: Loaded from local save.`;
      render();
    } catch (error) {
      state.log.push("Save data is corrupted and could not be loaded.");
      renderLog();
    }
  }

  elements.saveBtn.addEventListener("click", saveGame);
  elements.loadBtn.addEventListener("click", loadGame);
  elements.newGameBtn.addEventListener("click", newGame);
  elements.restartBtn.addEventListener("click", newGame);

  newGame();
})();
