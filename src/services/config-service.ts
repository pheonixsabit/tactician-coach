import { AppConfig } from '../models/match';

const STORAGE_KEY = 'tactician_coach_config';

export const DEFAULT_CONFIG: AppConfig = {
  riotId: 'TacticianGod',
  tagLine: 'NA1',
  apiKey: '',
  region: 'americas',
  platform: 'na1',
  autoOpenOverlay: true,
  useLiveRiotApiWhenAvailable: true,
};

export class ConfigService {
  public static getConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return { ...DEFAULT_CONFIG };
  }

  public static saveConfig(config: Partial<AppConfig>): AppConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save config to localStorage', e);
    }
    return updated;
  }

  public static hasValidRiotKey(): boolean {
    const config = this.getConfig();
    return Boolean(config.apiKey && config.apiKey.trim().startsWith('RGAPI-'));
  }
}
