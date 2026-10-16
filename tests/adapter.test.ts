import { describe, it, expect } from 'vitest';
import { MatchAdapter } from '../src/services/match-adapter';
import sampleData from '../assets/data/sample_matches.json';

describe('MatchAdapter & Unified Schema', () => {
  it('normalizes local fixture into UnifiedMatchData', () => {
    const raw = sampleData.matches[0];
    const unified = MatchAdapter.fromFixture(raw);

    expect(unified.source).toBe('local_fixture');
    expect(unified.player.placement).toBe(1);
    expect(unified.player.level).toBe(9);
    expect(unified.player.units.length).toBeGreaterThan(0);
    expect(unified.player.traits.length).toBeGreaterThan(0);
    expect(unified.player.units[0].displayName).toBeDefined();
  });

  it('normalizes Overwolf GEP telemetry payload into UnifiedMatchData', () => {
    const rawGep = {
      me: {
        puuid: 'gep-user-123',
        name: 'TacticianPlayer',
        gold: 15,
        level: 8
      },
      board: [
        { name: 'TFT13_Jinx', tier: 2, items: ['TFT_Item_InfinityEdge'] },
        { name: 'TFT13_Vi', tier: 2, items: ['TFT_Item_TitansResolve'] }
      ],
      augments: ['TFT13_Augment_RebelCrest'],
      match_stats: {
        placement: 2,
        duration: 1950,
        damage: 120,
        last_round: '5-6'
      }
    };

    const unified = MatchAdapter.fromOverwolfGep(rawGep);
    expect(unified.source).toBe('overwolf_gep');
    expect(unified.player.placement).toBe(2);
    expect(unified.player.units.length).toBe(2);
    expect(unified.player.units[0].displayName).toBe('Jinx');
    expect(unified.player.units[0].items).toContain('TFT_Item_InfinityEdge');
  });

  it('normalizes Riot API TFT-Match-v1 structure into UnifiedMatchData', () => {
    const rawRiotMatch = {
      metadata: { match_id: 'NA1_123456789' },
      info: {
        game_datetime: 1730000000000,
        game_length: 2100.5,
        tft_set_number: 13,
        participants: [
          {
            puuid: 'target-puuid-1',
            riotIdGameName: 'RiotPlayer',
            riotIdTagline: 'NA1',
            placement: 3,
            level: 8,
            gold_left: 2,
            last_round: 34,
            total_damage_to_players: 95,
            augments: ['TFT13_Augment_CyberneticUplink'],
            traits: [{ name: 'TFT13_Rebel', num_units: 5, tier_current: 2 }],
            units: [{ character_id: 'TFT13_Jinx', tier: 2, itemNames: ['TFT_Item_InfinityEdge'] }]
          }
        ]
      }
    };

    const unified = MatchAdapter.fromRiotApi(rawRiotMatch, 'target-puuid-1');
    expect(unified.source).toBe('riot_api');
    expect(unified.matchId).toBe('NA1_123456789');
    expect(unified.player.placement).toBe(3);
    expect(unified.player.gameName).toBe('RiotPlayer');
    expect(unified.player.units[0].displayName).toBe('Jinx');
  });
});
