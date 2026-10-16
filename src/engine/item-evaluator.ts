import { UnifiedMatchData, MetaComp, ItemAnalysisResult } from '../models/match';
import { MetaTftService } from '../services/metatft-service';

export class ItemEvaluator {
  public static evaluateItems(match: UnifiedMatchData, matchedComp: MetaComp | null): ItemAnalysisResult {
    const bisMatches: Array<{ unit: string; item: string; isBis: boolean }> = [];
    const critiques: string[] = [];
    let totalItemsOnCarries = 0;
    let bisOrGoodItemsCount = 0;

    const carryMap = new Map<string, { bis: string[]; alternatives: string[] }>();
    if (matchedComp) {
      for (const carry of matchedComp.carries) {
        carryMap.set(carry.characterId, { bis: carry.bis, alternatives: carry.alternatives });
      }
    }

    // Check equipped items on all units
    let hasArmorShred = false;
    let hasAntiHeal = false;

    for (const unit of match.player.units) {
      const metaConfig = carryMap.get(unit.characterId);

      for (const item of unit.items) {
        if (item === 'TFT_Item_LastWhisper') hasArmorShred = true;
        if (item === 'TFT_Item_SunfireCape' || item === 'TFT_Item_Morellonomicon' || item === 'TFT_Item_RedBuff') {
          hasAntiHeal = true;
        }

        if (metaConfig) {
          totalItemsOnCarries++;
          const isTrueBis = metaConfig.bis.includes(item);
          const isAlternative = metaConfig.alternatives.includes(item);

          bisMatches.push({
            unit: unit.displayName,
            item: MetaTftService.getItemName(item),
            isBis: isTrueBis
          });

          if (isTrueBis) {
            bisOrGoodItemsCount += 1.0;
          } else if (isAlternative) {
            bisOrGoodItemsCount += 0.75;
          } else {
            // Misplaced item on a core carry
            critiques.push(`Suboptimal item: ${MetaTftService.getItemName(item)} on ${unit.displayName}`);
          }
        }
      }
    }

    // Check utility requirements
    if (!hasArmorShred && match.player.placement > 4) {
      critiques.push('Lacked physical resistance shred (Last Whisper / Evenshroud) against heavy tank frontlines.');
    }
    if (!hasAntiHeal && match.player.placement > 4) {
      critiques.push('Lacked anti-heal (Sunfire / Morellonomicon / Red Buff) against sustain champions.');
    }

    // Score calculation
    let score = 50;
    if (totalItemsOnCarries > 0) {
      score = Math.round((bisOrGoodItemsCount / totalItemsOnCarries) * 100);
    }
    if (hasArmorShred) score = Math.min(100, score + 5);
    if (hasAntiHeal) score = Math.min(100, score + 5);
    if (critiques.length > 2) score = Math.max(20, score - 15);

    return {
      score,
      bisMatches,
      wastedComponents: [],
      critiques
    };
  }
}
