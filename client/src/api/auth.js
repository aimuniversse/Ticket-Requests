// Centralised auth + cache storage.
//
// Per-tab isolation:
//   - Tokens live ONLY in sessionStorage, which is scoped to a single tab.
//     Every tab can therefore be logged into a different operator account
//     independently — no shared localStorage means a new tab never inherits
//     another tab's session.
//   - A freshly opened tab shows the login page; open as many operator tabs
//     as you like, each with its own account.
//   - Logout clears the current tab's session and cached API data only.

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const ROLE_KEY = "userRole";
const CACHE_PREFIX = "tmb_cache_";

const read = (key) => {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(key, value); } catch { /* ignore */ }
};

const remove = (key) => {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem(key); } catch { /* ignore */ }
};

const getRawUser = () => {
  const raw = read(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const getAccessToken = () =>
  read(ACCESS_TOKEN_KEY) || read("access") || read("token");

export const getRefreshToken = () => read(REFRESH_TOKEN_KEY);

export const isAuthenticated = () => Boolean(getAccessToken());

export const getStoredUser = () => getRawUser();

export const getUserId = () => {
  const user = getRawUser();
  if (!user) return null;
  return user.id ?? user.user_id ?? user.operator_id ?? null;
};

export const getUserRole = () => (read(ROLE_KEY) || "").toLowerCase();

export const storeAuth = ({ access, refresh, user, role }) => {
  if (access) {
    write(ACCESS_TOKEN_KEY, access);
    write("access", access);
    write("token", access);
  }
  if (refresh) write(REFRESH_TOKEN_KEY, refresh);
  if (user !== undefined) write(USER_KEY, JSON.stringify(user));
  if (role) write(ROLE_KEY, role);
};

export const clearAuth = () => {
  [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, ROLE_KEY, "access", "token"].forEach(remove);
};

// Namespace a cache key by the signed-in user id so switching accounts never
// serves the previous account's cached data.
export const scopedKey = (name) => {
  const uid = getUserId();
  return uid === null || uid === undefined ? name : `${String(uid)}:${name}`;
};

// Drop every cached API response (used on login/logout to avoid stale data).
export const clearAppCache = () => {
  if (typeof window === "undefined") return;
  [sessionStorage, localStorage].forEach((store) => {
    try {
      const keys = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) keys.push(k);
      }
      keys.forEach((k) => store.removeItem(k));
    } catch { /* ignore */ }
  });
};
