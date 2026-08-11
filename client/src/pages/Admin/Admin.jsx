import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSignOutAlt, FaWallet, FaUser, FaBus, FaBars, FaHome, FaEnvelope, FaHistory, FaCheckCircle, FaCog, FaPhone } from "react-icons/fa";
import API from "../../api/axios";
import { clearAppCache, clearAuth, scopedKey } from "../../api/auth";
import Footer from "../../components/Footer";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { useCache } from "../../hooks/useCache";
import "../../styles/Admin.css";
import logoImage from "../../assets/logoc.png";

const SECTIONS = ["Dashboard", "Operators", "Customers", "Credit Requests", "Credit History", "Approvals", "Settings"];

const SECTION_ICONS = {
  Dashboard: FaHome,
  Operators: FaBus,
  Customers: FaUser,
  "Credit Requests": FaEnvelope,
  "Credit History": FaHistory,
  Approvals: FaCheckCircle,
  Settings: FaCog,
};

const PAGE_SIZE = 10;
const HISTORY_PAGE_SIZE = 15;

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

function UserCard({ user, isSelected, onClick }) {
  return (
    <article
      className={`user-card ${isSelected ? "user-card--selected" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      <div className="user-card__top">
        <div className="user-card__avatar">
          {user.role === "Operator" ? <FaBus /> : <FaUser />}
        </div>
        <div className="user-card__identity">
          <span className="user-card__name">{user.name || user.company_name || "—"}</span>
          <span className="user-card__role">{user.role}{user.id ? ` #${user.id}` : ""}</span>
        </div>
        <StatusPill status={user.status} />
      </div>
      <div className="user-card__details">
        {user.company_name && user.role === "Operator" && (
          <span className="user-card__detail"><strong>Company:</strong> {user.company_name}</span>
        )}
        {user.accepted_by_company && user.role === "Customer" && user.accepted_by_company !== "Nil" && (
          <span className="user-card__detail"><strong>Accepted By:</strong> {user.accepted_by_company} ({user.accepted_by_phone})</span>
        )}
        {user.accepted_by_company && user.role === "Customer" && user.accepted_by_company === "Nil" && (
          <span className="user-card__detail"><strong>Accepted By:</strong> Nil</span>
        )}
        {user.email && (
          <span className="user-card__detail"><strong>Email:</strong> {user.email}</span>
        )}
        {user.mobile && (
          <span className="user-card__detail"><strong>Phone:</strong> {user.role === "Customer" && user.status === "EXPIRED" ? (
            <a href={`tel:${user.mobile}`} className="admin-phone-link"><FaPhone /> {user.mobile}</a>
          ) : user.mobile}</span>
        )}
      </div>
    </article>
  );
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(str) {
  if (!str) return "—";
  return new Date(str).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ── Operator Detail Panel ──────────────────────────────────────────── */
function OperatorPanel({ user, data, loading, error }) {
  const [activeTab, setActiveTab] = useState("overview");
  if (loading) return <PanelSkeleton />;
  if (error) return <p className="panel-error">{error}</p>;

  const wallet = data?.wallet;
  const transactions = data?.transactions || [];

  return (
    <>
      <div className="panel-tabs">
        <button className={`panel-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={`panel-tab ${activeTab === "transactions" ? "active" : ""}`} onClick={() => setActiveTab("transactions")}>Transactions</button>
      </div>

      {activeTab === "overview" && (
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
        </>
      )}

      {activeTab === "transactions" && (
        <PaginatedTransactions transactions={transactions} />
      )}
    </>
  );
}

function PaginatedTransactions({ transactions }) {
  const { page, setPage, totalPages, paginatedData, pageInfo } = usePagination(transactions, PAGE_SIZE);
  return (
    <>
      <div className="panel-section-label">Request History</div>
      {transactions.length ? (
        <>
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
                {paginatedData.map((tx, i) => (
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
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageInfo={pageInfo} />
        </>
      ) : (
        <p className="panel-empty">No transactions yet.</p>
      )}
    </>
  );
}

/* ── Customer Detail Panel ──────────────────────────────────────────── */
function CustomerPanel({ user, data, loading, error }) {
  const [activeTab, setActiveTab] = useState("history");
  if (loading) return <PanelSkeleton />;
  if (error) return <p className="panel-error">{error}</p>;

  const requests = [...(data || [])].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
  );
  const statusCounts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const STATUS_ORDER = ["PENDING", "ACCEPTED", "ASSIGNED", "COMPLETED", "CANCELLED", "EXPIRED"];

  return (
    <>
      <div className="panel-tabs">
        <button className={`panel-tab ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>Request History ({requests.length})</button>
        <button className={`panel-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="panel-info-grid">
            {[
              { label: "Name", value: user.name || "—" },
              { label: "Phone", value: user.mobile || "—" },
              { label: "Email", value: user.email || "—" },
              { label: "Status", value: <StatusPill status={user.status} /> },
              { label: "Total Requests", value: requests.length },
              { label: "Last Active", value: requests.length ? formatDate(requests[0].created_at) : "—" },
            ].map(({ label, value }) => (
              <div className="panel-info-item" key={label}>
                <span className="panel-info-label">{label}</span>
                <span className="panel-info-value">{value}</span>
              </div>
            ))}
          </div>

          {requests.length > 0 && (
            <>
              <div className="panel-section-label">Request Summary</div>
              <div className="panel-stats-row">
                {STATUS_ORDER.filter((s) => statusCounts[s]).map((status) => (
                  <div className={`panel-stat-chip ${status}`} key={status}>
                    <span className="panel-stat-count">{statusCounts[status]}</span>
                    <span className="panel-stat-label">{status}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "history" && (
        <PaginatedCustomerRequests requests={requests} />
      )}
    </>
  );
}

function PaginatedCustomerRequests({ requests }) {
  const { page, setPage, totalPages, paginatedData, pageInfo } = usePagination(requests, PAGE_SIZE);
  return (
    <>
      {requests.length ? (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="panel-mini-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Request ID</th>
                  <th>Route</th>
                  <th>Journey Date</th>
                  <th>Bus Type</th>
                  <th>Tickets</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Operator</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((req, idx) => (
                  <tr key={req.id}>
                    <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td>
                      <div className="panel-req-id">{req.request_id || req.id || "—"}</div>
                      <div className="panel-req-datetime">{formatDateTime(req.created_at)}</div>
                    </td>
                    <td>{req.from_location} → {req.to_location}</td>
                    <td>{formatDate(req.journey_date)}</td>
                    <td>{req.bus_type ? req.bus_type.replace(/_/g, " ") : "—"}</td>
                    <td>{req.total_tickets}</td>
                    <td>₹{req.expected_price || "—"}</td>
                    <td><StatusPill status={req.status} /></td>
                    <td>{req.assigned_operator_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageInfo={pageInfo} />
        </>
      ) : (
        <p className="panel-empty">No requests found for this customer.</p>
      )}
    </>
  );
}

/* ── Main Admin Component ───────────────────────────────────────────── */
function Admin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Restore section from URL query param (supports browser back/forward)
  const sectionFromUrl = searchParams.get("section");
  const initialSection = SECTIONS.includes(sectionFromUrl) ? sectionFromUrl : "Dashboard";

  const [section, setSection] = useState(initialSection);
  const [data, setData] = useState({ operators: [], customers: [], approvals: [], requests: [], wallets: [], history: [], pointRequests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [walletOperators, setWalletOperators] = useState([]);
  const [creditForm, setCreditForm] = useState({ operator_id: "", credits: "", description: "Admin Request credit" });
  const [crediting, setCrediting] = useState(false);
  const [success, setSuccess] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [operatorSearch, setOperatorSearch] = useState("");
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
  const [activeOperatorIndex, setActiveOperatorIndex] = useState(-1);
  const operatorDropdownTimer = useRef(null);
  const operatorInputRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Detail panel state
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Cache instance
  const cache = useCache();

  // Update URL when section changes (enables browser history)
  const changeSection = useCallback((newSection) => {
    setSection(newSection);
    setSearchParams({ section: newSection }, { replace: false });
  }, [setSearchParams]);

  const closePanel = useCallback(() => {
    setSelectedUser(null);
    setDetailsData(null);
    setDetailsError("");
    document.body.style.overflow = "";
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
    if (window.innerWidth <= 900) {
      document.body.style.overflow = "hidden";
    }
    try {
      if (user.role === "Operator") {
        const cacheKey = scopedKey(`operator_detail_${user.id}`);
        const cached = cache.get(cacheKey);
        if (cached) {
          setDetailsData(cached);
          setDetailsLoading(false);
        }
        const res = await API.get(`auth/admin/operators/${user.id}/transactions/`);
        cache.set(cacheKey, res.data, 30_000);
        setDetailsData(res.data);
      } else {
        const cacheKey = scopedKey(`customer_detail_${user.mobile}`);
        const cached = cache.get(cacheKey);
        if (cached) {
          setDetailsData(cached);
          setDetailsLoading(false);
        }
        const res = await API.get(`customer/admin/customers/${user.mobile}/requests/`);
        cache.set(cacheKey, res.data, 30_000);
        setDetailsData(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Unable to load details.";
      setDetailsError(msg);
    } finally {
      setDetailsLoading(false);
    }
  }, [cache]);
  useEffect(() => {
    if (!selectedUser) return;
    const refreshDetails = async () => {
      try {
        const res =
          selectedUser.role === "Operator"
            ? await API.get(`auth/admin/operators/${selectedUser.id}/transactions/`)
            : await API.get(`customer/admin/customers/${selectedUser.mobile}/requests/`);
        setDetailsData(res.data);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          clearAuth();
          clearAppCache();
          navigate("/operator-login", { replace: true });
        }
      }
    };
    const timer = window.setInterval(refreshDetails, 15000);
    return () => window.clearInterval(timer);
  }, [selectedUser, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Serve from cache immediately for non-blocking UX
      const cachedOperators = cache.get(scopedKey("admin_operators"));
      const cachedApprovals = cache.get(scopedKey("admin_approvals"));
      const cachedCustomers = cache.get(scopedKey("admin_customers"));
      const cachedHistory = cache.get(scopedKey("admin_history"));
      const cachedPointReqs = cache.get(scopedKey("admin_point_requests"));

      if (cachedOperators || cachedCustomers) {
        setData((prev) => ({
          ...prev,
          operators: cachedOperators || prev.operators,
          approvals: cachedApprovals || prev.approvals,
          customers: cachedCustomers || prev.customers,
          history: cachedHistory || prev.history,
          pointRequests: cachedPointReqs || prev.pointRequests,
        }));
        setLoading(false);
      }

      const [operatorsResponse, approvalsResponse, customersResponse, historyResponse, pointRequestsResponse] = await Promise.all([
        API.get("operators/"),
        API.get("auth/admin/operators/pending/"),
        API.get("customer/admin/customers/").catch(() => ({ data: [] })),
        API.get("auth/admin/transactions/").catch(() => ({ data: [] })),
        API.get("auth/admin/point-requests/").catch(() => ({ data: [] })),
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
      const pointRequests = pointRequestsResponse.data || [];

      // Store in cache (30 s TTL)
      cache.set(scopedKey("admin_operators"), operators, 30_000);
      cache.set(scopedKey("admin_approvals"), approvals, 30_000);
      cache.set(scopedKey("admin_customers"), customers, 30_000);
      cache.set(scopedKey("admin_history"), history, 30_000);
      cache.set(scopedKey("admin_point_requests"), pointRequests, 30_000);

      setData({ operators, customers, approvals, requests: [], wallets: [], history, pointRequests });
      setError("");
    } catch (err) {
      const statusCode = err.response?.status;
      if (statusCode === 401 || statusCode === 403) {
        clearAuth();
        clearAppCache();
        navigate("/operator-login", { replace: true });
        return;
      }
      setError(err.response?.data?.detail || "Unable to load the admin dashboard.");
    } finally {
      setLoading(false);
    }
  }, [navigate, cache]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => { window.clearInterval(timer); document.body.style.overflow = ""; };
  }, [load]);

  useEffect(() => {
    API.get("operators/")
      .then((res) => setWalletOperators(res.data || []))
      .catch((err) => {
        const statusCode = err?.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          clearAuth();
          clearAppCache();
          navigate("/operator-login", { replace: true });
        }
      });
  }, [navigate]);

  // Sync URL → section when user navigates with browser back/forward
  useEffect(() => {
    const s = searchParams.get("section");
    if (s && SECTIONS.includes(s) && s !== section) {
      setSection(s);
      closePanel();
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const approve = async (id, action) => {
    try { await API.post(`auth/admin/operators/${id}/${action}/`); await load(); }
    catch (err) { setError(err.response?.data?.detail || `Unable to ${action} this operator.`); }
  };

  const logout = () => { clearAuth(); clearAppCache(); navigate("/operator-login", { replace: true }); };

  const addCredit = async (event) => {
    event.preventDefault();
    if (!creditForm.operator_id || !creditForm.credits) { setError("Select an operator and enter wallet points."); return; }
    setCrediting(true);
    setSuccess("");
    try {
      const op = walletOperators.find((item) => String(item.id) === String(creditForm.operator_id));
      await API.post("auth/wallet/add-credit/", {
        operator_ids: [Number(creditForm.operator_id)],
        credits: Number(creditForm.credits),
        description: creditForm.description,
      });
      setCreditForm({ operator_id: "", credits: "", description: "Admin wallet credit" });
      setError("");
      setSuccess(`Points credited successfully! Amount: ₹${creditForm.credits} | Operator ID: ${creditForm.operator_id} | Company: ${op?.company_name || "—"}`);
      setTimeout(() => setSuccess(""), 8000);
    } catch (err) {
      setCreditSuccess("");
      setError(err.response?.data?.detail || err.response?.data?.credits?.[0] || "Unable to add wallet points.");
    } finally {
      setCrediting(false);
    }
  };

  const users = section === "Operators" ? data.operators
    : section === "Customers" ? data.customers
      : [];

  const shownUsers = useMemo(
    () => users.filter((item) => `${item.id} ${item.name} ${item.email} ${item.mobile} ${item.company_name || ""} ${item.accepted_by_company || ""}`.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  );

  const requestCounts = data.requests.reduce((all, item) => ({ ...all, [item.status]: (all[item.status] || 0) + 1 }), {});

  /* ── Paginated table renderer ──────────────────────────────────────── */
  function PaginatedTable({ rows, columns, onRowClick, pageSize = PAGE_SIZE }) {
    const { page, setPage, totalPages, paginatedData, pageInfo } = usePagination(rows, pageSize);

    return rows.length ? (
      <>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}</tr></thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`${onRowClick ? "clickable-row" : ""} ${selectedUser?.id === row.id ? "selected-row" : ""}`}
                >
                  {columns.map((c) => (
                    <td key={c.label} data-label={c.label}>{c.render ? c.render(row, (page - 1) * pageSize + idx) : row[c.key] || "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageInfo={pageInfo} />
      </>
    ) : <Empty label="records" />;
  }

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
              onClick={() => { changeSection(label); closePanel(); }}
            >
              {label}
            </button>
          ))}
        </nav>
        <button type="button" className="logout-btn" onClick={logout}><FaSignOutAlt /> Logout</button>
        <button type="button" className="admin-drawer-toggle" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <FaBars />
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {drawerOpen && (
        <div className="admin-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <nav className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <img src={logoImage} alt="Tick My Bus" className="admin-drawer-logo" />
              <button type="button" className="admin-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                &times;
              </button>
            </div>
            <ul className="admin-drawer-list">
              {SECTIONS.map((label) => {
                const Icon = SECTION_ICONS[label];
                return (
                  <li key={label}>
                    <button
                      type="button"
                      className={`admin-drawer-item ${section === label ? "active" : ""}`}
                      onClick={() => { changeSection(label); closePanel(); setDrawerOpen(false); }}
                    >
                      <Icon />
                      <span>{label}</span>
                    </button>
                  </li>
                );
              })}
              <li className="admin-drawer-divider" />
              <li>
                <button type="button" className="admin-drawer-item logout" onClick={() => { logout(); setDrawerOpen(false); }}>
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

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
                <PaginatedTable rows={data.requests} columns={[
                  { label: "Request", key: "id" },
                  { label: "Customer", key: "customer" },
                  { label: "Route", key: "route" },
                  { label: "Status", render: (r) => <span className="badge badge-active">{r.status}</span> },
                  { label: "Operator", key: "operator" },
                ]} />
              </section>
            </>
          )}

          {/* ── Operators / Customers ── */}
          {(section === "Operators" || section === "Customers") && (
            <section className="admin-section">
              <div className="section-header">
                <div>
                  <span className="section-title">{section}</span>
                  <p className="section-subtitle">Click any row to view details.</p>
                </div>
                {section === "Customers" && (
                  <span className="live-indicator"><i /> Auto-refreshing</span>
                )}
              </div>

              <label className="users-search-label">
                Search {section.toLowerCase()}
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, ID, email or phone" />
              </label>

              <div className={`users-layout ${selectedUser ? "panel-open" : ""}`}>
                {selectedUser && <div className="panel-backdrop" onClick={closePanel} />}

                {/* Desktop: Table */}
                <div className="users-table-wrap">
                  <PaginatedTable
                    rows={shownUsers}
                    columns={[
                      ...(section === "Operators" || section === "Customers" ? [{ label: "S.No", render: (_r, idx) => idx + 1 }] : []),
                      { label: "Name", key: "name" },
                      ...(section === "Operators" ? [{ label: "Company", key: "company_name" }] : []),
                      ...(section === "Operators" ? [{ label: "ID", key: "id" }] : [{ label: "Request ID", key: "request_id" }]),
                      ...(section === "Operators" ? [{ label: "Email", key: "email" }] : []),
                      { label: "Mobile", render: (r) => r.status === "EXPIRED" && r.mobile ? (
                        <a href={`tel:${r.mobile}`} className="admin-phone-link"><FaPhone /> {r.mobile}</a>
                      ) : r.mobile || "—" },
                      ...(section === "Customers" ? [{ label: "Date/Time", render: (r) => formatDateTime(r.created_at) }] : []),
                      { label: "Status", render: (r) => <StatusPill status={r.status} /> },
                      ...(section === "Customers" ? [{ label: "Accepted By", render: (r) => r.accepted_by_company !== "Nil" ? `${r.accepted_by_company} (${r.accepted_by_phone})` : "Nil" }] : []),
                    ]}
                    onRowClick={selectUser}
                  />
                </div>

                {/* Mobile: Cards (paginated) */}
                <MobileCardList users={shownUsers} selectedUser={selectedUser} selectUser={selectUser} />

                {/* Detail Panel */}
                {selectedUser && (
                  <div className="user-detail-panel">
                    <span className="panel-drag-handle" />
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
          {section === "Credit History" && (
            <section className="admin-section">
              <div className="section-header">
                <div>
                  <span className="section-title">Transaction History</span>
                  <p className="section-subtitle">Points transferred from admin to operators.</p>
                </div>
              </div>

              {(data.history && data.history.length > 0) && (
                <div style={{ marginBottom: "1rem", maxWidth: "400px", width: "100%" }}>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by company name..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                </div>
              )}
              <HistoryTable data={data.history} search={historySearch} />
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
              <ApprovalList approvals={data.approvals} approve={approve} pageSize={PAGE_SIZE} />
            </section>
          )}

          {/* ── Requests (wallet credit) ── */}
          {section === "Credit Requests" && (
            <section className="admin-section">
              <div className="section-header">
                <div>
                  <span className="section-title">Operator Request points</span>
                  <p className="section-subtitle">Only administrators can add points. Operators spend one point when accepting a request.</p>
                </div>
              </div>
              {success && <p className="status-success">{success}</p>}
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

/* ── Mobile card list with pagination ───────────────────────────────── */
function MobileCardList({ users, selectedUser, selectUser }) {
  const { page, setPage, totalPages, paginatedData, pageInfo } = usePagination(users, PAGE_SIZE);
  return (
    <div className="users-cards-list">
      {users.length ? (
        <>
          {paginatedData.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isSelected={selectedUser?.id === user.id}
              onClick={() => selectUser(user)}
            />
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageInfo={pageInfo} />
        </>
      ) : <Empty label="records" />}
    </div>
  );
}

/* ── History table with pagination ──────────────────────────────────── */
function HistoryTable({ data, search }) {
  const q = search.toLowerCase();
  const filtered = (data || []).filter((item) =>
    (item.operator_company || "").toLowerCase().includes(q) ||
    (item.operator_phone || "").toLowerCase().includes(q) ||
    String(item.operator_id || "").includes(q)
  );
  const { page, setPage, totalPages, paginatedData, pageInfo } = usePagination(filtered, HISTORY_PAGE_SIZE);

  if (!filtered.length) return <Empty label="transactions" />;

  return (
    <>
      <div className="table-wrapper history-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Operator</th>
              <th>Company (Phone / ID)</th>
              <th>Points</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={item.id}>
                <td>{(page - 1) * HISTORY_PAGE_SIZE + index + 1}</td>
                <td>{item.operator_name || "—"}</td>
                <td>{item.operator_company || "—"} ({item.operator_phone || "—"} / {item.operator_id || "—"})</td>
                <td>{item.credits}</td>
                <td>{formatDate(item.created_at)}</td>
                <td>{item.description || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageInfo={pageInfo} />
      <div className="history-cards-list">
        {paginatedData.map((item, index) => (
          <article key={item.id} className="history-card-mobile">
            <div className="history-card-mobile__top">
              <div className="history-card-mobile__avatar">
                <FaBus />
              </div>
              <div className="history-card-mobile__identity">
                <span className="history-card-mobile__name">{(page - 1) * HISTORY_PAGE_SIZE + index + 1}. {item.operator_name || "—"}</span>
                <span className="history-card-mobile__company">{item.operator_company || "—"} ({item.operator_phone || "—"} / ID: {item.operator_id || "—"})</span>
              </div>
              <span className="history-card-mobile__points">+{item.credits}</span>
            </div>
            <div className="history-card-mobile__details">
              <span className="history-card-mobile__detail"><strong>Date:</strong> {formatDate(item.created_at)}</span>
              {item.description && (
                <span className="history-card-mobile__detail"><strong>Note:</strong> {item.description}</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

/* ── Approvals list with pagination ─────────────────────────────────── */
function ApprovalList({ approvals, approve, pageSize }) {
  const { page, setPage, totalPages, paginatedData, pageInfo } = usePagination(approvals, pageSize);
  if (!approvals.length) return <Empty label="pending approvals" />;
  return (
    <>
      <div className="approval-list">
        {paginatedData.map((item) => (
          <article key={item.id} className="approval-card">
            <div>
              <p className="approval-name">Name: {item.name}</p>
              <p className="approval-meta"><strong>Company Name:</strong> {item.company_name} · <strong>PH.NO:</strong> {item.mobile} · <strong>Email ID:</strong> {item.email}</p>
            </div>
            <div className="approval-actions">
              <button className="action-btn success" onClick={() => approve(item.id, "approve")}>Approve</button>
              <button className="action-btn secondary" onClick={() => approve(item.id, "reject")}>Reject</button>
            </div>
          </article>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageInfo={pageInfo} />
    </>
  );
}

export default Admin;
