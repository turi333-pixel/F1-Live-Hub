// Standings Page — Driver & Constructor toggle
import api from '../api.js';

const TEAM_COLORS = {
    red_bull: '#3671C6', mercedes: '#27F4D2', ferrari: '#E8002D',
    mclaren: '#FF8000', aston_martin: '#229971', alpine: '#FF87BC',
    williams: '#64C4FF', haas: '#B6BABD', rb: '#6692FF',
    sauber: '#52E252', kick_sauber: '#52E252', racing_bulls: '#6692FF',
};

function getTeamColor(id) {
    return TEAM_COLORS[id] || '#888';
}

export async function renderStandings() {
    const [driverData, constructorData] = await Promise.all([
        api.driverStandings(),
        api.constructorStandings(),
    ]);

    const drivers = driverData?.DriverStandings || [];
    const constructors = constructorData?.ConstructorStandings || [];

    const maxDriverPts = parseFloat(drivers[0]?.points || 1);
    const maxTeamPts = parseFloat(constructors[0]?.points || 1);

    const driverRows = drivers.map((d, i) => {
        const ptsRatio = (parseFloat(d.points) / maxDriverPts * 100).toFixed(0);
        const teamColor = getTeamColor(d.Constructors?.[0]?.constructorId);
        return `
      <tr class="fade-in" style="animation-delay:${i * 0.03}s">
        <td><span class="pos pos-${d.position}">${d.position}</span></td>
        <td>
          <span class="team-dot" style="background:${teamColor}"></span>
          <span class="driver-name">${d.Driver.givenName} ${d.Driver.familyName}</span>
          <div class="driver-team">${d.Constructors?.[0]?.name || ''}</div>
          <div class="gap-bar"><div class="gap-bar-fill" style="width:${ptsRatio}%;background:${teamColor}"></div></div>
        </td>
        <td class="points">${d.points}</td>
        <td>${d.wins > 0 ? d.wins + 'W' : ''}</td>
      </tr>
    `;
    }).join('');

    const constructorRows = constructors.map((c, i) => {
        const ptsRatio = (parseFloat(c.points) / maxTeamPts * 100).toFixed(0);
        const teamColor = getTeamColor(c.Constructor.constructorId);
        return `
      <tr class="fade-in" style="animation-delay:${i * 0.03}s">
        <td><span class="pos pos-${c.position}">${c.position}</span></td>
        <td>
          <span class="team-dot" style="background:${teamColor}"></span>
          <span class="driver-name">${c.Constructor.name}</span>
          <div class="gap-bar"><div class="gap-bar-fill" style="width:${ptsRatio}%;background:${teamColor}"></div></div>
        </td>
        <td class="points">${c.points}</td>
        <td>${c.wins > 0 ? c.wins + 'W' : ''}</td>
      </tr>
    `;
    }).join('');

    const noData = `
    <div class="empty-state">
      <div class="empty-state-icon">📊</div>
      <div class="empty-state-text">No standings data yet. The season starts in March 2026!</div>
    </div>
  `;

    return `
    <div class="standings-page">
      <div class="section-header">Championship Standings</div>

      <div class="tab-bar" id="standings-tabs">
        <button class="tab-btn active" data-tab="drivers" onclick="switchStandingsTab('drivers')">Drivers</button>
        <button class="tab-btn" data-tab="constructors" onclick="switchStandingsTab('constructors')">Constructors</button>
      </div>

      <div id="tab-drivers" class="tab-content">
        ${drivers.length > 0 ? `
          <table class="data-table">
            <thead><tr><th>Pos</th><th>Driver</th><th>Pts</th><th></th></tr></thead>
            <tbody>${driverRows}</tbody>
          </table>
        ` : noData}
      </div>

      <div id="tab-constructors" class="tab-content" style="display:none">
        ${constructors.length > 0 ? `
          <table class="data-table">
            <thead><tr><th>Pos</th><th>Constructor</th><th>Pts</th><th></th></tr></thead>
            <tbody>${constructorRows}</tbody>
          </table>
        ` : noData}
      </div>
    </div>
  `;
}

// Tab switcher — attached to window for onclick
window.switchStandingsTab = function (tab) {
    document.querySelectorAll('#standings-tabs .tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.getElementById('tab-drivers').style.display = tab === 'drivers' ? '' : 'none';
    document.getElementById('tab-constructors').style.display = tab === 'constructors' ? '' : 'none';
};
