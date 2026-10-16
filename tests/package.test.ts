import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Overwolf Manifest & Store Submission Compliance', () => {
  it('validates manifest.json structure and required fields', () => {
    const raw = fs.readFileSync('manifest.json', 'utf-8');
    const manifest = JSON.parse(raw);

    expect(manifest.manifest_version).toBe(1);
    expect(manifest.meta.name).toBe('Tactician Coach: TFT Post-Game Analyzer');
    expect(manifest.meta.version).toBe('0.0.1');

    // Game targeting
    const gameIds = manifest.data.game_targeting.game_ids;
    expect(gameIds).toContain(21570); // TFT Live
    expect(gameIds).toContain(5426);  // LoL Launcher

    // Game events array of integers
    expect(manifest.data.game_events).toContain(21570);

    // Launch events auto-wake
    expect(manifest.data.launch_events).toBeDefined();
    expect(manifest.data.launch_events[0].event_data.game_ids).toContain(21570);

    // Declared windows
    expect(manifest.data.windows.background).toBeDefined();
    expect(manifest.data.windows.post_game).toBeDefined();
    expect(manifest.data.windows.desktop).toBeDefined();

    // Hotkey
    expect(manifest.data.hotkeys.toggle_post_game).toBeDefined();
  });

  it('confirms all required store assets exist on disk', () => {
    expect(fs.existsSync(path.resolve('assets/icons/icon.png'))).toBe(true);
    expect(fs.existsSync(path.resolve('assets/store/tile.jpg'))).toBe(true);
    expect(fs.existsSync(path.resolve('assets/store/hero.jpg'))).toBe(true);
    expect(fs.existsSync(path.resolve('assets/store/creator.png'))).toBe(true);
    expect(fs.existsSync(path.resolve('assets/store/screenshot_1.jpg'))).toBe(true);
    expect(fs.existsSync(path.resolve('assets/store/screenshot_2.jpg'))).toBe(true);
  });

  it('confirms all Riot and Overwolf submission dossiers exist', () => {
    expect(fs.existsSync(path.resolve('docs/RIOT_API_APPLICATION.md'))).toBe(true);
    expect(fs.existsSync(path.resolve('docs/PRIVACY_POLICY.md'))).toBe(true);
    expect(fs.existsSync(path.resolve('docs/TERMS_OF_SERVICE.md'))).toBe(true);
    expect(fs.existsSync(path.resolve('docs/OVERWOLF_SUBMISSION_GUIDE.md'))).toBe(true);
    expect(fs.existsSync(path.resolve('docs/OVERWOLF_APP_IDEA_SUBMISSION.md'))).toBe(true);
    expect(fs.existsSync(path.resolve('docs/DEVELOPER_ONBOARDING_SETUP.md'))).toBe(true);
    expect(fs.existsSync(path.resolve('public/riot.txt'))).toBe(true);
  });
});
