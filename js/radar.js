/**
 * js/radar.js - Tactical Radar Canvas Controller for Shackleton Crater
 */

const RadarController = {
  canvas: null,
  ctx: null,
  sweepAngle: 0,
  animationId: null,

  // Image assets
  roverImg: null,
  baseImg: null,
  lunarBgImg: null,

  // Position state
  roverPos: { x: 0, y: 0, targetX: 0, targetY: 0 },
  roverSheltered: false,
  waveRadiusPercent: 1.0, // 1.0 = far edge, 0.0 = impact at base
  pulseOpacity: 0.8,

  init() {
    this.canvas = document.getElementById("radar-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    // Preload image assets
    this.roverImg = new Image();
    this.roverImg.src = "assets/images/rover.svg";

    this.baseImg = new Image();
    this.baseImg.src = "assets/images/habitat-base.svg";

    this.lunarBgImg = new Image();
    this.lunarBgImg.src = "assets/images/lunar-surface.png";

    // Handle high DPI displays
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    // Start continuous render loop
    this.startLoop();
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio || 600;
    this.canvas.height = rect.height * window.devicePixelRatio || 400;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  },

  /**
   * Responds to state changes from GameState.
   */
  updateFromState(state) {
    const { resources, history } = state;
    const initialTime = 45; // Based on scenario initialTimeMinutes

    // Wavefront shrinks toward center as time runs out
    this.waveRadiusPercent = Math.max(0.12, resources.timeRemaining / initialTime);

    // Check if crew evacuation was selected in history
    const recallAction = history.find(h => h.phase === "CREW_EVACUATION");
    if (recallAction) {
      this.roverSheltered = true;
    } else {
      this.roverSheltered = false;
    }
  },

  startLoop() {
    const render = () => {
      this.draw();
      this.animationId = requestAnimationFrame(render);
    };
    render();
  },

  draw() {
    if (!this.ctx || !this.canvas) return;
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const maxRadius = Math.min(width, height) * 0.42;

    this.ctx.clearRect(0, 0, width, height);

    // 1. Radar Background Grid & Rings
    this.drawRadarGrid(centerX, centerY, maxRadius);

    // 2. Incoming Proton Wavefront (Red CME Arc)
    this.drawProtonWave(centerX, centerY, maxRadius);

    // 3. Drill Site (900m North-East)
    const drillX = centerX + maxRadius * 0.7;
    const drillY = centerY - maxRadius * 0.7;
    this.drawDrillSite(drillX, drillY);

    // 4. Rover Position & Animation
    this.drawRover(centerX, centerY, drillX, drillY);

    // 5. Central Outpost Habitat (Artemis Base)
    this.drawBaseCamp(centerX, centerY);

    // 6. Sweeping Sonar Beam
    this.drawSweep(centerX, centerY, maxRadius);
  },

  drawRadarGrid(cx, cy, maxR) {
    const ctx = this.ctx;

    // Draw lunar surface background if loaded
    if (this.lunarBgImg && this.lunarBgImg.complete && this.lunarBgImg.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.drawImage(this.lunarBgImg, cx - maxR, cy - maxR, maxR * 2, maxR * 2);
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = "rgba(51, 65, 85, 0.45)"; // Slate subtle
    ctx.lineWidth = 1;

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - maxR, cy);
    ctx.lineTo(cx + maxR, cy);
    ctx.moveTo(cx, cy - maxR);
    ctx.lineTo(cx, cy + maxR);
    ctx.stroke();

    // 300m, 600m, 900m Rings
    const rings = [0.33, 0.66, 1.0];
    const labels = ["300m", "600m", "900m (Drill Perimeter)"];

    rings.forEach((ratio, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * ratio, 0, Math.PI * 2);
      ctx.stroke();

      // Ring label
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.font = "10px monospace";
      ctx.fillText(labels[idx], cx + 4, cy - maxR * ratio + 12);
    });
    ctx.restore();
  },

  drawProtonWave(cx, cy, maxR) {
    const ctx = this.ctx;
    const waveRadius = maxR * (1.2 * this.waveRadiusPercent);

    ctx.save();
    // Pulsing glow
    const glow = Math.sin(Date.now() / 200) * 0.2 + 0.8;
    ctx.strokeStyle = `rgba(239, 68, 68, ${glow})`; // Emergency Red
    ctx.lineWidth = 4;
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 12;

    // Front arc approaching from the top (Sun direction)
    ctx.beginPath();
    ctx.arc(cx, cy, waveRadius, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Secondary faint wave trail
    ctx.strokeStyle = "rgba(239, 68, 68, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, waveRadius + 18, Math.PI * 1.18, Math.PI * 1.82);
    ctx.stroke();

    // Wavefront label
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 11px monospace";
    ctx.fillText("▲ CME PROTON WAVEFRONT", cx - 75, cy - waveRadius - 8);
    ctx.restore();
  },

  drawDrillSite(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "#f59e0b"; // Warning amber
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 1;

    // Diamond marker for drill rig
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x + 6, y);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x - 6, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText("Drill Site", x + 10, y + 4);
    ctx.restore();
  },

  drawRover(cx, cy, drillX, drillY) {
    const ctx = this.ctx;
    ctx.save();

    // Determine target location: base or drill site
    const targetX = this.roverSheltered ? cx + 18 : drillX;
    const targetY = this.roverSheltered ? cy + 18 : drillY;

    // Smooth movement interpolation
    if (this.roverPos.x === 0) {
      this.roverPos.x = targetX;
      this.roverPos.y = targetY;
    } else {
      this.roverPos.x += (targetX - this.roverPos.x) * 0.08;
      this.roverPos.y += (targetY - this.roverPos.y) * 0.08;
    }

    // Trail connecting drill to current position
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(drillX, drillY);
    ctx.lineTo(this.roverPos.x, this.roverPos.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Rover Sprite or fallback
    if (this.roverImg && this.roverImg.complete && this.roverImg.naturalWidth > 0) {
      ctx.drawImage(this.roverImg, this.roverPos.x - 10, this.roverPos.y - 10, 20, 20);
    } else {
      ctx.fillStyle = "#38bdf8"; // Cyan fallback
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.roverPos.x, this.roverPos.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 10px monospace";
    ctx.fillText(
      this.roverSheltered ? "ROVER [DOCKED]" : "ROVER (EVA)",
      this.roverPos.x + 12,
      this.roverPos.y + 4
    );
    ctx.restore();
  },

  drawBaseCamp(cx, cy) {
    const ctx = this.ctx;
    ctx.save();

    // Draw Habitat Dome Sprite or fallback
    if (this.baseImg && this.baseImg.complete && this.baseImg.naturalWidth > 0) {
      ctx.drawImage(this.baseImg, cx - 16, cy - 16, 32, 32);
    } else {
      ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
      ctx.strokeStyle = "#10b981"; // Emerald green fallback
      ctx.lineWidth = 2;
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("BASE CAMP (SHELTER)", cx - 60, cy + 28);
    ctx.restore();
  },

  drawSweep(cx, cy, maxR) {
    const ctx = this.ctx;
    this.sweepAngle += 0.025;
    if (this.sweepAngle >= Math.PI * 2) this.sweepAngle = 0;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxR, this.sweepAngle, this.sweepAngle + 0.18);
    ctx.closePath();

    const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxR);
    gradient.addColorStop(0, "rgba(56, 189, 248, 0.2)");
    gradient.addColorStop(1, "rgba(56, 189, 248, 0.0)");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  }
};