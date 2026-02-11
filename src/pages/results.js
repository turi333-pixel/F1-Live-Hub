// Results Page — Latest Race Results
import api from '../api.js';

export async function renderResults() {
    const data = await api.latestResults();

    if (!data || !data.Results || data.Results.length === 0) {
        return `
      <div class="section-header">Latest Race Results</div>
      <div class="empty-state">
        <div class="empty-state-icon">🏁</div>
        <div class="empty-state-text">No race results yet. The 2026 season starts on March 8th!</div>
      </div>
    `;
    }

    const rows = data.Results.map((r, i) => {
        const isFL = r.FastestLap?.rank === '1';
        return `
      <tr class="fade-in" style="animation-delay:${i * 0.02}s">
        <td><span class="pos pos-${r.position}">${r.position}</span></td>
        <td>
          <span class="driver-name">${r.Driver.givenName} ${r.Driver.familyName}</span>
          <div class="driver-team">${r.Constructor?.name || ''}</div>
        </td>
        <td style="font-size:0.75rem;font-variant-numeric:tabular-nums;">
          ${r.Time?.time || r.status}
        </td>
        <td class="points">${r.points}${isFL ? ' <span class="fastest-lap">⚡</span>' : ''}</td>
      </tr>
    `;
    }).join('');

    return `
    <div class="results-header fade-in">
      <div class="card-subtitle">Round ${data.round}</div>
      <h2 class="results-race-name">${data.raceName}</h2>
      <p class="results-circuit">${data.Circuit?.circuitName || ''}</p>
    </div>

    <table class="data-table">
      <thead><tr><th>Pos</th><th>Driver</th><th>Time</th><th>Pts</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
