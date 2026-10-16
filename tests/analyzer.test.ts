import { describe, it, expect } from 'vitest';
import { CoachEngine } from '../src/engine/coach';
import { MatchAdapter } from '../src/services/match-adapter';
import sampleData from '../assets/data/sample_matches.json';

describe('Tactician Coach Analysis Engine & Riot Compliance', () => {
  it('correctly grades a 1st place match with high score and Rebel Fast-8 comp', async () => {
    const match = MatchAdapter.fromFixture(sampleData.matches[0]);
    const analysis = await CoachEngine.analyze(match);

    expect(analysis.placement).toBe(1);
    expect(['S', 'A']).toContain(analysis.overallGrade);
    expect(analysis.compAnalysis).not.toBeNull();
    expect(analysis.compAnalysis?.comp.name).toContain('Rebel Fast-8');
    expect(analysis.compAnalysis?.similarity).toBeGreaterThanOrEqual(80);

    expect(analysis.itemAnalysis.score).toBeGreaterThan(70);
    expect(analysis.strengths.length).toBeGreaterThan(0);
    expect(analysis.nextGameAdvice).toBeDefined();
  });

  it('correctly identifies blunders and assigns low grade for an 8th place match', async () => {
    const match = MatchAdapter.fromFixture(sampleData.matches[1]);
    const analysis = await CoachEngine.analyze(match);

    expect(analysis.placement).toBe(8);
    expect(['D', 'F']).toContain(analysis.overallGrade);
    expect(analysis.economyAnalysis.goldWastedAtDeath).toBe(48);
    expect(analysis.economyAnalysis.tempoGrade).toBe('Slow / Bleed');

    const hasDiedRichBlunder = analysis.blunders.some(b => b.includes('unspent gold') || b.includes('Died rich'));
    expect(hasDiedRichBlunder).toBe(true);
  });

  it('STRICT RIOT COMPLIANCE: confirms NO augment win-rate or average placement fields exist', async () => {
    const match = MatchAdapter.fromFixture(sampleData.matches[0]);
    const analysis = await CoachEngine.analyze(match);

    const serialized = JSON.stringify(analysis.augmentAnalysis);
    expect(serialized.toLowerCase()).not.toContain('winrate');
    expect(serialized.toLowerCase()).not.toContain('win_rate');
    expect(serialized.toLowerCase()).not.toContain('avgplacement');
    expect(serialized.toLowerCase()).not.toContain('average_placement');

    for (const evaluated of analysis.augmentAnalysis.evaluatedAugments) {
      expect(['Optimal', 'Viable', 'Suboptimal']).toContain(evaluated.synergyRating);
      expect(evaluated.critique).toBeDefined();
    }
  });
});
