import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import "../../styles/OperatorDashboard.css";
import {
  FaBars,
  FaBell,
  FaBus,
  FaChevronDown,
  FaCheckCircle,
  FaClock,
  FaCog,
  FaEnvelope,
  FaHome,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaSignOutAlt,
  FaSyncAlt,
  FaTicketAlt,
  FaUserCircle,
  FaWallet,
} from "react-icons/fa";
import AcceptedRequests from "./AcceptedRequests";
import ActiveRequests from "./ActiveRequests";
import CustomerDetailsUnlock from "./CustomerDetailsUnlock";
import Notifications from "./Notifications";
import Profile from "./Profile";
import Settings from "./Settings";
import Transactions from "./Transactions";
import Wallet from "./Wallet";

const requestLinks = [
  { id: "active", label: "Active Requests", icon: FaClock },
  { id: "accepted", label: "Accepted Requests", icon: FaCheckCircle },
  { id: "details", label: "Customer Details", icon: FaInfoCircle },
];

const accountLinks = [
  { id: "wallet", label: "Wallet", icon: FaWallet },
  { id: "transactions", label: "Transactions", icon: FaMoneyBillWave },
  { id: "notifications", label: "Notifications", icon: FaBell },
  { id: "settings", label: "Settings", icon: FaCog },
];

