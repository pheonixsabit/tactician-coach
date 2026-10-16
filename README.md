# Tactician Coach: TFT Post-Game Analyzer

An educational post-game companion and strategic analysis tool for **Teamfight Tactics (TFT)** built for the **Overwolf** platform.

Tactician Coach automatically activates upon match completion or player elimination to evaluate performance across composition synergy, itemization efficiency, augment alignment, and economy roll-down timings.

---

## ✨ Key Features

- **Post-Game Tactical Grade:** Computes an overall strategic grade (S to F) with key strengths and critical tactical blunders.
- **Composition Alignment:** Matches the player's final board against established meta archetypes (using MetaTFT benchmarks) with precision similarity scoring.
- **Itemization & BIS Quality:** Evaluates equipped carry and tank items, flags missing utility (anti-heal, armor/MR shred), and detects unspent components at elimination.
- **Economy & Tempo Evaluation:** Analyzes level timing, round elimination, and leftover gold to pinpoint roll-down mistakes (e.g. dying rich on stage 4).
- **Dual-Window Architecture:**
  - **In-Game Overlay (`post_game.html`):** Compact 380x500 floating HUD that pops up immediately after a match concludes (hotkey: `Alt+T`).
  - **Desktop Dashboard (`desktop.html`):** Expandable 1200x800 standalone window for reviewing match history, 8-player lobby placements, unit boards with star levels, and configuring settings.
- **Offline Reviewer Simulator:** Built-in 1-click event simulator allows testing 1st place and 8th place matches instantly without waiting for live TFT games.

---

## 🛡️ Fair Play & Riot Compliance Declaration

Tactician Coach is designed in strict compliance with the [Riot Games Developer Policies](https://developer.riotgames.com/policies/general) and TFT Game Policies:

1. **Strictly Post-Game:** Delivers coaching insights only after match completion or player elimination. Zero live combat automation or real-time gameplay overlays.
2. **Augment Policy Compliant:** **Never** displays Augment Win Rates, Augment Average Placements, or Legend Win Rates. Augment feedback is exclusively qualitative trait and damage synergy analysis.
3. **No Unfair Advantage:** Does not scout hidden opponent boards, track opponent benches, or predict upcoming matchup pairings.
4. **Ad Policy Compliant:** Ads are strictly confined to the standalone desktop dashboard; zero ads are displayed during active gameplay.

> *Tactician Coach isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.*

---

## 🚀 Tech Stack

- **Framework:** Overwolf Native (HTML5, TypeScript, Tailwind CSS)
- **Bundler:** Vite
- **Testing:** Vitest (11/11 automated unit tests covering engine grading, adapter ingestion, and manifest schema)
- **Data Ingestion:** Dual-layer architecture supporting Overwolf Game Events Provider (GEP) and official Riot Games API (`ACCOUNT-V1`, `TFT-MATCH-V1`, `TFT-LEAGUE-V1`).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Overwolf Client (Developer Mode enabled)

### Installation
```bash
# Clone the repository
git clone https://github.com/pheonixsabit/tactician-coach.git
cd tactician-coach

# Install dependencies
npm install

# Run automated tests
npm run test

# Launch Vite dev server
npm run dev

# Build production package (.opk)
npm run package
```

### Loading into Overwolf
1. Open the **Overwolf Client**.
2. Go to **Settings** > **About** > Click the **Development Options** cog.
3. Turn on **Developer Mode**.
4. Click **Load unpacked extension...** and select the `dist/` directory, or double-click `dist/tactician-coach.opk`.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
