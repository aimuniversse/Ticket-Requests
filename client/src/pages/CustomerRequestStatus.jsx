import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import API from "../api/axios";
import "../styles/CustomerRequestStatus.css";

const REQUEST_STORAGE_KEY = "latestTicketRequest";

const readStoredRequest = (token) => {
  if (!token) return null;

  try {
    const rawValue = localStorage.getItem(REQUEST_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    const identifier = parsed?.request_id || parsed?.id || parsed?.public_token;
    return identifier && String(identifier) === String(token) ? parsed : null;
  } catch {
    return null;
  }
};

export default function CustomerRequestStatus() {
  const { token } = useParams();
  const location = useLocation();
  const [request, setRequest] = useState(() => location.state?.request || readStoredRequest(token));
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialRequest = location.state?.request || readStoredRequest(token);
    if (initialRequest) {
      const hasExpired = initialRequest.expires_at && new Date(initialRequest.expires_at) <= new Date();
      setRequest({
        ...initialRequest,
        id: initialRequest.id ?? initialRequest.request_id,
        request_id: initialRequest.request_id || initialRequest.id,
        status: hasExpired ? "EXPIRED" : initialRequest.status || "PENDING",
      });
      setError("");
      if (initialRequest.id || initialRequest.request_id) {
        void refreshRequest(initialRequest.id ?? initialRequest.request_id);
      }
      return;
    }

    if (token) {
      void refreshRequest(token);
      return;
    }

    setError("We could not find this ticket request.");
  }, [token, location.state?.request]);

  const refreshRequest = async (requestId) => {
    if (!requestId) return;
    try {
      setLoading(true);
      const response = await API.get(`customer/requests/${requestId}/`, { skipAuth: true });
      const liveRequest = response?.data || {};
      const hasExpired = liveRequest.expires_at && new Date(liveRequest.expires_at) <= new Date();
      setRequest({
        ...liveRequest,
        id: liveRequest.id ?? liveRequest.request_id,
        request_id: liveRequest.request_id || liveRequest.id,
        status: hasExpired ? "EXPIRED" : liveRequest.status || "PENDING",
      });
      setError("");
    } catch {
      setError("We could not refresh the latest ticket request status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    const requestId = request?.id || request?.request_id;
    if (!requestId) return;

    const terminalStatuses = ["ACCEPTED", "EXPIRED", "COMPLETED", "CANCELLED"];
    if (terminalStatuses.includes(request?.status)) return;

    const poller = window.setInterval(() => {
      refreshRequest(requestId);
    }, 5000);
    return () => window.clearInterval(poller);
  }, [request?.id, request?.request_id, request?.status]);

  const remaining = useMemo(() => {
    const activeStatuses = ["PENDING", "NEW", "ASSIGNED"];
    if (!request?.expires_at || !activeStatuses.includes(request.status)) return null;

    const seconds = Math.max(0, Math.ceil((new Date(request.expires_at).getTime() - now) / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }, [request, now]);

  const title = request?.status === "ACCEPTED"
    ? "An operator has accepted your request"
    : request?.status === "EXPIRED"
      ? "Your request expired"
      : "Finding an operator";

  const statusCopy = request?.status === "PENDING" || request?.status === "NEW" || request?.status === "ASSIGNED"
    ? "Your request is visible to available operators. This page updates automatically."
    : request?.status === "EXPIRED"
      ? "No operator accepted in five minutes. You can send a fresh request whenever you are ready."
      : "Your operator will continue with the booking process.";

  return (
    <main className="request-status-page">
      <section className="request-status-card">
        <p className="status-eyebrow">LIVE REQUEST STATUS</p>
        <h1>{title}</h1>
        {error ? (
          <p className="status-error">{error}</p>
        ) : (
          <>
            <p className="status-copy">{statusCopy}</p>
            {loading && <p className="status-copy">Refreshing the latest status…</p>}
            {remaining && <div className="countdown" aria-live="polite">{remaining}</div>}
            <p className="request-reference">Reference: {request?.request_id || request?.id}</p>
          </>
        )}
        {(error || request?.status === "EXPIRED") && (
          <Link className="new-request-link" to="/ticket-request">Create a new request</Link>
        )}
      </section>
    </main>
  );
}
