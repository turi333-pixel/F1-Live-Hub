// Driver Page — Driver picker + Stats
import api from '../api.js';
import { t } from '../i18n.js';

let selectedDriverId = null;

function renderTimelineChart(canvas, races) {
    if (!canvas || !races.length) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = races.length * 40 + 20;
    const h = canvas.height = 160;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    [1, 5, 10, 15, 20].forEach(pos => {
        const y = 20 + (pos - 1) * (120 / 19);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    });

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

    races.forEach((r, i) => {
        const x = 20 + i * 40;
        const pos = r.position > 0 ? r.position : 20;
        const y = 20 + (pos - 1) * (120 / 19);

        ctx.fillStyle = '#1a1a24';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = r.position === 1 ? '#FFD700' : '#E10600';
        if (r.position === 0) ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(r.raceName.substring(0, 3).toUpperCase(), x, h - 5);
    });
}

function renderDriverStats(data) {
    if (!data || !data.driver) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">🏎️</div>
                <div class="empty-state-text">${t('driver.noData')}</div>
            </div>
        `;
    }

    const { driver, stats, races, teammate } = data;
    const currentPoints = parseFloat(data.points);
    const tmPoints = teammate ? parseFloat(teammate.points) : 0;
    const totalPoints = currentPoints + tmPoints;
    const driverWidth = totalPoints > 0 ? (currentPoints / totalPoints) * 100 : 50;
    const tmWidth = totalPoints > 0 ? (tmPoints / totalPoints) * 100 : 50;
    const number = driver.permanentNumber || '?';
    const fullName = `${driver.givenName || ''} ${driver.familyName || driver.driverId}`.toUpperCase().trim();

    return `
        <div class="driver-header fade-in">
            <div class="driver-avatar">${number}</div>
            <h2 class="driver-name">${fullName}</h2>
            <div class="driver-team">${data.team?.name || ''}</div>
            <div class="driver-position">${data.position || '-'}</div>
            <div class="driver-position-label">${t('driver.championshipPos')}</div>
        </div>

        <div class="stat-grid fade-in" style="animation-delay:0.1s">
            <div class="stat-box">
                <div class="stat-value">${data.points}</div>
                <div class="stat-label">${t('common.points')}</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.bestFinish || '-'}</div>
                <div class="stat-label">${t('driver.bestFinish')}</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.avgFinish || '-'}</div>
                <div class="stat-label">${t('driver.avgFinish')}</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.dnfs}</div>
                <div class="stat-label">${t('driver.dnfs')}</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.streak.count}</div>
                <div class="stat-label">${stats.streak.type === 'points' ? t('driver.ptStreak') : t('driver.noPts')}</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.pointsPerRace || '0'}</div>
                <div class="stat-label">${t('driver.ptsPerRace')}</div>
            </div>
        </div>

        ${races.length >= 2 ? `
        <div class="card fade-in" style="margin-top:var(--space-md);animation-delay:0.2s">
            <div class="chart-title">${t('driver.timeline')}</div>
            <div class="timeline-scroll">
                <canvas id="timeline-chart" class="chart-canvas"></canvas>
            </div>
        </div>
        ` : races.length === 1 ? `
        <div class="card fade-in" style="margin-top:var(--space-md);animation-delay:0.2s">
            <div class="chart-title">${t('driver.timeline')}</div>
            <div style="text-align:center;padding:var(--space-lg);color:var(--text-tertiary);font-size:0.8rem">
                ${t('driver.timelineEarly')}
            </div>
        </div>
        ` : ''}

        ${teammate ? `
        <div class="card fade-in" style="margin-top:var(--space-md);animation-delay:0.3s">
            <div class="chart-title">${t('driver.teammateBattle')} ${teammate.driver.familyName}</div>
            <div class="h2h-row">
                <div class="h2h-label">${t('driver.points')}</div>
                <div class="h2h-bars">
                    <div class="h2h-bar-alonso" style="width:${driverWidth}%">${currentPoints}</div>
                    <div class="h2h-bar-teammate" style="width:${tmWidth}%">${tmPoints}</div>
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

async function selectDriver(driverId) {
    selectedDriverId = driverId;
    const statsEl = document.getElementById('driver-stats');
    if (!statsEl) return;

    document.querySelectorAll('.driver-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.driverId === driverId);
    });

    statsEl.innerHTML = `
        <div style="display:flex;justify-content:center;padding:var(--space-xl)">
            <div class="loader-spinner"></div>
        </div>
    `;

    const data = await api.driver(driverId);
    statsEl.innerHTML = renderDriverStats(data);

    const canvas = document.getElementById('timeline-chart');
    if (canvas && data?.races) renderTimelineChart(canvas, data.races);
}

export async function renderDriver() {
    const standings = await api.driverStandings();
    const drivers = standings?.DriverStandings || [];

    const chips = drivers.map(d => {
        const lastName = d.Driver.familyName.toUpperCase();
        const isActive = d.Driver.driverId === (selectedDriverId || drivers[0]?.Driver.driverId);
        return `<button class="driver-chip${isActive ? ' active' : ''}" data-driver-id="${d.Driver.driverId}">${lastName}</button>`;
    }).join('');

    return `
        <div class="driver-picker fade-in">
            <div class="driver-chips">${chips}</div>
        </div>
        <div id="driver-stats"></div>
    `;
}

export function postRenderDriver() {
    document.querySelectorAll('.driver-chip').forEach(chip => {
        chip.addEventListener('click', () => selectDriver(chip.dataset.driverId));
    });

    const active = document.querySelector('.driver-chip.active');
    if (active) selectDriver(active.dataset.driverId);
}
