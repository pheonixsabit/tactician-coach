import { UnifiedMatchData, MetaComp, CompMatchResult } from '../models/match';

export class CompMatcher {
  public static matchComp(match: UnifiedMatchData, metaComps: MetaComp[]): CompMatchResult | null {
    if (!metaComps || metaComps.length === 0) return null;

    const playerUnits = new Set(match.player.units.map(u => u.characterId));
    let bestComp: MetaComp = metaComps[0];
    let highestScore = -1;
    let bestUnitOverlap = 0;
    let bestTraitOverlap = 0;

    for (const comp of metaComps) {
      // 1. Calculate Unit Overlap
      let matchingUnits = 0;
      for (const coreUnit of comp.coreUnits) {
        if (playerUnits.has(coreUnit)) {
          matchingUnits++;
        }
      }
      const unitScore = comp.coreUnits.length > 0 ? (matchingUnits / comp.coreUnits.length) * 100 : 0;

      // 2. Calculate Trait Overlap
      let traitMatches = 0;
      let totalTargetTraits = 0;
      const playerTraits = new Map(match.player.traits.map(t => [t.name, t.numUnits]));

      for (const [traitName, minCount] of Object.entries(comp.coreTraits)) {
        totalTargetTraits++;
        const playerVal = playerTraits.get(traitName) || 0;
        if (playerVal >= minCount) {
          traitMatches += 1.0;
        } else if (playerVal > 0) {
          traitMatches += 0.5;
        }
      }
      const traitScore = totalTargetTraits > 0 ? (traitMatches / totalTargetTraits) * 100 : 0;

      // Weighted score: 60% unit overlap, 40% trait overlap
      const totalScore = Math.round(unitScore * 0.6 + traitScore * 0.4);

      if (totalScore > highestScore) {
        highestScore = totalScore;
        bestComp = comp;
        bestUnitOverlap = Math.round(unitScore);
        bestTraitOverlap = Math.round(traitScore);
      }
    }

    return {
      comp: bestComp,
      similarity: highestScore,
      unitOverlap: bestUnitOverlap,
      traitOverlap: bestTraitOverlap
    };
  }
}
