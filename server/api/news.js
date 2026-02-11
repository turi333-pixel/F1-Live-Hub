// F1 News RSS feed aggregator
import { parseStringPromise } from 'xml2js';

const FEEDS = [
    { name: 'Formula 1', url: 'https://www.formula1.com/content/fom-website/en/latest/all.xml' },
    { name: 'Autosport', url: 'https://www.autosport.com/rss/feed/f1' },
    { name: 'Motorsport', url: 'https://www.motorsport.com/rss/f1/news/' },
];

async function fetchFeed(feed) {
    try {
        const res = await fetch(feed.url, {
            signal: AbortSignal.timeout(8000),
            headers: { 'User-Agent': 'F1LiveHub/1.0' },
        });
        if (!res.ok) return [];
        const xml = await res.text();
        const parsed = await parseStringPromise(xml, { explicitArray: false });

        const channel = parsed?.rss?.channel || parsed?.feed;
        if (!channel) return [];

        const items = Array.isArray(channel.item)
            ? channel.item
            : channel.item
                ? [channel.item]
                : Array.isArray(channel.entry)
                    ? channel.entry
                    : [];

        return items.slice(0, 10).map((item) => ({
            title: item.title?._ || item.title || '',
            link: item.link?.$ ? item.link.$.href : (item.link || ''),
            date: item.pubDate || item.published || item.updated || '',
            source: feed.name,
            description: (item.description?._ || item.description || item.summary || '').replace(/<[^>]+>/g, '').slice(0, 200),
        }));
    } catch (err) {
        console.warn(`[News] Failed to fetch ${feed.name}:`, err.message);
        return [];
    }
}

function deduplicateByTitle(articles) {
    const seen = new Map();
    for (const article of articles) {
        const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
        if (!seen.has(key)) {
            seen.set(key, article);
        }
    }
    return [...seen.values()];
}

export async function getNews() {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed));
    const all = results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value);

    const deduped = deduplicateByTitle(all);

    // Sort by date descending
    deduped.sort((a, b) => {
        const da = new Date(a.date || 0);
        const db = new Date(b.date || 0);
        return db - da;
    });

    return deduped.slice(0, 15);
}

export default { getNews };
