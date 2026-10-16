import { OverwolfGepService } from '../../services/overwolf-gep';
import { ConfigService } from '../../services/config-service';
import { CoachEngine } from '../../engine/coach';
import { UnifiedMatchData, PostGameAnalysis } from '../../models/match';

console.log('[Tactician Coach] Background controller initialized.');

let currentMatchData: UnifiedMatchData | null = null;
let currentAnalysis: PostGameAnalysis | null = null;

// Public Controller API exposed on the background window for child windows
export interface TacticianControllerAPI {
  getCurrentMatch: () => UnifiedMatchData | null;
  getCurrentAnalysis: () => PostGameAnalysis | null;
  runAnalysis: (matchData: UnifiedMatchData) => Promise<PostGameAnalysis>;
  openOverlay: () => void;
  openDesktop: () => void;
}

export const TacticianController: TacticianControllerAPI = {
  getCurrentMatch: () => currentMatchData,
  getCurrentAnalysis: () => currentAnalysis,
  runAnalysis: async (matchData: UnifiedMatchData) => {
    currentMatchData = matchData;
    currentAnalysis = await CoachEngine.analyze(matchData);
    localStorage.setItem('latest_match_analysis', JSON.stringify({ matchData, analysis: currentAnalysis }));
    return currentAnalysis;
  },
  openOverlay: () => {
    if (typeof overwolf !== 'undefined' && overwolf.windows) {
      overwolf.windows.obtainDeclaredWindow('post_game', (result) => {
        if (result.success) {
          overwolf.windows.restore(result.window.id, () => {
            console.log('[Tactician Coach] Overlay window opened.');
          });
        }
      });
    }
  },
  openDesktop: () => {
    if (typeof overwolf !== 'undefined' && overwolf.windows) {
      overwolf.windows.obtainDeclaredWindow('desktop', (result) => {
        if (result.success) {
          overwolf.windows.restore(result.window.id, () => {
            console.log('[Tactician Coach] Desktop window opened.');
          });
        }
      });
    }
  }
};

// Bind to window for overwolf.windows.getMainWindow()
(window as any).TacticianController = TacticianController;

// Initialize Overwolf Game Events Provider
OverwolfGepService.initialize();

// Listen for match completion
OverwolfGepService.onMatchEnd(async (matchData) => {
  console.log('[Tactician Coach] Match end detected! Running analysis...', matchData);
  try {
    await TacticianController.runAnalysis(matchData);
    const config = ConfigService.getConfig();
    if (config.autoOpenOverlay) {
      TacticianController.openOverlay();
    }
  } catch (err) {
    console.error('[Tactician Coach] Failed to analyze match data', err);
  }
});
