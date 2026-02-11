// OpenF1 API client — live timing, weather, telemetry
const BASE = 'https://api.openf1.org/v1';

async function fetchJSON(path) {
    try {
        const url = `${BASE}${path}`;
        console.log(`[OpenF1] Fetching ${url}`);
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
            console.warn(`[OpenF1] ${res.status} for ${url}`);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.warn(`[OpenF1] Error fetching ${path}:`, err.message);
        return null;
    }
}

export async function getMeetings(year = new Date().getFullYear()) {
    return await fetchJSON(`/meetings?year=${year}`);
}

export async function getSessions(meetingKey) {
    return await fetchJSON(`/sessions?meeting_key=${meetingKey}`);
}

export async function getWeather(meetingKey) {
    // Get latest weather for a meeting
    const sessions = await fetchJSON(`/sessions?meeting_key=${meetingKey}`);
    if (!sessions || sessions.length === 0) return null;
    const lastSession = sessions[sessions.length - 1];
    const weather = await fetchJSON(`/weather?session_key=${lastSession.session_key}&order=date&order_direction=desc`);
    if (!weather || weather.length === 0) return null;
    return weather[0]; // most recent reading
}

export async function getLaps(sessionKey, driverNumber) {
    let path = `/laps?session_key=${sessionKey}`;
    if (driverNumber) path += `&driver_number=${driverNumber}`;
    return await fetchJSON(path);
}

export async function getDrivers(sessionKey) {
    return await fetchJSON(`/drivers?session_key=${sessionKey}`);
}

export async function getPositions(sessionKey) {
    return await fetchJSON(`/position?session_key=${sessionKey}`);
}

export async function getIntervals(sessionKey) {
    return await fetchJSON(`/intervals?session_key=${sessionKey}`);
}

export async function getPitStops(sessionKey) {
    return await fetchJSON(`/pit?session_key=${sessionKey}`);
}

export async function getCarData(sessionKey, driverNumber) {
    let path = `/car_data?session_key=${sessionKey}`;
    if (driverNumber) path += `&driver_number=${driverNumber}`;
    path += '&speed>=300'; // only high-speed data points for efficiency
    return await fetchJSON(path);
}

export async function getRaceControl(sessionKey) {
    return await fetchJSON(`/race_control?session_key=${sessionKey}`);
}

export default {
    getMeetings,
    getSessions,
    getWeather,
    getLaps,
    getDrivers,
    getPositions,
    getIntervals,
    getPitStops,
    getCarData,
    getRaceControl,
};
