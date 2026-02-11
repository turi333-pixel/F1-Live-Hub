// Frontend API wrapper
const API_BASE = '/api';

async function fetchAPI(path) {
    try {
        const res = await fetch(`${API_BASE}${path}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        return json.data ?? json;
    } catch (err) {
        console.error(`[API] ${path}:`, err.message);
        return null;
    }
}

export const api = {
    nextRace: () => fetchAPI('/next-race'),
    schedule: () => fetchAPI('/schedule'),
    driverStandings: () => fetchAPI('/standings/drivers'),
    constructorStandings: () => fetchAPI('/standings/constructors'),
    latestResults: () => fetchAPI('/results/latest'),
    news: () => fetchAPI('/news'),
    alonso: () => fetchAPI('/alonso'),
    scenarios: () => fetchAPI('/scenarios'),
};

export default api;
