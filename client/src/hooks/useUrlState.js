import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * useUrlState
 *
 * A `useState`-style value that is backed by a URL search param, so browser
 * back/forward restores it. `null`, `undefined` or `""` removes the param.
 *
 * @param {string} key     - Search param name, e.g. "status".
 * @param {*}      initial - Value used when the param is absent.
 * @param {{ replace?: boolean }} [options]
 *        `replace: true` (default) updates the URL without adding a history
 *        entry — ideal for search-as-you-type. Pass `replace: false` to push
 *        history entries for discrete navigation.
 * @returns {[value, setValue]}
 */
export function useUrlState(key, initial = "", options = {}) {
  const { replace = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) ?? initial;

  const setValue = useCallback((next) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      const resolved =
        typeof next === "function" ? next(params.get(key) ?? initial) : next;
      if (resolved === null || resolved === undefined || resolved === "") {
        params.delete(key);
      } else {
        params.set(key, String(resolved));
      }
      return params;
    }, { replace });
  }, [key, initial, replace, setSearchParams]);

  return [value, setValue];
}
