/**
 * js/app.js - Connects GameState to the DOM
 */

// Educational Tooltips helper
window.showTip = function(key) {
  const modal = document.getElementById("tip-modal");
  const titleEl = document.getElementById("tip-title");
  const bodyEl = document.getElementById("tip-body");

  const tips = {
    mSv: "MilliSievert (mSv) measures radiation dose absorbed by the human body. On Earth, we absorb about 3 mSv per year. NASA astronauts must stay below 50 mSv during a mission to stay safe.",
    CME: "A Coronal Mass Ejection (CME) is a huge cloud of solar plasma and magnetic field blasted into space at millions of miles per hour by the Sun.",
    WaterWall: "Water (H₂O) contains light hydrogen atoms. Hydrogen is exceptionally good at blocking high-speed solar protons, making water tanks ideal radiation shields!"
  };

  if (tips[key] && modal) {
    titleEl.textContent = `NASA Science Fact: ${key}`;
    bodyEl.textContent = tips[key];
    modal.classList.remove("hidden");
    if (typeof SoundController !== "undefined") SoundController.playClick();
  }
};

window.closeTip = function() {
  const modal = document.getElementById("tip-modal");
  if (modal) modal.classList.add("hidden");
};

// 1. DOM Updater
function renderHUD(state) {
  const { resources, metadata } = state;

  // Clock & Flare Class
  const clockEl = document.getElementById("countdown-clock");
  if (clockEl) clockEl.textContent = `${resources.timeRemaining}:00`;
  
  const flareEl = document.getElementById("flare-class");
  if (flareEl && metadata.flareClass) {
    flareEl.textContent = `FLARE CLASS: ${metadata.flareClass}`;
  }

  // Radiation Meter
  const radBar = document.getElementById("bar-radiation");
  const radVal = document.getElementById("val-radiation");
  if (radBar && radVal) {
    const radPercent = Math.min(100, (resources.crewRadiation / resources.radiationCriticalLimit) * 100);
    radBar.style.width = `${radPercent}%`;
    radVal.textContent = `${resources.crewRadiation} / 50 mSv`;
    
    radBar.className = "meter-bar";
    if (resources.crewRadiation > 50) radBar.classList.add("alert");
    else if (resources.crewRadiation > 20) radBar.classList.add("warning");
    else radBar.classList.add("safe");
  }

  // Power Meter
  const pwrBar = document.getElementById("bar-power");
  const pwrVal = document.getElementById("val-power");
  if (pwrBar && pwrVal) {
    pwrBar.style.width = `${resources.basePower}%`;
    pwrVal.textContent = `${resources.basePower}%`;
    
    pwrBar.className = "meter-bar";
    if (resources.basePower < 25) pwrBar.classList.add("alert");
    else if (resources.basePower < 50) pwrBar.classList.add("warning");
    else pwrBar.classList.add("nominal");
  }

  // Water Meter
  const waterBar = document.getElementById("bar-water");
  const waterVal = document.getElementById("val-water");
  if (waterBar && waterVal) {
    const waterPercent = Math.min(100, (resources.waterReserve / 80) * 100);
    waterBar.style.width = `${waterPercent}%`;
    waterVal.textContent = `${resources.waterReserve} L`;
  }

  // Ice Core Slots
  const slots = document.querySelectorAll(".core-slot");
  slots.forEach((slot, index) => {
    slot.classList.toggle("filled", index < resources.iceCores);
  });
}

