/**
 * js/state.js - Core State Machine for SOLAR ALERT
 * Handles resource clamping, decision application, and ending evaluation.
 */

const GameState = {
  // Current session resources & tracking
  scenarioId: null,
  metadata: {},
  resources: {
    timeRemaining: 45,
    crewRadiation: 0,
    basePower: 100,
    waterReserve: 80,
    iceCores: 0,
    maxIceCores: 4,
    radiationSafeLimit: 50,
    radiationCriticalLimit: 100
  },
  currentDecisionIndex: 0,
  decisions: [],
  endingsConfig: {},
  history: [],
  isGameOver: false,
  activeEnding: null,

  // Change notification subscribers
  subscribers: [],

  /**
   * Initializes or resets state using the scenario JSON.
   * @param {Object} scenarioData - The parsed JSON object.
   */
  init(scenarioData) {
    this.scenarioId = scenarioData.scenarioId;
    this.metadata = scenarioData.metadata;
    this.resources = { ...scenarioData.initialResources };
    this.decisions = scenarioData.decisions;
    this.endingsConfig = scenarioData.endings;
    this.currentDecisionIndex = 0;
    this.history = [];
    this.isGameOver = false;
    this.activeEnding = null;

    this.notify();
    return this.getSnapshot();
  },

  /**
   * Returns a read-only snapshot of current state.
   */
  getSnapshot() {
    return {
      metadata: this.metadata,
      resources: { ...this.resources },
      currentDecision: this.getCurrentDecision(),
      decisionIndex: this.currentDecisionIndex,
      totalDecisions: this.decisions.length,
      history: [...this.history],
      isGameOver: this.isGameOver,
      activeEnding: this.activeEnding
    };
  },

  /**
   * Retrieves the current active decision object, or null if complete.
   */
  getCurrentDecision() {
    if (this.currentDecisionIndex < this.decisions.length) {
      return this.decisions[this.currentDecisionIndex];
    }
    return null;
  },

  /**
   * Applies an option chosen by the player and recalculates all bounds.
   * @param {string} optionId - ID of the selected option.
   */
  applyDecision(optionId) {
    if (this.isGameOver) {
      console.warn("Action ignored: Game is already over.");
      return null;
    }

    const currentDecision = this.getCurrentDecision();
    if (!currentDecision) {
      console.warn("No active decision to resolve.");
      return null;
    }

    const option = currentDecision.options.find(opt => opt.id === optionId);
    if (!option) {
      console.error(`Option with id '${optionId}' not found.`);
      return null;
    }

    // Apply resource mutations
    this.resources.timeRemaining -= option.timeCost;
    this.resources.basePower -= option.powerCost;
    this.resources.waterReserve -= option.waterCost;
    this.resources.crewRadiation += option.radiationDose;
    this.resources.iceCores += option.iceCoresSaved;

    // Enforce safety & physical bounds
    this.enforceResourceClamping();

    // Record decision in history
    this.history.push({
      decisionId: currentDecision.id,
      phase: currentDecision.phase,
      optionId: option.id,
      optionLabel: option.label,
      feedback: option.feedback
    });

    this.currentDecisionIndex++;

    // Check terminal conditions
    if (
      this.currentDecisionIndex >= this.decisions.length ||
      this.resources.timeRemaining <= 0 ||
      this.resources.basePower <= 0 ||
      this.resources.crewRadiation >= this.resources.radiationCriticalLimit
    ) {
      this.triggerGameOver();
    }

    this.notify();
    return {
      feedback: option.feedback,
      snapshot: this.getSnapshot()
    };
  },

  /**
   * Clamps resource numbers within realistic limits.
   */
  enforceResourceClamping() {
    // Time cannot fall below 0
    this.resources.timeRemaining = Math.max(0, this.resources.timeRemaining);

    // Power bounded between 0% and 100%
    this.resources.basePower = Math.min(100, Math.max(0, this.resources.basePower));

    // Water cannot fall below 0
    this.resources.waterReserve = Math.max(0, this.resources.waterReserve);

    // Ice cores cannot exceed mission quota
    this.resources.iceCores = Math.min(
      this.resources.maxIceCores,
      Math.max(0, this.resources.iceCores)
    );
  },

  /**
   * Concludes the run and assigns the matching ending.
   */
  triggerGameOver() {
    this.isGameOver = true;
    this.activeEnding = this.evaluateEnding();
  },

  /**
   * Evaluates the ending based on final resource metrics.
   * Matches the criteria set in the JSON schema.
   */
  evaluateEnding() {
    const { crewRadiation, basePower, iceCores } = this.resources;
    const { evaluation, outcomes } = this.endingsConfig;

    // Failure: Base blackout
    if (basePower <= 0) {
      return outcomes.ending_d;
    }

    // Ending A: Gold Commander Pin
    if (
      crewRadiation <= evaluation.goldThreshold.maxRadiation &&
      basePower >= evaluation.goldThreshold.minPower &&
      iceCores >= evaluation.goldThreshold.minCores
    ) {
      return outcomes.ending_a;
    }

    // Ending B: Silver Pin (Safe survival, low or zero samples)
    if (
      crewRadiation <= evaluation.silverThreshold.maxRadiation &&
      basePower >= evaluation.silverThreshold.minPower
    ) {
      return outcomes.ending_b;
    }

    // Ending C: Bronze Pin (High science, elevated radiation)
    if (
      crewRadiation <= evaluation.bronzeThreshold.maxRadiation &&
      basePower >= evaluation.bronzeThreshold.minPower
    ) {
      return outcomes.ending_c;
    }

    // Fallback: Severe radiation exposure or mission abort
    return outcomes.ending_d;
  },

  /**
   * Subscribe to state mutations (used by UI renders in Stage 2).
   * @param {Function} callback - Triggered with the latest snapshot.
   */
  subscribe(callback) {
    if (typeof callback === "function") {
      this.subscribers.push(callback);
    }
  },

  /**
   * Broadcasts updates to all subscribed UI components.
   */
  notify() {
    const snapshot = this.getSnapshot();
    this.subscribers.forEach(cb => cb(snapshot));
  }
};