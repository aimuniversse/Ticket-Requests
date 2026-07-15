import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import "../styles/CustomerRequestStatus.css";

const POLL_INTERVAL = 10000;

export default function CustomerRequestStatus() {
  const { token } = useParams();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let active = true;
    const load = async () => { try { const response = await API.get(`customer/requests/status/${token}/`); if (active) { setRequest(response.data); setError(""); } } catch { if (active) setError("We could not find this ticket request."); } };
    load();
    const poller = window.setInterval(load, POLL_INTERVAL);
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; window.clearInterval(poller); window.clearInterval(ticker); };
  }, [token]);
  const remaining = useMemo(() => {
    if (!request?.expires_at || request.status !== "PENDING") return null;
    const seconds = Math.max(0, Math.ceil((new Date(request.expires_at).getTime() - now) / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }, [request, now]);
  const title = request?.status === "ACCEPTED" ? "An operator has accepted your request" : request?.status === "EXPIRED" ? "Your request expired" : "Finding an operator";
  return <main className="request-status-page"><section className="request-status-card"><p className="status-eyebrow">LIVE REQUEST STATUS</p><h1>{title}</h1>{error ? <p className="status-error">{error}</p> : <><p className="status-copy">{request?.status === "PENDING" ? "Your request is visible to available operators. This page updates automatically." : request?.status === "EXPIRED" ? "No operator accepted in five minutes. You can send a fresh request whenever you are ready." : "Your operator will continue with the booking process."}</p>{remaining && <div className="countdown" aria-live="polite">{remaining}</div>}<p className="request-reference">Reference: {request?.request_id}</p></>}{(error || request?.status === "EXPIRED") && <Link className="new-request-link" to="/ticket-request">Create a new request</Link>}</section></main>;
}