// 2. Scenario Data
const scenarioData = {
  "scenarioId": "DONKI-2024-X54",
  "metadata": {
    "title": "The Mother's Day Superstorm",
    "historicalDate": "May 10, 2024",
    "flareClass": "X5.4",
    "cmeSpeedKmS": 1800,
    "initialTimeMinutes": 45
  },
  "initialResources": {
    "timeRemaining": 45,
    "crewRadiation": 0,
    "basePower": 100,
    "waterReserve": 80,
    "iceCores": 0,
    "maxIceCores": 4,
    "radiationSafeLimit": 50,
    "radiationCriticalLimit": 100
  },
  "decisions": [
    {
      "id": "dec_1_recall",
      "phase": "CREW_EVACUATION",
      "title": "EVA Crew Recall & Ice Core Protocol",
      "situation": "Specialist Leo and Dr. Maya are 900m away at the drill site with 4 fresh pressurized ice cores.",
      "options": [
        {
          "id": "sprint",
          "label": "Emergency Sprint (Abandon Equipment)",
          "timeCost": 15,
          "powerCost": 0,
          "waterCost": 0,
          "radiationDose": 2,
          "iceCoresSaved": 0,
          "feedback": "Crew reached the airlock quickly. The drill rig and all 4 ice cores were left behind."
        },
        {
          "id": "pack_cores",
          "label": "Pack Rover & Secure Cores",
          "timeCost": 30,
          "powerCost": 0,
          "waterCost": 0,
          "radiationDose": 22,
          "iceCoresSaved": 4,
          "feedback": "All 4 ice cores secured in rover cold storage, but the crew absorbed +22 mSv during the operation."
        }
      ]
    },
    {
      "id": "dec_2_shielding",
      "phase": "HABITAT_DEFENSE",
      "title": "Habitat Storm Shielding Setup",
      "situation": "Regolith cover alone is insufficient for an X-class proton storm. Choose an active shielding protocol.",
      "options": [
        {
          "id": "water_wall",
          "label": "Pump Hydroponic Water-Wall",
          "timeCost": 10,
          "powerCost": 10,
          "waterCost": 35,
          "radiationDose": 5,
          "iceCoresSaved": 0,
          "feedback": "Water bladders absorbed 65% of incoming protons."
        },
        {
          "id": "magnetic_shield",
          "label": "Overcharge Magnetic Deflector",
          "timeCost": 5,
          "powerCost": 45,
          "waterCost": 0,
          "radiationDose": 2,
          "iceCoresSaved": 0,
          "feedback": "Magnetic shield active, but battery reserves took a major hit."
        }
      ]
    },
    {
      "id": "dec_3_grid",
      "phase": "GRID_LOCKDOWN",
      "title": "Critical Grid & Solar Array Protocol",
      "situation": "Initial proton showers are striking the rim. Unprotected solar arrays risk electrostatic burnout.",
      "options": [
        {
          "id": "retract_arrays",
          "label": "Retract Panels & Isolate Grid",
          "timeCost": 5,
          "powerCost": 15,
          "waterCost": 0,
          "radiationDose": 0,
          "iceCoresSaved": 0,
          "feedback": "Panels safely housed in vaults. Outpost runs strictly on remaining battery reserves."
        },
        {
          "id": "leave_active",
          "label": "Keep Arrays Deployed for Heaters",
          "timeCost": 0,
          "powerCost": -10,
          "waterCost": 0,
          "radiationDose": 5,
          "iceCoresSaved": 0,
          "feedback": "Auxiliary life support stayed active, but static charges caused minor electrical fires."
        }
      ]
    }
  ],
  "endings": {
    "evaluation": {
      "goldThreshold": { "maxRadiation": 25, "minPower": 25, "minCores": 4 },
      "silverThreshold": { "maxRadiation": 35, "minPower": 20, "minCores": 0 },
      "bronzeThreshold": { "maxRadiation": 50, "minPower": 10, "minCores": 1 }
    },
    "outcomes": {
      "ending_a": {
        "title": "The Exemplary Commander",
        "rank": "Gold Mission Pin",
        "description": "Dr. Maya and Specialist Leo survived the X-class storm with minimal radiation. All 4 ice cores were preserved in cold storage.",
        "nasaFact": "Water and polyethylene shielding are primary candidates for Artemis habitats because hydrogen atoms efficiently absorb solar protons."
      },
      "ending_b": {
        "title": "Survival Over Science",
        "rank": "Silver Mission Pin",
        "description": "The crew reached safety and the habitat stayed intact, but abandoning the ice samples delayed lunar water research milestones.",
        "nasaFact": "Lunar polar ice is essential for future missions because it can be split into hydrogen for rocket fuel and oxygen for breathing."
      },
      "ending_c": {
        "title": "The Pyrrhic Discovery",
        "rank": "Bronze Mission Pin",
        "description": "Scientific samples were secured, but the crew took an elevated radiation dose that triggered acute fatigue and medical quarantine.",
        "nasaFact": "NASA OSDR data (Study OSD-379) shows space radiation damages DNA and immune function, making exposure tracking a top mission priority."
      },
      "ending_d": {
        "title": "Outpost Power Failure",
        "rank": "Mission Abort",
        "description": "Battery reserves hit 0% during the storm. Thermal heaters failed, forcing an emergency abort to the Orion capsule.",
        "nasaFact": "Nighttime temperatures at the lunar poles reach -130°C. Power management is a non-negotiable life support requirement."
      }
    }
  }
};

// ============================================================================
// STAGE 5: Impact Resolution, Scoring & Debrief Modal
// ============================================================================

