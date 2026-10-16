# Developer Onboarding & Environment Setup Guide

This guide details how to configure your local development machine according to the official [Overwolf Onboarding Resources](https://dev.overwolf.com/ow-native/getting-started/onboarding-resources/setting-up-dev-environment).

---

## 1. Switch Overwolf to the Developers Channel

The Developers Channel gives you early access to Game Events Provider (GEP) patches and enables channel switching directly in the Packages window:

1. Open the **Overwolf Desktop Client**.
2. Click the **Gear icon (Settings)** in the top right.
3. In the sidebar, select **About**.
4. Hold **`Ctrl + Shift`** and **Left Click** on the Overwolf logo.
5. In the channel input box that appears, enter:
   ```text
   Developers
   ```
6. Click **Check for updates** and then **Relaunch**.
7. Confirm that the channel in the Packages window now displays `Developers`.

---

## 2. Enable CEF Remote Debugging (Port 8088)

Because Overwolf apps run on Chromium Embedded Framework (CEF), you can debug all windows simultaneously in Google Chrome:

### Method A: Overwolf Shortcut Flag (Recommended)
1. Right-click your Overwolf desktop shortcut -> **Properties**.
2. In the **Target** field, add the following flag to the end of the line:
   ```text
   --enable-logging --remote-debugging-port=8088
   ```
3. Click **Apply** and relaunch Overwolf using this shortcut.
4. Open Google Chrome and navigate to:
   👉 **[http://localhost:8088](http://localhost:8088)**
5. You will see a list of all active CEF targets:
   - `background.html` (Background Controller & GEP listener)
   - `post_game.html` (In-Game Overlay)
   - `desktop.html` (Main Dashboard)
6. Click any target to open the full Chrome Developer Tools (Console, Network, Sources, Elements).

---

## 3. Load the Unpacked Extension (Version 0.0.1)

1. In Overwolf, navigate to **Settings** -> **About** -> **Development Tools** -> **Packages**.
2. Click **Load unpacked extension...**
3. Select this repository's folder:
   ```text
   i:\Workspace\TFT performance report\dist
   ```
4. Verify that **Tactician Coach: TFT Post-Game Analyzer** appears in the packages list with version **`0.0.1`**.

---

## 4. Test Auto-Launch with TFT

1. Launch League of Legends / Teamfight Tactics.
2. The Overwolf client reads `manifest.json`'s `launch_events` targeting Game ID `21570`.
3. The background controller (`background.ts`) will automatically wake up and register for GEP telemetry.
4. When your match concludes or you reach 0 HP, the post-game overlay will automatically restore to the foreground.
