import { useEffect, useMemo, useState } from "react";
import { FaCheck, FaCheckCircle, FaClock, FaPhone, FaSearch, FaSyncAlt, FaTimes, FaUser } from "react-icons/fa";
import API from "../../api/axios";
import "../../styles/AcceptedRequests.css";
import "../../styles/ActiveRequests.css";

const formatDate = (date) => date ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`)) : "\u2014";
const formatDateTime = (date) => {
  if (!date) return "\u2014";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
};

const getStatusPillClass = (status) => {
  switch (status) {
    case "ACCEPTED": return "status-pill--accepted";
    case "ASSIGNED": return "status-pill--assigned";
    case "COMPLETED": return "status-pill--completed";
    case "EXPIRED": return "status-pill--expired";
    case "NEW": return "status-pill--new";
    case "CANCELLED": return "status-pill--expired";
    default: return "status-pill--pending";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "ACCEPTED": return "Accepted";
    case "ASSIGNED": return "Assigned";
    case "COMPLETED": return "Completed";
    case "EXPIRED": return "Expired";
    case "NEW": return "New";
    case "CANCELLED": return "Cancelled";
    default: return "Pending";
  }
};

const getRowClass = (status) => {
  switch (status) {
    case "NEW": return "request-row--new";
    case "ASSIGNED": return "request-row--active";
    case "COMPLETED": return "request-row--completed";
    case "EXPIRED":
    case "CANCELLED": return "request-row--expired";
    default: return "request-row--accepted";
  }
};

const AcceptedRequests = ({ onCountChange }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadRequests = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const response = await API.get("auth/requests/assigned/");
      setRequests(response.data || []);
      setError("");
    } catch (err) {
      setError(err?.response?.status === 401 ? "Please sign in again as an operator to view accepted requests." : "Unable to load accepted requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(true);
    const timer = window.setInterval(() => loadRequests(false), 10000);
    return () => window.clearInterval(timer);
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { ALL: requests.length, NEW: 0, PENDING: 0, ACCEPTED: 0, ASSIGNED: 0, EXPIRED: 0, COMPLETED: 0 };
    requests.forEach((item) => {
      const s = item.status?.toUpperCase();
      if (s in counts && s !== "ALL") counts[s]++;
    });
    return counts;
  }, [requests]);

  useEffect(() => {
    if (onCountChange) onCountChange(statusCounts);
  }, [statusCounts, onCountChange]);

  const filteredRequests = useMemo(() => {
    const search = query.trim().toLowerCase();
    const statusOrder = { NEW: 0, PENDING: 1, ASSIGNED: 2, ACCEPTED: 3, COMPLETED: 4, EXPIRED: 5, CANCELLED: 6 };
    const filtered = requests.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status?.toUpperCase() === statusFilter;
      if (!search) return matchesStatus;
      const haystack = [item.request_id, item.from_location, item.to_location, item.name, item.phone_number, item.bus_type]
        .filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && haystack.includes(search);
    });
    return [...filtered].sort((a, b) => {
      const aOrder = statusOrder[a.status?.toUpperCase()] ?? 5;
      const bOrder = statusOrder[b.status?.toUpperCase()] ?? 5;
      return aOrder - bOrder;
    });
  }, [requests, query, statusFilter]);

  return (
    <section className="requests-page accepted-requests-page">
      <header className="requests-page__header">
        <div>
          <p className="requests-page__eyebrow">Your confirmed queue</p>
          <h1>Accepted requests</h1>
          <p>Track every request you have accepted and its booking progress.</p>
        </div>
        <div className="requests-page__tools">
          <span className="live-indicator"><i /> Auto-refreshing</span>
          <button type="button" className="table-action table-action--secondary" onClick={() => loadRequests(true)}><FaSyncAlt /> Refresh</button>
        </div>
      </header>
      {error && <p className="requests-notice requests-notice--error">{error}</p>}
      <div className="request-table-card">
        <div className="request-table-card__bar">
          <div><strong>{filteredRequests.length}</strong> matching request{filteredRequests.length === 1 ? "" : "s"}</div>
          <div className="accepted-filters">
            <label className="accepted-filter">
              <FaSearch />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, phone, route..." />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">All ({statusCounts.ALL})</option>
              <option value="NEW">New ({statusCounts.NEW})</option>
              <option value="PENDING">Pending ({statusCounts.PENDING})</option>
              <option value="ACCEPTED">Accepted ({statusCounts.ACCEPTED})</option>
              <option value="ASSIGNED">Assigned ({statusCounts.ASSIGNED})</option>
              <option value="COMPLETED">Completed ({statusCounts.COMPLETED})</option>
              <option value="EXPIRED">Expired ({statusCounts.EXPIRED})</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="requests-empty"><FaSyncAlt className="requests-empty__icon requests-empty__icon--spin" /><h2>Loading requests</h2><p>Getting your accepted requests.</p></div>
        ) : filteredRequests.length === 0 ? (
          <div className="requests-empty"><FaCheckCircle className="requests-empty__icon" /><h2>No accepted requests</h2><p>Requests you accept from the active queue will appear here.</p></div>
        ) : (
          <div className="request-table-wrap">
            <table className="request-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Route</th>
                  <th>Journey date</th>
                  <th>Time</th>
                  <th>Seats</th>
                  <th>Bus type</th>
                  <th>Price</th>
                  <th>Customer name</th>
                  <th>Phone number</th>
                  <th>Created at</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((item) => (
                  <tr key={item.id} className={getRowClass(item.status)}>
                    <td data-label="Request ID"><span className="request-id">{item.request_id || `#${item.id}`}</span></td>
                    <td data-label="Route"><strong className="route-cell">{item.from_location}<span>&rarr;</span>{item.to_location}</strong></td>
                    <td data-label="Journey date">{formatDate(item.journey_date)}</td>
                    <td data-label="Time">{item.journey_time || "\u2014"}</td>
                    <td data-label="Seats">{item.total_tickets}</td>
                    <td data-label="Bus type"><span className="type-pill">{item.bus_type?.replaceAll("_", " ") || "\u2014"}</span></td>
                    <td data-label="Price"><strong>&#8377;{item.expected_price}</strong></td>
                    <td data-label="Customer name">
                      {item.contact_unlocked ? (
                        <span className="customer-unlocked"><FaUser /> {item.name || "\u2014"}</span>
                      ) : (
                        <span className="customer-locked">Locked</span>
                      )}
                    </td>
                    <td data-label="Phone number">
                      {item.contact_unlocked ? (
                        <span className="customer-unlocked"><FaPhone /> {item.phone_number || "\u2014"}</span>
                      ) : (
                        <span className="customer-locked">Locked</span>
                      )}
                    </td>
                    <td data-label="Created at"><span className="time-cell">{formatDateTime(item.created_at)}</span></td>
                    <td data-label="Status">
                      <div className="status-stack">
                        <span className={`status-pill ${getStatusPillClass(item.status)}`}>{getStatusLabel(item.status)}</span>
                        {item.status === "EXPIRED" && <span className="expired-badge">Request expired</span>}
                        {item.status === "ACCEPTED" && <span className="accepted-label"><FaCheck /> Booking confirmed</span>}
                        {item.status === "COMPLETED" && <span className="accepted-label"><FaCheckCircle /> Trip completed</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
export default AcceptedRequests;
