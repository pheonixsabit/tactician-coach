import { UnifiedMatchData, EconomyAnalysisResult } from '../models/match';

export class EconomyEvaluator {
  public static evaluateEconomy(match: UnifiedMatchData): EconomyAnalysisResult {
    const goldLeft = match.player.goldLeft || 0;
    const stage = match.player.lastRound || 'Unknown';
    const placement = match.player.placement;
    const level = match.player.level;

    const critiques: string[] = [];
    let score = 85;
    let tempoGrade: 'Fast' | 'Standard' | 'Slow / Bleed' = 'Standard';

    // 1. Unspent gold upon elimination
    if (placement > 4) {
      if (goldLeft >= 35) {
        score -= 40;
        tempoGrade = 'Slow / Bleed';
        critiques.push(`Died rich: Eliminated on stage ${stage} with ${goldLeft} unspent gold. Rolling down earlier could have preserved HP.`);
      } else if (goldLeft >= 15) {
        score -= 20;
        critiques.push(`Eliminated with ${goldLeft} unspent gold. Every 2-star upgrade matters during elimination rounds.`);
      } else {
        critiques.push(`Rolled down effectively to 0 gold fighting for survival on stage ${stage}.`);
      }
    } else {
      // Top 4 finish
      if (level >= 9) {
        tempoGrade = 'Fast';
        critiques.push(`High tempo: successfully pushed Level 9 on stage ${stage} to cap out high-cost legendaries.`);
      } else {
        critiques.push(`Solid economy management: stabilized at level ${level} and converted gold into top-four placement.`);
      }
    }

    // 2. Level vs Stage benchmark
    if (stage.startsWith('4-') && level < 7 && placement > 4) {
      score -= 20;
      critiques.push('Under-leveled on Stage 4: Fell behind the lobby curve, taking heavy round losses.');
    }

    return {
      score: Math.max(10, Math.min(100, score)),
      eliminationStage: stage,
      goldWastedAtDeath: placement > 4 ? goldLeft : 0,
      tempoGrade,
      critiques
    };
  }
}
