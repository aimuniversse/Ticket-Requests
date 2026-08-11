import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaCheckCircle, FaClock, FaPhone, FaSearch, FaSyncAlt, FaUser } from "react-icons/fa";
import API from "../../api/axios";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { useUrlState } from "../../hooks/useUrlState";
import { useCache } from "../../hooks/useCache";
import "../../styles/ActiveRequests.css";

const REQUEST_STORAGE_KEY = "latestTicketRequest";

const formatDate = (date) => date ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`)) : "\u2014";
const formatDateTime = (date) => {
  if (!date) return "\u2014";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
};

const formatPhoneDisplay = (item) => {
  if (!item?.phone_number) return "\u2014";
  if (item.contact_unlocked || item.status === "ACCEPTED" || item.status === "ASSIGNED") {
    return `${item.name || "Customer"} \u2022 ${item.phone_number}`;
  }
  const phone = String(item.phone_number);
  if (phone.length <= 5) return phone;
  return `*****${phone.slice(-5)}`;
};

const formatTimeLeft = (expiresAt, status) => {
  if (status === "EXPIRED") return "Already taken";
  if (status === "ACCEPTED" || status === "ASSIGNED") return "Booked";
  if (!expiresAt) return "Available now";
  const minutes = Math.max(0, Math.ceil((new Date(expiresAt) - Date.now()) / 60000));
  return minutes ? `${minutes} min left` : "Closing now";
};

const normalizeRequest = (item) => ({
  ...item,
  id: item?.id ?? item?.request_id,
  request_id: item?.request_id || `#${item?.id ?? "unknown"}`,
  status: item?.status || "PENDING",
  expected_price: item?.expected_price ?? "",
  bus_type: item?.bus_type || "\u2014",
});

const readPersistedRequests = () => {
  try {
    const rawValue = localStorage.getItem(REQUEST_STORAGE_KEY);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    return parsed ? [normalizeRequest(parsed)] : [];
  } catch {
    return [];
  }
};

const removePersistedRequest = (requestId) => {
  try {
    const rawValue = localStorage.getItem(REQUEST_STORAGE_KEY);
    if (!rawValue) return;
    const parsed = JSON.parse(rawValue);
    if (!parsed || String(parsed?.id ?? parsed?.request_id) !== String(requestId)) return;
    localStorage.removeItem(REQUEST_STORAGE_KEY);
  } catch {
    // Ignore storage issues.
  }
};

const mergeRequests = (apiRequests = [], assignedRequests = [], persistedRequests = []) => {
  const grouped = new Map();

  [...apiRequests, ...persistedRequests].forEach((item) => {
    const normalized = normalizeRequest(item);
    const key = normalized.id || normalized.request_id;
    if (!key) return;
    grouped.set(key, { ...(grouped.get(key) || {}), ...normalized });
  });

  assignedRequests.forEach((item) => {
    const normalized = normalizeRequest(item);
    const key = normalized.id || normalized.request_id;
    if (!key) return;
    const existing = grouped.get(key) || {};
    grouped.set(key, { ...existing, ...normalized });
  });

  return Array.from(grouped.values()).filter((request) =>
    ["PENDING", "NEW", "ASSIGNED", "ACCEPTED", "EXPIRED"].includes(request.status)
  );
};

