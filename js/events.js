/**
 * js/events.js - Decision Engine & Terminal UI Controller
 */

const EventController = {
  /**
   * Formats resource cost tags for kid-friendly buttons.
   */
  formatCosts(option) {
    const parts = [];
    if (option.timeCost > 0) parts.push(`-${option.timeCost}m Time`);
    if (option.powerCost > 0) parts.push(`-${option.powerCost}% Power`);
    if (option.powerCost < 0) parts.push(`+${Math.abs(option.powerCost)}% Power`);
    if (option.waterCost > 0) parts.push(`-${option.waterCost}L Water`);
    if (option.radiationDose > 0) parts.push(`+${option.radiationDose} mSv Rad`);
    if (option.iceCoresSaved > 0) parts.push(`+${option.iceCoresSaved} Cores`);
    return parts.length > 0 ? parts.join(" | ") : "No Resource Cost";
  },

  /**
   * Displays the educational feedback banner for 2.5 seconds.
   */
  showFeedback(text) {
    const banner = document.getElementById("feedback-banner");
    const textEl = document.getElementById("feedback-text");
    if (!banner || !textEl) return;

    textEl.textContent = text;
    banner.classList.remove("hidden");

    clearTimeout(banner._timer);
    banner._timer = setTimeout(() => {
      banner.classList.add("hidden");
    }, 2500);
  },

  /**
   * Renders the active decision card and action buttons into the terminal.
   */
  renderDecision(state) {
    const container = document.getElementById("decision-container");
    const phaseEl = document.getElementById("decision-phase");
    const titleEl = document.getElementById("decision-title");
    const situationEl = document.getElementById("decision-situation");
    const optionsGrid = document.getElementById("options-container");

    if (!container) return;

    if (state.isGameOver) {
      if (optionsGrid) {
        optionsGrid.innerHTML = `<p style="color: var(--text-dim); padding: 8px 0;">All pre-storm protocols executed. Awaiting impact...</p>`;
      }
      return;
    }

    const decision = state.currentDecision;
    if (!decision) return;

    // Update text headers
    phaseEl.textContent = decision.phase.replace(/_/g, " ");
    titleEl.textContent = decision.title;
    situationEl.textContent = decision.situation;

    // Clear existing buttons and render fresh ones
    optionsGrid.innerHTML = "";
    decision.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "btn-option";
      btn.innerHTML = `
        <span class="option-label">${opt.label}</span>
        <span class="option-costs">${this.formatCosts(opt)}</span>
      `;

      btn.addEventListener("click", () => {
        const result = GameState.applyDecision(opt.id);
        if (result && result.feedback) {
          this.showFeedback(result.feedback);
        }
      });

      optionsGrid.appendChild(btn);
    });
  }
};