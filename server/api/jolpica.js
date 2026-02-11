// Jolpica (Ergast-compatible) F1 API client
const BASE = 'https://api.jolpi.ca/ergast/f1';

async function fetchJSON(path) {
    try {
        const url = `${BASE}${path}`;
        console.log(`[Jolpica] Fetching ${url}`);
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
            console.warn(`[Jolpica] ${res.status} for ${url}`);
            return null;
        }
        const json = await res.json();
        return json.MRData || json;
    } catch (err) {
        console.warn(`[Jolpica] Error fetching ${path}:`, err.message);
        return null;
    }
}

export async function getSchedule(season = 'current') {
    const data = await fetchJSON(`/${season}.json?limit=30`);
    if (!data?.RaceTable?.Races) return null;
    return data.RaceTable.Races;
}

export async function getDriverStandings(season = 'current') {
    const data = await fetchJSON(`/${season}/driverstandings.json`);
    if (!data?.StandingsTable?.StandingsLists?.[0]) return null;
    return data.StandingsTable.StandingsLists[0];
}

export async function getConstructorStandings(season = 'current') {
    const data = await fetchJSON(`/${season}/constructorstandings.json`);
    if (!data?.StandingsTable?.StandingsLists?.[0]) return null;
    return data.StandingsTable.StandingsLists[0];
}

export async function getLastRaceResults() {
    const data = await fetchJSON('/current/last/results.json');
    if (!data?.RaceTable?.Races?.[0]) return null;
    return data.RaceTable.Races[0];
}

export async function getRaceResults(season, round) {
    const data = await fetchJSON(`/${season}/${round}/results.json`);
    if (!data?.RaceTable?.Races?.[0]) return null;
    return data.RaceTable.Races[0];
}

export async function getDriverResults(driverId, season = 'current') {
    const data = await fetchJSON(`/${season}/drivers/${driverId}/results.json?limit=50`);
    if (!data?.RaceTable?.Races) return null;
    return data.RaceTable.Races;
}

export async function getQualifying(driverId, season = 'current') {
    const data = await fetchJSON(`/${season}/drivers/${driverId}/qualifying.json?limit=50`);
    if (!data?.RaceTable?.Races) return null;
    return data.RaceTable.Races;
}

export default {
    getSchedule,
    getDriverStandings,
    getConstructorStandings,
    getLastRaceResults,
    getRaceResults,
    getDriverResults,
    getQualifying,
};