const ActiveRequests = ({ initialFilter }) => {
  const navigate = useNavigate();
  const cache = useCache();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [query, setQuery] = useUrlState("q", "");
  const [statusFilter, setStatusFilter] = useUrlState("status", initialFilter || "ALL");

  const loadRequests = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      // Serve cached data immediately
      const cached = cache.get("active_requests");
      if (cached && showLoader) {
        setRequests(mergeRequests(cached, [], readPersistedRequests()));
        setLoading(false);
      }
      const [leadsRes, assignedRes] = await Promise.all([
        API.get("customer/").catch(() => ({ data: [] })),
        API.get("auth/requests/assigned/").catch(() => ({ data: [] })),
      ]);
      const apiRequests = (leadsRes.data || []).map(normalizeRequest);
      const assignedRequests = (assignedRes.data || []).map(normalizeRequest);
      const persistedRequests = readPersistedRequests();
      const merged = mergeRequests(apiRequests, assignedRequests, persistedRequests);
      cache.set("active_requests", apiRequests, 30_000);
      setRequests(merged);
      setError("");
    } catch (err) {
      if (err?.response?.status === 401) {
        setError("Please sign in again as an operator to view requests.");
      } else {
        setError("Unable to load active requests.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    try {
      setWalletLoading(true);
      const response = await API.get("auth/wallet/");
      setWalletBalance(Number(response?.data?.current_balance ?? 0));
    } catch (err) {
      setWalletBalance(0);
      if (err?.response?.status !== 401) {
        setError("Unable to load wallet balance.");
      }
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    const role = (localStorage.getItem("userRole") || "").toLowerCase();
    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    const persistedRequests = readPersistedRequests();
    if (persistedRequests.length) {
      setRequests(persistedRequests);
    }
    loadRequests(true);
    loadWallet();
    const timer = window.setInterval(() => {
      loadRequests(false);
      loadWallet();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialFilter) setStatusFilter(initialFilter);
  }, [initialFilter]);

  const handleAccept = async (item) => {
    if (walletLoading || walletBalance === null) {
      setError("Checking wallet balance...");
      return;
    }
    if (walletBalance <= 0) {
      setError("Add wallet credits before accepting this lead.");
      return;
    }

    try {
      const response = await API.get(`customer/requests/${item.id}/`);
      const liveStatus = response?.data?.status;
      if (liveStatus === "EXPIRED" || liveStatus === "ACCEPTED" || liveStatus === "ASSIGNED") {
        removePersistedRequest(item.id);
        setError("This request is already in progress or has already been accepted.");
        await loadRequests();
        await loadWallet();
        return;
      }
    } catch {
      // Fall through to the accept request and let the backend reply.
    }

    if (item.status === "EXPIRED" || item.status === "ACCEPTED" || item.status === "ASSIGNED") {
      removePersistedRequest(item.id);
      setError("This request is already in progress or has already been accepted.");
      return;
    }

    setAcceptingId(item.id);
    try {
      await API.post(`customer/leads/${item.id}/accept/`);
      removePersistedRequest(item.id);
      await loadRequests();
      await loadWallet();
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message || "This request is no longer available.";
      removePersistedRequest(item.id);
      setError(detail);
      await loadRequests();
      await loadWallet();
    } finally {
      setAcceptingId(null);
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { ALL: requests.length, NEW: 0, PENDING: 0, ACCEPTED: 0, ASSIGNED: 0, EXPIRED: 0 };
    requests.forEach((item) => {
      const s = item.status?.toUpperCase();
      if (s in counts && s !== "ALL") counts[s]++;
    });
    return counts;
  }, [requests]);

  const sortedRequests = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = requests.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      if (!search) return matchesStatus;
      const haystack = [item.request_id, item.from_location, item.to_location, item.name, item.gender, item.phone_number, item.bus_type]
        .filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && haystack.includes(search);
    });

    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime();
      const bTime = new Date(b.created_at || 0).getTime();
      if (aTime !== bTime) return bTime - aTime;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [requests, query, statusFilter]);

  const isAccepted = (item) => item.status === "ACCEPTED" || item.status === "ASSIGNED";

  const getRowClass = (item) => {
    if (isAccepted(item)) return "request-row--accepted";
    if (item.status === "NEW") return "request-row--new";
    return "request-row--active";
  };

  const getStatusPillClass = (status) => {
    switch (status) {
      case "ACCEPTED": return "status-pill--accepted";
      case "ASSIGNED": return "status-pill--assigned";
      case "EXPIRED": return "status-pill--expired";
      case "NEW": return "status-pill--new";
      default: return "status-pill--pending";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACCEPTED": return "Accepted";
      case "ASSIGNED": return "Assigned";
      case "EXPIRED": return "Already taken";
      case "NEW": return "New";
      default: return "Pending";
    }
  };

  return (
    <section className="requests-page">
      <header className="requests-page__header">
        <div>
          <p className="requests-page__eyebrow">Live request queue</p>
          <h1>Active requests</h1>
          <p>Review customer price requests and accept the ones you can serve.</p>
        </div>
        <div className="requests-page__tools">
          <span className="live-indicator"><i /> Auto-refreshing</span>
          <button type="button" className="table-action table-action--secondary" onClick={() => loadRequests(true)}><FaSyncAlt /> Refresh</button>
        </div>
      </header>
      {error && <p className="requests-notice requests-notice--error">{error}</p>}
      <div className="request-table-card">
        <div className="request-table-card__bar">
          <div><strong>{sortedRequests.length}</strong> request{sortedRequests.length === 1 ? "" : "s"}</div>
          <div className="accepted-filters">
            <label className="accepted-filter"><FaSearch /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requests..." /></label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All ({statusCounts.ALL})</option>
              <option value="PENDING">Pending ({statusCounts.PENDING})</option>
              <option value="ACCEPTED">Accepted ({statusCounts.ACCEPTED})</option>
              <option value="EXPIRED">Already taken ({statusCounts.EXPIRED})</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="requests-empty"><FaSyncAlt className="requests-empty__icon requests-empty__icon--spin" /><h2>Loading requests</h2><p>Getting the latest available requests for you.</p></div>
        ) : sortedRequests.length === 0 ? (
          <div className="requests-empty"><FaClock className="requests-empty__icon" /><h2>No requests</h2><p>New customer requests will appear here automatically.</p></div>
        ) : (
          <ActiveRequestsTablePaginated
            sortedRequests={sortedRequests}
            acceptingId={acceptingId}
            walletLoading={walletLoading}
            walletBalance={walletBalance}
            handleAccept={handleAccept}
            isAccepted={isAccepted}
            getRowClass={getRowClass}
            getStatusPillClass={getStatusPillClass}
            getStatusLabel={getStatusLabel}
          />
        )}
      </div>
    </section>
  );
};

