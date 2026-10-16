# Riot Games Developer Portal: Production API Key Application Dossier

Use this document to copy and paste directly into your project registration form on the [Riot Games Developer Portal](https://developer.riotgames.com/).

---

## 1. Project Information

* **Project Name:** `Tactician Coach: TFT Post-Game Analyzer`
* **Project Type:** `Production Project` (or `Personal Project` for private beta)
* **Target Game:** `Teamfight Tactics (TFT)`
* **Product URL / Website:** `https://yourdomain.com` *(or your Overwolf Appstore link once draft build is uploaded)*
* **Terms of Service URL:** `https://yourdomain.com/terms` *(or link to `TERMS_OF_SERVICE.md` on GitHub Pages)*
* **Privacy Policy URL:** `https://yourdomain.com/privacy` *(or link to `PRIVACY_POLICY.md` on GitHub Pages)*

---

## 2. General Description of the Application

```text
Tactician Coach is a dedicated post-game analysis and educational companion app for Teamfight Tactics (TFT) published on Overwolf. 

After a match concludes, the application reviews the player's performance across four core gameplay pillars:
1. Composition Alignment: Compares end-game traits and core units to established meta archetypes.
2. Itemization & Best-in-Slot (BIS): Evaluates carry and tank item optimization, resistance shred utility, and component balance.
3. Augment Tactical Synergy: Reviews selected augments strictly in the context of board and trait synergy (fully respecting Riot's TFT data policy).
4. Economy & Tempo: Analyzes level timing, round elimination, and leftover gold to provide actionable feedback on roll-down timing.

The app's sole purpose is educational post-game review to help players understand their mistakes, recognize tactical strengths, and improve their gameplay.
```

---

## 3. Requested APIs & Technical Justifications

### Endpoint 1: `ACCOUNT-V1`
* **Requested URLs:**
  * `GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}`
* **Technical Justification:**
  ```text
  Required to look up a player's encrypted PUUID using their global Riot ID (GameName#TagLine). The PUUID is the universal identifier needed to retrieve the player's recent TFT match history.
  ```

### Endpoint 2: `TFT-MATCH-V1`
* **Requested URLs:**
  * `GET /tft/match/v1/matches/by-puuid/{puuid}/ids`
  * `GET /tft/match/v1/matches/{matchId}`
* **Technical Justification:**
  ```text
  Required to fetch the player's completed match history and end-game participant data (final placement, units, star levels, equipped items, active traits, and damage dealt) to generate post-game coaching breakdowns and grade performance.
  ```

### Endpoint 3: `TFT-LEAGUE-V1`
* **Requested URLs:**
  * `GET /tft/league/v1/entries/by-summoner/{summonerId}`
* **Technical Justification:**
  ```text
  Used to display the player's current rank tier, division, and LP in the post-game dashboard so players can track their ranked progression over recent matches.
  ```

---

## 4. Competitive Integrity & Policy Compliance Statement

```text
Tactician Coach strictly complies with Riot Games Third-Party Developer Policies and TFT-specific data restrictions:

1. Strictly Post-Game: The application does NOT provide real-time gameplay automation, botting, or competitive advantages during live combat rounds. All feedback and analysis occurs after the match finishes or player elimination.
2. Full Compliance with Augment Data Bans: The app does NOT display Augment Win Rates, Augment Average Placements, or Legend Win Rates. Augment feedback is exclusively qualitative trait and damage synergy analysis (e.g. evaluating whether an AD or AP augment aligns with the active carry).
3. Secret Information: The app does NOT predict upcoming match-up opponents or read enemy shop probabilities.
4. Security: The Production API key is never bundled in distributed client binaries or CEF packages; all API access is mediated via secure server endpoints with rate-limiting and response caching.
```

---

## 5. Data Privacy & GDPR Statement

```text
Player data is handled in accordance with GDPR and CCPA standards:
- The app stores only encrypted PUUIDs and public match statistics in local client cache (IndexedDB) for match history display.
- No personal identifying information (PII), email addresses, or account credentials are collected or stored.
- Users can clear their stored match cache at any time via the Settings menu ('Clear Local Cache').
```

---

## 6. Mandatory Riot Legal Boilerplate Included in UI

Every page and window of Tactician Coach includes the required Riot disclaimer:

> *"Tactician Coach isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc."*
