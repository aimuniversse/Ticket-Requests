import { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaSearch, FaSyncAlt, FaUser } from "react-icons/fa";
import API from "../../api/axios";
import "../../styles/AcceptedRequests.css";
import "../../styles/ActiveRequests.css";

const formatDate = (date) => date ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`)) : "—";
const labelStatus = (status) => status ? `${status[0]}${status.slice(1).toLowerCase()}` : "Accepted";

const AcceptedRequests = () => {
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

  const filteredRequests = useMemo(() => {
    const search = query.trim().toLowerCase();
    return requests.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      if (!search) return matchesStatus;

      const haystack = [item.request_id, item.from_location, item.to_location, item.name, item.phone_number, item.bus_type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && haystack.includes(search);
    });
  }, [requests, query, statusFilter]);

  return <section className="requests-page accepted-requests-page">
    <header className="requests-page__header">
      <div>
        <p className="requests-page__eyebrow">Your confirmed queue</p>
        <h1>Accepted requests</h1>
        <p>Track every request you have accepted and its booking progress.</p>
      </div>
      <button type="button" className="table-action table-action--secondary" onClick={() => loadRequests(true)}><FaSyncAlt /> Refresh</button>
    </header>
    {error && <p className="requests-notice requests-notice--error">{error}</p>}
    <div className="request-table-card">
      <div className="request-table-card__bar">
        <div><strong>{filteredRequests.length}</strong> matching request{filteredRequests.length === 1 ? "" : "s"}</div>
        <div className="accepted-filters">
          <label className="accepted-filter">
            <FaSearch />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search requests" />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">All</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>
      {loading ? <div className="requests-empty"><FaSyncAlt className="requests-empty__icon requests-empty__icon--spin" /><h2>Loading requests</h2><p>Getting your accepted requests.</p></div> : filteredRequests.length === 0 ? <div className="requests-empty"><FaCheckCircle className="requests-empty__icon" /><h2>No accepted requests</h2><p>Requests you accept from the active queue will appear here.</p></div> : <div className="request-table-wrap"><table className="request-table"><thead><tr><th>Request ID</th><th>Route</th><th>Journey date</th><th>Seats</th><th>Bus type</th><th>Requested price</th><th>Customer details</th><th>Status</th></tr></thead><tbody>{filteredRequests.map((item) => <tr key={item.id}><td data-label="Request ID"><span className="request-id">{item.request_id || `#${item.id}`}</span></td><td data-label="Route"><strong className="route-cell">{item.from_location}<span>→</span>{item.to_location}</strong></td><td data-label="Journey date">{formatDate(item.journey_date)}</td><td data-label="Seats">{item.total_tickets}</td><td data-label="Bus type"><span className="type-pill">{item.bus_type?.replaceAll("_", " ") || "—"}</span></td><td data-label="Requested price"><strong>₹{item.expected_price}</strong></td><td data-label="Customer details">{item.contact_unlocked ? <span className="customer-unlocked"><FaUser /> {item.name || item.phone_number || "Available"}</span> : <span className="customer-locked">Locked</span>}</td><td data-label="Status"><span className="status-pill status-pill--accepted">{labelStatus(item.status)}</span></td></tr>)}</tbody></table></div>}
    </div>
  </section>;
};
export default AcceptedRequests;
