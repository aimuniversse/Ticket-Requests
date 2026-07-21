import { useEffect, useMemo, useState } from "react";
import {
  FaUser,
  FaPhone,
  FaTicketAlt,
  FaSearch,
  FaSyncAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBus,
  FaMoneyBillWave,
  FaLock,
  FaUnlock,
  FaInfoCircle,
} from "react-icons/fa";
import API from "../../api/axios";
import "../../styles/CustomerDetailsUnlock.css";
import "../../styles/ActiveRequests.css";

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(`${date}T00:00:00`))
    : "—";

const CustomerDetailsUnlock = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadRequests = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const response = await API.get("auth/requests/assigned/");
      setRequests(response.data || []);
      setError("");
    } catch (err) {
      setError(
        err?.response?.status === 401
          ? "Please sign in again as an operator to view customer details."
          : "Unable to load customer details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(true);
    const timer = window.setInterval(() => loadRequests(false), 10000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredRequests = useMemo(() => {
    const search = query.trim().toLowerCase();
    return requests.filter((item) => {
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      if (!search) return matchesStatus;

      const haystack = [
        item.request_id,
        item.from_location,
        item.to_location,
        item.name,
        item.phone_number,
        item.bus_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && haystack.includes(search);
    });
  }, [requests, query, statusFilter]);

  return (
    <section className="requests-page customer-details-page">
      <header className="requests-page__header">
        <div>
          <p className="requests-page__eyebrow">Customer information</p>
          <h1>Customer Details</h1>
          <p>
            View full customer details for every request you have accepted.
            Contact information is unlocked after acceptance.
          </p>
        </div>
        <button
          type="button"
          className="table-action table-action--secondary"
          onClick={() => loadRequests(true)}
        >
          <FaSyncAlt /> Refresh
        </button>
      </header>

      {error && (
        <p className="requests-notice requests-notice--error">{error}</p>
      )}

      <div className="request-table-card">
        <div className="request-table-card__bar">
          <div>
            <strong>{filteredRequests.length}</strong> customer
            {filteredRequests.length === 1 ? "" : "s"}
          </div>
          <div className="accepted-filters">
            <label className="accepted-filter">
              <FaSearch />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, phone, route, request ID..."
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="requests-empty">
            <FaSyncAlt className="requests-empty__icon requests-empty__icon--spin" />
            <h2>Loading customer details</h2>
            <p>Fetching customer information from the server.</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="requests-empty">
            <FaInfoCircle className="requests-empty__icon" />
            <h2>No customer details found</h2>
            <p>
              Customer details will appear here once you accept requests from
              the active queue.
            </p>
          </div>
        ) : (
          <div className="customer-cards-grid">
            {filteredRequests.map((item) => (
              <div
                key={item.id}
                className={`customer-detail-card ${item.contact_unlocked ? "customer-detail-card--unlocked" : "customer-detail-card--locked"}`}
              >
                <div className="customer-detail-card__header">
                  <div className="customer-detail-card__id">
                    <FaTicketAlt />
                    <span>{item.request_id || `#${item.id}`}</span>
                  </div>
                  <span
                    className={`status-pill ${
                      item.status === "ACCEPTED"
                        ? "status-pill--accepted"
                        : item.status === "COMPLETED"
                          ? "status-pill--completed"
                          : item.status === "ASSIGNED"
                            ? "status-pill--assigned"
                            : "status-pill--pending"
                    }`}
                  >
                    {item.status
                      ? `${item.status[0]}${item.status.slice(1).toLowerCase()}`
                      : "—"}
                  </span>
                </div>

                <div className="customer-detail-card__route">
                  <FaMapMarkerAlt />
                  <strong>
                    {item.from_location} → {item.to_location}
                  </strong>
                </div>

                <div className="customer-detail-card__meta">
                  <span>
                    <FaCalendarAlt /> {formatDate(item.journey_date)}
                    {item.journey_time ? ` • ${item.journey_time}` : ""}
                  </span>
                  <span>
                    <FaBus />{" "}
                    {item.bus_type?.replaceAll("_", " ") || "—"}
                  </span>
                  <span>
                    <FaMoneyBillWave /> ₹{item.expected_price}
                  </span>
                  <span>Seats: {item.total_tickets}</span>
                </div>

                <div className="customer-detail-card__contact">
                  {item.contact_unlocked ? (
                    <>
                      <div className="customer-detail-card__unlock-badge">
                        <FaUnlock /> Details Unlocked
                      </div>
                      <div className="customer-detail-card__info">
                        <div className="customer-detail-card__field">
                          <FaUser />
                          <div>
                            <span>Customer Name</span>
                            <h4>{item.name || "—"}</h4>
                          </div>
                        </div>
                        <div className="customer-detail-card__field">
                          <FaPhone />
                          <div>
                            <span>Phone Number</span>
                            <h4>{item.phone_number || "—"}</h4>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="customer-detail-card__locked">
                      <FaLock />
                      <span>
                        Accept this lead to unlock customer contact details
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerDetailsUnlock;
