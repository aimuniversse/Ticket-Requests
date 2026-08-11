import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * usePagination
 * @param {Array}  data     - Full array of items to paginate.
 * @param {number} pageSize - Number of items per page (default 10).
 * @param {{ paramKey: string }} [options]
 *        When `paramKey` is provided the current page is kept in sync with a
 *        URL search param, so browser back/forward restores the page.
 * @returns {{ page, setPage, totalPages, paginatedData, pageInfo, goFirst, goLast, goPrev, goNext }}
 */
export function usePagination(data = [], pageSize = 10, options = {}) {
  const { paramKey } = options;
  const hasUrlSync = typeof paramKey === "string" && paramKey.length > 0;
  const [searchParams, setSearchParams] = useSearchParams();

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const readUrlPage = useCallback(() => {
    if (!hasUrlSync) return 1;
    const parsed = parseInt(searchParams.get(paramKey) || "1", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [hasUrlSync, searchParams, paramKey]);

  const [page, setPage] = useState(readUrlPage);

  // Follow URL param changes (browser back/forward or manual URL edits)
  useEffect(() => {
    if (!hasUrlSync) return;
    setPage(readUrlPage());
  }, [hasUrlSync, searchParams, readUrlPage]);

  // Clamp when the dataset shrinks (filters/search applied), and mirror the
  // clamped page back into the URL so back/forward stays consistent.
  useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
    if (hasUrlSync && searchParams.get(paramKey) !== String(totalPages)) {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set(paramKey, String(totalPages));
        return params;
      }, { replace: true });
    }
  }, [page, totalPages, hasUrlSync, paramKey, searchParams, setSearchParams]);

  const safePage = Math.min(page, totalPages);

  const setPageClamped = useCallback((next) => {
    const target = Math.max(1, Math.min(next, totalPages));
    setPage(target);
    if (hasUrlSync) {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set(paramKey, String(target));
        return params;
      }, { replace: true });
    }
  }, [totalPages, hasUrlSync, setSearchParams, paramKey]);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const pageInfo = {
    from: totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1,
    to: Math.min(safePage * pageSize, totalItems),
    total: totalItems,
  };

  return {
    page: safePage,
    setPage: setPageClamped,
    totalPages,
    paginatedData,
    pageInfo,
    goFirst: () => setPageClamped(1),
    goLast: () => setPageClamped(totalPages),
    goPrev: () => setPageClamped(safePage - 1),
    goNext: () => setPageClamped(safePage + 1),
  };
}
