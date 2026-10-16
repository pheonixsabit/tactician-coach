import { ConfigService } from './config-service';
import { UnifiedMatchData } from '../models/match';
import { MatchAdapter } from './match-adapter';

export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export class RiotApiClient {
  private static getHeaders(apiKey?: string): HeadersInit {
    const key = apiKey || ConfigService.getConfig().apiKey;
    return {
      'X-Riot-Token': key,
      'Accept': 'application/json'
    };
  }

  private static getRegionalHost(region: string): string {
    switch (region.toLowerCase()) {
      case 'europe':
        return 'https://europe.api.riotgames.com';
      case 'asia':
        return 'https://asia.api.riotgames.com';
      case 'sea':
        return 'https://sea.api.riotgames.com';
      case 'americas':
      default:
        return 'https://americas.api.riotgames.com';
    }
  }

  /**
   * Resolves Riot ID (gameName#tagLine) to PUUID via ACCOUNT-V1
   */
  public static async getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotAccount> {
    const config = ConfigService.getConfig();
    const host = this.getRegionalHost(config.region);
    const url = `${host}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) {
      throw new Error(`Riot API Account lookup failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Fetches recent TFT match IDs for a player via TFT-MATCH-V1
   */
  public static async getRecentMatchIds(puuid: string, count: number = 10): Promise<string[]> {
    const config = ConfigService.getConfig();
    const host = this.getRegionalHost(config.region);
    const url = `${host}/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`;

    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) {
      throw new Error(`Riot API TFT Match list failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Fetches raw match details and normalizes to UnifiedMatchData via TFT-MATCH-V1
   */
  public static async getMatchDetails(matchId: string, puuid: string): Promise<UnifiedMatchData> {
    const config = ConfigService.getConfig();
    const host = this.getRegionalHost(config.region);
    const url = `${host}/tft/match/v1/matches/${matchId}`;

    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) {
      throw new Error(`Riot API Match details failed: ${res.status} ${res.statusText}`);
    }
    const rawMatch = await res.json();
    return MatchAdapter.fromRiotApi(rawMatch, puuid);
  }
}
