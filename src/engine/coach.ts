import { UnifiedMatchData, PostGameAnalysis, MetaComp } from '../models/match';
import { CompMatcher } from './comp-matcher';
import { ItemEvaluator } from './item-evaluator';
import { AugmentEvaluator } from './augment-evaluator';
import { EconomyEvaluator } from './economy-evaluator';
import { MetaTftService } from '../services/metatft-service';

export class CoachEngine {
  public static async analyze(match: UnifiedMatchData): Promise<PostGameAnalysis> {
    const metaComps: MetaComp[] = await MetaTftService.getMetaComps();

    // 1. Run Sub-Evaluators
    const compMatch = CompMatcher.matchComp(match, metaComps);
    const itemAnalysis = ItemEvaluator.evaluateItems(match, compMatch?.comp || null);
    const augmentAnalysis = AugmentEvaluator.evaluateAugments(match, compMatch?.comp || null);
    const economyAnalysis = EconomyEvaluator.evaluateEconomy(match);

    // 2. Calculate Weighted Overall Score
    // Placement weight (35%), Items (25%), Comp Alignment (15%), Augments (15%), Economy (10%)
    const placementScore = Math.max(0, (9 - match.player.placement) * 12.5); // 1st = 100, 8th = 12.5
    const compScore = compMatch ? compMatch.similarity : 50;

    const compositeScore = Math.round(
      placementScore * 0.35 +
      itemAnalysis.score * 0.25 +
      compScore * 0.15 +
      augmentAnalysis.score * 0.15 +
      economyAnalysis.score * 0.10
    );

    // 3. Assign Letter Grade
    let overallGrade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
    if (compositeScore >= 90) overallGrade = 'S';
    else if (compositeScore >= 80) overallGrade = 'A';
    else if (compositeScore >= 70) overallGrade = 'B';
    else if (compositeScore >= 60) overallGrade = 'C';
    else if (compositeScore >= 50) overallGrade = 'D';
    else overallGrade = 'F';

    // 4. Generate Strengths & Blunders
    const strengths: string[] = [];
    const blunders: string[] = [];

    // Comp Insights
    if (compMatch && compMatch.similarity >= 80) {
      strengths.push(`Recognized and hit the ${compMatch.comp.name} meta shell with ${compMatch.unitOverlap}% core unit precision.`);
    } else if (compMatch && compMatch.similarity < 50) {
      blunders.push(`Board lacked synergy: ended as a disconnected hybrid (${compMatch.unitOverlap}% match to nearest comp ${compMatch.comp.name}).`);
    }

    // Item Insights
    if (itemAnalysis.bisMatches.filter(b => b.isBis).length >= 2) {
      strengths.push(`Secured Best-in-Slot (BIS) itemization on your primary carries.`);
    }
    for (const critique of itemAnalysis.critiques.slice(0, 2)) {
      blunders.push(critique);
    }

    // Augment Insights
    const optimalAugments = augmentAnalysis.evaluatedAugments.filter(a => a.synergyRating === 'Optimal');
    if (optimalAugments.length >= 2) {
      strengths.push(`Capitalized on high-synergy combat/trait augments (${optimalAugments.map(a => a.name).join(', ')}).`);
    }
    const suboptimalAugments = augmentAnalysis.evaluatedAugments.filter(a => a.synergyRating === 'Suboptimal');
    for (const sub of suboptimalAugments) {
      blunders.push(`Augment Miss: ${sub.name} - ${sub.critique}`);
    }

    // Critical Economy Insights (High priority blunder)
    if (economyAnalysis.goldWastedAtDeath >= 20) {
      blunders.unshift(`Economy blunder: died holding ${economyAnalysis.goldWastedAtDeath} unspent gold on stage ${economyAnalysis.eliminationStage}.`);
    } else if (economyAnalysis.tempoGrade === 'Fast') {
      strengths.push('Disciplined economy: successfully leveled to 9 to cap out legendary board.');
    }

    // Fill defaults if too short
    if (strengths.length === 0) {
      strengths.push('Contested a recognized carry and maintained health through the early stages.');
    }
    if (blunders.length === 0 && match.player.placement > 1) {
      blunders.push('Late-game positioning: scout remaining opponents to avoid carry focus fire.');
    }

    // 5. Actionable Next-Game Recommendation
    let nextGameAdvice = 'Maintain active scouting and prioritize flexible item slams on 2-1 and 2-5.';
    if (economyAnalysis.goldWastedAtDeath >= 20) {
      nextGameAdvice = 'Commit to an all-in roll down on stage 4-1 or 4-2 whenever you drop below 35 HP. Never bleed out holding gold.';
    } else if (itemAnalysis.critiques.length > 0) {
      nextGameAdvice = 'Prioritize building resistance shred (Last Whisper or Statikk Shiv) early to ensure carries can pierce frontline tanks.';
    } else if (compMatch && compMatch.similarity < 60) {
      nextGameAdvice = 'Pick a direction by stage 3-2 based on your upgraded 2-star units and items, rather than pivoting too late.';
    }

    return {
      matchId: match.matchId,
      placement: match.player.placement,
      overallGrade,
      compAnalysis: compMatch,
      itemAnalysis,
      augmentAnalysis,
      economyAnalysis,
      strengths: strengths.slice(0, 3),
      blunders: blunders.slice(0, 3),
      nextGameAdvice
    };
  }
}
