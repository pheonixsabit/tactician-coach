import sampleData from '../../assets/data/sample_matches.json';
import { UnifiedMatchData } from '../models/match';
import { MatchAdapter } from './match-adapter';
import { OverwolfGepService } from './overwolf-gep';

export class EventSimulator {
  public static getSampleMatches(): UnifiedMatchData[] {
    return sampleData.matches.map(m => MatchAdapter.fromFixture(m));
  }

  public static simulateFirstPlaceMatch(): UnifiedMatchData {
    const match = MatchAdapter.fromFixture(sampleData.matches[0]);
    OverwolfGepService.triggerMatchEnd({
      me: {
        puuid: match.player.puuid,
        name: match.player.gameName,
        gold: match.player.goldLeft,
        level: match.player.level
      },
      board: match.player.units.map(u => ({
        name: u.characterId,
        tier: u.tier,
        items: u.items
      })),
      augments: match.player.augments,
      match_stats: {
        placement: 1,
        duration: match.gameDurationSeconds,
        damage: match.player.damageToPlayers,
        last_round: match.player.lastRound
      }
    });
    return match;
  }

  public static simulateEighthPlaceMatch(): UnifiedMatchData {
    const match = MatchAdapter.fromFixture(sampleData.matches[1]);
    OverwolfGepService.triggerMatchEnd({
      me: {
        puuid: match.player.puuid,
        name: match.player.gameName,
        gold: match.player.goldLeft,
        level: match.player.level
      },
      board: match.player.units.map(u => ({
        name: u.characterId,
        tier: u.tier,
        items: u.items
      })),
      augments: match.player.augments,
      match_stats: {
        placement: 8,
        duration: match.gameDurationSeconds,
        damage: match.player.damageToPlayers,
        last_round: match.player.lastRound
      }
    });
    return match;
  }
}
