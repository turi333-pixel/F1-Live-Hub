// Client-side hash router + page mounting
import { renderHome } from './pages/home.js';
import { renderCalendar } from './pages/calendar.js';
import { renderStandings } from './pages/standings.js';
import { renderAlonso } from './pages/alonso.js';
import { renderScenarios } from './pages/scenarios.js';
import { renderResults } from './pages/results.js';

const pages = {
    '/': renderHome,
    '/calendar': renderCalendar,
    '/standings': renderStandings,
    '/alonso': renderAlonso,
    '/scenarios': renderScenarios,
    '/results': renderResults,
};

function getRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
}

function updateNav(route) {
    document.querySelectorAll('.nav-item').forEach((item) => {
        const page = item.dataset.page;
        const isActive =
            (page === 'home' && (route === '/' || route === '')) ||
            (page === 'calendar' && route === '/calendar') ||
            (page === 'standings' && (route === '/standings' || route === '/results')) ||
            (page === 'alonso' && route === '/alonso') ||
            (page === 'scenarios' && route === '/scenarios');
        item.classList.toggle('active', isActive);
    });
}

async function navigate() {
    const route = getRoute();
    const container = document.getElementById('page-container');
    const render = pages[route] || pages['/'];

    // Show loader
    container.innerHTML = `
    <div class="loader-fullscreen">
      <div class="loader-spinner"></div>
      <p>Loading...</p>
    </div>
  `;

    updateNav(route);

    try {
        const html = await render();
        container.innerHTML = `<div class="page-enter">${html}</div>`;

        // Run any post-render setup (charts, timers, etc.)
        if (route === '/' || route === '') {
            const { postRenderHome } = await import('./pages/home.js');
            postRenderHome?.();
        } else if (route === '/alonso') {
            const { postRenderAlonso } = await import('./pages/alonso.js');
            postRenderAlonso?.();
        } else if (route === '/scenarios') {
            const { postRenderScenarios } = await import('./pages/scenarios.js');
            postRenderScenarios?.();
        }
    } catch (err) {
        console.error('[Router]', err);
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">Something went wrong. Please try again.</div>
      </div>
    `;
    }
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);
