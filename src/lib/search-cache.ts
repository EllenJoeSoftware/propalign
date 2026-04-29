/**
 * Tiny in-memory LRU cache for the /api/properties/search endpoint.
 *
 * Same filter combo within TTL_MS returns the cached response without
 * hitting Firestore. Massively reduces read costs when a user is
 * iterating on filters in quick succession.
 *
 * - Per-server-instance only (resets on cold-start / deploy).
 * - 60-second TTL is short enough that fresh listings still appear
 *   within a minute.
 * - Capped at 100 entries to bound memory.
 */

const TTL_MS = 60_000;
const MAX_ENTRIES = 100;

interface Entry {
  value: any;
  expires: number;
}

const cache = new Map<string, Entry>();

export function cacheGet(key: string): any | null {
  const e = cache.get(key);
  if (!e) return null;
  if (e.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  // Touch — move to end for LRU
  cache.delete(key);
  cache.set(key, e);
  return e.value;
}

export function cacheSet(key: string, value: any): void {
  cache.set(key, { value, expires: Date.now() + TTL_MS });
  if (cache.size > MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

/** Build a stable cache key from a filter object. */
export function cacheKey(parts: Record<string, unknown>): string {
  // Sort keys for determinism so {a,b} and {b,a} match.
  const sorted: Record<string, unknown> = {};
  for (const k of Object.keys(parts).sort()) {
    sorted[k] = parts[k];
  }
  return JSON.stringify(sorted);
}
