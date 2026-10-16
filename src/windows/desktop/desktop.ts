import { PostGameAnalysis, UnifiedMatchData } from '../../models/match';
import { EventSimulator } from '../../services/event-simulator';
import { CoachEngine } from '../../engine/coach';
import { ConfigService } from '../../services/config-service';
import { MetaTftService } from '../../services/metatft-service';
import { RiotApiClient } from '../../services/riot-api';

let currentMatchData: UnifiedMatchData | null = null;
let currentAnalysis: PostGameAnalysis | null = null;

async function loadMatch(match: UnifiedMatchData) {
  currentMatchData = match;
  currentAnalysis = await CoachEngine.analyze(match);
  renderDashboard(currentMatchData, currentAnalysis);
}

function renderDashboard(match: UnifiedMatchData, analysis: PostGameAnalysis) {
  // 1. Connection Status
  const connectionText = document.getElementById('connectionText')!;
  if (ConfigService.hasValidRiotKey()) {
    connectionText.textContent = 'Riot API Primary (Active)';
  } else {
    connectionText.textContent = match.source === 'overwolf_gep' ? 'Overwolf GEP Live' : 'Local Adapter Active';
  }

  // 2. Hero Summary
  const heroPlacement = document.getElementById('heroPlacement')!;
  heroPlacement.textContent = `#${analysis.placement} Place`;
  heroPlacement.className = analysis.placement <= 4 ? 'text-3xl font-black text-amber-400 mt-1' : 'text-3xl font-black text-rose-400 mt-1';

  const mins = Math.floor(match.gameDurationSeconds / 60);
  const secs = match.gameDurationSeconds % 60;
  document.getElementById('heroDuration')!.textContent = `${mins}m ${secs}s • Stage ${match.player.lastRound}`;

  // Grade
  const heroGradeLetter = document.getElementById('heroGradeLetter')!;
  const heroGradeBadge = document.getElementById('heroGradeBadge')!;
  heroGradeLetter.textContent = analysis.overallGrade;
  if (analysis.overallGrade === 'S' || analysis.overallGrade === 'A') {
    heroGradeBadge.className = 'w-16 h-16 rounded-xl bg-emerald-600 flex flex-col items-center justify-center text-white shadow-lg';
  } else if (analysis.overallGrade === 'B' || analysis.overallGrade === 'C') {
    heroGradeBadge.className = 'w-16 h-16 rounded-xl bg-blue-600 flex flex-col items-center justify-center text-white shadow-lg';
  } else {
    heroGradeBadge.className = 'w-16 h-16 rounded-xl bg-rose-600 flex flex-col items-center justify-center text-white shadow-lg';
  }

  // Comp
  if (analysis.compAnalysis) {
    document.getElementById('heroCompName')!.textContent = analysis.compAnalysis.comp.name;
    document.getElementById('heroCompPercent')!.textContent = `${analysis.compAnalysis.similarity}%`;
    document.getElementById('heroCompBar')!.style.width = `${analysis.compAnalysis.similarity}%`;
    document.getElementById('heroCompTier')!.innerHTML = `Meta Tier: <span class="text-amber-400 font-bold">${analysis.compAnalysis.comp.tier} Tier</span> (Avg: ${analysis.compAnalysis.comp.avgPlacement})`;
  } else {
    document.getElementById('heroCompName')!.textContent = 'Custom Composition';
    document.getElementById('heroCompPercent')!.textContent = '40%';
    document.getElementById('heroCompBar')!.style.width = '40%';
  }

  // Item Score
  document.getElementById('heroItemScore')!.textContent = `${analysis.itemAnalysis.score}`;
  const bisCount = analysis.itemAnalysis.bisMatches.filter(b => b.isBis).length;
  document.getElementById('heroItemSummary')!.textContent = bisCount > 0 ? `✓ ${bisCount} Best-in-Slot items equipped` : 'Suboptimal item distributions';

  // Economy Score
  document.getElementById('heroEconScore')!.textContent = `${analysis.economyAnalysis.score}`;
  document.getElementById('heroEconSummary')!.textContent = `${analysis.economyAnalysis.tempoGrade} tempo • ${analysis.economyAnalysis.goldWastedAtDeath}g unspent at death`;

  // 3. Coach Breakdown
  const strengthsList = document.getElementById('coachStrengthsList')!;
  strengthsList.innerHTML = analysis.strengths.map(s => `<li>✓ ${s}</li>`).join('');

  const blundersList = document.getElementById('coachBlundersList')!;
  blundersList.innerHTML = analysis.blunders.map(b => `<li>✗ ${b}</li>`).join('');

  document.getElementById('coachNextGameAdvice')!.textContent = analysis.nextGameAdvice;

  // 4. Units Board
  document.getElementById('playerLevelBadge')!.textContent = `Level ${match.player.level}`;
  const unitsGrid = document.getElementById('unitsGrid')!;
  unitsGrid.innerHTML = match.player.units.map(u => {
    const starString = '★'.repeat(u.tier);
    const starColor = u.tier === 3 ? 'text-amber-300' : u.tier === 2 ? 'text-gray-300' : 'text-amber-600';
    const carryBorder = u.isCarry ? 'border-amber-500/80 shadow-amber-500/20 shadow-md' : 'border-gray-800';

    const itemsHtml = u.items.map(itemId => {
      const itemName = MetaTftService.getItemName(itemId);
      const isBis = analysis.itemAnalysis.bisMatches.some(b => b.item === itemName && b.isBis);
      const badgeColor = isBis ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-gray-800 text-gray-300 border-gray-700';
      return `<span class="px-1.5 py-0.5 rounded text-[9px] border ${badgeColor} truncate max-w-full inline-block" title="${itemName}">${itemName}</span>`;
    }).join('');

    return `
      <div class="bg-gray-900/90 border ${carryBorder} rounded-lg p-2.5 flex flex-col justify-between space-y-2">
        <div>
          <div class="flex items-center justify-between text-xs font-bold text-white">
            <span class="truncate">${u.displayName}</span>
            <span class="${starColor} text-[11px]">${starString}</span>
          </div>
          ${u.isCarry ? '<span class="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Key Carry</span>' : ''}
        </div>
        <div class="flex flex-col space-y-1">
          ${itemsHtml || '<span class="text-[9px] text-gray-600">No items</span>'}
        </div>
      </div>
    `;
  }).join('');

  // 5. Augment Synergy
  const augmentsContainer = document.getElementById('augmentsContainer')!;
  augmentsContainer.innerHTML = analysis.augmentAnalysis.evaluatedAugments.map(a => {
    const badgeColor = a.synergyRating === 'Optimal' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' :
                       a.synergyRating === 'Viable' ? 'bg-blue-950/60 border-blue-800 text-blue-300' :
                       'bg-rose-950/60 border-rose-800 text-rose-300';
    return `
      <div class="bg-gray-900/60 border border-gray-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
        <div>
          <div class="font-bold text-white">${a.name}</div>
          <div class="text-[11px] text-gray-400 mt-0.5">${a.critique}</div>
        </div>
        <span class="px-2 py-0.5 rounded border text-[10px] font-bold ${badgeColor}">
          ${a.synergyRating}
        </span>
      </div>
    `;
  }).join('');

  // 6. Lobby Standings
  const lobbyContainer = document.getElementById('lobbyContainer')!;
  if (match.lobby && match.lobby.length > 0) {
    lobbyContainer.innerHTML = match.lobby.map(p => {
      const isPlayer = p.puuid === match.player.puuid;
      const highlight = isPlayer ? 'bg-amber-950/30 border-amber-800/60 text-white font-bold' : 'bg-gray-900/40 border-gray-800 text-gray-300';
      const placeColor = p.placement === 1 ? 'text-amber-400' : p.placement <= 4 ? 'text-emerald-400' : 'text-gray-400';
      return `
        <div class="p-2 rounded border ${highlight} flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="font-black text-xs ${placeColor}">#${p.placement}</span>
            <span class="truncate max-w-[120px]">${p.gameName}</span>
          </div>
          <div class="flex items-center space-x-2 text-[11px] text-gray-400">
            <span>Lvl ${p.level}</span>
            <span class="truncate max-w-[140px] text-gray-500">${p.traits.slice(0, 2).join(', ')}</span>
          </div>
        </div>
      `;
    }).join('');
  } else {
    lobbyContainer.innerHTML = '<div class="text-xs text-gray-500">Lobby telemetry not available in single-player simulation mode.</div>';
  }
}

