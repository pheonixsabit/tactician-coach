# Overwolf Appstore Submission Guide for Tactician Coach

This guide details how to test, build, and submit **Tactician Coach** to the **Overwolf Appstore**.

---

## 1. Local Testing in Overwolf Developer Mode

You do not need prior store approval to test the app on your local machine:
1. Open the **Overwolf Desktop Client**.
2. Click the **Gear icon (Settings)** in the top right.
3. Navigate to **About** -> **Development Tools** (or click the Overwolf tray icon -> Support -> Development Options).
4. Click on **Packages** -> **Load unpacked extension...**
5. Select the project directory (`i:\Workspace\TFT performance report` or `dist`).
6. Confirm that **Tactician Coach** appears in your extension list with version `1.0.0`.
7. Launch League of Legends / Teamfight Tactics or run the built-in simulator to test!

---

## 2. Automated Packaging to `.opk`

To package the production application into an official Overwolf Package (`.opk`):

```bash
npm run package
```

This automated script:
1. Compiles all TypeScript and Tailwind CSS assets into optimized bundles in `dist/`.
2. Validates `manifest.json` against Overwolf's manifest specification.
3. Verifies that all store assets (`icon.png`, `tile.jpg`, `hero.jpg`, `creator.png`) exist.
4. Generates `dist/tactician-coach.opk` ready for submission.

---

## 3. Submitting to the Overwolf Developer Console

### Step 1: Create an Overwolf Developer Account
1. Visit [https://dev.overwolf.com/](https://dev.overwolf.com/) and create or log into your developer account.
2. Submit your **App Proposal** if you have not already (select Game: *Teamfight Tactics*, Category: *Companion / Post-Game*).
3. Once approved, you will gain access to the **Overwolf Developer Console**.

### Step 2: Upload the `.opk` Package
1. In the Overwolf Developer Console, navigate to your app dashboard.
2. Go to **Release Management**.
3. Under the **Testing** or **Production** channel, click **Upload New Version**.
4. Drag and drop `dist/tactician-coach.opk`.
5. The console will automatically validate the package checksum and manifest schema.

### Step 3: Store Listing Information
Copy and paste the store copy below into your app listing:

* **Short Description (max 100 chars):**
  > Instant TFT post-game analysis, comp alignment scoring, BIS item evaluations, and tactical coaching.

* **Full Description (Markdown, max 2000 chars):**
  ```markdown
  ### Elevate Your Teamfight Tactics Mastery
  Tactician Coach is the ultimate post-game companion for TFT tacticians. The moment your match ends, Tactician Coach analyzes your board and gives you an immediate competitive breakdown:

  - **Composition Alignment:** See how closely your end-game board matched top meta archetypes and get your precision percentage.
  - **Itemization & BIS Quality:** Grade your items on primary carries and tanks. Spot missing armor shred, lack of anti-heal, or suboptimal slams.
  - **Augment Tactical Synergy:** Evaluate your augment choices in the context of your active traits and carries (100% compliant with Riot third-party policies).
  - **Economy & Tempo:** Review your elimination stage and unspent gold to master roll-down timings and prevent bleeding out rich.
  - **Actionable Coaching:** Get 3 key strengths, 3 critical blunders, and a tactical recommendation for your next game.

  *Tactician Coach isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties.*
  ```

### Step 4: Upload Store Media Assets
Upload the pre-generated assets from `assets/store/`:
* **App Icon:** `assets/icons/icon.png` (55 × 55 PNG)
* **Store Tile:** `assets/store/tile.jpg` (258 × 198 JPG)
* **Hero Image:** `assets/store/hero.jpg` (258 × 198 JPG)
* **Creator Image:** `assets/store/creator.png` (400 × 320 PNG)
* **Screenshots:** `assets/store/screenshot_1.jpg`, `screenshot_2.jpg` (1200 × 675 JPG)

### Step 5: Submit for Review
Click **Submit for Review**. The Overwolf QA team will test the package for stability, memory footprint (<150MB), and Riot compliance before approving it for public Appstore distribution!
