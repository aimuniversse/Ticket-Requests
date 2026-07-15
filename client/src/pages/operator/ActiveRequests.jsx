import { useEffect, useState } from "react";
import { FaBus, FaCheck, FaClock, FaMapMarkerAlt, FaRupeeSign, FaUsers } from "react-icons/fa";
import API from "../../api/axios";
import "../../styles/ActiveRequests.css";

const ActiveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);
  const loadRequests = async () => {
    try {
      const response = await API.get("auth/requests/available/");
      setRequests(response.data || []);
      setError("");
    } catch { setError("Unable to load active requests."); }
  };
  useEffect(() => { loadRequests(); const timer = window.setInterval(loadRequests, 10000); return () => window.clearInterval(timer); }, []);
  const handleAccept = async (item) => {
    setAcceptingId(item.id);
    try { await API.post(`customer/requests/${item.id}/assign/`); await loadRequests(); }
    catch (err) { setError(err.response?.data?.detail || "This request is no longer available."); await loadRequests(); }
    finally { setAcceptingId(null); }
  };
  return <div className="active-page"><div className="page-header"><div><h1>Active Ticket Requests</h1><p>Live requests refresh automatically. Customer contact details remain private.</p></div></div>{error && <p className="status-error">{error}</p>}{requests.length === 0 ? <div className="empty-card"><FaBus className="empty-icon" /><h2>No Active Requests</h2><p>New customer requests will appear here automatically.</p></div> : <div className="request-grid">{requests.map((item) => <div className="request-card" key={item.id}><div className="request-top"><h2>{item.from_location} → {item.to_location}</h2><div className="timer"><FaClock /> Available now</div></div><div className="request-info"><div><FaMapMarkerAlt /><span>Journey</span><strong>{item.journey_date}</strong></div><div><FaUsers /><span>Passengers</span><strong>{item.total_tickets}</strong></div><div><FaBus /><span>Bus Type</span><strong>{item.bus_type}</strong></div><div><FaRupeeSign /><span>Budget</span><strong>₹ {item.expected_price}</strong></div></div><div className="privacy-box">🔒 Customer name and contact details are hidden until booking conditions are met.</div><div className="action-buttons"><button className="accept" disabled={acceptingId === item.id} onClick={() => handleAccept(item)}><FaCheck /> {acceptingId === item.id ? "Accepting..." : "Accept"}</button></div></div>)}</div>}</div>;
};

export default ActiveRequests;
