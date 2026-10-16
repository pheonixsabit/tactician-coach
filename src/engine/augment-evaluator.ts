import { UnifiedMatchData, MetaComp, AugmentAnalysisResult } from '../models/match';

export class AugmentEvaluator {
  /**
   * Strictly evaluates augments based on Board & Trait Synergy.
   * COMPLIANCE: NEVER outputs augment win-rates or average game placement numbers.
   */
  public static evaluateAugments(match: UnifiedMatchData, matchedComp: MetaComp | null): AugmentAnalysisResult {
    const evaluatedAugments: AugmentAnalysisResult['evaluatedAugments'] = [];
    let synergyScoreSum = 0;

    const playerTraits = new Set(match.player.traits.map(t => t.name));
    const compTraits = matchedComp ? new Set(Object.keys(matchedComp.coreTraits)) : new Set<string>();

    for (const augmentId of match.player.augments) {
      const cleanName = augmentId
        .replace(/^TFT\d+_Augment_|^TFT\d+_/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim();

      let rating: 'Optimal' | 'Viable' | 'Suboptimal' = 'Viable';
      let critique = 'Provides solid generic utility to your board.';
      let scoreVal = 75;

      // Synergy checks
      if (augmentId.toLowerCase().includes('crest') || augmentId.toLowerCase().includes('crown') || augmentId.toLowerCase().includes('heart')) {
        // Trait emblem augment
        const matchedTrait = Array.from(playerTraits).find(t =>
          augmentId.toLowerCase().includes(t.toLowerCase().replace(/^tft\d+_trait_|^tft\d+_/, ''))
        );

        if (matchedTrait) {
          rating = 'Optimal';
          critique = 'Direct trait amplifier: pushed your team into a higher vertical trait tier.';
          scoreVal = 95;
        } else {
          rating = 'Suboptimal';
          critique = 'Emblem augment chosen without supporting board units or active trait synergy.';
          scoreVal = 40;
        }
      } else if (augmentId.toLowerCase().includes('magic') || augmentId.toLowerCase().includes('ap')) {
        // AP augment
        const hasApCarry = matchedComp?.carries.some(c => c.role.includes('AP'));
        if (hasApCarry) {
          rating = 'Optimal';
          critique = 'Amplified ability power on your primary magical damage dealer.';
          scoreVal = 90;
        } else {
          rating = 'Suboptimal';
          critique = 'Spellcaster augment selected on a predominantly physical / AD composition.';
          scoreVal = 45;
        }
      } else if (augmentId.toLowerCase().includes('cybernetic') || augmentId.toLowerCase().includes('radiant')) {
        rating = 'Optimal';
        critique = 'High-tempo combat augment that maximized itemized champion power.';
        scoreVal = 90;
      } else if (augmentId.toLowerCase().includes('loss') || augmentId.toLowerCase().includes('spoon')) {
        if (match.player.placement > 4) {
          rating = 'Suboptimal';
          critique = 'Greedy economy augment taken without stabilizing board HP, accelerating elimination.';
          scoreVal = 50;
        }
      }

      synergyScoreSum += scoreVal;
      evaluatedAugments.push({
        id: augmentId,
        name: cleanName,
        synergyRating: rating,
        critique
      });
    }

    const count = evaluatedAugments.length || 1;
    const finalScore = Math.round(synergyScoreSum / count);

    return {
      score: finalScore,
      evaluatedAugments
    };
  }
}
