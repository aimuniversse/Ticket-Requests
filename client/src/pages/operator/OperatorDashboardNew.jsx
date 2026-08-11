import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../api/axios";
import { clearAppCache, clearAuth, getStoredUser, scopedKey } from "../../api/auth";
import { useCache } from "../../hooks/useCache";
import "../../styles/OperatorDashboard.css";
import logo from "../../assets/logo.jpeg";
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
  FaTimes,
  FaUserCircle,
  FaWallet,
} from "react-icons/fa";
import AcceptedRequests from "./AcceptedRequests";
import ActiveRequests from "./ActiveRequests";
import Notifications from "./Notifications";
import Profile from "./Profile";
import Settings from "./Settings";
import Wallet from "./Wallet";

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // silent fail for audio
  }
};

const requestLinks = [
  { id: "active", label: "Active Requests", icon: FaClock },
  { id: "accepted", label: "Accepted Requests", icon: FaCheckCircle },
];

const accountLinks = [
  { id: "notifications", label: "Notifications", icon: FaBell },
  { id: "settings", label: "Settings", icon: FaCog },
];

const OperatorDashboardNew = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cache = useCache();

  // Restore tab from URL on mount (enables browser back/forward)
  const tabFromUrl = searchParams.get("tab") || "overview";
  const filterFromUrl = searchParams.get("status") || null;
  const [activeSection, setActiveSection] = useState(tabFromUrl);
  const [cardFilter, setCardFilter] = useState(filterFromUrl);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState(null);
  const [walletError, setWalletError] = useState("");
  const [walletLoading, setWalletLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [acceptedCounts, setAcceptedCounts] = useState({});
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [leadPoolCount, setLeadPoolCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const prevLeadIdsRef = { current: new Set() };
  const initializedRef = { current: false };
  const seenNotifIdsRef = { current: new Set() };
  const toastIdRef = useRef(0);
  const notifDropdownRef = useRef(null);

  const fetchAssignedRequests = async () => {
    setLoading(true);
    setError("");

    try {
      // Serve cached assigned requests immediately (non-blocking UX)
      const cacheKey = scopedKey("dashboard_assigned_requests");
      const cached = cache.get(cacheKey);
      if (cached) setRequests(cached);
      const response = await API.get("auth/requests/assigned/");
      cache.set(cacheKey, response.data || [], 30_000);
      setRequests(response.data || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        clearAuth();
        clearAppCache();
        navigate("/operator-login", { replace: true });
        return;
      }

      setError("Unable to load assigned requests from the backend right now.");
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    setWalletLoading(true);
    setWalletError("");

    try {
      const response = await API.get("auth/wallet/");
      setWallet(response.data || null);
    } catch (err) {
      setWalletError(err.response?.data?.detail || "Unable to load wallet details.");
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchNotifications = async (initial = false) => {
    try {
      const response = await API.get("auth/notifications/");
      const items = response.data || [];

      const fresh = items.filter((item) => !seenNotifIdsRef.current.has(item.id));
      fresh.forEach((item) => seenNotifIdsRef.current.add(item.id));
      if (!fresh.length) return;

      const built = fresh.map((item) => ({
        id: `notif-${item.id}`,
        type: item.type || "info",
        title: item.title,
        message: item.message,
        time: new Date(item.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        read: item.is_read,
      }));

      setNotifications((prev) => [...built, ...prev]);

      if (!initial) {
        built.forEach((item) => {
          const toastId = `toast-${++toastIdRef.current}`;
          setToasts((prev) => [
            ...prev,
            {
              id: toastId,
              type: item.type,
              title: item.title,
              message: item.message,
              detail: "",
            },
          ]);
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toastId));
          }, 6000);
        });
        setUnreadCount((prev) => prev + built.length);
        playNotificationSound();
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    // Sync URL tab → state when user navigates with browser back/forward
    const urlTab = searchParams.get("tab") || "overview";
    const urlFilter = searchParams.get("status") || null;
    if (urlTab !== activeSection || urlFilter !== cardFilter) {
      setActiveSection(urlTab);
      setCardFilter(urlFilter);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {

    const storedUser = getStoredUser();
    if (storedUser) {
      try {
        setUser(storedUser);
      } catch {
        setUser(null);
      }
    }

    fetchAssignedRequests();
    loadWallet();
    fetchCounts();
    fetchNotifications(true);
    const pollTimer = window.setInterval(() => {
      fetchCounts();
      fetchNotifications();
    }, 10000);
    return () => window.clearInterval(pollTimer);
  }, [navigate]);

  const summary = useMemo(() => {
    const total = requests.length;
    const active = requests.filter((request) => request.status?.toUpperCase() === "ASSIGNED").length;
    const followUp = Math.max(total - active, 0);

    return { total, active, followUp };
  }, [requests]);

  const handleAcceptedCounts = (counts) => {
    setAcceptedCounts(counts);
  };

  const fetchCounts = async () => {
    try {
      const [assignedRes, leadsRes] = await Promise.all([
        API.get("auth/requests/assigned/").catch(() => ({ data: [] })),
        API.get("customer/").catch(() => ({ data: [] })),
      ]);

      const assignedItems = assignedRes.data || [];
      const leadItems = leadsRes.data || [];

      const counts = { NEW: 0, PENDING: 0, ACCEPTED: 0, ASSIGNED: 0, EXPIRED: 0, COMPLETED: 0 };
      assignedItems.forEach((item) => {
        const s = item.status?.toUpperCase();
        if (s in counts) counts[s]++;
      });

      const availableLeads = leadItems.filter((r) => {
        const s = r.status?.toUpperCase();
        return s === "PENDING" || s === "NEW";
      });

      const expiredIds = new Set();
      leadItems.forEach((r) => {
        if (r.status?.toUpperCase() === "EXPIRED") expiredIds.add(String(r.id ?? r.request_id));
      });
      assignedItems.forEach((r) => {
        if (r.status?.toUpperCase() === "EXPIRED") expiredIds.add(String(r.id ?? r.request_id));
      });

      setLeadPoolCount(availableLeads.length);
      setExpiredCount(expiredIds.size);

      const currentLeadIds = new Set(availableLeads.map((r) => String(r.id ?? r.request_id)));

      if (initializedRef.current) {
        const newLeads = availableLeads.filter((r) => !prevLeadIdsRef.current.has(String(r.id ?? r.request_id)));
        if (newLeads.length > 0) {
          setHasNewRequests(true);
          setUnreadCount((prev) => prev + newLeads.length);
          playNotificationSound();

          newLeads.forEach((r) => {
            const notifId = `notif-${r.id ?? r.request_id}-${Date.now()}`;
            const toastId = `toast-${++toastIdRef.current}`;

            setNotifications((prev) => [
              {
                id: notifId,
                type: "request",
                title: "New Ticket Request",
                message: `${r.from_location || "?"} \u2192 ${r.to_location || "?"} for ${r.journey_date || "today"}`,
                time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                request: r,
              },
              ...prev,
            ]);

            setToasts((prev) => [
              ...prev,
              {
                id: toastId,
                type: "request",
                title: "New Ticket Request",
                message: `${r.from_location || "?"} \u2192 ${r.to_location || "?"}`,
                detail: `${r.phone_number ? `${r.phone_number} \u2022 ` : ""}${r.total_tickets || "?"} seats \u2022 ${r.bus_type || ""}`,
                request: r,
              },
            ]);

            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== toastId));
            }, 6000);
          });
        }
      }

      prevLeadIdsRef.current = currentLeadIds;
      initializedRef.current = true;

      setAcceptedCounts(counts);
    } catch {
      // silent
    }
  };

  const handleLogout = () => {
    clearAuth();
    clearAppCache();
    navigate("/operator-login", { replace: true });
  };

  const requestPoints = walletLoading ? "--" : wallet?.current_balance ?? 0;

  const selectSection = (section, filter = null) => {
    setActiveSection(section);
    setCardFilter(filter);
    setMenuOpen(false);
    setOpenDropdown(null);
    // Write tab (and optional status filter) to URL so browser back/forward
    // restores the exact view.
    setSearchParams(
      filter ? { tab: section, status: filter } : { tab: section },
      { replace: false },
    );
  };

  const handleCardClick = (section, filter) => {
    if (filter === "PENDING" || filter === "NEW") setHasNewRequests(false);
    selectSection(section, filter);
  };

  const handleBellClick = () => {
    setNotifDropdownOpen((prev) => !prev);
    setOpenDropdown(null);
  };

  const handleNotifDropdownViewAll = () => {
    setNotifDropdownOpen(false);
    setHasNewRequests(false);
    setUnreadCount(0);
    selectSection("notifications");
  };

  const dismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleActivityClick = (request) => {
    if (request.status === "PENDING" || request.status === "NEW") {
      selectSection("active", request.status);
    } else {
      selectSection("accepted", request.status);
    }
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
        <div className="dashboard-card dashboard-card--clickable" role="button" tabIndex={0} onClick={() => handleCardClick("active", null)} onKeyDown={(e) => e.key === "Enter" && handleCardClick("active", null)}>
          <FaTicketAlt className="card-icon" />
          <span>Available Leads</span>
          <h2>{loading ? "--" : leadPoolCount}</h2>
        </div>

        <div className={`dashboard-card dashboard-card--new dashboard-card--clickable ${hasNewRequests ? "dashboard-card--alert" : ""}`} role="button" tabIndex={0} onClick={() => handleCardClick("active", null)} onKeyDown={(e) => e.key === "Enter" && handleCardClick("active", null)}>
          <FaClock className="card-icon" />
          <span>New Requests</span>
          <h2>{leadPoolCount}</h2>
          {hasNewRequests && <span className="new-badge">NEW</span>}
        </div>

        <div className="dashboard-card dashboard-card--active dashboard-card--clickable" role="button" tabIndex={0} onClick={() => handleCardClick("accepted", null)} onKeyDown={(e) => e.key === "Enter" && handleCardClick("accepted", null)}>
          <FaCheckCircle className="card-icon" />
          <span>Assigned to You</span>
          <h2>{summary.total}</h2>
        </div>

        <div className="dashboard-card dashboard-card--accepted dashboard-card--clickable" role="button" tabIndex={0} onClick={() => handleCardClick("accepted", "ACCEPTED")} onKeyDown={(e) => e.key === "Enter" && handleCardClick("accepted", "ACCEPTED")}>
          <FaCheckCircle className="card-icon" />
          <span>Accepted</span>
          <h2>{acceptedCounts.ACCEPTED ?? 0}</h2>
        </div>

        <div className="dashboard-card dashboard-card--expired dashboard-card--clickable" role="button" tabIndex={0} onClick={() => handleCardClick("active", "EXPIRED")} onKeyDown={(e) => e.key === "Enter" && handleCardClick("active", "EXPIRED")}>
          <FaClock className="card-icon" />
          <span>Already taken</span>
          <h2>{expiredCount}</h2>
        </div>

        <div className="dashboard-card dashboard-card--clickable" role="button" tabIndex={0} onClick={() => handleCardClick("account")} onKeyDown={(e) => e.key === "Enter" && handleCardClick("account")}>
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
              <div className="request-item request-item--clickable" key={request.id} role="button" tabIndex={0} onClick={() => handleActivityClick(request)} onKeyDown={(e) => e.key === "Enter" && handleActivityClick(request)}>
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

  const renderRequests = () => null;

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
          <button type="button" className="brand" onClick={() => selectSection("overview")}><span><img src={logo} alt="Tick My Bus" /></span>{/*<strong>TickMyBus</strong>*/}</button>
          <nav className={`top-nav ${menuOpen ? "is-open" : ""}`}>
            <button type="button" className={`top-nav-link ${activeSection === "overview" ? "active" : ""}`} onClick={() => selectSection("overview")}><FaHome /> Overview</button>
            {renderDropdown("Requests", "requests", requestLinks)}
            {renderDropdown("Operations", "operations", accountLinks)}
          </nav>
          <div className="header-actions">
            <div className="notif-bell-wrap" ref={notifDropdownRef}>
              <button type="button" className={`notification-btn ${hasNewRequests ? "notification-btn--alert" : ""}`} aria-label="Notifications" onClick={handleBellClick}>
                <FaBell />
                {unreadCount > 0 && <span className="notification-btn__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
              {notifDropdownOpen && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown__header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && <span className="notif-dropdown__unread">{unreadCount} new</span>}
                  </div>
                  <div className="notif-dropdown__list">
                    {notifications.length === 0 ? (
                      <div className="notif-dropdown__empty">
                        <FaBell />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((item) => (
                        <div key={item.id} className="notif-dropdown__item">
                          <div className="notif-dropdown__icon">
                            {item.type === "request" && <FaTicketAlt />}
                            {item.type === "accepted" && <FaCheckCircle />}
                            {item.type === "expired" && <FaClock />}
                            {(item.type === "credit" || item.type === "wallet") && <FaWallet />}
                            {!["request", "accepted", "expired", "credit", "wallet"].includes(item.type) && <FaBell />}
                          </div>
                          <div className="notif-dropdown__text">
                            <strong>{item.title}</strong>
                            <p>{item.message}</p>
                            <small>{item.time}</small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button type="button" className="notif-dropdown__viewall" onClick={handleNotifDropdownViewAll}>
                      View all notifications
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className={`profile-menu ${openDropdown === "profile" ? "is-open" : ""}`}>
              <button type="button" className="profile-trigger" onClick={() => setOpenDropdown(openDropdown === "profile" ? null : "profile")}><FaUserCircle /><span><strong>{user?.name || "Operator"}</strong><small>{user?.email || "Operator account"}</small></span><FaChevronDown /></button>
              <div className="profile-popover">
                <button type="button" onClick={() => selectSection("profile")}><FaUserCircle /> My profile</button>
                <button type="button" className="requests-item"><FaTicketAlt /> Requests <span className="requests-count">{requestPoints}</span></button>
                <button type="button" onClick={() => selectSection("settings")}><FaCog /> Settings</button>
                <button type="button" className="logout-button" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main">

        {activeSection === "overview" && renderOverview()}
        {activeSection === "active" && <ActiveRequests initialFilter={cardFilter} />}
        {activeSection === "accepted" && <AcceptedRequests onCountChange={handleAcceptedCounts} initialFilter={cardFilter} />}

        {activeSection === "wallet" && <Wallet />}
        {activeSection === "notifications" && <Notifications notifications={notifications} onClear={() => { setUnreadCount(0); setHasNewRequests(false); }} />}
        {activeSection === "profile" && <Profile />}
        {activeSection === "settings" && <Settings />}
        {activeSection === "requests" && null}
        {activeSection === "account" && renderAccount()}
      </main>

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-notification">
            <div className="toast-notification__icon">
              {toast.type === "credit" || toast.type === "wallet" ? <FaWallet /> : <FaTicketAlt />}
            </div>
            <div className="toast-notification__body">
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
              <small>{toast.detail}</small>
            </div>
            <button type="button" className="toast-notification__close" onClick={() => dismissToast(toast.id)}>
              <FaTimes />
            </button>
            <div className="toast-notification__progress" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperatorDashboardNew;