const OperatorDashboardNew = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);

  const fetchAssignedRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("auth/requests/assigned/");
      setRequests(response.data || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        navigate("/operator-login");
        return;
      }

      setError("Unable to load assigned requests from the backend right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    fetchAssignedRequests();
  }, [navigate]);

  const summary = useMemo(() => {
    const total = requests.length;
    const active = requests.filter((request) => request.status?.toUpperCase() === "ASSIGNED").length;
    const followUp = Math.max(total - active, 0);

    return { total, active, followUp };
  }, [requests]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/operator-login");
  };

  const selectSection = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  const renderOverview = () => (
    <>
      <section className="welcome">
        <div>
          <p className="eyebrow">Operator Control Center</p>
          <h1>Welcome back{user?.name ? `, ${user.name}` : ""} 👋</h1>
          <p>
            Your assigned requests are synced directly from the backend. Review them here, monitor operator activity, and stay aligned with your live operations.
          </p>
        </div>
      </section>

      <section className="dashboard-cards">
        <div className="dashboard-card">
          <FaTicketAlt className="card-icon" />
          <span>Total Assigned Requests</span>
          <h2>{loading ? "--" : summary.total}</h2>
        </div>

        <div className="dashboard-card">
          <FaClock className="card-icon" />
          <span>Active Requests</span>
          <h2>{loading ? "--" : summary.active}</h2>
        </div>

        <div className="dashboard-card">
          <FaCheckCircle className="card-icon" />
          <span>Follow-up Needed</span>
          <h2>{loading ? "--" : summary.followUp}</h2>
        </div>

        <div className="dashboard-card">
          <FaWallet className="card-icon" />
          <span>Account Status</span>
          <h2>{user?.role || "Operator"}</h2>
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Latest Activity</h2>
          <button type="button" className="ghost-btn" onClick={fetchAssignedRequests}>
            <FaSyncAlt /> Refresh
          </button>
        </div>

        {error ? (
          <div className="status-card error">{error}</div>
        ) : requests.length === 0 ? (
          <div className="empty-request">
            <FaInfoCircle className="empty-icon" />
            <h3>No assigned requests yet</h3>
            <p>Requests assigned to this operator will appear here automatically from the backend.</p>
          </div>
        ) : (
          <div className="request-list">
            {requests.slice(0, 3).map((request) => (
              <div className="request-item" key={request.id}>
                <div>
                  <h3>{request.name}</h3>
                  <p>
                    <FaInfoCircle /> Status: {request.status || "Pending"}
                  </p>
                </div>
                <span className="badge">{request.status || "Assigned"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );

  const renderRequests = () => (
    <section className="panel">
      <div className="section-title">
        <h2>Assigned Requests</h2>
        <button type="button" className="ghost-btn" onClick={fetchAssignedRequests}>
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="status-card">Loading assigned requests…</div>
      ) : error ? (
        <div className="status-card error">{error}</div>
      ) : requests.length === 0 ? (
        <div className="empty-request">
          <FaTicketAlt className="empty-icon" />
          <h3>No assigned requests found</h3>
          <p>Your backend-assigned requests will appear here.</p>
        </div>
      ) : (
        <div className="request-grid">
          {requests.map((request) => (
            <article className="request-card" key={request.id}>
              <div className="request-header">
                <div>
                  <h3>{request.name}</h3>
                  <p className="muted">Request ID: {request.id}</p>
                </div>
                <span className="badge">{request.status || "Assigned"}</span>
              </div>

              <div className="request-body">
                <div className="info-row">
                  <FaMapMarkerAlt />
                  <span>Assigned operator ID: {request.assigned_operator_id || "N/A"}</span>
                </div>
                <div className="info-row">
                  <FaInfoCircle />
                  <span>Backend status: {request.status || "Pending"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const renderAccount = () => (
    <section className="panel account-panel">
      <div className="section-title">
        <h2>Account Details</h2>
      </div>

      <div className="account-card">
        <div className="account-avatar">
          <FaUserCircle />
        </div>
        <div className="account-info">
          <h3>{user?.name || "Operator"}</h3>
          <p>
            <FaEnvelope /> {user?.email || "No email available"}
          </p>
          <p>
            <FaPhoneAlt /> {user?.phone_number || "No phone number available"}
          </p>
          <p>
            <FaBus /> Role: {user?.role || "Operator"}
          </p>
        </div>
      </div>
    </section>
  );

  const renderDropdown = (label, id, links) => (
    <div className={`top-nav-dropdown ${openDropdown === id ? "is-open" : ""}`}>
      <button type="button" className="top-nav-link" onClick={() => setOpenDropdown(openDropdown === id ? null : id)}>{label}<FaChevronDown /></button>
      <div className="top-nav-menu">
        {links.map(({ id: section, label: itemLabel, icon: Icon }) => <button type="button" key={section} onClick={() => selectSection(section)}><Icon /> {itemLabel}</button>)}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <header className="operator-header">
        <div className="operator-header__inner">
          <button type="button" className="mobile-menu-btn" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}><FaBars /></button>
          <button type="button" className="brand" onClick={() => selectSection("overview")}><span><FaBus /></span><strong>TicketMyBus</strong></button>
          <nav className={`top-nav ${menuOpen ? "is-open" : ""}`}>
            <button type="button" className={`top-nav-link ${activeSection === "overview" ? "active" : ""}`} onClick={() => selectSection("overview")}><FaHome /> Overview</button>
            {renderDropdown("Requests", "requests", requestLinks)}
            {renderDropdown("Operations", "operations", accountLinks)}
          </nav>
          <div className="header-actions">
            <button type="button" className="notification-btn" aria-label="Notifications" onClick={() => selectSection("notifications")}><FaBell /></button>
            <div className={`profile-menu ${openDropdown === "profile" ? "is-open" : ""}`}>
              <button type="button" className="profile-trigger" onClick={() => setOpenDropdown(openDropdown === "profile" ? null : "profile")}><FaUserCircle /><span><strong>{user?.name || "Operator"}</strong><small>{user?.email || "Operator account"}</small></span><FaChevronDown /></button>
              <div className="profile-popover"><button type="button" onClick={() => selectSection("profile")}><FaUserCircle /> My profile</button><button type="button" onClick={() => selectSection("settings")}><FaCog /> Settings</button><button type="button" className="logout-button" onClick={handleLogout}><FaSignOutAlt /> Logout</button></div>
            </div>
          </div>
        </div>
      </header>

      <main className="main">

        {activeSection === "overview" && renderOverview()}
        {activeSection === "active" && <ActiveRequests />}
        {activeSection === "accepted" && <AcceptedRequests />}
        {activeSection === "details" && <CustomerDetailsUnlock unlocked={false} customer={{ name: "Sample Customer", phone: "9876543210", email: "customer@example.com", bookingCode: "TB-1001" }} />}
        {activeSection === "wallet" && <Wallet />}
        {activeSection === "transactions" && <Transactions />}
        {activeSection === "notifications" && <Notifications notifications={[]} />}
        {activeSection === "profile" && <Profile />}
        {activeSection === "settings" && <Settings />}
        {activeSection === "requests" && renderRequests()}
        {activeSection === "account" && renderAccount()}
      </main>
    </div>
  );
};

export default OperatorDashboardNew;
