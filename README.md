# SOLAR ALERT: 45 Minutes to Impact
> An Artemis Outpost Survival & Space Weather Simulator for Junior Astronauts (Ages 7–12)
> Built for the NASA Space Apps Challenge 2026

## 🚀 Mission Overview
Space-themed STEM education often glosses over the actual engineering trade-offs that determine survival on the Moon. **SOLAR ALERT** is a fast-paced, turn-based mission control simulator where players manage NASA's Artemis Base Camp at the Lunar South Pole during a high-speed Coronal Mass Ejection (CME).

Every action carries a cost: recalling astronauts quickly means abandoning valuable lunar ice cores; activating hydrogen water walls blocks deadly solar protons but starves the hydroponic crop; and shielding the base with magnetic deflectors depletes the battery grid required for night-time heating.

## 🛰️ NASA Open Data Grounding
1. **NASA Space Weather Database (DONKI):**
   - Scenario grounded in real solar flare observations from **Active Region 3664 (Class X5.4 / X8.7, May 2024)**.
   - Real Coronal Mass Ejection velocities ($1,800\text{ km/s}$) dictate in-game reaction windows.
2. **NASA Open Science Data Repository (OSDR):**
   - Radiation exposure limits ($50\text{ mSv}$ safe mission ceiling, $100\text{ mSv}$ critical illness) calibrated directly against **NASA-STD-3001** and OSDR astronaut health studies.
3. **Artemis Lunar Architecture:**
   - Shackleton Crater South Pole geography, cold-trap ice core retrieval, and passive water-wall bladder shielding.

## 🛠️ Technology Stack
- **Pure Web Standards:** Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Tactical Radar:** HTML5 Dynamic Canvas.
- **Audio Synthesis:** Web Audio API (zero external assets or latency).
- **Zero-Install:** Runs instantly on any modern browser or classroom Chromebook.

## 🎮 How to Play
1. Read the DONKI alert banner: an X-class CME is incoming.
2. Balance your 45-minute budget across three tactical decisions:
   - **Phase 1: Crew Recall:** Sprint for safety or risk exposure to save scientific ice cores.
   - **Phase 2: Base Shielding:** Deploy water walls, charge magnetic coils, or rely on lunar regolith.
   - **Phase 3: Grid Lockdown:** Retract sensitive solar arrays or keep backup heating active.
3. Survive the storm collision and review your official **NASA Science Debrief Pin (Gold, Silver, Bronze, or Abort)**.
