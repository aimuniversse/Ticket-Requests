import { useCallback, useMemo, useRef } from "react";

/**
 * useCache
 *
 * A lightweight, in-memory cache with optional sessionStorage fallback.
 * - get(key)               → returns cached data or null if stale/missing
 * - set(key, data, ttlMs)  → stores data; default TTL = 30 000 ms
 * - invalidate(key)        → removes one entry
 * - invalidateAll()        → clears everything
 *
 * The cache lives in a ref so it never triggers re-renders.
 * sessionStorage is used to persist the LAST known value across soft refreshes.
 */
export function useCache() {
  const store = useRef(new Map()); // key → { data, expiresAt }

  const STORAGE_PREFIX = "tmb_cache_";

  const get = useCallback((key) => {
    const entry = store.current.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    // Remove stale in-memory entry
    if (entry) store.current.delete(key);

    // Try sessionStorage fallback (returns null if expired there too)
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt > Date.now()) {
          // Restore to in-memory so next call is fast
          store.current.set(key, parsed);
          return parsed.data;
        }
        sessionStorage.removeItem(STORAGE_PREFIX + key);
      }
    } catch {
      // sessionStorage unavailable or JSON parse error — ignore
    }
    return null;
  }, []);

  const set = useCallback((key, data, ttlMs = 30_000) => {
    const entry = { data, expiresAt: Date.now() + ttlMs };
    store.current.set(key, entry);
    try {
      sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Quota exceeded or unavailable — in-memory only
    }
  }, []);

  const invalidate = useCallback((key) => {
    store.current.delete(key);
    try { sessionStorage.removeItem(STORAGE_PREFIX + key); } catch { /* ignore */ }
  }, []);

  const invalidateAll = useCallback(() => {
    store.current.clear();
    try {
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith(STORAGE_PREFIX))
        .forEach((k) => sessionStorage.removeItem(k));
    } catch { /* ignore */ }
  }, []);

  return useMemo(
    () => ({ get, set, invalidate, invalidateAll }),
    [get, set, invalidate, invalidateAll],
  );
}
