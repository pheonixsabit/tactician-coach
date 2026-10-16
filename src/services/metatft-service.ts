import { MetaComp } from '../models/match';
import fallbackData from '../../assets/data/meta_snapshot.json';

export class MetaTftService {
  private static cachedComps: MetaComp[] | null = null;
  private static itemDict: Record<string, { name: string; type: string }> = fallbackData.itemDictionary || {};
  private static champDict: Record<string, { name: string; cost: number; traits: string[] }> = fallbackData.championDictionary || {};

  /**
   * Dual-layer retriever: tries live endpoints, falls back to embedded snapshot
   */
  public static async getMetaComps(): Promise<MetaComp[]> {
    if (this.cachedComps) {
      return this.cachedComps;
    }

    try {
      // Attempt live public fetch (with 3-second timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('https://raw.githubusercontent.com/MetaTFT/meta-snapshot/main/current.json', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const liveData = await response.json();
        if (liveData && Array.isArray(liveData.comps) && liveData.comps.length > 0) {
          this.cachedComps = liveData.comps as MetaComp[];
          return this.cachedComps;
        }
      }
    } catch {
      // Expected fallback on network or CORS restrictions
    }

    // Seamless fallback to embedded snapshot
    this.cachedComps = fallbackData.comps as MetaComp[];
    return this.cachedComps;
  }

  public static getItemName(itemId: string): string {
    if (this.itemDict[itemId]) {
      return this.itemDict[itemId].name;
    }
    return itemId.replace(/^TFT_Item_|^TFT\d+_Item_/, '');
  }

  public static getChampionName(champId: string): string {
    if (this.champDict[champId]) {
      return this.champDict[champId].name;
    }
    return champId.replace(/^TFT\d+_/, '');
  }

  public static getChampionTraits(champId: string): string[] {
    return this.champDict[champId]?.traits || [];
  }
}
