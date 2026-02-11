// Scheduled data refresh using node-cron
import cron from 'node-cron';
import cache from './cache.js';
import jolpica from './api/jolpica.js';
import openf1 from './api/openf1.js';
import news from './api/news.js';

const TTL = {
    SCHEDULE: 60 * 60 * 1000,          // 1 hour
    STANDINGS: 10 * 60 * 1000,         // 10 min
    RESULTS: 10 * 60 * 1000,           // 10 min
    NEWS: 5 * 60 * 1000,               // 5 min
    WEATHER: 5 * 60 * 1000,            // 5 min
    ALONSO: 10 * 60 * 1000,            // 10 min
};

async function safeRefresh(key, fetcher, ttl) {
    try {
        const data = await fetcher();
        if (data !== null && data !== undefined) {
            cache.set(key, data, ttl);
            console.log(`[Scheduler] Refreshed: ${key}`);
        } else {
            console.warn(`[Scheduler] No data for ${key}, keeping stale`);
        }
    } catch (err) {
        console.warn(`[Scheduler] Failed to refresh ${key}:`, err.message);
    }
}

export async function refreshAll() {
    console.log('[Scheduler] Starting refresh cycle...');
    await Promise.allSettled([
        safeRefresh('schedule', () => jolpica.getSchedule(), TTL.SCHEDULE),
        safeRefresh('driverStandings', () => jolpica.getDriverStandings(), TTL.STANDINGS),
        safeRefresh('constructorStandings', () => jolpica.getConstructorStandings(), TTL.STANDINGS),
        safeRefresh('lastRaceResults', () => jolpica.getLastRaceResults(), TTL.RESULTS),
        safeRefresh('news', () => news.getNews(), TTL.NEWS),
        safeRefresh('alonsoResults', () => jolpica.getDriverResults('alonso'), TTL.ALONSO),
        safeRefresh('alonsoQualifying', () => jolpica.getQualifying('alonso'), TTL.ALONSO),
    ]);
    console.log('[Scheduler] Refresh cycle complete');
}

export function startScheduler() {
    // Initial load
    refreshAll();

    // Every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        refreshAll();
    });

    console.log('[Scheduler] Cron scheduled (every 5 min)');
}

export default { refreshAll, startScheduler };