function setupEventListeners() {
  const samples = EventSimulator.getSampleMatches();

  document.getElementById('sim1stBtn')!.addEventListener('click', () => {
    loadMatch(samples[0]);
  });

  document.getElementById('sim8thBtn')!.addEventListener('click', () => {
    loadMatch(samples[1]);
  });

  // Settings Modal Handlers
  const modal = document.getElementById('settingsModal')!;
  const settingsBtn = document.getElementById('settingsBtn')!;
  const closeSettingsBtn = document.getElementById('closeSettingsBtn')!;
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn')!;
  const saveSettingsBtn = document.getElementById('saveSettingsBtn')!;

  const settingRiotId = document.getElementById('settingRiotId') as HTMLInputElement;
  const settingTagLine = document.getElementById('settingTagLine') as HTMLInputElement;
  const settingRegion = document.getElementById('settingRegion') as HTMLSelectElement;
  const settingApiKey = document.getElementById('settingApiKey') as HTMLInputElement;
  const settingAutoOpen = document.getElementById('settingAutoOpen') as HTMLInputElement;

  settingsBtn.addEventListener('click', () => {
    const config = ConfigService.getConfig();
    settingRiotId.value = config.riotId;
    settingTagLine.value = config.tagLine;
    settingRegion.value = config.region;
    settingApiKey.value = config.apiKey;
    settingAutoOpen.checked = config.autoOpenOverlay;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  const closeModal = () => {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  };

  closeSettingsBtn.addEventListener('click', closeModal);
  cancelSettingsBtn.addEventListener('click', closeModal);

  saveSettingsBtn.addEventListener('click', async () => {
    const updated = ConfigService.saveConfig({
      riotId: settingRiotId.value.trim(),
      tagLine: settingTagLine.value.trim(),
      region: settingRegion.value as any,
      apiKey: settingApiKey.value.trim(),
      autoOpenOverlay: settingAutoOpen.checked
    });
    closeModal();

    if (ConfigService.hasValidRiotKey()) {
      try {
        const account = await RiotApiClient.getAccountByRiotId(updated.riotId, updated.tagLine);
        const matchIds = await RiotApiClient.getRecentMatchIds(account.puuid, 1);
        if (matchIds && matchIds.length > 0) {
          const liveMatch = await RiotApiClient.getMatchDetails(matchIds[0], account.puuid);
          loadMatch(liveMatch);
          return;
        }
      } catch (e) {
        console.warn('Failed to fetch from live Riot API after setting key, falling back to local', e);
      }
    }

    if (currentMatchData) {
      loadMatch(currentMatchData);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();

  let initialMatch: UnifiedMatchData | null = null;
  if (typeof overwolf !== 'undefined' && overwolf.windows) {
    try {
      const mainWindow: any = overwolf.windows.getMainWindow();
      if (mainWindow && mainWindow.TacticianController) {
        initialMatch = mainWindow.TacticianController.getCurrentMatch();
      }
    } catch (e) {
      console.warn('Could not query getMainWindow in desktop.ts', e);
    }
  }

  if (!initialMatch) {
    const stored = localStorage.getItem('latest_match_analysis');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        initialMatch = parsed.matchData;
      } catch {
        // Fallback
      }
    }
  }

  const sample = initialMatch || EventSimulator.getSampleMatches()[0];
  loadMatch(sample);
});
