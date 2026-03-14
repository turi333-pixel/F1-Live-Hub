// Internationalisation — en, es, de
const TRANSLATIONS = {
    en: {
        nav: { home: 'Home', calendar: 'Calendar', standings: 'Standings', driver: 'Driver', scenarios: 'Scenarios' },
        common: {
            loading: 'Loading...', error: 'Something went wrong. Please try again.',
            awaitingData: 'Awaiting data', noResults: 'No results yet', noNews: 'No news available',
            round: 'Round', of: 'of', pos: 'Pos', driver: 'Driver', constructor: 'Constructor',
            pts: 'Pts', time: 'Time', points: 'Points', done: 'Done', next: 'Next',
            sprint: 'Sprint', sprintWeekend: 'Sprint Weekend', upNext: 'UP NEXT', normalRace: 'Normal Race',
            days: 'Days', hours: 'Hours', min: 'Min', sec: 'Sec', rain: 'Rain',
        },
        home: {
            seasonNotStarted: "Season hasn't started yet. Check back soon!",
            sessionSchedule: 'Session Schedule', quickAccess: 'Quick Access',
            drivers: 'Drivers', constructors: 'Constructors',
            latestResults: 'Latest Results', breakingNews: 'Breaking News',
        },
        calendar: { title: '2026 Calendar', unavailable: 'Calendar data unavailable.' },
        standings: {
            title: 'Championship Standings', drivers: 'Drivers', constructors: 'Constructors',
            noData: 'No standings data yet. The season starts in March 2026!',
        },
        results: {
            title: 'Latest Race Results',
            noResults: 'No race results yet. The 2026 season starts on March 8th!',
        },
        driver: {
            championshipPos: 'Championship Position', bestFinish: 'Best Finish', avgFinish: 'Avg Finish',
            dnfs: 'DNFs', ptStreak: 'Pt Streak', noPts: 'No Pts', ptsPerRace: 'Pts / Race',
            timeline: 'Race Results Timeline',
            timelineEarly: 'Round 1 complete — timeline builds as the season progresses',
            teammateBattle: 'Teammate Battle vs', points: 'Points',
            noData: 'No data available for this driver yet.',
        },
        scenarios: {
            title: 'Scenario Forecast', next: 'Next:', top5wins: 'Top 5 Wins',
            titleClinch: 'Title Clinch', teamChaos: 'Team Chaos', quickCalc: 'Quick Calc',
            placeholder: 'Positions to gain (e.g. 2)', calculate: 'Calculate',
            enterTarget: 'Enter a target to see what needs to happen.',
            warming: 'Scenario engine warming up...',
            ifWins: 'If <strong>{0}</strong> wins next race...',
            takesLead: 'Takes P1 lead by {0} pts',
            movesTo: 'Moves to P{0} ({1} leads by {2})',
            newTop3: 'New Top 3:',
            clinch: {
                leadsBy: 'leads by {0} pts',
                alreadyClinched: '🏆 Title already mathematically secured!',
                p2MaxPts: 'P2 can score max {0} pts — not enough to catch up',
                needsPts: 'Needs {0} more pts advantage to clinch (min {1} races)',
                remaining: '{0} races remaining',
                eliminated: 'Mathematically eliminated from the title',
                gapTooLarge: '{0} pts gap, only {1} pts remaining',
                ptsBehind: 'pts behind',
                needs: 'Needs ~{0} wins + rival mistakes to stay in contention',
                maxCatchup: 'Can close up to {0} pts if rivals score 0',
            },
            chaos: {
                dnfWins: '<strong>{0}</strong> DNF — <strong>{1}</strong> wins...',
                leaderChange: '🔄 {0} takes the championship lead by {1} pts!',
                staysLeader: '{0} stays P1 despite DNF — leads by {1} pts',
                shock: 'Shock result: <strong>{0}</strong> wins...',
                movesUp: 'Gains {0} position(s) — moves up to P{1}',
                noChange: 'Stays at P{0} — still outside top 3',
                top3dnf: 'Top 3 all DNF — {0} inherits the win...',
                top3dnfResult: '{0} wins by default — leads by {1} pts',
            },
        },
    },
    es: {
        nav: { home: 'Inicio', calendar: 'Calendario', standings: 'Clasificación', driver: 'Piloto', scenarios: 'Escenarios' },
        common: {
            loading: 'Cargando...', error: 'Algo salió mal. Por favor, inténtalo de nuevo.',
            awaitingData: 'Esperando datos', noResults: 'Sin resultados aún', noNews: 'Sin noticias disponibles',
            round: 'Ronda', of: 'de', pos: 'Pos', driver: 'Piloto', constructor: 'Constructor',
            pts: 'Pts', time: 'Tiempo', points: 'Puntos', done: 'Listo', next: 'Siguiente',
            sprint: 'Sprint', sprintWeekend: 'Fin de Semana Sprint', upNext: 'PRÓXIMO', normalRace: 'Carrera Normal',
            days: 'Días', hours: 'Horas', min: 'Min', sec: 'Seg', rain: 'Lluvia',
        },
        home: {
            seasonNotStarted: '¡La temporada aún no ha comenzado. Vuelve pronto!',
            sessionSchedule: 'Horario de Sesiones', quickAccess: 'Acceso Rápido',
            drivers: 'Pilotos', constructors: 'Constructores',
            latestResults: 'Últimos Resultados', breakingNews: 'Últimas Noticias',
        },
        calendar: { title: 'Calendario 2026', unavailable: 'Datos del calendario no disponibles.' },
        standings: {
            title: 'Clasificación del Campeonato', drivers: 'Pilotos', constructors: 'Constructores',
            noData: '¡Aún no hay clasificación. La temporada comienza en marzo de 2026!',
        },
        results: {
            title: 'Últimos Resultados de Carrera',
            noResults: '¡Aún no hay resultados. La temporada 2026 comienza el 8 de marzo!',
        },
        driver: {
            championshipPos: 'Posición en el Campeonato', bestFinish: 'Mejor Resultado', avgFinish: 'Promedio',
            dnfs: 'Abandonos', ptStreak: 'Racha de Pts', noPts: 'Sin Puntos', ptsPerRace: 'Pts / Carrera',
            timeline: 'Cronología de Resultados',
            timelineEarly: 'Ronda 1 completada — la cronología crece durante la temporada',
            teammateBattle: 'Batalla vs', points: 'Puntos',
            noData: 'No hay datos disponibles para este piloto aún.',
        },
        scenarios: {
            title: 'Pronóstico de Escenarios', next: 'Próxima:', top5wins: 'Top 5 Victorias',
            titleClinch: 'Título Definitivo', teamChaos: 'Caos de Equipos', quickCalc: 'Cálculo Rápido',
            placeholder: 'Posiciones a ganar (ej. 2)', calculate: 'Calcular',
            enterTarget: 'Ingresa un objetivo para ver qué necesita suceder.',
            warming: 'Motor de escenarios iniciando...',
            ifWins: 'Si <strong>{0}</strong> gana la próxima carrera...',
            takesLead: 'Toma el liderato P1 con {0} pts de ventaja',
            movesTo: 'Sube a P{0} ({1} lidera con {2} pts)',
            newTop3: 'Nuevo Top 3:',
            clinch: {
                leadsBy: 'lidera por {0} pts',
                alreadyClinched: '🏆 ¡Título asegurado matemáticamente!',
                p2MaxPts: 'P2 puede sumar máx {0} pts — insuficiente para alcanzar',
                needsPts: 'Necesita {0} pts más de ventaja para asegurar (mín {1} carreras)',
                remaining: '{0} carreras restantes',
                eliminated: 'Eliminado matemáticamente del campeonato',
                gapTooLarge: '{0} pts de diferencia, solo {1} pts restantes',
                ptsBehind: 'pts de retraso',
                needs: 'Necesita ~{0} victorias + errores del rival para seguir en carrera',
                maxCatchup: 'Puede recortar hasta {0} pts si los rivales no puntúan',
            },
            chaos: {
                dnfWins: '<strong>{0}</strong> abandona — <strong>{1}</strong> gana...',
                leaderChange: '🔄 ¡{0} toma el liderato del campeonato por {1} pts!',
                staysLeader: '{0} sigue P1 pese al abandono — lidera por {1} pts',
                shock: 'Resultado sorpresa: <strong>{0}</strong> gana...',
                movesUp: 'Gana {0} posición(es) — sube a P{1}',
                noChange: 'Se queda en P{0} — fuera del top 3',
                top3dnf: 'Los 3 primeros abandonan — {0} hereda la victoria...',
                top3dnfResult: '{0} gana por defecto — lidera por {1} pts',
            },
        },
    },
    de: {
        nav: { home: 'Start', calendar: 'Kalender', standings: 'Wertung', driver: 'Fahrer', scenarios: 'Szenarien' },
        common: {
            loading: 'Laden...', error: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
            awaitingData: 'Warte auf Daten', noResults: 'Noch keine Ergebnisse', noNews: 'Keine Nachrichten verfügbar',
            round: 'Runde', of: 'von', pos: 'Pos', driver: 'Fahrer', constructor: 'Konstrukteur',
            pts: 'Pkt', time: 'Zeit', points: 'Punkte', done: 'Fertig', next: 'Nächstes',
            sprint: 'Sprint', sprintWeekend: 'Sprint-Wochenende', upNext: 'ALS NÄCHSTES', normalRace: 'Normales Rennen',
            days: 'Tage', hours: 'Std', min: 'Min', sec: 'Sek', rain: 'Regen',
        },
        home: {
            seasonNotStarted: 'Die Saison hat noch nicht begonnen. Schau bald wieder!',
            sessionSchedule: 'Session-Zeitplan', quickAccess: 'Schnellzugriff',
            drivers: 'Fahrer', constructors: 'Konstrukteure',
            latestResults: 'Letzte Ergebnisse', breakingNews: 'Aktuelle Nachrichten',
        },
        calendar: { title: 'Kalender 2026', unavailable: 'Kalenderdaten nicht verfügbar.' },
        standings: {
            title: 'Meisterschaftswertung', drivers: 'Fahrer', constructors: 'Konstrukteure',
            noData: 'Noch keine Wertungsdaten. Die Saison beginnt im März 2026!',
        },
        results: {
            title: 'Letzte Rennergebnisse',
            noResults: 'Noch keine Rennergebnisse. Die Saison 2026 beginnt am 8. März!',
        },
        driver: {
            championshipPos: 'Meisterschaftsposition', bestFinish: 'Bestes Ergebnis', avgFinish: 'Ø Ergebnis',
            dnfs: 'Ausfälle', ptStreak: 'Punkte-Serie', noPts: 'Ohne Punkte', ptsPerRace: 'Pkt / Rennen',
            timeline: 'Rennergebnis-Zeitleiste',
            timelineEarly: 'Runde 1 abgeschlossen — Zeitleiste wächst im Laufe der Saison',
            teammateBattle: 'Teamkollegen-Duell vs', points: 'Punkte',
            noData: 'Noch keine Daten für diesen Fahrer verfügbar.',
        },
        scenarios: {
            title: 'Szenario-Prognose', next: 'Nächstes:', top5wins: 'Top 5 Siege',
            titleClinch: 'Titelgewinn', teamChaos: 'Team-Chaos', quickCalc: 'Schnellrechner',
            placeholder: 'Positionen zu gewinnen (z.B. 2)', calculate: 'Berechnen',
            enterTarget: 'Gib ein Ziel ein, um zu sehen, was passieren muss.',
            warming: 'Szenario-Engine wird gestartet...',
            ifWins: 'Wenn <strong>{0}</strong> das nächste Rennen gewinnt...',
            takesLead: 'Übernimmt P1 mit {0} Punkten Vorsprung',
            movesTo: 'Rückt auf P{0} vor ({1} führt mit {2} Pkt)',
            newTop3: 'Neues Top 3:',
            clinch: {
                leadsBy: 'führt mit {0} Pkt',
                alreadyClinched: '🏆 Titel mathematisch bereits gesichert!',
                p2MaxPts: 'P2 kann max {0} Pkt holen — nicht genug aufzuholen',
                needsPts: 'Braucht {0} Pkt mehr Vorsprung zum Titelgewinn (mind. {1} Rennen)',
                remaining: '{0} Rennen verbleibend',
                eliminated: 'Mathematisch aus dem Titelkampf ausgeschieden',
                gapTooLarge: '{0} Pkt Rückstand, nur {1} Pkt verbleibend',
                ptsBehind: 'Pkt Rückstand',
                needs: 'Braucht ~{0} Siege + Rivalenfehler um im Kampf zu bleiben',
                maxCatchup: 'Kann bis zu {0} Pkt aufholen wenn Rivalen 0 punkten',
            },
            chaos: {
                dnfWins: '<strong>{0}</strong> scheidet aus — <strong>{1}</strong> gewinnt...',
                leaderChange: '🔄 {0} übernimmt die Führung mit {1} Pkt!',
                staysLeader: '{0} bleibt P1 trotz Ausfall — führt mit {1} Pkt',
                shock: 'Schockergebnis: <strong>{0}</strong> gewinnt...',
                movesUp: 'Gewinnt {0} Position(en) — rückt auf P{1} vor',
                noChange: 'Bleibt auf P{0} — außerhalb der Top 3',
                top3dnf: 'Top 3 scheiden alle aus — {0} erbt den Sieg...',
                top3dnfResult: '{0} gewinnt kampflos — führt mit {1} Pkt',
            },
        },
    },
};

const DATE_LOCALES = { en: 'en-GB', es: 'es-ES', de: 'de-DE' };

let currentLang = localStorage.getItem('f1_lang') || 'en';
if (!TRANSLATIONS[currentLang]) currentLang = 'en';

export function t(key, ...args) {
    const keys = key.split('.');
    let val = TRANSLATIONS[currentLang];
    for (const k of keys) val = val?.[k];
    if (val === undefined) val = key;
    if (args.length) args.forEach((arg, i) => { val = val.replace(`{${i}}`, arg); });
    return val;
}

export function getLanguage() { return currentLang; }
export function getDateLocale() { return DATE_LOCALES[currentLang] || 'en-GB'; }

export function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('f1_lang', lang);
    document.dispatchEvent(new CustomEvent('languagechange', { detail: lang }));
}
