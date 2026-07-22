import { useEffect, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaHistory, FaPaperPlane, FaWallet } from "react-icons/fa";
import API from "../../api/axios";
import "../../styles/Wallet.css";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pointRequests, setPointRequests] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [reqForm, setReqForm] = useState({ points: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const [walletResponse, historyResponse, prResponse] = await Promise.all([
        API.get("auth/wallet/"),
        API.get("auth/wallet/history/"),
        API.get("auth/point-requests/").catch(() => ({ data: [] })),
      ]);
      setWallet(walletResponse.data);
      setTransactions(historyResponse.data || []);
      setPointRequests(prResponse.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load wallet details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWallet(); }, []);

  const totals = useMemo(() =>
    transactions.reduce((sum, item) => ({
      credit: sum.credit + (item.transaction_type === "CREDIT" ? item.credits : 0),
      debit: sum.debit + (item.transaction_type === "DEBIT" ? item.credits : 0),
    }), { credit: 0, debit: 0 }),
  [transactions]);

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!reqForm.points || Number(reqForm.points) < 1) {
      setError("Enter a valid number of points.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await API.post("auth/point-requests/create/", {
        points_requested: Number(reqForm.points),
        reason: reqForm.reason,
      });
      setReqForm({ points: "", reason: "" });
      setSuccess("Point request submitted successfully. Waiting for admin approval.");
      await loadWallet();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.points_requested?.[0] || "Unable to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (str) => {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <h1>Operator Wallet</h1>
        <p>Wallet points are added by an administrator. One point is used when you accept a ticket request.</p>
      </div>

      {error && <p className="status-error">{error}</p>}
      {success && <p className="status-success">{success}</p>}

      <section className="wallet-summary">
        <div className="wallet-card">
          <FaWallet className="wallet-icon" />
          <span>Available points</span>
          <h2>{loading ? "--" : wallet?.current_balance ?? 0}</h2>
        </div>
        <div className="wallet-card">
          <FaArrowDown className="credit" />
          <span>Total credit</span>
          <h2>{loading ? "--" : totals.credit}</h2>
        </div>
        <div className="wallet-card">
          <FaArrowUp className="debit" />
          <span>Points used</span>
          <h2>{loading ? "--" : totals.debit}</h2>
        </div>
      </section>

      <section className="wallet-request-section">
        <div className="wallet-request-header">
          <FaPaperPlane className="wallet-request-icon" />
          <div>
            <h2>Request points from admin</h2>
            <p>Submit a request and the admin will review it.</p>
          </div>
        </div>
        <form className="wallet-request-form" onSubmit={submitRequest}>
          <label>
            Points
            <input
              type="number"
              min="1"
              placeholder="e.g. 50"
              value={reqForm.points}
              onChange={(e) => setReqForm({ ...reqForm, points: e.target.value })}
              disabled={submitting}
            />
          </label>
          <label>
            Reason
            <input
              type="text"
              placeholder="Why do you need points?"
              value={reqForm.reason}
              onChange={(e) => setReqForm({ ...reqForm, reason: e.target.value })}
              disabled={submitting}
            />
          </label>
          <button className="wallet-request-btn" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Send request"}
          </button>
        </form>
      </section>

      {pointRequests.length > 0 && (
        <section className="wallet-request-history">
          <h2><FaArrowHistory /> My point requests</h2>
          <div className="pr-list">
            {pointRequests.map((req) => (
              <div key={req.id} className={`pr-card ${req.status.toLowerCase()}`}>
                <div className="pr-top">
                  <span className="pr-points">{req.points_requested} pts</span>
                  <span className={`pr-status ${req.status.toLowerCase()}`}>{req.status}</span>
                </div>
                {req.reason && <p className="pr-reason">{req.reason}</p>}
                <div className="pr-meta">
                  <span>{formatDate(req.created_at)}</span>
                  {req.admin_response && <span className="pr-admin-note">Admin: {req.admin_response}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="wallet-actions">
        <button className="history-btn" type="button" onClick={loadWallet}>
          <FaHistory /> Refresh history
        </button>
      </section>

      <section className="wallet-history">
        <h2>Recent transactions</h2>
        {transactions.length === 0 ? (
          <div className="empty-wallet">
            <FaWallet className="empty-icon" />
            <h3>No transactions</h3>
            <p>Credits added by an admin and points used to accept requests will appear here.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Date</th><th>Type</th><th>Points</th><th>Description</th><th>Balance</th></tr>
            </thead>
            <tbody>
              {transactions.map((item, index) => (
                <tr key={`${item.created_at}-${index}`}>
                  <td>{new Date(item.created_at).toLocaleString("en-IN")}</td>
                  <td>{item.transaction_type}</td>
                  <td>{item.credits}</td>
                  <td>{item.description}</td>
                  <td>{item.balance_after_transaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Wallet;