function ActiveRequestsTablePaginated({
  sortedRequests, acceptingId, walletLoading, walletBalance,
  handleAccept, isAccepted, getRowClass, getStatusPillClass, getStatusLabel,
}) {
  const { page, setPage, totalPages, paginatedData, pageInfo } = usePagination(sortedRequests, 10, { paramKey: "page" });

  return (
    <>
      <div className="request-table-wrap">
        <table className="request-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Route</th>
              <th>Journey date</th>
              <th>Seats</th>
              <th>Bus type</th>
              <th>Requested price</th>
              <th>Customer</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Time left</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className={getRowClass(item)}>
                <td data-label="Request ID">
                  <span className="request-id">{item.request_id || `#${item.id}`}</span>
                  <span className="request-id-time">{formatDateTime(item.created_at)}</span>
                </td>
                <td data-label="Route"><strong className="route-cell">{item.from_location}<span>&rarr;</span>{item.to_location}</strong></td>
                <td data-label="Journey date">{formatDate(item.journey_date)}</td>
                <td data-label="Seats">{item.total_tickets}</td>
                <td data-label="Bus type"><span className="type-pill">{item.bus_type?.replaceAll("_", " ") || "\u2014"}</span></td>
                <td data-label="Requested price"><strong>&#8377;{item.expected_price}</strong></td>
                 <td data-label="Customer">
                  {(item.contact_unlocked || isAccepted(item)) ? (
                    <span className="customer-unlocked"><FaUser /> {item.name || "\u2014"}</span>
                  ) : (
                    <span className="time-cell"><FaUser /> {item.name || "\u2014"}</span>
                  )}
                </td>
                <td data-label="Gender">{item.gender || "\u2014"}</td>
                <td data-label="Phone">
                  {(item.contact_unlocked || isAccepted(item)) && item.phone_number ? (
                    <a href={`tel:${item.phone_number}`} className="customer-unlocked phone-link"><FaPhone /> {item.phone_number}</a>
                  ) : (
                    <span className="time-cell">{formatPhoneDisplay(item)}</span>
                  )}
                </td>
                <td data-label="Time left"><span className="time-cell"><FaClock /> {formatTimeLeft(item.expires_at, item.status)}</span></td>
                <td data-label="Status">
                  <div className="status-stack">
                    <span className={`status-pill ${getStatusPillClass(item.status)}`}>{getStatusLabel(item.status)}</span>
                    {item.status === "EXPIRED" && <span className="expired-badge">Already taken</span>}
                    {isAccepted(item) ? (
                      <span className="accepted-label"><FaCheck /> Booking confirmed</span>
                    ) : (
                      <button
                        type="button"
                        className="table-action table-action--accept"
                        disabled={acceptingId === item.id || item.status === "EXPIRED" || walletLoading || walletBalance === null || walletBalance <= 0}
                        onClick={() => handleAccept(item)}
                      >
                        <FaCheck /> {item.status === "EXPIRED" ? "Already taken" : acceptingId === item.id ? "Accepting" : walletLoading ? "Checking" : walletBalance <= 0 ? "No credits" : "Accept"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageInfo={pageInfo} />
      <div className="request-cards-list">
        {sortedRequests.map((item) => (
          <article key={`card-${item.id}`} className={`request-card-mobile ${getRowClass(item)}`}>
            <div className="request-card-mobile__top">
              <div className="request-card-mobile__route">
                <span className="request-card-mobile__id">{item.request_id || `#${item.id}`}</span>
                <span className="request-card-mobile__id-time">{formatDateTime(item.created_at)}</span>
                <strong className="route-cell">{item.from_location}<span>&rarr;</span>{item.to_location}</strong>
              </div>
              <div className="request-card-mobile__status">
                <span className={`status-pill ${getStatusPillClass(item.status)}`}>{getStatusLabel(item.status)}</span>
                {isAccepted(item) ? (
                  <span className="accepted-label"><FaCheck /> Booking confirmed</span>
                ) : (
                  <button
                    type="button"
                    className="table-action table-action--accept"
                    disabled={acceptingId === item.id || item.status === "EXPIRED" || walletLoading || walletBalance === null || walletBalance <= 0}
                    onClick={() => handleAccept(item)}
                  >
                    <FaCheck /> {item.status === "EXPIRED" ? "Already taken" : acceptingId === item.id ? "Accepting" : walletLoading ? "Checking" : walletBalance <= 0 ? "No credits" : "Accept"}
                  </button>
                )}
              </div>
            </div>
            <div className="request-card-mobile__details">
              <div className="request-card-mobile__col request-card-mobile__col--left">
                <span className="request-card-mobile__detail"><strong>Passenger:</strong> {item.name || "Customer"}</span>
                <span className="request-card-mobile__detail"><strong>Gender:</strong> {item.gender || "\u2014"}</span>
                <span className="request-card-mobile__detail"><strong>Type:</strong> {item.bus_type?.replaceAll("_", " ") || "\u2014"}</span>
              </div>
              <div className="request-card-mobile__col request-card-mobile__col--right">
                <span className="request-card-mobile__detail"><strong>Phone:</strong> {(item.contact_unlocked || isAccepted(item)) && item.phone_number ? (
                  <a href={`tel:${item.phone_number}`} className="phone-link">{item.phone_number}</a>
                ) : formatPhoneDisplay(item)}</span>
                <span className="request-card-mobile__detail request-card-mobile__detail--num"><strong>Seats</strong>{item.total_tickets}</span>
                <span className="request-card-mobile__detail request-card-mobile__detail--num"><strong>Price</strong>&#8377;{item.expected_price}</span>
                <span className="request-card-mobile__detail request-card-mobile__detail--num"><strong>Time</strong>{formatTimeLeft(item.expires_at, item.status)}</span>
                <span className="request-card-mobile__detail"><strong>Date:</strong> {formatDate(item.journey_date)}</span>

              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default ActiveRequests;
