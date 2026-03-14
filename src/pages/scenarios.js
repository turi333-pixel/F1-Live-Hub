// Scenario Forecast Page — Interactive What-If Calculator
import api from '../api.js';
import { t } from '../i18n.js';

let forecastData = null;

function calculateScenario(standings, winners) {
    const nextStandings = standings.map(d => ({ ...d }));
    winners.forEach(w => {
        const driver = nextStandings.find(d => d.driverId === w.driverId);
        if (driver) driver.points += w.points;
    });
    nextStandings.sort((a, b) => b.points - a.points);
    nextStandings.forEach((d, i) => {
        d.prevPos = d.position;
        d.position = i + 1;
    });
    return nextStandings;
}

function scenarioCard(description, result, sub, highlight, leadChange) {
    const cls = `scenario-card${highlight ? ' highlight' : ''}${leadChange ? ' lead-change' : ''}`;
    return `
    <div class="${cls}">
      <div class="scenario-condition">${description}</div>
      <div class="scenario-result">${result}</div>
      ${sub ? `<div style="font-size:0.7rem;color:#888;margin-top:6px;">${sub}</div>` : ''}
    </div>`;
}

// ── Filter: Top 5 Wins ───────────────────────────
function generateTop5Wins() {
    if (!forecastData) return '';
    const { currentStandings, racePoints } = forecastData;

    return currentStandings.map(driver => {
        const newOrder = calculateScenario(currentStandings, [{ driverId: driver.driverId, points: racePoints[0] }]);
        const me = newOrder.find(d => d.driverId === driver.driverId);
        const gain = me.prevPos - me.position;
        const leads = me.position === 1;
        const leader = newOrder[0];
        const leadGap = leader.points - newOrder[1].points;

        return scenarioCard(
            t('scenarios.ifWins', driver.name),
            leads ? t('scenarios.takesLead', leadGap) : t('scenarios.movesTo', me.position, leader.name, leadGap),
            `${t('scenarios.newTop3')} ${newOrder.slice(0, 3).map(d => `${d.name} (${d.points})`).join(', ')}`,
            leads || gain > 0,
            false
        );
    }).join('');
}

// ── Filter: Title Clinch ─────────────────────────
function generateTitleClinch() {
    if (!forecastData) return '';
    const { currentStandings, remainingRaces, maxPointsRemaining } = forecastData;
    const leader = currentStandings[0];
    const p2 = currentStandings[1];

    return currentStandings.map(driver => {
        const gap = leader.points - driver.points;
        const canStillWin = driver.points + maxPointsRemaining >= leader.points;

        if (driver.position === 1) {
            // Points P2 can still score
            const maxP2 = p2.points + maxPointsRemaining;
            const clinchMargin = leader.points - maxP2;
            if (clinchMargin > 0) {
                return scenarioCard(
                    `<strong>${driver.name}</strong> ${t('scenarios.clinch.leadsBy', leader.points - p2.points)}`,
                    t('scenarios.clinch.alreadyClinched'),
                    t('scenarios.clinch.p2MaxPts', maxP2),
                    true, false
                );
            }
            const ptsNeeded = maxP2 - leader.points + 1;
            const racesMin = Math.ceil(ptsNeeded / 26);
            return scenarioCard(
                `<strong>${driver.name}</strong> ${t('scenarios.clinch.leadsBy', leader.points - p2.points)}`,
                t('scenarios.clinch.needsPts', ptsNeeded, Math.min(racesMin, remainingRaces)),
                t('scenarios.clinch.remaining', remainingRaces),
                racesMin <= 2, false
            );
        }

        if (!canStillWin) {
            return scenarioCard(
                `<strong>${driver.name}</strong>`,
                t('scenarios.clinch.eliminated'),
                t('scenarios.clinch.gapTooLarge', gap, maxPointsRemaining),
                false, false
            );
        }

        const winsNeeded = Math.ceil(gap / 26);
        return scenarioCard(
            `<strong>${driver.name}</strong> — ${gap} ${t('scenarios.clinch.ptsBehind')}`,
            t('scenarios.clinch.needs', winsNeeded),
            t('scenarios.clinch.maxCatchup', Math.min(maxPointsRemaining, gap + maxPointsRemaining)),
            false, false
        );
    }).join('');
}

