import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaWallet, FaUser, FaBus } from "react-icons/fa";
import API from "../../api/axios";
import Footer from "../../components/Footer";
import "../../styles/Admin.css";
import logoImage from "../../assets/logoc.png";

const SECTIONS = ["Dashboard", "Users", "Requests", "History", "Approvals", "Settings"];

const Empty = ({ label }) => (
  <div className="empty-card">
    <h3>No {label} yet</h3>
    <p>This section is connected to live backend data and will populate when records are created.</p>
  </div>
);

const PanelSkeleton = () => (
  <div className="panel-skeleton">
    <div className="skeleton-line short" />
    <div className="skeleton-line medium" />
    <div className="skeleton-line tall" />
    <div className="skeleton-line full" />
    <div className="skeleton-line medium" />
    <div className="skeleton-line full" />
    <div className="skeleton-line short" />
  </div>
);

const StatusPill = ({ status }) => (
  <span className={`status-pill ${status || ""}`}>{status || "—"}</span>
);

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── Operator Detail Panel ──────────────────────────────────────────── */
function OperatorPanel({ user, data, loading, error }) {
  if (loading) return <PanelSkeleton />;
  if (error) return <p className="panel-error">{error}</p>;

  const wallet = data?.wallet;
  const transactions = data?.transactions || [];

  return (
    <>
      <div className="panel-info-grid">
        {[
          { label: "Company", value: user.company_name || "—" },
          { label: "Contact Name", value: user.name || "—" },
          { label: "Phone", value: user.mobile || "—" },
          { label: "Email", value: user.email || "—" },
          { label: "Status", value: <StatusPill status={user.status} /> },
          { label: "ID", value: user.id },
        ].map(({ label, value }) => (
          <div className="panel-info-item" key={label}>
            <span className="panel-info-label">{label}</span>
            <span className="panel-info-value">{value}</span>
          </div>
        ))}
      </div>

      {wallet && (
        <div className="panel-wallet-card">
          <div>
            <div className="panel-wallet-label">Points Balance</div>
            <div className="panel-wallet-balance">{wallet.current_balance ?? 0}</div>
            <div className="panel-wallet-unit">points available</div>
          </div>
          <FaWallet className="panel-wallet-icon" />
        </div>
      )}

      <div className="panel-section-label">Request History</div>
      {transactions.length ? (
        <div style={{ overflowX: "auto" }}>
          <table className="panel-mini-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Credits</th>
                <th>Balance After</th>
                <th>Description</th>
                <th>Date</th>
                <th>Customer</th>
                <th>From</th>
                <th>To</th>
                <th>Journey Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i}>
                  <td>
                    <span className={tx.transaction_type === "CREDIT" ? "tx-credit" : "tx-debit"}>
                      {tx.transaction_type === "CREDIT" ? "+" : "−"}{tx.credits}
                    </span>
                  </td>
                  <td>{tx.credits}</td>
                  <td>{tx.balance_after_transaction}</td>
                  <td>{tx.description || "—"}</td>
                  <td>{formatDate(tx.created_at)}</td>
                  <td>{tx.customer_name || "—"}</td>
                  <td>{tx.customer_from || "—"}</td>
                  <td>{tx.customer_to || "—"}</td>
                  <td>{formatDate(tx.request_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="panel-empty">No transactions yet.</p>
      )}
    </>
  );
}

/* ── Customer Detail Panel ──────────────────────────────────────────── */
function CustomerPanel({ user, data, loading, error }) {
  if (loading) return <PanelSkeleton />;
  if (error) return <p className="panel-error">{error}</p>;

  const requests = data || [];

  return (
    <>
      <div className="panel-info-grid">
        {[
          { label: "Name", value: user.name || "—" },
          { label: "Phone", value: user.mobile || "—" },
          { label: "Total Requests", value: requests.length },
        ].map(({ label, value }) => (
          <div className="panel-info-item" key={label}>
            <span className="panel-info-label">{label}</span>
            <span className="panel-info-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="panel-section-label">Request History</div>
      {requests.length ? (
        <div style={{ overflowX: "auto" }}>
          <table className="panel-mini-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Date</th>
                <th>Tickets</th>
                <th>Status</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.from_location} → {req.to_location}</td>
                  <td>{formatDate(req.journey_date)}</td>
                  <td>{req.total_tickets}</td>
                  <td><StatusPill status={req.status} /></td>
                  <td>{req.assigned_operator_name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="panel-empty">No requests found for this customer.</p>
      )}
    </>
  );
}

/* ── Main Admin Component ───────────────────────────────────────────── */
function Admin() {
  const navigate = useNavigate();
  const [section, setSection] = useState("Dashboard");
  const [data, setData] = useState({ operators: [], customers: [], approvals: [], requests: [], wallets: [], history: [], pointRequests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("operators");
  const [walletOperators, setWalletOperators] = useState([]);
  const [creditForm, setCreditForm] = useState({ operator_id: "", credits: "", description: "Admin Request credit" });
  const [crediting, setCrediting] = useState(false);
  const [pointRequestAction, setPointRequestAction] = useState({});
<<<<<<< HEAD
  const [historySearch, setHistorySearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
=======
  const [historyTab, setHistoryTab] = useState("Point Requests");
  const [operatorSearch, setOperatorSearch] = useState("");
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
  const [activeOperatorIndex, setActiveOperatorIndex] = useState(-1);
  const operatorDropdownTimer = useRef(null);
  const operatorInputRef = useRef(null);
>>>>>>> 332fab01927346c87f0b547ac4c9f0dce9bbf7af

  // Detail panel state
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const closePanel = useCallback(() => {
    setSelectedUser(null);
    setDetailsData(null);
    setDetailsError("");
  }, []);

  const getOperatorSuggestions = useCallback(() => {
    const query = operatorSearch.trim().toLowerCase();
    if (!query) return walletOperators;
    return walletOperators.filter((op) =>
      `${op.company_name} ${op.name} ${op.phone_number}`.toLowerCase().includes(query)
    );
  }, [operatorSearch, walletOperators]);

  const selectOperator = useCallback((op) => {
    setCreditForm((prev) => ({ ...prev, operator_id: String(op.id) }));
    setOperatorSearch("");
    setShowOperatorDropdown(false);
    setActiveOperatorIndex(-1);
  }, []);

  const handleOperatorKeyDown = useCallback((e) => {
    const suggestions = getOperatorSuggestions();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowOperatorDropdown(true);
      setActiveOperatorIndex((cur) => Math.min(cur + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveOperatorIndex((cur) => Math.max(cur - 1, 0));
    } else if (e.key === "Enter" && activeOperatorIndex >= 0 && activeOperatorIndex < suggestions.length) {
      e.preventDefault();
      selectOperator(suggestions[activeOperatorIndex]);
    } else if (e.key === "Escape") {
      setShowOperatorDropdown(false);
      setActiveOperatorIndex(-1);
    }
  }, [getOperatorSuggestions, activeOperatorIndex, selectOperator]);

  const selectUser = useCallback(async (user) => {
    setSelectedUser(user);
    setDetailsData(null);
    setDetailsError("");
    setDetailsLoading(true);
    try {
      if (user.role === "Operator") {
        const res = await API.get(`auth/admin/operators/${user.id}/transactions/`);
        setDetailsData(res.data);
      } else {
        const res = await API.get(`customer/admin/customers/${user.mobile}/requests/`);
        setDetailsData(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Unable to load details.";
      setDetailsError(msg);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const [operatorsResponse, approvalsResponse, customersResponse, historyResponse] = await Promise.all([
=======
      const [operatorsResponse, approvalsResponse, customersResponse, historyResponse, pointRequestsResponse] = await Promise.all([
>>>>>>> 332fab01927346c87f0b547ac4c9f0dce9bbf7af
        API.get("operators/"),
        API.get("auth/admin/operators/pending/"),
        API.get("customer/admin/customers/").catch(() => ({ data: [] })),
        API.get("auth/admin/transactions/").catch(() => ({ data: [] })),
<<<<<<< HEAD
=======
        API.get("auth/admin/point-requests/").catch(() => ({ data: [] })),
>>>>>>> 332fab01927346c87f0b547ac4c9f0dce9bbf7af
      ]);
      const operators = (operatorsResponse.data || []).map((op) => ({
        ...op,
        mobile: op.phone_number,
        status: op.approval_status,
        role: "Operator",
      }));
      const approvals = (approvalsResponse.data || []).map((op) => ({ ...op, mobile: op.phone_number }));
      const customers = customersResponse.data || [];
      const history = historyResponse.data || [];
<<<<<<< HEAD
      setData({ operators, customers, approvals, requests: [], wallets: [], history, pointRequests: [] });
=======
      const pointRequests = pointRequestsResponse.data || [];
      setData({ operators, customers, approvals, requests: [], wallets: [], history, pointRequests });
>>>>>>> 332fab01927346c87f0b547ac4c9f0dce9bbf7af
      setError("");
    } catch (err) {
      const statusCode = err.response?.status;
      if (statusCode === 401 || statusCode === 403) {
        localStorage.clear();
        navigate("/operator-login");
        return;
      }
      setError(err.response?.data?.detail || "Unable to load the admin dashboard.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    API.get("operators/")
      .then((res) => setWalletOperators(res.data || []))
      .catch((err) => {
        const statusCode = err?.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          localStorage.clear();
          navigate("/operator-login");
        }
      });
  }, [navigate]);

  const approve = async (id, action) => {
    try { await API.post(`auth/admin/operators/${id}/${action}/`); await load(); }
    catch (err) { setError(err.response?.data?.detail || `Unable to ${action} this operator.`); }
  };

  const logout = () => { localStorage.clear(); navigate("/operator-login"); };

  const addCredit = async (event) => {
    event.preventDefault();
    if (!creditForm.operator_id || !creditForm.credits) { setError("Select an operator and enter wallet points."); return; }
    setCrediting(true);
    try {
      await API.post("auth/wallet/add-credit/", {
        operator_ids: [Number(creditForm.operator_id)],
        credits: Number(creditForm.credits),
        description: creditForm.description,
      });
      setCreditForm({ operator_id: "", credits: "", description: "Admin wallet credit" });
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.credits?.[0] || "Unable to add wallet points.");
    } finally {
      setCrediting(false);
    }
  };

  const actOnPointRequest = async (requestId, action) => {
    const response = pointRequestAction[requestId] || "";
    try {
      await API.post(`auth/admin/point-requests/${requestId}/${action}/`, { admin_response: response });
      setPointRequestAction((prev) => { const next = { ...prev }; delete next[requestId]; return next; });
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || `Unable to ${action} this request.`);
    }
  };

  const users = userType === "operators" ? data.operators
    : userType === "customers" ? data.customers
      : [...data.operators, ...data.customers];

  const shownUsers = useMemo(
    () => users.filter((item) => `${item.id} ${item.name} ${item.email} ${item.mobile}`.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  );

  const requestCounts = data.requests.reduce((all, item) => ({ ...all, [item.status]: (all[item.status] || 0) + 1 }), {});

  const renderTable = (rows, columns, onRowClick) =>
    rows.length ? (
      <div className="table-wrapper">
        <table className="admin-table">
          <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`${onRowClick ? "clickable-row" : ""} ${selectedUser?.id === row.id ? "selected-row" : ""}`}
              >
                {columns.map((c) => (
                  <td key={c.label}>{c.render ? c.render(row) : row[c.key] || "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : <Empty label="records" />;

  return (
    <div className="admin-page">
      <div className="admin-components-header">
        <div className="header-left">
          <img src={logoImage} alt="Tick My Bus" className="header-logo" />
          <span className="header-brand" />
        </div>
        <nav className="header-nav">
          {SECTIONS.map((label) => (
            <button
              key={label}
              type="button"
              className={`component-chip ${section === label ? "active" : ""}`}
              onClick={() => { setSection(label); closePanel(); }}
            >
              {label}
            </button>
          ))}
        </nav>
        <button type="button" className="logout-btn" onClick={logout}><FaSignOutAlt /> Logout</button>
      </div>

      <div className="admin-layout">
        <main className="admin-main">
          {error && <p className="status-error">{error}</p>}

          {/* ── Dashboard ── */}
          {section === "Dashboard" && (
            <>
              <section className="dashboard-overview">
                <article className="overview-card"><p>Operators</p><h3>{data.operators.length}</h3></article>
                <article className="overview-card"><p>Customers</p><h3>{data.customers.length}</h3></article>
                <article className="overview-card"><p>Pending approvals</p><h3>{data.approvals.length}</h3></article>
                <article className="overview-card"><p>Active requests</p><h3>{(requestCounts.PENDING || 0) + (requestCounts.ACCEPTED || 0)}</h3></article>
              </section>
              <section className="admin-section">
                <div className="section-header">
                  <div>
                    <span className="section-title">Ticket requests</span>
                    <p className="section-subtitle">Live request and assignment status. Admins cannot accept requests.</p>
                  </div>
                </div>
                {renderTable(data.requests, [
                  { label: "Request", key: "id" },
                  { label: "Customer", key: "customer" },
                  { label: "Route", key: "route" },
                  { label: "Status", render: (r) => <span className="badge badge-active">{r.status}</span> },
                  { label: "Operator", key: "operator" },
                ])}
              </section>
            </>
          )}

          {/* ── Users ── */}
          {section === "Users" && (
            <section className="admin-section">
              <div className="section-header">
                <div>
                  <span className="section-title">Users</span>
                  <p className="section-subtitle">Click any row to view details. Customers are derived from submitted requests.</p>
                </div>
                <div className="tab-group">
                  {["operators", "customers", "all"].map((tab) => (
                    <button
                      key={tab}
                      className={userType === tab ? "tab active" : "tab"}
                      onClick={() => { setUserType(tab); closePanel(); }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <label>
                Search users
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, ID, email or phone" />
              </label>

              <div className={`users-layout ${selectedUser ? "panel-open" : ""}`}>
                {/* Table */}
                <div>
                  {renderTable(
                    shownUsers,
                    [
                      { label: "Name", key: "name" },
                      { label: "ID", key: "id" },
                      { label: "Email", key: "email" },
                      { label: "Mobile", key: "mobile" },
                      { label: "Status", render: (r) => <StatusPill status={r.status} /> },
                      { label: "Role", key: "role" },
                    ],
                    selectUser,
                  )}
                </div>

                {/* Detail Panel */}
                {selectedUser && (
                  <div className="user-detail-panel">
                    <div className="panel-header">
                      <div className="panel-header-info">
                        <span className={`panel-role-badge ${selectedUser.role?.toLowerCase()}`}>
                          {selectedUser.role === "Operator" ? <FaBus /> : <FaUser />}
                          {selectedUser.role}
                        </span>
                        <span className="panel-name">{selectedUser.name || selectedUser.company_name || "—"}</span>
                        <span className="panel-sub">
                          {selectedUser.role === "Operator"
                            ? selectedUser.company_name
                            : selectedUser.mobile}
                        </span>
                      </div>
                      <button className="panel-close-btn" onClick={closePanel} aria-label="Close panel">✕</button>
                    </div>

                    <div className="panel-body">
                      {selectedUser.role === "Operator" ? (
                        <OperatorPanel
                          user={selectedUser}
                          data={detailsData}
                          loading={detailsLoading}
                          error={detailsError}
                        />
                      ) : (
                        <CustomerPanel
                          user={selectedUser}
                          data={detailsData}
                          loading={detailsLoading}
                          error={detailsError}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── History ── */}  
          {section === "History" && (
            <section className="admin-section">
              <div className="section-header">
                <div>
                  <span className="section-title">History</span>
                  <p className="section-subtitle">Operator point requests and transaction history.</p>
                </div>
                <div className="tab-group">
                  {["Point Requests", "Transactions"].map((tab) => (
                    <button
                      key={tab}
                      className={`tab ${historyTab === tab ? "active" : ""}`}
                      onClick={() => setHistoryTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
<<<<<<< HEAD
              {data.history.length > 0 && (
                <div style={{ position: "relative", marginBottom: "1rem", maxWidth: "400px", width: "100%" }}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by company name..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    onFocus={() => historySearch.length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    style={{ padding: "0.5rem 1rem", width: "100%", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
                  />
                  {showSuggestions && historySearch.length >= 2 && (() => {
                    const matches = [...new Set(data.history.map((item) => item.operator_company).filter(Boolean))]
                      .filter((name) => name.toLowerCase().includes(historySearch.toLowerCase()));
                    return matches.length > 0 ? (
                      <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #ccc", borderTop: "none", borderRadius: "0 0 6px 6px", listStyle: "none", margin: 0, padding: 0, maxHeight: "160px", overflowY: "auto", zIndex: 10, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                        {matches.map((name) => (
                          <li
                            key={name}
                            onMouseDown={() => { setHistorySearch(name); setShowSuggestions(false); }}
                            style={{ padding: "0.5rem 1rem", cursor: "pointer", borderBottom: "1px solid #eee" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}
                </div>
=======

              {historyTab === "Point Requests" && (
                (data.pointRequests && data.pointRequests.length) ? (
                  <div className="history-list">
                    {data.pointRequests.map((req) => (
                      <article key={req.id} className={`history-card ${req.status.toLowerCase()}`}>
                        <div className="history-card-main">
                          <div className="history-card-top">
                            <span className="history-operator">{req.company_name || "—"}</span>
                            <span className={`history-points ${req.status === "APPROVED" ? "approved" : req.status === "REJECTED" ? "rejected" : ""}`}>
                              {req.points_requested} pts
                            </span>
                          </div>
                          <p className="history-reason">{req.reason || "No reason provided"}</p>
                          <div className="history-meta">
                            <span className={`history-status-pill ${req.status.toLowerCase()}`}>{req.status}</span>
                            <span className="history-date">{formatDate(req.created_at)}</span>
                            {req.admin_response && <span className="history-admin-note">Admin: {req.admin_response}</span>}
                          </div>
                        </div>
                        {req.status === "PENDING" && (
                          <div className="history-card-actions">
                            <input
                              type="text"
                              className="history-response-input"
                              placeholder="Response (optional)"
                              value={pointRequestAction[req.id] || ""}
                              onChange={(e) => setPointRequestAction({ ...pointRequestAction, [req.id]: e.target.value })}
                            />
                            <div className="history-btn-group">
                              <button className="action-btn success" onClick={() => actOnPointRequest(req.id, "approve")}>Approve</button>
                              <button className="action-btn secondary" onClick={() => actOnPointRequest(req.id, "reject")}>Reject</button>
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <Empty label="point requests" />
                )
              )}

              {historyTab === "Transactions" && (
                (data.history && data.history.length) ? (
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Operator</th>
                          <th>Company</th>
                          <th>Points</th>
                          <th>Date</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.history.map((item) => (
                          <tr key={item.id}>
                            <td>{item.operator_name || "—"}</td>
                            <td>{item.operator_company || "—"}</td>
                            <td>{item.credits}</td>
                            <td>{formatDate(item.created_at)}</td>
                            <td>{item.description || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty label="transaction history" />
                )
>>>>>>> 332fab01927346c87f0b547ac4c9f0dce9bbf7af
              )}
              {(() => {
                const filtered = data.history.filter((item) =>
                  (item.operator_company || "").toLowerCase().includes(historySearch.toLowerCase())
                );
                return filtered.length ? (
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Operator ID</th>
                          <th>Name</th>
                          <th>Company</th>
                          <th>Email</th>
                          <th>Points</th>
                          <th>Date</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((item) => (
                          <tr key={item.id}>
                            <td>{item.operator_id || "—"}</td>
                            <td>{item.operator_name || "—"}</td>
                            <td>{item.operator_company || "—"}</td>
                            <td>{item.operator_email || "—"}</td>
                            <td>{item.credits}</td>
                            <td>{formatDate(item.created_at)}</td>
                            <td>{item.description || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty label="transactions" />
                );
              })()}
            </section>
          )}
          {section === "Approvals" && (
            <section className="admin-section">
              <div className="section-header">
                <div>
                  <span className="section-title">Pending operator approvals</span>
                  <p className="section-subtitle">Approve or reject registrations in real time.</p>
                </div>
              </div>
              {data.approvals.length ? (
                <div className="approval-list">
                  {data.approvals.map((item) => (
                    <article key={item.id} className="approval-card">
                      <div>
                        <p className="approval-name">{item.name}</p>
                        <p className="approval-meta">{item.company_name} · {item.email} · {item.mobile}</p>
                      </div>
                      <div className="approval-actions">
                        <button className="action-btn success" onClick={() => approve(item.id, "approve")}>Approve</button>
                        <button className="action-btn secondary" onClick={() => approve(item.id, "reject")}>Reject</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <Empty label="pending approvals" />}
            </section>
          )}

          {/* ── Requests (wallet credit) ── */}
          {section === "Requests" && (
            <section className="admin-section">
              <div className="section-header">
                <div>
                  <span className="section-title">Operator Request points</span>
                  <p className="section-subtitle">Only administrators can add points. Operators spend one point when accepting a request.</p>
                </div>
              </div>
              <form className="wallet-credit-form" onSubmit={addCredit}>
                <label className="operator-autocomplete-label">
                  Operator
                  <div className="operator-autocomplete">
                    <input
                      ref={operatorInputRef}
                      type="text"
                      value={operatorSearch || (creditForm.operator_id ? walletOperators.find((op) => String(op.id) === creditForm.operator_id)
                        ? `${walletOperators.find((op) => String(op.id) === creditForm.operator_id).company_name} — ${walletOperators.find((op) => String(op.id) === creditForm.operator_id).name}`
                        : "" : "")}
                      onChange={(e) => {
                        setOperatorSearch(e.target.value);
                        setShowOperatorDropdown(true);
                        setActiveOperatorIndex(-1);
                        if (creditForm.operator_id) setCreditForm((prev) => ({ ...prev, operator_id: "" }));
                      }}
                      onFocus={() => {
                        clearTimeout(operatorDropdownTimer.current);
                        setShowOperatorDropdown(true);
                        setActiveOperatorIndex(-1);
                      }}
                      onBlur={() => {
                        operatorDropdownTimer.current = setTimeout(() => setShowOperatorDropdown(false), 180);
                      }}
                      onKeyDown={handleOperatorKeyDown}
                      placeholder="Type to search operators..."
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={showOperatorDropdown}
                      autoComplete="off"
                    />
                    {creditForm.operator_id && !operatorSearch && (
                      <button
                        type="button"
                        className="operator-clear-btn"
                        onClick={() => {
                          setCreditForm((prev) => ({ ...prev, operator_id: "" }));
                          setOperatorSearch("");
                          operatorInputRef.current?.focus();
                        }}
                      >
                        ✕
                      </button>
                    )}
                    {showOperatorDropdown && getOperatorSuggestions().length > 0 && (
                      <ul className="operator-dropdown" role="listbox">
                        {getOperatorSuggestions().map((op, index) => (
                          <li
                            key={op.id}
                            className={`operator-option ${index === activeOperatorIndex ? "is-active" : ""} ${String(op.id) === creditForm.operator_id ? "is-selected" : ""}`}
                            role="option"
                            aria-selected={String(op.id) === creditForm.operator_id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectOperator(op)}
                          >
                            <span className="operator-option-name">{op.company_name}</span>
                            <span className="operator-option-detail">{op.name} — {op.phone_number}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {showOperatorDropdown && operatorSearch && getOperatorSuggestions().length === 0 && (
                      <div className="operator-dropdown operator-dropdown-empty" role="status">
                        No matching operators
                      </div>
                    )}
                  </div>
                </label>
                <label>
                  Points
                  <input type="number" min="1" value={creditForm.credits} onChange={(e) => setCreditForm({ ...creditForm, credits: e.target.value })} />
                </label>
                <label>
                  Description
                  <input value={creditForm.description} onChange={(e) => setCreditForm({ ...creditForm, description: e.target.value })} />
                </label>
                <button className="action-btn success" disabled={crediting}>{crediting ? "Adding..." : "Add points"}</button>
              </form>
            </section>
          )}

          {/* ── Settings ── */}
          {section === "Settings" && (
            <section className="admin-section">
              <span className="section-title">Settings</span>
              <p className="section-subtitle">Admin account and notification settings will be stored server-side when those preferences are added.</p>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Admin;
