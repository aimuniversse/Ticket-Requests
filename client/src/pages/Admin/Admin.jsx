import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import API from "../../api/axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/Admin.css";

const SECTIONS = ["Dashboard", "Users", "Wallets", "Transcripts", "Approvals", "Support", "Settings"];
const Empty = ({ label }) => <div className="empty-card"><h3>No {label} yet</h3><p>This section is connected to live backend data and will populate when records are created.</p></div>;

function Admin() {
  const navigate = useNavigate();
  const [section, setSection] = useState("Dashboard");
  const [data, setData] = useState({ operators: [], customers: [], approvals: [], requests: [], wallets: [], transcripts: [], support_tickets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("operators");

  const load = async () => {
    setLoading(true);
    try { const response = await API.get("auth/admin/overview/"); setData(response.data); setError(""); }
    catch (err) { setError(err.response?.data?.detail || "Unable to load the admin dashboard."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); const timer = window.setInterval(load, 15000); return () => window.clearInterval(timer); }, []);
  const approve = async (id, action) => {
    try { await API.post(`auth/admin/operators/${id}/${action}/`); await load(); }
    catch (err) { setError(err.response?.data?.detail || `Unable to ${action} this operator.`); }
  };
  const logout = () => { localStorage.clear(); navigate("/operator-login"); };
  const users = userType === "operators" ? data.operators : userType === "customers" ? data.customers : [...data.operators, ...data.customers];
  const shownUsers = useMemo(() => users.filter((item) => `${item.id} ${item.name} ${item.email} ${item.mobile}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const requestCounts = data.requests.reduce((all, item) => ({ ...all, [item.status]: (all[item.status] || 0) + 1 }), {});
  const renderTable = (rows, columns) => rows.length ? <div className="table-wrapper"><table className="admin-table"><thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{columns.map((c) => <td key={c.label}>{c.render ? c.render(row) : row[c.key] || "—"}</td>)}</tr>)}</tbody></table></div> : <Empty label="records" />;

<<<<<<< HEAD
  const handleRejectRequest = (requestId) => {
    setApprovals((prev) => prev.filter((item) => item.id !== requestId));
  };

  useEffect(() => {
    getAdminData()
      .then((data) => {
        setOperators(data.operators || []);
        setCustomers(data.customers || []);
        setApprovals(data.approvals || []);
        setWallets(data.wallets || []);
        setWalletHistory(data.walletHistory || []);
        setTranscripts(data.transcripts || []);
        setTickets(data.tickets || []);
      })
      .catch(() => {
        setOperators([]);
        setCustomers([]);
        setApprovals([]);
        setWallets([]);
        setWalletHistory([]);
        setTranscripts([]);
        setTickets([]);
      });
  }, []);

  const filteredUsers = useMemo(() => {
    const activeList =
      activeUserTab === "operators"
        ? operators
        : activeUserTab === "customers"
          ? customers
          : [...operators, ...customers];

    return activeList.filter((user) => {
      const searchValue = userSearch.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(searchValue) ||
        user.id.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue) ||
        user.mobile.toLowerCase().includes(searchValue);
      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeUserTab, userSearch, statusFilter, operators, customers]);

  const totalOperatorWallet = wallets
    .filter((item) => item.type === "Operator")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalCustomerWallet = wallets
    .filter((item) => item.type === "Customer")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-brand">{ADMIN_LABELS.brand}</div>
          <nav className="sidebar-nav">
            {SIDEBAR_LINKS.map((label) => (
              <button
                key={label}
                type="button"
                className={`sidebar-link ${activeSection === label ? "active" : ""}`}
                onClick={() => setActiveSection(label)}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          <div className="admin-topbar">
            <div className="topbar-search">
              <input
                type="search"
                placeholder={ADMIN_LABELS.searchPlaceholder}
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
              />
              <span className="help-icon" title={ADMIN_LABELS.helpTooltip}>?</span>
            </div>
            <div className="topbar-actions">
              <span className="topbar-chip">Admin</span>
              <span className="topbar-note">Live dashboard</span>
            </div>
          </div>

          {activeSection === "Dashboard" && (
            <section className="dashboard-overview">
              <article className="overview-card">
                <p className="overview-label">Operators</p>
                <h3>{operators.length}</h3>
                <span className="tag tag-active">Active</span>
              </article>
              <article className="overview-card">
                <p className="overview-label">Customers</p>
                <h3>{customers.length}</h3>
                <span className="tag tag-info">Customers</span>
              </article>
              <article className="overview-card">
                <p className="overview-label">Pending Approvals</p>
                <h3>{approvals.length}</h3>
                <span className="tag tag-warning">Needs review</span>
              </article>
              <article className="overview-card">
                <p className="overview-label">Wallet Total</p>
                <h3>₹{totalOperatorWallet + totalCustomerWallet}</h3>
                <span className="tag tag-success">Live</span>
              </article>
            </section>
          )}

          {activeSection === "Users" && (
            <section className="admin-section user-management">
              <div className="section-header">
                <div>
                  <span className="section-title">Operator Management</span>
                  <p className="section-subtitle">Manage operators and customers with search, filters, and controls.</p>
                </div>
                <div className="tab-group">
                  {USER_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      className={activeUserTab === tab.id ? "tab active" : "tab"}
                      onClick={() => setActiveUserTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="section-controls">
                <label>
                  Search users
                  <input
                    type="search"
                    placeholder={ADMIN_LABELS.userManagement.searchPlaceholder}
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                  />
                </label>
                <div className="status-filters">
                  {STATUS_FILTERS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`filter-chip ${statusFilter === status ? "active" : ""}`}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={selectedUser?.id === user.id ? "selected-row" : ""}
                        onClick={() => handleUserSelect(user)}
                      >
                        <td>{user.name}</td>
                        <td>{user.id}</td>
                        <td>{user.email}</td>
                        <td>{user.mobile}</td>
                        <td>
                          <span className={`badge badge-${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleViewUser(user);
                            }}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="action-btn secondary"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleToggleUserStatus(user);
                            }}
                          >
                            {user.status === "Blocked" ? "Unblock" : "Block"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedUser && (
                <div className="detail-panel">
                  <h4>Selected User</h4>
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>ID:</strong> {selectedUser.id}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Mobile:</strong> {selectedUser.mobile}</p>
                  <p><strong>Status:</strong> {selectedUser.status}</p>
                  <p><strong>Role:</strong> {selectedUser.role}</p>
                </div>
              )}
            </section>
          )}

          {activeSection === "Wallets" && (
            <section className="admin-section wallet-section">
              <div className="section-header">
                <div>
                  <span className="section-title">{ADMIN_LABELS.walletSummary.title}</span>
                  <p className="section-subtitle">{ADMIN_LABELS.walletSummary.subtitle}</p>
                </div>
                <label>
                  Filter wallets
                  <input
                    type="search"
                    placeholder={ADMIN_LABELS.walletSummary.searchPlaceholder}
                    value={walletSearch}
                    onChange={(event) => setWalletSearch(event.target.value)}
                  />
                </label>
              </div>

              <div className="wallet-cards">
                {wallets.map((item) => (
                  <article key={item.type} className="wallet-card">
                    <p>{item.name}</p>
                    <h3>₹{item.amount}</h3>
                    <span>{item.users} users</span>
                  </article>
                ))}
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Wallet ID</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletHistory
                      .filter((item) =>
                        `${item.user} ${item.type}`.toLowerCase().includes(walletSearch.toLowerCase())
                      )
                      .map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.id}</td>
                          <td>{entry.user}</td>
                          <td>{entry.type}</td>
                          <td>₹{entry.balance}</td>
                          <td>
                            <span className={`badge badge-${entry.status.toLowerCase()}`}>
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === "Approvals" && (
            <section className="admin-section approval-section">
              <div className="section-header">
                <div>
                  <span className="section-title">{ADMIN_LABELS.approvals.title}</span>
                  <p className="section-subtitle">{ADMIN_LABELS.approvals.subtitle}</p>
                </div>
                <label>
                  Search approvals
                  <input
                    type="search"
                    placeholder={ADMIN_LABELS.approvals.searchPlaceholder}
                    value={approvalSearch}
                    onChange={(event) => setApprovalSearch(event.target.value)}
                  />
                </label>
              </div>

              <div className="approval-list">
                {approvals
                  .filter((request) =>
                    `${request.name} ${request.id} ${request.email}`
                      .toLowerCase()
                      .includes(approvalSearch.toLowerCase())
                  )
                  .map((request) => (
                    <article key={request.id} className="approval-card">
                      <div>
                        <p className="approval-name">{request.name}</p>
                        <p className="approval-meta">{request.id} · {request.email}</p>
                      </div>
                      <div className="approval-actions">
                        <button
                          type="button"
                          className="action-btn success"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="action-btn secondary"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          )}

          {activeSection === "Transcripts" && (
            <section className="admin-section transcript-section">
              <div className="section-header">
                <div>
                  <span className="section-title">{ADMIN_LABELS.transcription.title}</span>
                  <p className="section-subtitle">{ADMIN_LABELS.transcription.subtitle}</p>
                </div>
                <label>
                  Search transcripts
                  <input
                    type="search"
                    placeholder={ADMIN_LABELS.transcription.searchPlaceholder}
                    value={transcriptSearch}
                    onChange={(event) => setTranscriptSearch(event.target.value)}
                  />
                </label>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Summary</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transcripts
                      .filter((item) =>
                        `${item.id} ${item.user} ${item.summary}`
                          .toLowerCase()
                          .includes(transcriptSearch.toLowerCase())
                      )
                      .map((item) => (
                        <tr
                          key={item.id}
                          className={selectedTranscript?.id === item.id ? "selected-row" : ""}
                          onClick={() => handleTranscriptSelect(item)}
                        >
                          <td>{item.id}</td>
                          <td>{item.user}</td>
                          <td>{item.type}</td>
                          <td>{item.summary}</td>
                          <td>
                            <span className={`badge badge-${item.status.toLowerCase()}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="action-btn"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleReviewTranscript(item);
                              }}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {selectedTranscript && (
                <div className="detail-panel">
                  <h4>Selected Transcript</h4>
                  <p><strong>ID:</strong> {selectedTranscript.id}</p>
                  <p><strong>User:</strong> {selectedTranscript.user}</p>
                  <p><strong>Type:</strong> {selectedTranscript.type}</p>
                  <p><strong>Summary:</strong> {selectedTranscript.summary}</p>
                  <p><strong>Status:</strong> {selectedTranscript.status}</p>
                </div>
              )}
            </section>
          )}

          {activeSection === "Support" && (
            <section className="admin-section support-section">
              <div className="section-header">
                <div>
                  <span className="section-title">{ADMIN_LABELS.support.title}</span>
                  <p className="section-subtitle">{ADMIN_LABELS.support.subtitle}</p>
                </div>
                <label>
                  Search tickets
                  <input
                    type="search"
                    placeholder={ADMIN_LABELS.support.searchPlaceholder}
                    value={ticketSearch}
                    onChange={(event) => setTicketSearch(event.target.value)}
                  />
                </label>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Customer</th>
                      <th>Issue</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets
                      .filter((ticket) =>
                        `${ticket.id} ${ticket.customer} ${ticket.issue}`
                          .toLowerCase()
                          .includes(ticketSearch.toLowerCase())
                      )
                      .map((ticket) => (
                        <tr
                          key={ticket.id}
                          className={selectedTicket?.id === ticket.id ? "selected-row" : ""}
                          onClick={() => handleTicketSelect(ticket)}
                        >
                          <td>{ticket.id}</td>
                          <td>{ticket.customer}</td>
                          <td>{ticket.issue}</td>
                          <td>
                            <span className={`badge badge-${ticket.priority.toLowerCase()}`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-open">{ticket.status}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="action-btn"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenTicket(ticket);
                              }}
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {selectedTicket && (
                <div className="detail-panel">
                  <h4>Selected Ticket</h4>
                  <p><strong>ID:</strong> {selectedTicket.id}</p>
                  <p><strong>Customer:</strong> {selectedTicket.customer}</p>
                  <p><strong>Issue:</strong> {selectedTicket.issue}</p>
                  <p><strong>Priority:</strong> {selectedTicket.priority}</p>
                  <p><strong>Status:</strong> {selectedTicket.status}</p>
                </div>
              )}
            </section>
          )}

          {activeSection === "Settings" && (
            <section className="admin-section settings-section">
              <div className="section-header">
                <div>
                  <span className="section-title">Settings</span>
                  <p className="section-subtitle">
                    Configure dashboard preferences, notifications, and account options.
                  </p>
                </div>
              </div>

              <div className="settings-content">
                <article className="settings-card">
                  <h4>Notification Preferences</h4>
                  <p>Enable or disable email notifications for new tickets and approval requests.</p>
                </article>
                <article className="settings-card">
                  <h4>Theme</h4>
                  <p>Switch between light and dark mode for the admin dashboard display.</p>
                </article>
              </div>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
=======
  return <div className="admin-page"><Header /><div className="admin-layout"><aside className="admin-sidebar"><div className="sidebar-brand">Admin Panel</div><nav className="sidebar-nav">{SECTIONS.map((label) => <button key={label} type="button" className={`sidebar-link ${section === label ? "active" : ""}`} onClick={() => setSection(label)}>{label}</button>)}</nav><button type="button" className="sidebar-link logout-btn" onClick={logout}><FaSignOutAlt /> Logout</button></aside><main className="admin-main"><div className="admin-topbar"><div><strong>Live administration</strong><p>{loading ? "Refreshing…" : "Updated from the backend"}</p></div><button type="button" className="action-btn" onClick={load}>Refresh</button></div>{error && <p className="status-error">{error}</p>}
    {section === "Dashboard" && <><section className="dashboard-overview"><article className="overview-card"><p>Operators</p><h3>{data.operators.length}</h3></article><article className="overview-card"><p>Customer requests</p><h3>{data.customers.length}</h3></article><article className="overview-card"><p>Pending approvals</p><h3>{data.approvals.length}</h3></article><article className="overview-card"><p>Active requests</p><h3>{(requestCounts.PENDING || 0) + (requestCounts.ACCEPTED || 0)}</h3></article></section><section className="admin-section"><div className="section-header"><div><span className="section-title">Ticket requests</span><p className="section-subtitle">Live request and assignment status. Admins cannot accept requests.</p></div></div>{renderTable(data.requests, [{ label: "Request", key: "id" }, { label: "Customer", key: "customer" }, { label: "Route", key: "route" }, { label: "Status", render: (r) => <span className="badge badge-active">{r.status}</span> }, { label: "Operator", key: "operator" }])}</section></>}
    {section === "Users" && <section className="admin-section"><div className="section-header"><div><span className="section-title">Users</span><p className="section-subtitle">Live operators and customers derived from submitted requests.</p></div><div className="tab-group">{["operators", "customers", "all"].map((tab) => <button key={tab} className={userType === tab ? "tab active" : "tab"} onClick={() => setUserType(tab)}>{tab}</button>)}</div></div><label>Search users<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, ID, email or phone" /></label>{renderTable(shownUsers, [{ label: "Name", key: "name" }, { label: "ID", key: "id" }, { label: "Email", key: "email" }, { label: "Mobile", key: "mobile" }, { label: "Status", key: "status" }, { label: "Role", key: "role" }])}</section>}
    {section === "Approvals" && <section className="admin-section"><div className="section-header"><div><span className="section-title">Pending operator approvals</span><p className="section-subtitle">Approve or reject registrations in real time.</p></div></div>{data.approvals.length ? <div className="approval-list">{data.approvals.map((item) => <article key={item.id} className="approval-card"><div><p className="approval-name">{item.name}</p><p className="approval-meta">{item.company_name} · {item.email} · {item.mobile}</p></div><div className="approval-actions"><button className="action-btn success" onClick={() => approve(item.id, "approve")}>Approve</button><button className="action-btn secondary" onClick={() => approve(item.id, "reject")}>Reject</button></div></article>)}</div> : <Empty label="pending approvals" />}</section>}
    {section === "Wallets" && <section className="admin-section"><span className="section-title">Wallets & transactions</span><Empty label="wallet records" /></section>}
    {section === "Transcripts" && <section className="admin-section"><span className="section-title">Transcripts</span><Empty label="transcripts" /></section>}
    {section === "Support" && <section className="admin-section"><span className="section-title">Support</span><Empty label="support tickets" /></section>}
    {section === "Settings" && <section className="admin-section"><span className="section-title">Settings</span><p className="section-subtitle">Admin account and notification settings will be stored server-side when those preferences are added.</p></section>}
  </main></div><Footer /></div>;
>>>>>>> ac5e7532a4f570cbb352a9e592a0db2112174d39
}
export default Admin;
