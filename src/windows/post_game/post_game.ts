import { PostGameAnalysis } from '../../models/match';
import { EventSimulator } from '../../services/event-simulator';
import { CoachEngine } from '../../engine/coach';

async function initOverlay() {
  const placementBanner = document.getElementById('placementBanner')!;
  const compNameBanner = document.getElementById('compNameBanner')!;
  const gradeBadge = document.getElementById('gradeBadge')!;
  const strengthsList = document.getElementById('strengthsList')!;
  const blundersList = document.getElementById('blundersList')!;
  const coachTipText = document.getElementById('coachTipText')!;
  const dragHeader = document.getElementById('dragHeader')!;
  const closeBtn = document.getElementById('closeBtn')!;
  const expandBtn = document.getElementById('expandBtn')!;

  // Dragging support
  dragHeader.addEventListener('mousedown', () => {
    if (typeof overwolf !== 'undefined' && overwolf.windows) {
      overwolf.windows.getCurrentWindow((result) => {
        if (result.success) {
          overwolf.windows.dragMove(result.window.id);
        }
      });
    }
  });

  // Close support
  closeBtn.addEventListener('click', () => {
    if (typeof overwolf !== 'undefined' && overwolf.windows) {
      overwolf.windows.getCurrentWindow((result) => {
        if (result.success) {
          overwolf.windows.close(result.window.id);
        }
      });
    }
  });

  // Expand to Desktop Window support
  expandBtn.addEventListener('click', () => {
    if (typeof overwolf !== 'undefined' && overwolf.windows) {
      overwolf.windows.obtainDeclaredWindow('desktop', (result) => {
        if (result.success) {
          overwolf.windows.restore(result.window.id, () => {
            overwolf.windows.changePosition(result.window.id, 100, 100);
          });
        }
      });
    } else {
      window.open('../desktop/desktop.html', '_blank');
    }
  });

  // Load Data via Central Background Controller (Overwolf pattern)
  let analysis: PostGameAnalysis | null = null;
  if (typeof overwolf !== 'undefined' && overwolf.windows) {
    try {
      const mainWindow: any = overwolf.windows.getMainWindow();
      if (mainWindow && mainWindow.TacticianController) {
        analysis = mainWindow.TacticianController.getCurrentAnalysis();
      }
    } catch (e) {
      console.warn('Could not query getMainWindow TacticianController', e);
    }
  }

  if (!analysis) {
    const stored = localStorage.getItem('latest_match_analysis');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        analysis = parsed.analysis;
      } catch {
        // Fallback
      }
    }
  }

  // Fallback to sample 1st place if no stored match
  if (!analysis) {
    const sample = EventSimulator.getSampleMatches()[0];
    analysis = await CoachEngine.analyze(sample);
  }

  // Render UI
  placementBanner.textContent = `#${analysis.placement} Place`;
  placementBanner.className = analysis.placement <= 4 ? 'text-2xl font-black text-amber-400' : 'text-2xl font-black text-rose-400';

  if (analysis.compAnalysis) {
    compNameBanner.textContent = `${analysis.compAnalysis.comp.name} (${analysis.compAnalysis.similarity}% Match)`;
  } else {
    compNameBanner.textContent = 'Custom Composition';
  }

  gradeBadge.textContent = analysis.overallGrade;
  if (analysis.overallGrade === 'S' || analysis.overallGrade === 'A') {
    gradeBadge.className = 'w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-2xl font-black text-white shadow-lg';
  } else if (analysis.overallGrade === 'B' || analysis.overallGrade === 'C') {
    gradeBadge.className = 'w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-lg';
  } else {
    gradeBadge.className = 'w-12 h-12 rounded-lg bg-rose-600 flex items-center justify-center text-2xl font-black text-white shadow-lg';
  }

  strengthsList.innerHTML = analysis.strengths.map(s => `<div class="truncate">✓ ${s}</div>`).join('');
  blundersList.innerHTML = analysis.blunders.map(b => `<div class="truncate">✗ ${b}</div>`).join('');
  coachTipText.textContent = analysis.nextGameAdvice;
}

document.addEventListener('DOMContentLoaded', initOverlay);
