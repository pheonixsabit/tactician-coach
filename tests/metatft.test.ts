import { describe, it, expect } from 'vitest';
import { MetaTftService } from '../src/services/metatft-service';

describe('MetaTftService & Dual-Layer Ingestion', () => {
  it('retrieves meta compositions with clean fallback', async () => {
    const comps = await MetaTftService.getMetaComps();
    expect(comps.length).toBeGreaterThan(0);
    expect(comps[0].id).toBeDefined();
    expect(comps[0].coreUnits.length).toBeGreaterThan(0);
    expect(comps[0].carries.length).toBeGreaterThan(0);
  });

  it('correctly maps item and champion internal IDs to display names', () => {
    const itemName = MetaTftService.getItemName('TFT_Item_InfinityEdge');
    expect(itemName).toBe('Infinity Edge');

    const champName = MetaTftService.getChampionName('TFT13_Jinx');
    expect(champName).toBe('Jinx');
  });
});
