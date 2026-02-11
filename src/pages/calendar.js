// Calendar Page — Full Season Schedule
import api from '../api.js';

function formatDate(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr || '00:00:00Z'}`);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getStatus(race) {
    const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
    const now = new Date();
    if (now > raceDate) return 'Completed';
    // Check if it's the immediate next race (within a week or so, or just next in list)
    // For simplicity here we just return date. Logic in render optimizes this.
    return formatDate(race.date, race.time);
}

export async function renderCalendar() {
    const schedule = await api.schedule();

    if (!schedule || schedule.length === 0) {
        return `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-text">Calendar data unavailable.</div>
      </div>
    `;
    }

    const now = new Date();
    let nextRaceIndex = -1;
    const rows = schedule.map((race, i) => {
        const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
        const isPast = now > raceDate;
        const isNext = !isPast && (nextRaceIndex === -1 ? (nextRaceIndex = i, true) : false);
        const isSprint = !!race.Sprint;

        let statusBadge = '';
        if (isPast) statusBadge = `<span class="badge badge-green">Done</span>`;
        else if (isNext) statusBadge = `<span class="badge badge-red">Next</span>`;
        else statusBadge = `<span class="badge">${formatDate(race.date, race.time)}</span>`;

        const countryCode = race.Circuit.Location.country.substring(0, 3).toUpperCase(); // Placeholder for flag logic if we had images

        return `
      <div class="card calendar-card ${isNext ? 'card-accent' : ''} fade-in" style="animation-delay:${i * 0.02}s; margin-bottom:var(--space-md);">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:var(--space-sm);">
          <div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;font-weight:700;">Round ${race.round}</div>
          ${statusBadge}
        </div>
        
        <div style="display:flex;gap:var(--space-md);">
          <div style="flex:1;">
            <h3 class="card-title" style="margin-bottom:4px;">${race.raceName.replace(' Grand Prix', '')}</h3>
            <div style="font-size:0.8rem;color:var(--text-secondary);">${race.Circuit.circuitName}</div>
            ${isSprint ? '<div style="margin-top:6px;"><span class="badge badge-purple">Sprint</span></div>' : ''}
          </div>
        </div>

        ${isNext ? `
           <div style="margin-top:var(--space-md);padding-top:var(--space-sm);border-top:1px solid var(--border);">
             <div style="font-size:0.7rem;color:var(--f1-red);font-weight:700;text-align:right;">UP NEXT</div>
           </div>
        ` : ''}
      </div>
    `;
    }).join('');

    return `
    <div class="section-header">2026 Calendar</div>
    <div class="calendar-list">
      ${rows}
    </div>
  `;
}
