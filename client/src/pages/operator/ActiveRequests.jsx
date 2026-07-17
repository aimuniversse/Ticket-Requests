import { useEffect, useState } from "react";
import { FaCheck, FaClock, FaFilter, FaSyncAlt } from "react-icons/fa";
import API from "../../api/axios";
import "../../styles/ActiveRequests.css";

const formatDate = (date) => date ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`)) : "—";
const formatTimeLeft = (expiresAt) => {
  if (!expiresAt) return "Available now";
  const minutes = Math.max(0, Math.ceil((new Date(expiresAt) - Date.now()) / 60000));
  return minutes ? `${minutes} min left` : "Closing now";
};

const ActiveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const loadRequests = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try { const response = await API.get("customer/"); setRequests(response.data || []); setError(""); }
    catch { setError("Unable to load active requests."); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadRequests(true); const timer = window.setInterval(loadRequests, 10000); return () => window.clearInterval(timer); }, []);
  const handleAccept = async (item) => {
    setAcceptingId(item.id);
    try { await API.post(`customer/leads/${item.id}/accept/`); await loadRequests(); }
    catch (err) { setError(err.response?.data?.detail || "This request is no longer available."); await loadRequests(); }
    finally { setAcceptingId(null); }
  };
  return <section className="requests-page">
    <header className="requests-page__header"><div><p className="requests-page__eyebrow">Live request queue</p><h1>Active requests</h1><p>Review customer price requests and accept the ones you can serve.</p></div><div className="requests-page__tools"><span className="live-indicator"><i /> Auto-refreshing</span><button type="button" className="table-action table-action--secondary" onClick={() => loadRequests(true)}><FaSyncAlt /> Refresh</button></div></header>
    {error && <p className="requests-notice requests-notice--error">{error}</p>}
    <div className="request-table-card"><div className="request-table-card__bar"><div><strong>{requests.length}</strong> open request{requests.length === 1 ? "" : "s"}</div><span><FaFilter /> Latest first</span></div>
      {loading ? <div className="requests-empty"><FaSyncAlt className="requests-empty__icon requests-empty__icon--spin" /><h2>Loading requests</h2><p>Getting the latest available requests for you.</p></div> : requests.length === 0 ? <div className="requests-empty"><FaClock className="requests-empty__icon" /><h2>No active requests</h2><p>New customer requests will appear here automatically.</p></div> : <div className="request-table-wrap"><table className="request-table"><thead><tr><th>Request ID</th><th>Route</th><th>Journey date</th><th>Seats</th><th>Bus type</th><th>Requested price</th><th>Remaining time</th><th>Status</th><th>Action</th></tr></thead><tbody>{requests.map((item) => <tr key={item.id}><td data-label="Request ID"><span className="request-id">{item.request_id || `#${item.id}`}</span></td><td data-label="Route"><strong className="route-cell">{item.from_location}<span>→</span>{item.to_location}</strong></td><td data-label="Journey date">{formatDate(item.journey_date)}</td><td data-label="Seats">{item.total_tickets}</td><td data-label="Bus type"><span className="type-pill">{item.bus_type?.replaceAll("_", " ") || "—"}</span></td><td data-label="Requested price"><strong>₹{item.expected_price}</strong></td><td data-label="Remaining time"><span className="time-cell"><FaClock /> {formatTimeLeft(item.expires_at)}</span></td><td data-label="Status"><span className="status-pill status-pill--pending">Pending</span></td><td data-label="Action"><button className="table-action table-action--accept" disabled={acceptingId === item.id} onClick={() => handleAccept(item)}><FaCheck /> {acceptingId === item.id ? "Accepting" : "Accept"}</button></td></tr>)}</tbody></table></div>}
    </div>
  </section>;
};
export default ActiveRequests;
