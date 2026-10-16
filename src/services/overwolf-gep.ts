import { MatchAdapter } from './match-adapter';
import { UnifiedMatchData } from '../models/match';

const TFT_GAME_ID = 21570;
const REQUIRED_FEATURES = [
  'game_info',
  'live_client_data',
  'me',
  'match_info',
  'board',
  'bench',
  'augments',
  'match_stats'
];

export type MatchEndCallback = (matchData: UnifiedMatchData) => void;

export class OverwolfGepService {
  private static accumulatedState: any = {
    me: {},
    board: [],
    augments: [],
    match_stats: {}
  };
  private static listeners: MatchEndCallback[] = [];

  public static isRunningInOverwolf(): boolean {
    return typeof overwolf !== 'undefined' && typeof overwolf.games !== 'undefined';
  }

  public static initialize(): void {
    if (!this.isRunningInOverwolf()) {
      console.log('Running outside Overwolf - GEP listeners idle.');
      return;
    }

    overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, (res: any) => {
      if (res.success) {
        console.log('Overwolf TFT GEP features registered successfully.');
      } else {
        console.warn('Failed to register TFT GEP features:', res.error);
      }
    });

    overwolf.games.events.onInfoUpdates2.addListener((info: any) => {
      this.handleInfoUpdate(info);
    });

    overwolf.games.events.onNewEvents.addListener((events: any) => {
      this.handleGameEvents(events);
    });
  }

  public static onMatchEnd(callback: MatchEndCallback): void {
    this.listeners.push(callback);
  }

  private static handleInfoUpdate(info: any): void {
    if (!info || !info.info) return;

    if (info.info.me) {
      Object.assign(this.accumulatedState.me, info.info.me);
    }
    if (info.info.board) {
      this.accumulatedState.board = info.info.board;
    }
    if (info.info.augments) {
      this.accumulatedState.augments = info.info.augments;
    }
    if (info.info.match_stats) {
      Object.assign(this.accumulatedState.match_stats, info.info.match_stats);
      // Check if placement or game end is signaled
      if (info.info.match_stats.placement) {
        this.triggerMatchEnd();
      }
    }
  }

  private static handleGameEvents(eventWrapper: any): void {
    if (!eventWrapper || !eventWrapper.events) return;
    for (const event of eventWrapper.events) {
      if (event.name === 'match_end' || event.name === 'defeat' || event.name === 'victory') {
        this.triggerMatchEnd();
      }
    }
  }

  public static triggerMatchEnd(overrideData?: any): void {
    const dataToUse = overrideData || this.accumulatedState;
    const matchData = MatchAdapter.fromOverwolfGep(dataToUse);
    for (const listener of this.listeners) {
      try {
        listener(matchData);
      } catch (e) {
        console.error('Error in match end listener', e);
      }
    }
  }
}
