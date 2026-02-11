// Scenario Forecast Page — Interactive What-If Calculator
import api from '../api.js';

let forecastData = null;

// Calculate new standings given a scenario
function calculateScenario(standings, winners) {
    // Deep clone to avoid mutating original
    const nextStandings = standings.map(d => ({ ...d }));

    // Apply points
    winners.forEach(w => {
        const driver = nextStandings.find(d => d.driverId === w.driverId);
        if (driver) {
            driver.points += w.points;
        }
    });

    // Re-sort
    nextStandings.sort((a, b) => b.points - a.points);

    // Update positions
    nextStandings.forEach((d, i) => {
        d.prevPos = d.position;
        d.position = i + 1;
    });

    return nextStandings;
}

function generateScenarios() {
    if (!forecastData) return '';

    const { currentStandings, racePoints, nextRace } = forecastData;
    const topDrivers = currentStandings;

    // Generate simple "Winner" scenarios
    const scenarios = topDrivers.map(driver => {
        const winPoints = racePoints[0]; // 25 pts
        const newOrder = calculateScenario(topDrivers, [{ driverId: driver.driverId, points: winPoints }]);

        // Analyze impact
        const me = newOrder.find(d => d.driverId === driver.driverId);
        const gain = me.prevPos - me.position;
        const leads = me.position === 1;
        const leader = newOrder[0];
        const leadGap = leader.points - newOrder[1].points;

        return {
            driver,
            newOrder,
            description: `If <strong>${driver.name}</strong> wins next race...`,
            result: leads
                ? `Takes P1 lead by ${leadGap} pts`
                : `Moves to P${me.position} (${leader.name} leads by ${leadGap})`,
            highlight: leads || gain > 0,
        };
    });

    return scenarios.map(s => `
    <div class="scenario-card ${s.highlight ? 'highlight' : ''}">
      <div class="scenario-condition">${s.description}</div>
      <div class="scenario-result">${s.result}</div>
      <div style="font-size:0.7rem;color:#888;margin-top:6px;">
        New Top 3: ${s.newOrder.slice(0, 3).map(d => `${d.name} (${d.points})`).join(', ')}
      </div>
    </div>
  `).join('');
}

function calculateAlonsoNeeds() {
    const targetInput = document.getElementById('target-pos');
    const resultDiv = document.getElementById('calc-result');
    const targetDelta = parseInt(targetInput?.value);

    if (!targetDelta || !forecastData) return;

    // Find Alonso
    // Note: forecastData.currentStandings only has top 5. For full calc we'd need full list. 
    // Assuming Alonso checks against top 5 for now or returns generic.
    resultDiv.innerHTML = `Calculating possibilities for +${targetDelta} positions...`;
}

export async function renderScenarios() {
    const data = await api.scenarios();
    forecastData = data;

    if (!data || !data.currentStandings) {
        return `
      <div class="empty-state">
        <div class="empty-state-icon">🔮</div>
        <div class="empty-state-text">Scenario engine warming up...</div>
      </div>
    `;
    }

    const raceType = data.nextRace?.isSprint ? 'Sprint Weekend' : 'Normal Race';

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
    <div class="section-header">Scenario Forecast</div>
    
    <div class="card-subtitle" style="text-align:center">
      Next: ${data.nextRace?.name} (${raceType})
    </div>

    <div class="scenario-standings">
      ${rows}
    </div>

    <div class="filter-bar">
      <div class="filter-chip active">Top 5 Wins</div>
      <div class="filter-chip">Title Clinch</div>
      <div class="filter-chip">Team Chaos</div>
    </div>

    <div id="scenario-list">
      ${generateScenarios()}
    </div>

    <div class="calculator-section">
      <div class="calculator-title">Alonso Quick Calc</div>
      <div class="input-group">
        <input type="number" id="target-pos" class="input-field" placeholder="Positions to gain (e.g. 2)" min="1" max="10">
        <button class="btn" id="calc-btn">Calculate</button>
      </div>
      <div id="calc-result" class="calculator-result">
        Enter a target to see what needs to happen.
      </div>
    </div>
  `;
}

export function postRenderScenarios() {
    document.getElementById('calc-btn')?.addEventListener('click', calculateAlonsoNeeds);
}
