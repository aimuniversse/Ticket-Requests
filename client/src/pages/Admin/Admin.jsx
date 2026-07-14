import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getAdminData } from "../../services/adminService";
import "../../styles/Admin.css";

const SIDEBAR_LINKS = [
  "Dashboard",
  "Users",
  "Wallets",
  "Transcripts",
  "Approvals",
  "Support",
  "Settings",
];

const USER_TABS = [
  { id: "operators", label: "Operators" },
  { id: "customers", label: "Customers" },
  { id: "combined", label: "Combined" },
];

const STATUS_FILTERS = ["All", "Active", "Pending", "Blocked"];

const ADMIN_LABELS = {
  brand: "Admin Panel",
  searchPlaceholder: "Search users, wallets, tickets...",
  helpTooltip: "Search by name, ID, email or mobile",
  userManagement: {
    title: "User Management",
    subtitle: "Manage operators and customers with search, filters, and controls.",
    searchPlaceholder: "Search by name, email, ID or mobile",
  },
  walletSummary: {
    title: "Wallet Summary",
    subtitle: "Monitor wallet balances and view active transaction statuses.",
    searchPlaceholder: "Search wallet entries",
  },
  approvals: {
    title: "Pending Approvals",
    subtitle: "Approve or reject new operator registrations quickly.",
    searchPlaceholder: "Search by request ID or name",
  },
  transcription: {
    title: "Transcription Center",
    subtitle: "Review recent transcripts and call logs from support interactions.",
    searchPlaceholder: "Search by user or summary",
  },
  support: {
    title: "Customer Support",
    subtitle: "Track open tickets and respond to customer requests.",
    searchPlaceholder: "Search ticket ID, customer, or issue",
  },
};

function Admin() {
  const [activeUserTab, setActiveUserTab] = useState("operators");
  const [userSearch, setUserSearch] = useState("");
  const [walletSearch, setWalletSearch] = useState("");
  const [approvalSearch, setApprovalSearch] = useState("");
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [ticketSearch, setTicketSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [operators, setOperators] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeSection, setActiveSection] = useState("Dashboard");

  const handleUserSelect = (user) => setSelectedUser(user);
  const handleViewUser = (user) => setSelectedUser(user);
  const handleToggleUserStatus = (user) => {
    const nextStatus = user.status === "Blocked" ? "Active" : "Blocked";
    if (user.role === "Operator") {
      setOperators((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, status: nextStatus } : item
        )
      );
    } else {
      setCustomers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, status: nextStatus } : item
        )
      );
    }
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...selectedUser, status: nextStatus });
    }
  };

  const handleTranscriptSelect = (item) => setSelectedTranscript(item);
  const handleReviewTranscript = (item) => setSelectedTranscript(item);
  const handleTicketSelect = (ticket) => setSelectedTicket(ticket);
  const handleOpenTicket = (ticket) => setSelectedTicket(ticket);

  const handleApproveRequest = (requestId) => {
    setApprovals((prev) => prev.filter((item) => item.id !== requestId));
  };

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
                <span className="section-title">User Management</span>
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
}

export default Admin;
