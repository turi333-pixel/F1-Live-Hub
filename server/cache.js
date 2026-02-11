// In-memory cache with per-key TTL and stale-while-revalidate
const store = new Map();

export function get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    return entry.data;
}

export function getFresh(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) return null; // expired
    return entry.data;
}

export function set(key, data, ttlMs = 5 * 60 * 1000) {
    store.set(key, {
        data,
        expiry: Date.now() + ttlMs,
        setAt: Date.now(),
    });
}

export function isStale(key) {
    const entry = store.get(key);
    if (!entry) return true;
    return Date.now() > entry.expiry;
}

export function keys() {
    return [...store.keys()];
}

export function clear() {
    store.clear();
}

export default { get, getFresh, set, isStale, keys, clear };
