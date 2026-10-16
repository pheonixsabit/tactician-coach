export interface TraitInfo {
  name: string;
  numUnits: number;
  tierCurrent: number;
}

export interface UnitInfo {
  characterId: string;
  displayName: string;
  tier: number; // 1, 2, or 3 star
  items: string[];
  isCarry?: boolean;
}

export interface LobbyParticipant {
  puuid: string;
  gameName: string;
  placement: number;
  level: number;
  traits: string[];
}

export interface UnifiedMatchData {
  source: 'local_fixture' | 'overwolf_gep' | 'riot_api';
  matchId: string;
  gameDatetime: number;
  gameDurationSeconds: number;
  setNumber: number;
  player: {
    puuid: string;
    gameName: string;
    tagLine: string;
    placement: number; // 1 to 8
    level: number;
    goldLeft: number;
    lastRound: string; // e.g. "5-4"
    damageToPlayers: number;
    augments: string[];
    traits: TraitInfo[];
    units: UnitInfo[];
  };
  lobby?: LobbyParticipant[];
}

export interface CarryMetaConfig {
  characterId: string;
  role: string;
  bis: string[];
  alternatives: string[];
}

export interface MetaComp {
  id: string;
  name: string;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  avgPlacement: number;
  playstyle: string;
  coreUnits: string[];
  coreTraits: Record<string, number>;
  carries: CarryMetaConfig[];
}

export interface CompMatchResult {
  comp: MetaComp;
  similarity: number; // 0 to 100%
  traitOverlap: number;
  unitOverlap: number;
}

export interface ItemAnalysisResult {
  score: number; // 0 to 100
  bisMatches: Array<{ unit: string; item: string; isBis: boolean }>;
  wastedComponents: string[];
  critiques: string[];
}

export interface AugmentAnalysisResult {
  score: number; // 0 to 100
  evaluatedAugments: Array<{
    id: string;
    name: string;
    synergyRating: 'Optimal' | 'Viable' | 'Suboptimal';
    critique: string;
  }>;
}

export interface EconomyAnalysisResult {
  score: number; // 0 to 100
  eliminationStage: string;
  goldWastedAtDeath: number;
  tempoGrade: 'Fast' | 'Standard' | 'Slow / Bleed';
  critiques: string[];
}

export interface PostGameAnalysis {
  matchId: string;
  placement: number;
  overallGrade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  compAnalysis: CompMatchResult | null;
  itemAnalysis: ItemAnalysisResult;
  augmentAnalysis: AugmentAnalysisResult;
  economyAnalysis: EconomyAnalysisResult;
  strengths: string[];
  blunders: string[];
  nextGameAdvice: string;
}

export interface AppConfig {
  riotId: string;
  tagLine: string;
  apiKey: string;
  region: 'americas' | 'europe' | 'asia' | 'sea';
  platform: 'na1' | 'euw1' | 'eun1' | 'kr' | 'br1' | 'jp1' | 'oc1';
  autoOpenOverlay: boolean;
  useLiveRiotApiWhenAvailable: boolean;
}