const DebriefController = {
  isResolving: false,

  calculateScore(resources) {
    const scienceScore = resources.iceCores * 150;
    const powerScore = resources.basePower * 3;
    const radPenalty = resources.crewRadiation * 8;
    return Math.max(0, Math.round(scienceScore + powerScore - radPenalty));
  },

  handleImpactSequence(state) {
    if (!state.isGameOver || this.isResolving) return;
    this.isResolving = true;

    const appEl = document.getElementById("app");
    const radarStatus = document.getElementById("radar-status");

    if (radarStatus) {
      radarStatus.textContent = "CRITICAL: WAVEFRONT IMPACT";
      radarStatus.style.color = "var(--col-alert)";
      radarStatus.style.borderColor = "var(--col-alert)";
    }

    if (appEl) {
      appEl.classList.add("storm-shaking", "storm-flashing");
    }

    if (typeof RadarController !== "undefined") {
      RadarController.waveRadiusPercent = 0.05;
    }

    if (typeof SoundController !== "undefined") {
      SoundController.playImpactRumble();
    }

    setTimeout(() => {
      if (appEl) {
        appEl.classList.remove("storm-shaking", "storm-flashing");
      }
      this.showModal(state);
    }, 1200);
  },

  showModal(state) {
    const modal = document.getElementById("debrief-modal");
    const titleEl = document.getElementById("modal-title");
    const rankEl = document.getElementById("modal-rank");
    const descEl = document.getElementById("modal-desc");
    const factEl = document.getElementById("modal-fact");
    const badgeEl = document.getElementById("modal-badge");

    if (!modal || !state.activeEnding) return;

    const ending = state.activeEnding;
    const score = this.calculateScore(state.resources);

    const rank = ending.rank || "Mission Complete";
    let pinEmoji = "🏅";
    if (rank.includes("Gold")) pinEmoji = "🥇";
    else if (rank.includes("Silver")) pinEmoji = "🥈";
    else if (rank.includes("Bronze")) pinEmoji = "🥉";
    else pinEmoji = "⚠️";

    // Map badges to your actual assets/images/ files
    if (badgeEl.tagName === "IMG") {
      let badgeFile = "badge-gold.png";
      if (rank.includes("Silver")) badgeFile = "badge-silver.png";
      else if (rank.includes("Bronze")) badgeFile = "badge-bronze.png";
      else if (rank.includes("Abort") || rank.includes("Failure")) badgeFile = "badge-fail.png";

      badgeEl.src = `assets/images/${badgeFile}`;
    } else {
      badgeEl.textContent = pinEmoji;
    }
    if (titleEl) titleEl.textContent = ending.title || "Mission Status";
    if (rankEl) rankEl.textContent = `${rank.toUpperCase()} | FINAL SCORE: ${score} PTS`;
    if (descEl) descEl.textContent = ending.description || "";
    if (factEl) factEl.textContent = ending.nasaFact || "";

    modal.classList.remove("hidden");
  },

  restartGame() {
    const modal = document.getElementById("debrief-modal");
    const radarStatus = document.getElementById("radar-status");
    if (modal) modal.classList.add("hidden");

    if (radarStatus) {
      radarStatus.textContent = "SCANNING WAVEFRONT";
      radarStatus.style.color = "var(--col-warning)";
      radarStatus.style.borderColor = "rgba(245, 158, 11, 0.3)";
    }

    this.isResolving = false;
    GameState.init(scenarioData);
  }
};

// --- Initialization & Safe Subscriptions ---

// 1. Audio setup (guarded)
if (typeof SoundController !== "undefined") {
  SoundController.init();

  const audioBtn = document.getElementById("btn-audio");
  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      const isMuted = SoundController.toggleMute();
      audioBtn.textContent = isMuted ? "🔇 AUDIO: MUTED" : "🔊 AUDIO: ON";
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".btn-option")) {
      SoundController.playClick();
    }
  });
}

// 2. Radar setup (guarded)
if (typeof RadarController !== "undefined") {
  RadarController.init();
}

// 3. Register state subscribers
GameState.subscribe(renderHUD);

if (typeof EventController !== "undefined") {
  GameState.subscribe(state => EventController.renderDecision(state));
}

if (typeof RadarController !== "undefined") {
  GameState.subscribe(state => RadarController.updateFromState(state));
}

GameState.subscribe(state => DebriefController.handleImpactSequence(state));

// 4. Wire restart button
const restartBtn = document.getElementById("btn-restart");
if (restartBtn) {
  restartBtn.addEventListener("click", () => DebriefController.restartGame());
}

// 5. Start the game
GameState.init(scenarioData);