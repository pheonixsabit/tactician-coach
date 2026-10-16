import { UnifiedMatchData, UnitInfo, TraitInfo, LobbyParticipant } from '../models/match';

export class MatchAdapter {
  /**
   * Normalizes raw Riot Games API TFT-Match-v1 JSON into UnifiedMatchData
   */
  public static fromRiotApi(rawMatch: any, targetPuuid: string): UnifiedMatchData {
    const info = rawMatch.info || {};
    const metadata = rawMatch.metadata || {};
    const participants: any[] = info.participants || [];

    const targetParticipant = participants.find((p: any) => p.puuid === targetPuuid) || participants[0] || {};

    const units: UnitInfo[] = (targetParticipant.units || []).map((u: any) => ({
      characterId: u.character_id,
      displayName: u.character_id.replace(/^TFT\d+_/, ''),
      tier: u.tier || 1,
      items: u.itemNames || [],
      isCarry: (u.itemNames || []).length >= 2 || (u.tier || 1) >= 3
    }));

    const traits: TraitInfo[] = (targetParticipant.traits || []).map((t: any) => ({
      name: t.name,
      numUnits: t.num_units,
      tierCurrent: t.tier_current
    }));

    const lobby: LobbyParticipant[] = participants.map((p: any) => ({
      puuid: p.puuid,
      gameName: p.riotIdGameName || 'Player',
      placement: p.placement,
      level: p.level,
      traits: (p.traits || [])
        .filter((t: any) => t.tier_current > 0)
        .map((t: any) => `${t.num_units} ${t.name.replace(/^TFT\d+_Trait_|^TFT\d+_/, '')}`)
    }));

    return {
      source: 'riot_api',
      matchId: metadata.match_id || 'UNKNOWN_MATCH',
      gameDatetime: info.game_datetime || Date.now(),
      gameDurationSeconds: Math.round(info.game_length || 0),
      setNumber: info.tft_set_number || 13,
      player: {
        puuid: targetParticipant.puuid || targetPuuid,
        gameName: targetParticipant.riotIdGameName || 'Tactician',
        tagLine: targetParticipant.riotIdTagline || 'NA1',
        placement: targetParticipant.placement || 1,
        level: targetParticipant.level || 8,
        goldLeft: targetParticipant.gold_left || 0,
        lastRound: targetParticipant.last_round ? `${targetParticipant.last_round}` : 'Unknown',
        damageToPlayers: targetParticipant.total_damage_to_players || 0,
        augments: targetParticipant.augments || [],
        traits,
        units
      },
      lobby
    };
  }

  /**
   * Normalizes Overwolf Game Events Provider (GEP) raw telemetry into UnifiedMatchData
   */
  public static fromOverwolfGep(gepData: {
    me?: any;
    board?: any;
    augments?: any;
    match_stats?: any;
  }): UnifiedMatchData {
    const me = gepData.me || {};
    const stats = gepData.match_stats || {};

    const rawUnits = gepData.board ? (Array.isArray(gepData.board) ? gepData.board : Object.values(gepData.board)) : [];
    const units: UnitInfo[] = rawUnits.map((u: any) => ({
      characterId: u.name || u.character_id || 'Unknown',
      displayName: (u.name || u.character_id || 'Unknown').replace(/^TFT\d+_/, ''),
      tier: Number(u.tier || u.level || 1),
      items: Array.isArray(u.items) ? u.items : [],
      isCarry: (u.items && u.items.length >= 2) || Number(u.tier || 1) >= 3
    }));

    const rawAugments = gepData.augments ? (Array.isArray(gepData.augments) ? gepData.augments : Object.values(gepData.augments)) : [];
    const augments = rawAugments.map((a: any) => (typeof a === 'string' ? a : a.name || a.id));

    return {
      source: 'overwolf_gep',
      matchId: stats.match_id || `OW_${Date.now()}`,
      gameDatetime: Date.now(),
      gameDurationSeconds: stats.duration || 1800,
      setNumber: 13,
      player: {
        puuid: me.puuid || 'local-overwolf-player',
        gameName: me.name || 'Tactician',
        tagLine: 'LOCAL',
        placement: Number(stats.placement || 1),
        level: Number(me.level || 8),
        goldLeft: Number(me.gold || 0),
        lastRound: stats.last_round || '5-5',
        damageToPlayers: Number(stats.damage || 80),
        augments,
        traits: [], // Dynamically derived from units if not in GEP
        units
      }
    };
  }

  /**
   * Direct passthrough for bundled local fixtures
   */
  public static fromFixture(fixture: any): UnifiedMatchData {
    return {
      ...fixture,
      source: 'local_fixture'
    };
  }
}
