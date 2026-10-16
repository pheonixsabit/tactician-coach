# Overwolf App Idea Submission Dossier (Phase 1: App Proposal)

Use this pre-filled dossier when submitting your app proposal on the **Overwolf App Idea Form**:
👉 [https://dev.overwolf.com/app-idea-form](https://dev.overwolf.com/app-idea-form)

---

## 1. General App Details

* **App Name:** `Tactician Coach: TFT Post-Game Analyzer`
* **Target Game:** `Teamfight Tactics (Game ID: 21570)`
* **Chosen Framework:** `Overwolf Native` (HTML, TypeScript, Tailwind CSS, CEF)
* **App Category:** `Companion / Post-Game Analysis / Coaching`
* **Target Audience:** Casual and competitive TFT tacticians looking to review their mistakes, master itemization, and improve economy roll-down timings.

---

## 2. App Value Proposition & Key Features

```text
Tactician Coach is an educational post-game companion tool for Teamfight Tactics (TFT) that automatically triggers when a match finishes. 

Key Features:
1. Composition Alignment: Compares the player's final board to current meta archetypes (using MetaTFT benchmarks) and provides a precision match percentage.
2. Itemization & Best-in-Slot (BIS) Quality: Evaluates equipped carry and tank items, flags missing utility (armor/MR shred, anti-heal), and detects unspent components.
3. Augment Tactical Synergy: Reviews augment choices strictly through qualitative trait and board synergy (100% compliant with Riot third-party policies; no augment win-rate numbers).
4. Economy & Tempo Grading: Analyzes level timing, round elimination, and unspent gold to diagnose roll-down mistakes (e.g. dying rich on stage 4).
5. Actionable Coaching Summary: Assigns an overall performance grade (S to F) along with 3 key strengths, 3 critical blunders, and advice for the next game.
```

---

## 3. Window Behavior & User Experience (UX)

* **Window Style:** `Hybrid (In-Game Overlay + Standalone Desktop Window)`
  * **Overlay Window (`post_game.html`):** Compact 380x500 floating HUD that automatically pops up upon match completion or player elimination with the placement banner, letter grade, and quick takeaways. Can be dismissed or toggled with `Alt+T`.
  * **Desktop Window (`desktop.html`):** Expandable standalone window accessible anytime to browse match history, inspect unit boards with star ratings and item badges, review 8-player lobby standings, and configure settings.

---

## 4. Game Compliance & Fair Play Declaration

```text
Tactician Coach adheres strictly to Riot Games Third-Party Developer Policies and Overwolf Compliance Guidelines:
1. Post-Game Focus: All coaching advice, grades, and breakdowns are delivered strictly after a match finishes or after the player is eliminated. The app provides zero real-time gameplay automation during live combat.
2. Augment Data Compliance: In strict accordance with Riot's TFT rules, the app NEVER displays Augment Win Rates, Augment Average Placements, or Legend Win Rates. Augment feedback is exclusively qualitative trait and damage synergy analysis.
3. No Secret Data: The app does not predict upcoming match-ups or read enemy shop probabilities.
```

---

## 5. Monetization Strategy

```text
Compliant with Overwolf's monetization policy:
- Free Tier: All core post-game analysis and coaching features are 100% free for all players.
- Overwolf Ads: Standard non-intrusive Overwolf ad banner (300x250 or 400x300) placed in the desktop dashboard window. No ads during live gameplay.
- Overwolf Subscriptions (Future): Optional ad-free premium tier via official Overwolf Subscriptions.
- No 3rd-party ad networks or unauthorized payment gateways.
```

---

## 6. Development Status & Deliverables

* **Working Prototype Ready:** Built with TypeScript, Vite, and Tailwind CSS.
* **Tested Package:** Automated `.opk` bundle generated (`dist/tactician-coach.opk`) with valid manifest v2 schema and complete pixel-accurate store assets (`assets/store/`).
* **Offline Mock & Event Simulator:** Built-in reviewer simulator allows testing 1st and 8th place matches in 1 click without waiting for a live 40-minute TFT match.
