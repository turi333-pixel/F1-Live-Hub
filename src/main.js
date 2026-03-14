// Client-side hash router + page mounting
import { renderHome } from './pages/home.js';
import { renderCalendar } from './pages/calendar.js';
import { renderStandings } from './pages/standings.js';
import { renderDriver } from './pages/driver.js';
import { renderScenarios } from './pages/scenarios.js';
import { renderResults } from './pages/results.js';
import { t, getLanguage, setLanguage } from './i18n.js';

const pages = {
    '/': renderHome,
    '/calendar': renderCalendar,
    '/standings': renderStandings,
    '/driver': renderDriver,
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
            (page === 'driver' && route === '/driver') ||
            (page === 'scenarios' && route === '/scenarios');
        item.classList.toggle('active', isActive);
    });
}

function updateNavLabels() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
}

function updateLangSelector() {
    const lang = getLanguage();
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

async function navigate() {
    const route = getRoute();
    const container = document.getElementById('page-container');
    const render = pages[route] || pages['/'];

    container.innerHTML = `
    <div class="loader-fullscreen">
      <div class="loader-spinner"></div>
      <p>${t('common.loading')}</p>
    </div>
  `;

    updateNav(route);

    try {
        const html = await render();
        container.innerHTML = `<div class="page-enter">${html}</div>`;

        if (route === '/' || route === '') {
            const { postRenderHome } = await import('./pages/home.js');
            postRenderHome?.();
        } else if (route === '/driver') {
            const { postRenderDriver } = await import('./pages/driver.js');
            postRenderDriver?.();
        } else if (route === '/scenarios') {
            const { postRenderScenarios } = await import('./pages/scenarios.js');
            postRenderScenarios?.();
        }
    } catch (err) {
        console.error('[Router]', err);
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">${t('common.error')}</div>
      </div>
    `;
    }
}

// Language selector
document.getElementById('lang-selector')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    setLanguage(btn.dataset.lang);
});

// Re-render on language change
document.addEventListener('languagechange', () => {
    updateNavLabels();
    updateLangSelector();
    navigate();
});

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', () => {
    updateNavLabels();
    updateLangSelector();
    navigate();
});
