import { useState } from "react";
import "../styles/Pagination.css";

/**
 * Pagination
 *
 * @param {number}   page         - Current page (1-indexed).
 * @param {number}   totalPages   - Total number of pages.
 * @param {Function} onPageChange - Called with the new page number.
 * @param {{ from, to, total }} pageInfo - Item range info for the info label.
 * @param {boolean}  [showJump]   - Show a jump-to-page input (default true when totalPages > 5).
 */
function Pagination({ page, totalPages, onPageChange, pageInfo, showJump }) {
  const [jumpValue, setJumpValue] = useState("");

  if (totalPages <= 1) return null;

  const shouldShowJump = showJump !== undefined ? showJump : totalPages > 5;

  // Build visible page numbers (at most 5 around current)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page]);
    for (let d = -2; d <= 2; d++) {
      const p = page + d;
      if (p >= 1 && p <= totalPages) pages.add(p);
    }
    const sorted = [...pages].sort((a, b) => a - b);
    // Insert ellipsis markers
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
      result.push(sorted[i]);
    }
    return result;
  };

  const handleJump = (e) => {
    e.preventDefault();
    const n = parseInt(jumpValue, 10);
    if (n >= 1 && n <= totalPages) {
      onPageChange(n);
      setJumpValue("");
    }
  };

  return (
    <div className="pagination-bar" role="navigation" aria-label="Pagination">
      {pageInfo && (
        <span className="pagination-info">
          {pageInfo.from}–{pageInfo.to} of {pageInfo.total}
        </span>
      )}

      <div className="pagination-controls">
        <button
          className="pg-btn pg-btn--edge"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="First page"
          title="First page"
        >
          «
        </button>
        <button
          className="pg-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          title="Previous page"
        >
          ‹
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} className="pg-ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`pg-btn pg-btn--num ${p === page ? "pg-btn--active" : ""}`}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          className="pg-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          title="Next page"
        >
          ›
        </button>
        <button
          className="pg-btn pg-btn--edge"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Last page"
          title="Last page"
        >
          »
        </button>
      </div>

      {shouldShowJump && (
        <form className="pagination-jump" onSubmit={handleJump}>
          <label className="pagination-jump__label" htmlFor="pg-jump-input">
            Go to
          </label>
          <input
            id="pg-jump-input"
            className="pagination-jump__input"
            type="number"
            min="1"
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            placeholder={String(page)}
          />
          <button type="submit" className="pg-btn pagination-jump__btn">
            Go
          </button>
        </form>
      )}
    </div>
  );
}

export default Pagination;
