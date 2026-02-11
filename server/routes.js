// Express API routes
import { Router } from 'express';
import cache from './cache.js';
import jolpica from './api/jolpica.js';
import openf1 from './api/openf1.js';

const router = Router();

// Helper: return cached data or fetch fresh
async function cachedOr(key, fetcher, res) {
    let data = cache.get(key);
    if (data) return res.json({ data, cached: true });
    try {
        data = await fetcher();
        if (data) {
            cache.set(key, data);
            return res.json({ data, cached: false });
        }
        return res.status(503).json({ error: 'Data temporarily unavailable' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// ─── Schedule ──────────────────────────────────
router.get('/schedule', (req, res) => {
    cachedOr('schedule', () => jolpica.getSchedule(), res);
});

// ─── Next Race ─────────────────────────────────
router.get('/next-race', async (req, res) => {
    try {
        let races = cache.get('schedule');
        if (!races) {
            races = await jolpica.getSchedule();
            if (races) cache.set('schedule', races, 60 * 60 * 1000);
        }
        if (!races) return res.status(503).json({ error: 'Schedule unavailable' });

        const now = new Date();
        const next = races.find((r) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now);
        if (!next) return res.json({ data: null, message: 'Season complete' });

        // Try to get weather from OpenF1
        let weather = null;
        try {
            const meetings = cache.get('meetings') || await openf1.getMeetings();
            if (meetings) {
                cache.set('meetings', meetings, 60 * 60 * 1000);
                const meeting = meetings.find(
                    (m) => m.circuit_short_name?.toLowerCase().includes(next.Circuit.circuitId) ||
                        m.meeting_name?.toLowerCase().includes(next.raceName.replace(' Grand Prix', '').toLowerCase())
                );
                if (meeting) {
                    weather = await openf1.getWeather(meeting.meeting_key);
                }
            }
        } catch (e) {
            console.warn('[Routes] Weather fetch failed:', e.message);
        }

        return res.json({ data: { race: next, weather } });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ─── Standings ─────────────────────────────────
router.get('/standings/drivers', (req, res) => {
    cachedOr('driverStandings', () => jolpica.getDriverStandings(), res);
});

router.get('/standings/constructors', (req, res) => {
    cachedOr('constructorStandings', () => jolpica.getConstructorStandings(), res);
});

// ─── Results ───────────────────────────────────
router.get('/results/latest', (req, res) => {
    cachedOr('lastRaceResults', () => jolpica.getLastRaceResults(), res);
});

// ─── News ──────────────────────────────────────
router.get('/news', (req, res) => {
    cachedOr('news', async () => {
        const { getNews } = await import('./api/news.js');
        return getNews();
    }, res);
});

// ─── Alonso ────────────────────────────────────
router.get('/alonso', async (req, res) => {
    try {
        const [standings, results, qualifying] = await Promise.all([
            cache.get('driverStandings') || jolpica.getDriverStandings(),
            cache.get('alonsoResults') || jolpica.getDriverResults('alonso'),
            cache.get('alonsoQualifying') || jolpica.getQualifying('alonso'),
        ]);

        // Find Alonso in standings
        const alonsoStanding = standings?.DriverStandings?.find(
            (d) => d.Driver?.driverId === 'alonso'
        );

        // Compute race stats
        let bestFinish = 99, totalPoints = 0, dnfs = 0, finishPositions = [];
        let races = [];

        if (results && Array.isArray(results)) {
            races = results.map((race) => {
                const result = race.Results?.[0];
                if (!result) return null;
                const pos = parseInt(result.position) || 0;
                const pts = parseFloat(result.points) || 0;
                totalPoints += pts;
                if (result.status !== 'Finished' && !result.status?.startsWith('+')) {
                    dnfs++;
                }
                if (pos > 0 && pos < bestFinish) bestFinish = pos;
                finishPositions.push(pos);
                return {
                    round: race.round,
                    raceName: race.raceName,
                    position: pos,
                    points: pts,
                    grid: parseInt(result.grid) || 0,
                    status: result.status,
                    time: result.Time?.time || result.status,
                };
            }).filter(Boolean);
        }

        const avgFinish = finishPositions.length > 0
            ? (finishPositions.reduce((a, b) => a + b, 0) / finishPositions.length).toFixed(1)
            : null;

        // Qualifying data
        let qualiData = [];
        if (qualifying && Array.isArray(qualifying)) {
            qualiData = qualifying.map((race) => {
                const q = race.QualifyingResults?.[0];
                return {
                    round: race.round,
                    raceName: race.raceName,
                    qualiPosition: parseInt(q?.position) || 0,
                    q1: q?.Q1 || null,
                    q2: q?.Q2 || null,
                    q3: q?.Q3 || null,
                };
            });
        }

        // Teammate comparison (find teammate from standings by same constructor)
        let teammate = null;
        if (alonsoStanding && standings?.DriverStandings) {
            const alonsoTeam = alonsoStanding.Constructors?.[0]?.constructorId;
            teammate = standings.DriverStandings.find(
                (d) => d.Driver?.driverId !== 'alonso' &&
                    d.Constructors?.[0]?.constructorId === alonsoTeam
            );
        }

        // Streaks
        let currentStreak = 0, streakType = 'points';
        for (let i = races.length - 1; i >= 0; i--) {
            if (races[i].points > 0) currentStreak++;
            else break;
        }
        if (currentStreak === 0) {
            streakType = 'no-points';
            for (let i = races.length - 1; i >= 0; i--) {
                if (races[i].points === 0) currentStreak++;
                else break;
            }
        }

        const data = {
            driver: alonsoStanding?.Driver || { driverId: 'alonso', givenName: 'Fernando', familyName: 'Alonso' },
            team: alonsoStanding?.Constructors?.[0] || null,
            position: alonsoStanding?.position || null,
            points: alonsoStanding?.points || totalPoints.toString(),
            wins: alonsoStanding?.wins || '0',
            races,
            qualiData,
            stats: {
                bestFinish: bestFinish < 99 ? bestFinish : null,
                avgFinish,
                dnfs,
                pointsPerRace: races.length > 0 ? (totalPoints / races.length).toFixed(1) : null,
                totalRaces: races.length,
                streak: { count: currentStreak, type: streakType },
            },
            teammate: teammate ? {
                driver: teammate.Driver,
                position: teammate.position,
                points: teammate.points,
            } : null,
        };

        res.json({ data });
    } catch (err) {
        console.error('[Routes] Alonso error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─── Scenarios ─────────────────────────────────
router.get('/scenarios', async (req, res) => {
    try {
        const standings = cache.get('driverStandings') || await jolpica.getDriverStandings();
        const schedule = cache.get('schedule') || await jolpica.getSchedule();

        if (!standings || !schedule) {
            return res.status(503).json({ error: 'Data unavailable for scenario calculation' });
        }

        const drivers = standings.DriverStandings?.slice(0, 5) || [];
        const now = new Date();
        const nextRace = schedule.find((r) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now);
        const isSprint = !!nextRace?.Sprint;

        // Points system
        const racePoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
        const sprintPoints = [8, 7, 6, 5, 4, 3, 2, 1];
        const fastestLapBonus = 1;

        // Remaining races count
        const remainingRaces = schedule.filter(
            (r) => new Date(`${r.date}T${r.time || '00:00:00Z'}`) > now
        ).length;

        const maxPointsPerRace = 26; // 25 + 1 FL
        const maxPointsRemaining = remainingRaces * maxPointsPerRace;

        const data = {
            currentStandings: drivers.map((d) => ({
                driverId: d.Driver.driverId,
                name: `${d.Driver.givenName} ${d.Driver.familyName}`,
                team: d.Constructors?.[0]?.name || '',
                points: parseFloat(d.points),
                position: parseInt(d.position),
            })),
            nextRace: nextRace ? {
                name: nextRace.raceName,
                round: nextRace.round,
                date: nextRace.date,
                isSprint,
            } : null,
            remainingRaces,
            maxPointsRemaining,
            racePoints,
            sprintPoints,
            fastestLapBonus,
        };

        res.json({ data });
    } catch (err) {
        console.error('[Routes] Scenarios error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─── Health ────────────────────────────────────
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        cacheKeys: cache.keys(),
    });
});

export default router;
