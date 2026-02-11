// Home Page — Next Race + Quick Tiles
import api from '../api.js';

// Team colors for visual flair
const TEAM_COLORS = {
    red_bull: '#3671C6', mercedes: '#27F4D2', ferrari: '#E8002D',
    mclaren: '#FF8000', aston_martin: '#229971', alpine: '#FF87BC',
    williams: '#64C4FF', haas: '#B6BABD', rb: '#6692FF',
    sauber: '#52E252', kick_sauber: '#52E252', racing_bulls: '#6692FF',
};

function formatDate(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr || '00:00:00Z'}`);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) +
        ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
}

function getCountdown(targetDate) {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
    return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
    };
}

function sessionRows(race) {
    const sessions = [];
    if (race.FirstPractice) sessions.push({ name: 'FP1', ...race.FirstPractice });
    if (race.SecondPractice) sessions.push({ name: 'FP2', ...race.SecondPractice });
    if (race.ThirdPractice) sessions.push({ name: 'FP3', ...race.ThirdPractice });
    if (race.SprintQualifying) sessions.push({ name: 'Sprint Quali', ...race.SprintQualifying });
    if (race.Sprint) sessions.push({ name: 'Sprint', ...race.Sprint });
    if (race.Qualifying) sessions.push({ name: 'Qualifying', ...race.Qualifying });
    sessions.push({ name: 'Race', date: race.date, time: race.time });
    return sessions.map(s =>
        `<div class="session-row">
      <span class="session-name">${s.name}</span>
      <span class="session-time">${formatDate(s.date, s.time)}</span>
    </div>`
    ).join('');
}

export async function renderHome() {
    const [nextRaceData, driverStandings, constructorStandings, latestResults, newsData] = await Promise.all([
        api.nextRace(),
        api.driverStandings(),
        api.constructorStandings(),
        api.latestResults(),
        api.news(),
    ]);

    // Next Race Section
    let heroHTML = '';
    if (nextRaceData?.race) {
        const race = nextRaceData.race;
        const weather = nextRaceData.weather;
        const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
        const cd = getCountdown(raceDate);
        const isSprint = !!race.Sprint;

        heroHTML = `
      <div class="card card-accent home-hero fade-in">
        <div class="card-subtitle">
          ${isSprint ? '<span class="badge badge-purple">Sprint Weekend</span> · ' : ''}
          Round ${race.round} of 24
        </div>
        <h2 class="hero-race-name">${race.raceName}</h2>
        <p class="hero-circuit">${race.Circuit.circuitName} · ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}</p>
        <p class="hero-date">${formatDate(race.date, race.time)}</p>

        <div class="countdown" id="countdown" data-target="${raceDate.toISOString()}">
          <div class="countdown-unit">
            <div class="countdown-value" id="cd-days">${cd.days}</div>
            <div class="countdown-label">Days</div>
          </div>
          <div class="countdown-unit">
            <div class="countdown-value" id="cd-hours">${cd.hours}</div>
            <div class="countdown-label">Hours</div>
          </div>
          <div class="countdown-unit">
            <div class="countdown-value" id="cd-mins">${cd.mins}</div>
            <div class="countdown-label">Min</div>
          </div>
          <div class="countdown-unit">
            <div class="countdown-value" id="cd-secs">${cd.secs}</div>
            <div class="countdown-label">Sec</div>
          </div>
        </div>

        ${weather ? `
          <div style="margin-top: var(--space-md); display: flex; justify-content: center;">
            <div class="weather-badge">
              🌡️ <span class="weather-temp">${Math.round(weather.air_temperature || 0)}°C</span>
              💧 ${weather.humidity || '—'}%
              💨 ${weather.wind_speed ? Math.round(weather.wind_speed) + ' km/h' : '—'}
              ${weather.rainfall ? '🌧️ Rain' : '☀️'}
            </div>
          </div>
        ` : ''}

        <div style="margin-top: var(--space-lg);">
          <div class="card-subtitle">Session Schedule</div>
          <div class="session-list">${sessionRows(race)}</div>
        </div>
      </div>
    `;
    } else {
        heroHTML = `
      <div class="card card-accent home-hero fade-in">
        <div class="empty-state">
          <div class="empty-state-icon">🏁</div>
          <div class="empty-state-text">Season hasn't started yet. Check back soon!</div>
        </div>
      </div>
    `;
    }

    // Driver standings preview
    const topDrivers = driverStandings?.DriverStandings?.slice(0, 3) || [];
    const driverTileContent = topDrivers.length > 0
        ? topDrivers.map((d, i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span class="pos pos-${i + 1}">${d.position}</span>
          <span style="font-size:0.75rem;font-weight:600;">${d.Driver.familyName}</span>
          <span class="points" style="margin-left:auto;font-size:0.75rem;">${d.points}</span>
        </div>
      `).join('')
        : '<span style="font-size:0.75rem;color:var(--text-tertiary);">Awaiting data</span>';

    // Constructor standings preview
    const topTeams = constructorStandings?.ConstructorStandings?.slice(0, 3) || [];
    const teamTileContent = topTeams.length > 0
        ? topTeams.map((c, i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span class="pos pos-${i + 1}">${c.position}</span>
          <span style="font-size:0.75rem;font-weight:600;">${c.Constructor.name}</span>
          <span class="points" style="margin-left:auto;font-size:0.75rem;">${c.points}</span>
        </div>
      `).join('')
        : '<span style="font-size:0.75rem;color:var(--text-tertiary);">Awaiting data</span>';

    // Latest results preview
    const podium = latestResults?.Results?.slice(0, 3) || [];
    const resultsTileContent = podium.length > 0
        ? `<div class="tile-detail" style="margin-bottom:4px;">${latestResults.raceName}</div>` +
        podium.map((r, i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span class="pos pos-${i + 1}">${r.position}</span>
          <span style="font-size:0.75rem;font-weight:600;">${r.Driver.familyName}</span>
        </div>
      `).join('')
        : '<span style="font-size:0.75rem;color:var(--text-tertiary);">No results yet</span>';

    // News preview
    const topNews = (newsData || []).slice(0, 3);
    const newsTileContent = topNews.length > 0
        ? topNews.map(n => `
        <div style="margin-bottom:6px;">
          <a href="${n.link}" target="_blank" rel="noopener" class="news-title" style="font-size:0.7rem;display:block;line-height:1.3;">${n.title}</a>
          <span class="news-meta" style="font-size:0.6rem;">${n.source}</span>
        </div>
      `).join('')
        : '<span style="font-size:0.75rem;color:var(--text-tertiary);">No news available</span>';

    return `
    ${heroHTML}

    <div class="section-header">Quick Access</div>

    <div class="tiles-grid">
      <a href="#/standings" class="tile slide-up" style="animation-delay:0.05s">
        <div class="tile-icon" style="background:rgba(255,215,0,0.15)">🏆</div>
        <div class="tile-title">Drivers</div>
        ${driverTileContent}
      </a>
      <a href="#/standings" class="tile slide-up" style="animation-delay:0.1s">
        <div class="tile-icon" style="background:rgba(68,138,255,0.15)">🏗️</div>
        <div class="tile-title">Constructors</div>
        ${teamTileContent}
      </a>
      <a href="#/results" class="tile slide-up" style="animation-delay:0.15s">
        <div class="tile-icon" style="background:rgba(0,230,118,0.15)">🏁</div>
        <div class="tile-title">Latest Results</div>
        ${resultsTileContent}
      </a>
      <div class="tile slide-up" style="animation-delay:0.2s">
        <div class="tile-icon" style="background:rgba(255,135,188,0.15)">📰</div>
        <div class="tile-title">Breaking News</div>
        ${newsTileContent}
      </div>
    </div>
  `;
}

// Post-render: start countdown timer
let countdownInterval = null;
export function postRenderHome() {
    if (countdownInterval) clearInterval(countdownInterval);

    const el = document.getElementById('countdown');
    if (!el) return;

    const target = new Date(el.dataset.target);

    countdownInterval = setInterval(() => {
        const cd = getCountdown(target);
        const days = document.getElementById('cd-days');
        const hours = document.getElementById('cd-hours');
        const mins = document.getElementById('cd-mins');
        const secs = document.getElementById('cd-secs');
        if (days) days.textContent = cd.days;
        if (hours) hours.textContent = cd.hours;
        if (mins) mins.textContent = cd.mins;
        if (secs) secs.textContent = cd.secs;
    }, 1000);
}
