# F1 Live Hub 🏎️

A real-time Formula 1 dashboard for the 2026 season. Aggregates live data from multiple F1 APIs and presents it through a fast, mobile-first web app with multilingual support.

**Live:** https://f1-live-hub-442393916614.europe-west1.run.app

---

## Features

### Pages

| Page | Description |
|------|-------------|
| **Home** | Next race countdown (live, ticking), session schedule, weather at circuit, championship standings preview, latest results, and breaking news |
| **Calendar** | Full 2026 season schedule with round status (completed / next / upcoming), sprint weekend indicators |
| **Standings** | Driver and Constructor championship tables with gap bars, team colours, and win counts |
| **Driver** | Pick any of the 20 drivers from a chip selector at the top — shows championship position, points, best/avg finish, DNFs, points streak, pts-per-race, race results timeline chart, and teammate head-to-head comparison |
| **Scenarios** | Three interactive scenario filters: **Top 5 Wins** (what if each top driver wins?), **Title Clinch** (mathematical clinch calculation, elimination check), **Team Chaos** (leader DNF, shock wins, top-3-all-DNF) |
| **Results** | Full results table for the most recent race |

### Multilingual
Language selector (EN / ES / DE) in the top bar. All UI labels, section headers, stat names, error messages, scenario descriptions, and date formats switch instantly. Selection is saved in `localStorage`.

### Data & Caching
- All external API calls are proxied through the Express backend
- In-memory cache with per-key TTL (standings: 10 min, schedule: 1 hr, news: 5 min)
- Background scheduler refreshes all data sources every 5 minutes
- Stale-while-revalidate: cached data is served immediately while a refresh runs

---

## Tech Stack

**Backend**
- Node.js (ES modules) + Express
- `node-cron` — scheduled background data refresh
- `xml2js` — RSS feed parsing

**Frontend**
- Vanilla JavaScript (ES modules, no framework)
- Vite — build tool and dev server
- Hash-based client-side router
- Canvas API — race results timeline chart

**Data Sources**
| Source | Data |
|--------|------|
| [Jolpica / Ergast API](https://api.jolpi.ca) | Season schedule, driver & constructor standings, race results, driver history, qualifying |
| [OpenF1 API](https://openf1.org) | Live timing, weather at circuit |
| F1 / Autosport / Motorsport RSS feeds | Latest news |

**Infrastructure**
- Docker (multi-stage build)
- Google Cloud Run (europe-west1) — serverless, auto-scaling

---

## Project Structure

```
F1/
├── server/
│   ├── index.js          # Express app, serves built frontend
│   ├── routes.js         # All /api/* endpoints
│   ├── cache.js          # TTL-based in-memory cache
│   ├── scheduler.js      # node-cron background refresh
│   └── api/
│       ├── jolpica.js    # Ergast-compatible API wrapper
│       ├── openf1.js     # OpenF1 live timing wrapper
│       └── news.js       # RSS aggregator
├── src/
│   ├── main.js           # Hash router + language init
│   ├── api.js            # Frontend fetch wrapper
│   ├── i18n.js           # Translations (EN / ES / DE)
│   ├── pages/
│   │   ├── home.js
│   │   ├── calendar.js
│   │   ├── standings.js
│   │   ├── driver.js
│   │   ├── scenarios.js
│   │   └── results.js
│   └── styles/
│       ├── global.css    # Design tokens, layout
│       ├── components.css
│       └── pages.css
├── index.html
├── Dockerfile
├── deploy.sh             # Cloud Run deploy script
└── vite.config.js
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/schedule` | Full 2026 season calendar |
| `GET /api/next-race` | Next race + weather data |
| `GET /api/standings/drivers` | Driver championship standings |
| `GET /api/standings/constructors` | Constructor championship standings |
| `GET /api/results/latest` | Most recent race results |
| `GET /api/driver/:driverId` | Stats for any driver (results, qualifying, teammate comparison) |
| `GET /api/scenarios` | Championship forecast data for scenario engine |
| `GET /api/news` | Aggregated F1 news (up to 15 articles) |
| `GET /api/health` | Server health + cache key status |

---

## Running Locally

**Prerequisites:** Node.js 20+

```bash
# Install dependencies
npm install

# Start both backend (port 3001) and frontend dev server (port 5173)
npm run dev
```

Open http://localhost:5173

The backend runs on port 3001. Vite proxies `/api/*` requests to it automatically (see `vite.config.js`).

---

## Deployment

The app is containerised and deployed to Google Cloud Run.

```bash
# Set your GCP project
export GCP_PROJECT_ID=your-project-id

# Build, push image, and deploy
bash deploy.sh
```

The deploy script uses `gcloud builds submit` (Cloud Build) to build the Docker image remotely, then deploys it to Cloud Run with:
- 256 MB RAM, 1 CPU
- Min 0 instances (scales to zero), max 3
- Port 8080 (injected by Cloud Run via `PORT` env var)

---

## Environment

No API keys required — all data sources are public APIs. The only environment variable used in production is `PORT` (set automatically by Cloud Run).
