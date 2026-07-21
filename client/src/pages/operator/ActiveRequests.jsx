import { useEffect, useMemo, useState } from "react";
import { FaCheck, FaClock, FaPhone, FaSearch, FaSyncAlt, FaUser, FaTimes } from "react-icons/fa";
import API from "../../api/axios";
import "../../styles/ActiveRequests.css";

const REQUEST_STORAGE_KEY = "latestTicketRequest";

const formatDate = (date) => date ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`)) : "—";
const formatPhoneDisplay = (item) => {
  if (!item?.phone_number) return "—";
  if (item.contact_unlocked || item.status === "ACCEPTED") {
    return `${item.name || "Customer"} • ${item.phone_number}`;
  }

  const phone = String(item.phone_number);
  if (phone.length <= 5) return phone;
  return `*****${phone.slice(-5)}`;
};
const formatTimeLeft = (expiresAt, status) => {
  if (status === "EXPIRED") return "Expired";
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
  bus_type: item?.bus_type || "—",
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

const mergeRequests = (apiRequests = [], persistedRequests = []) => {
  const grouped = new Map();

  [...apiRequests, ...persistedRequests].forEach((item) => {
    const normalized = normalizeRequest(item);
    const key = normalized.id || normalized.request_id;
    if (!key) return;
    grouped.set(key, { ...(grouped.get(key) || {}), ...normalized });
  });

  return Array.from(grouped.values()).filter((request) => ["PENDING", "NEW", "ASSIGNED", "EXPIRED"].includes(request.status));
};

const ActiveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadRequests = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const response = await API.get("customer/");
      const apiRequests = (response.data || []).map(normalizeRequest);
      const persistedRequests = readPersistedRequests();
      const mergedRequests = mergeRequests(apiRequests, persistedRequests);
      setRequests(mergedRequests);
      setError("");
    }
    catch (err) {
      if (err?.response?.status === 401) {
        setError("Please sign in again as an operator to view requests.");
      } else {
        setError("Unable to load active requests.");
      }
    }
    finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    try {
      setWalletLoading(true);
      const response = await API.get("auth/wallet/");
      setWalletBalance(Number(response?.data?.current_balance ?? 0));
    }
    catch (err) {
      setWalletBalance(0);
      if (err?.response?.status !== 401) {
        setError("Unable to load wallet balance.");
      }
    }
    finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    const persistedRequests = readPersistedRequests();
    if (persistedRequests.length) {
      setRequests(persistedRequests);
    }

    loadRequests(true);
    loadWallet();
    const timer = window.setInterval(() => {
      loadRequests(false);
      loadWallet();
    }, 10000);
    return () => window.clearInterval(timer);
  }, []);

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
      const response = await API.post(`customer/leads/${item.id}/accept/`);
      removePersistedRequest(item.id);
      await loadRequests();
      await loadWallet();
    }
    catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message || "This request is no longer available.";
      removePersistedRequest(item.id);
      setError(detail);
      await loadRequests();
      await loadWallet();
    }
    finally {
      setAcceptingId(null);
    }
  };

  const sortedRequests = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = requests.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      if (!search) return matchesStatus;
      const haystack = [item.request_id, item.from_location, item.to_location, item.name, item.phone_number, item.bus_type]
        .filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && haystack.includes(search);
    });

    return [...filtered].sort((a, b) => {
      const aActive = a.status === "PENDING" || a.status === "NEW";
      const bActive = b.status === "PENDING" || b.status === "NEW";
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return 0;
    });
  }, [requests, query, statusFilter]);

  const isAccepted = (item) => item.status === "ACCEPTED" || item.status === "ASSIGNED";

  return <section className="requests-page">
    <header className="requests-page__header"><div><p className="requests-page__eyebrow">Live request queue</p><h1>Active requests</h1><p>Review customer price requests and accept the ones you can serve.</p></div><div className="requests-page__tools"><span className="live-indicator"><i /> Auto-refreshing</span><button type="button" className="table-action table-action--secondary" onClick={() => loadRequests(true)}><FaSyncAlt /> Refresh</button></div></header>
    {error && <p className="requests-notice requests-notice--error">{error}</p>}
    <div className="request-table-card"><div className="request-table-card__bar"><div><strong>{sortedRequests.length}</strong> request{sortedRequests.length === 1 ? "" : "s"}</div><div className="accepted-filters"><label className="accepted-filter"><FaSearch /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requests..." /></label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="ALL">All</option><option value="PENDING">Pending</option><option value="NEW">New</option><option value="ASSIGNED">Assigned</option><option value="ACCEPTED">Accepted</option><option value="EXPIRED">Expired</option></select></div></div>
      {loading ? <div className="requests-empty"><FaSyncAlt className="requests-empty__icon requests-empty__icon--spin" /><h2>Loading requests</h2><p>Getting the latest available requests for you.</p></div> : sortedRequests.length === 0 ? <div className="requests-empty"><FaClock className="requests-empty__icon" /><h2>No requests</h2><p>New customer requests will appear here automatically.</p></div> : <div className="request-table-wrap"><table className="request-table"><thead><tr><th>Request ID</th><th>Route</th><th>Journey date</th><th>Seats</th><th>Bus type</th><th>Requested price</th><th>Customer</th><th>Remaining time</th><th>Status</th><th>Action</th></tr></thead><tbody>{sortedRequests.map((item) => <tr key={item.id} className={isAccepted(item) ? "request-row--accepted" : "request-row--active"}><td data-label="Request ID"><span className="request-id">{item.request_id || `#${item.id}`}</span></td><td data-label="Route"><strong className="route-cell">{item.from_location}<span>→</span>{item.to_location}</strong></td><td data-label="Journey date">{formatDate(item.journey_date)}</td><td data-label="Seats">{item.total_tickets}</td><td data-label="Bus type"><span className="type-pill">{item.bus_type?.replaceAll("_", " ") || "—"}</span></td><td data-label="Requested price"><strong>₹{item.expected_price}</strong></td><td data-label="Customer"><span className="time-cell">{formatPhoneDisplay(item)}</span></td><td data-label="Remaining time"><span className="time-cell"><FaClock /> {formatTimeLeft(item.expires_at, item.status)}</span></td><td data-label="Status"><div className="status-stack"><span className={`status-pill ${item.status === "ACCEPTED" ? "status-pill--accepted" : item.status === "EXPIRED" ? "status-pill--expired" : item.status === "ASSIGNED" ? "status-pill--assigned" : "status-pill--pending"}`}>{item.status === "ACCEPTED" ? "Accepted" : item.status === "ASSIGNED" ? "Assigned" : item.status === "EXPIRED" ? "Expired" : "Pending"}</span>{item.status === "EXPIRED" && <span className="expired-badge">Request expired</span>}</div></td><td data-label="Action">{isAccepted(item) ? <span className="accepted-label"><FaCheck /> Accepted</span> : <button className="table-action table-action--accept" disabled={acceptingId === item.id || item.status === "EXPIRED" || walletLoading || walletBalance === null || walletBalance <= 0} onClick={() => handleAccept(item)}><FaCheck /> {item.status === "EXPIRED" ? "Expired" : acceptingId === item.id ? "Accepting" : walletLoading ? "Checking" : walletBalance <= 0 ? "No credits" : "Accept"}</button>}</td></tr>)}</tbody></table></div>}
    </div>
  </section>;
};
export default ActiveRequests;
