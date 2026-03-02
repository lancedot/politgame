window.GAME_CONTENT = {
  maxQuarter: 4,
  openingNarrative:
    "You are the CFO. Every quarter you must balance growth optics, regulatory exposure, and personal incentive before the market judges your story.",
  eventPool: [
    {
      id: "rev-recognition",
      title: "Aggressive Revenue Recognition",
      description:
        "Sales asks to pull next-quarter enterprise contracts into this quarter's books.",
      choices: [
        {
          text: "Approve now to beat guidance",
          effects: { growth: 16, risk: 14, integrity: -12, personal: 8 },
          log: "You booked future contracts early. Analysts cheer, compliance quietly worries."
        },
        {
          text: "Partially approve with legal review",
          effects: { growth: 8, risk: 5, integrity: -2, personal: 3 },
          log: "You split the difference: smoother optics, moderate paper trail risk."
        },
        {
          text: "Reject and report conservative numbers",
          effects: { growth: -6, risk: -8, integrity: 9, personal: -2 },
          log: "You held the line. Short-term pressure rises, but controls strengthen."
        }
      ]
    },
    {
      id: "spe-financing",
      title: "Off-Balance-Sheet Structure",
      description:
        "Investment banking proposes a structured vehicle to hide debt and protect EPS.",
      choices: [
        {
          text: "Use full structure and move liabilities out",
          effects: { growth: 12, risk: 18, integrity: -16, personal: 7 },
          log: "Leverage vanished from core statements. So did transparency."
        },
        {
          text: "Use reduced structure with disclosure note",
          effects: { growth: 6, risk: 7, integrity: -4, personal: 2 },
          log: "You retain flexibility but leave breadcrumbs for scrutiny."
        },
        {
          text: "Decline structure, deleverage openly",
          effects: { growth: -5, risk: -10, integrity: 11, personal: -1 },
          log: "Painful now, but rating agencies trust your governance more."
        }
      ]
    },
    {
      id: "bonus-cycle",
      title: "Executive Bonus Committee",
      description:
        "Compensation committee links your package to quarter-end growth targets.",
      choices: [
        {
          text: "Lobby for growth-first metrics",
          effects: { growth: 10, risk: 9, integrity: -8, personal: 12 },
          log: "Your compensation surges with valuation optics, ethics team objects."
        },
        {
          text: "Adopt mixed metrics with compliance weighting",
          effects: { growth: 4, risk: 2, integrity: 4, personal: 4 },
          log: "Balanced incentives improve governance without killing ambition."
        },
        {
          text: "Freeze bonus until audit cycle closes",
          effects: { growth: -3, risk: -7, integrity: 9, personal: -8 },
          log: "Shareholders respect restraint, but your personal upside shrinks."
        }
      ]
    },
    {
      id: "whistleblower",
      title: "Whistleblower Alert",
      description:
        "Internal audit receives an anonymous complaint about booking assumptions.",
      choices: [
        {
          text: "Contain issue internally and move fast",
          effects: { growth: 7, risk: 15, integrity: -14, personal: 5 },
          log: "The report was buried. If discovered later, fallout could be severe."
        },
        {
          text: "Open limited independent review",
          effects: { growth: 1, risk: 4, integrity: 3, personal: 1 },
          log: "You bought time and created a formal process with manageable cost."
        },
        {
          text: "Escalate fully to board audit committee",
          effects: { growth: -6, risk: -12, integrity: 14, personal: -3 },
          log: "Governance strengthens and legal exposure drops despite short-term drag."
        }
      ]
    }
  ]
};
