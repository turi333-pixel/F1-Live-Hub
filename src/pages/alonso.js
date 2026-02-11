// Fernando Alonso Page — Stats, Graphs, and Teammate Comparison
import api from '../api.js';

function renderTimelineChart(canvas, races) {
    if (!canvas || !races.length) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = races.length * 40 + 20;
    const h = canvas.height = 160;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    [1, 5, 10, 15, 20].forEach(pos => {
        const y = 20 + (pos - 1) * (120 / 19);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    });

    // Data line
    ctx.beginPath();
    races.forEach((r, i) => {
        const x = 20 + i * 40;
        const pos = r.position > 0 ? r.position : 20;
        const y = 20 + (pos - 1) * (120 / 19);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#E10600';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dots
    races.forEach((r, i) => {
        const x = 20 + i * 40;
        const pos = r.position > 0 ? r.position : 20;
        const y = 20 + (pos - 1) * (120 / 19);

        ctx.fillStyle = '#1a1a24';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = r.position === 1 ? '#FFD700' : '#E10600';
        if (r.position === 0) ctx.fillStyle = '#555'; // DNF
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Labels
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(r.raceName.substring(0, 3).toUpperCase(), x, h - 5);
    });
}

export async function renderAlonso() {
    const data = await api.alonso();

    if (!data || !data.driver) {
        return `
      <div class="empty-state">
        <div class="empty-state-icon">🏎️</div>
        <div class="empty-state-text">Alonso data initializing...</div>
      </div>
    `;
    }

    const { driver, stats, races, teammate } = data;
    const currentPoints = parseFloat(data.points);

    // Teammate comparison widths
    const tmPoints = teammate ? parseFloat(teammate.points) : 0;
    const totalPoints = currentPoints + tmPoints;
    const alonsoWidth = totalPoints > 0 ? (currentPoints / totalPoints) * 100 : 50;
    const tmWidth = totalPoints > 0 ? (tmPoints / totalPoints) * 100 : 50;

    return `
    <div class="alonso-header fade-in">
      <div class="alonso-avatar">14</div>
      <h2 class="alonso-name">FERNANDO ALONSO</h2>
      <div class="alonso-team">${data.team?.name || 'Aston Martin Aramco'}</div>
      
      <div class="alonso-position">${data.position || '-'}</div>
      <div class="alonso-position-label">Championship Position</div>
    </div>

    <div class="stat-grid fade-in" style="animation-delay:0.1s">
      <div class="stat-box">
        <div class="stat-value">${data.points}</div>
        <div class="stat-label">Points</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${stats.bestFinish || '-'}</div>
        <div class="stat-label">Best Finish</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${stats.avgFinish || '-'}</div>
        <div class="stat-label">Avg Finish</div>
      </div>
       <div class="stat-box">
        <div class="stat-value">${stats.dnfs}</div>
        <div class="stat-label">DNFs</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${stats.streak.count}</div>
        <div class="stat-label">${stats.streak.type === 'points' ? 'Pt Streak' : 'No Pts'}</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${stats.pointsPerRace || '0'}</div>
        <div class="stat-label">Pts / Race</div>
      </div>
    </div>

    <div class="card fade-in" style="margin-top:var(--space-md);animation-delay:0.2s">
      <div class="chart-title">Race Results Timeline</div>
      <div class="timeline-scroll">
        <canvas id="timeline-chart" class="chart-canvas"></canvas>
      </div>
    </div>

    ${teammate ? `
      <div class="card fade-in" style="margin-top:var(--space-md);animation-delay:0.3s">
        <div class="chart-title">Teammate Battle vs ${teammate.driver.familyName}</div>
        
        <div class="h2h-row">
          <div class="h2h-label">Points</div>
          <div class="h2h-bars">
            <div class="h2h-bar-alonso" style="width:${alonsoWidth}%">${currentPoints}</div>
            <div class="h2h-bar-teammate" style="width:${tmWidth}%">${tmPoints}</div>
          </div>
        </div>
      </div>
    ` : ''}
  `;
}

// Hook called by router after HTML is inserted
export function postRenderAlonso() {
    const canvas = document.getElementById('timeline-chart');
    if (canvas) {
        // We need to re-fetch data or store it locally to render chart. 
        // Ideally router passes data, but for now we re-fetch from cache (fast).
        api.alonso().then(data => {
            if (data && data.races) renderTimelineChart(canvas, data.races);
        });
    }
}