// ── Filter: Team Chaos ───────────────────────────
function generateTeamChaos() {
    if (!forecastData) return '';
    const { currentStandings, racePoints } = forecastData;
    const leader = currentStandings[0];
    const p2 = currentStandings[1];
    const cards = [];

    // Scenario: Leader DNFs (0 pts), P2 wins
    const dnfOrder = calculateScenario(currentStandings, [{ driverId: p2.driverId, points: racePoints[0] }]);
    const newLeader = dnfOrder[0];
    const leaderChange = newLeader.driverId !== leader.driverId;
    cards.push(scenarioCard(
        t('scenarios.chaos.dnfWins', leader.name, p2.name),
        leaderChange
            ? t('scenarios.chaos.leaderChange', p2.name, newLeader.points - dnfOrder[1].points)
            : t('scenarios.chaos.staysLeader', leader.name, newLeader.points - dnfOrder[1].points),
        `${t('scenarios.newTop3')} ${dnfOrder.slice(0, 3).map(d => `${d.name} (${d.points})`).join(', ')}`,
        leaderChange, leaderChange
    ));

    // Scenario: P4 or P5 wins (upset)
    currentStandings.slice(3).forEach(driver => {
        const upsOrder = calculateScenario(currentStandings, [{ driverId: driver.driverId, points: racePoints[0] }]);
        const me = upsOrder.find(d => d.driverId === driver.driverId);
        const gain = me.prevPos - me.position;
        cards.push(scenarioCard(
            t('scenarios.chaos.shock', driver.name),
            gain > 0
                ? t('scenarios.chaos.movesUp', gain, me.position)
                : t('scenarios.chaos.noChange', me.position),
            `${t('scenarios.newTop3')} ${upsOrder.slice(0, 3).map(d => `${d.name} (${d.points})`).join(', ')}`,
            gain > 0, false
        ));
    });

    // Scenario: All top-3 DNF, P4 wins
    const allDNFOrder = calculateScenario(currentStandings, [
        { driverId: currentStandings[3]?.driverId, points: racePoints[0] }
    ]);
    if (currentStandings[3]) {
        const chaos = allDNFOrder[0];
        cards.push(scenarioCard(
            t('scenarios.chaos.top3dnf'),
            t('scenarios.chaos.top3dnfResult', currentStandings[3].name, chaos.points - allDNFOrder[1].points),
            `${t('scenarios.newTop3')} ${allDNFOrder.slice(0, 3).map(d => `${d.name} (${d.points})`).join(', ')}`,
            true, allDNFOrder[0].driverId !== leader.driverId
        ));
    }

    return cards.join('');
}

function switchFilter(active) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.filter === active));
    const list = document.getElementById('scenario-list');
    if (!list) return;
    if (active === 'top5wins') list.innerHTML = generateTop5Wins();
    else if (active === 'titleclinch') list.innerHTML = generateTitleClinch();
    else if (active === 'teamchaos') list.innerHTML = generateTeamChaos();
}

function calculateNeeds() {
    const targetInput = document.getElementById('target-pos');
    const resultDiv = document.getElementById('calc-result');
    const targetDelta = parseInt(targetInput?.value);
    if (!targetDelta || !forecastData) return;

    const { currentStandings, remainingRaces, maxPointsRemaining } = forecastData;
    const leader = currentStandings[0];

    const results = currentStandings
        .filter(d => d.position > 1)
        .map(d => {
            const gap = leader.points - d.points;
            const canCatch = d.points + maxPointsRemaining >= leader.points;
            return canCatch
                ? `${d.name}: needs ~${gap} pts more than leader over ${remainingRaces} races`
                : `${d.name}: mathematically eliminated (${gap} pts gap, ${maxPointsRemaining} max remaining)`;
        });

    resultDiv.innerHTML = results.length
        ? results.map(r => `<div style="margin-bottom:4px">• ${r}</div>`).join('')
        : t('scenarios.enterTarget');
}

export async function renderScenarios() {
    const data = await api.scenarios();
    forecastData = data;

    if (!data || !data.currentStandings) {
        return `
      <div class="empty-state">
        <div class="empty-state-icon">🔮</div>
        <div class="empty-state-text">${t('scenarios.warming')}</div>
      </div>
    `;
    }

    const raceType = data.nextRace?.isSprint ? t('common.sprintWeekend') : t('common.normalRace');

    const rows = data.currentStandings.map(d => `
    <div class="scenario-driver-row">
      <div class="scenario-driver-pos">${d.position}</div>
      <div class="scenario-driver-info">
        <div class="scenario-driver-name">${d.name}</div>
        <div class="scenario-driver-team">${d.team}</div>
      </div>
      <div class="scenario-driver-pts">${d.points}</div>
    </div>
  `).join('');

    return `
    <div class="section-header">${t('scenarios.title')}</div>

    <div class="card-subtitle" style="text-align:center">
      ${t('scenarios.next')} ${data.nextRace?.name} (${raceType})
    </div>

    <div class="scenario-standings">
      ${rows}
    </div>

    <div class="filter-bar">
      <button class="filter-chip active" data-filter="top5wins">${t('scenarios.top5wins')}</button>
      <button class="filter-chip" data-filter="titleclinch">${t('scenarios.titleClinch')}</button>
      <button class="filter-chip" data-filter="teamchaos">${t('scenarios.teamChaos')}</button>
    </div>

    <div id="scenario-list">
      ${generateTop5Wins()}
    </div>

    <div class="calculator-section">
      <div class="calculator-title">${t('scenarios.quickCalc')}</div>
      <div class="input-group">
        <input type="number" id="target-pos" class="input-field" placeholder="${t('scenarios.placeholder')}" min="1" max="10">
        <button class="btn" id="calc-btn">${t('scenarios.calculate')}</button>
      </div>
      <div id="calc-result" class="calculator-result">
        ${t('scenarios.enterTarget')}
      </div>
    </div>
  `;
}

export function postRenderScenarios() {
    document.querySelector('.filter-bar')?.addEventListener('click', e => {
        const chip = e.target.closest('.filter-chip');
        if (chip) switchFilter(chip.dataset.filter);
    });
    document.getElementById('calc-btn')?.addEventListener('click', calculateNeeds);
}
