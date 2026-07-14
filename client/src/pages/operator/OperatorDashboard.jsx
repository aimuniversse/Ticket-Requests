import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/OperatorDashboard.css";
import RequestCard from "./RequestCard";
import AcceptQuoteModal from "./AcceptQuoteModal";
import CustomerDetailsUnlock from "./CustomerDetailsUnlock";
import ActiveRequests from "./ActiveRequests";
import AcceptedRequests from "./AcceptedRequests";

import {
  FaBus,
  FaHome,
  FaWallet,
  FaTicketAlt,
  FaBell,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaBars,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

const OperatorDashboard = () => {
  const location = useLocation();

  // Dashboard summary (Backend will replace this)
  const [dashboard] = useState({
    walletBalance: "",
    todayRequests: "",
    activeRequests: "",
    acceptedToday: "",
  });

  // Live requests (Backend will populate)
  const [requests] = useState([]);

  return (
    <div className="dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="logo">

          <FaBus />

          <h2>TicketMyBus</h2>

        </div>

        <ul>

          <li className={location.pathname === "/operator/dashboard" ? "active" : ""}>
            <Link to="/operator/dashboard">
              <FaHome />
              Dashboard
            </Link>
          </li>

          <li className={location.pathname === "/operator/request-card" ? "active" : ""}>
            <Link to="/operator/request-card">
              <FaTicketAlt />
              Ticket Requests
            </Link>
          </li>

          <li className={location.pathname === "/operator/active-requests" ? "active" : ""}>
            <Link to="/operator/active-requests">
              <FaClock />
              Active Requests
            </Link>
          </li>

          <li className={location.pathname === "/operator/accepted-requests" ? "active" : ""}>
            <Link to="/operator/accepted-requests">
              <FaCheckCircle />
              Accepted Requests
            </Link>
          </li>

          <li className={location.pathname === "/operator/wallet" ? "active" : ""}>
            <Link to="/operator/wallet">
              <FaWallet />
              Wallet
            </Link>
          </li>

          <li className={location.pathname === "/operator/transactions" ? "active" : ""}>
            <Link to="/operator/transactions">
              <FaMoneyBillWave />
              Transactions
            </Link>
          </li>

          <li className={location.pathname === "/operator/notifications" ? "active" : ""}>
            <Link to="/operator/notifications">
              <FaBell />
              Notifications
            </Link>
          </li>

          <li className={location.pathname === "/operator/profile" ? "active" : ""}>
            <Link to="/operator/profile">
              <FaUserCircle />
              Profile
            </Link>
          </li>

          <li className={location.pathname === "/operator/settings" ? "active" : ""}>
            <Link to="/operator/settings">
              <FaCog />
              Settings
            </Link>
          </li>

          <li className="logout">
            <Link to="/operator-login">
              <FaSignOutAlt />
              Logout
            </Link>
          </li>

        </ul>

      </aside>

      {/* Main */}

      <main className="main">

        {/* Topbar */}

        <div className="topbar">

          <div className="left">

            <FaBars className="menu" />

            <h2>Operator Dashboard</h2>

          </div>

          <div className="right">

            <input
              type="text"
              placeholder="Search Request..."
            />

            <FaBell className="icon" />

            <FaUserCircle className="profile" />

          </div>

        </div>

        {/* Welcome */}

        <section className="welcome">

          <h1>Welcome Back 👋</h1>

          <p>

            Receive ticket price requests,
            accept them within 5 minutes,
            and unlock customer details after wallet payment.

          </p>

        </section>

        {/* Dashboard Cards */}

        <section className="dashboard-cards">

          <div className="dashboard-card">

            <FaWallet className="card-icon" />

            <span>Wallet Balance</span>

            <h2>

              {dashboard.walletBalance || "--"}

            </h2>

          </div>

          <div className="dashboard-card">

            <FaTicketAlt className="card-icon" />

            <span>Today's Requests</span>

            <h2>

              {dashboard.todayRequests || "--"}

            </h2>

          </div>

          <div className="dashboard-card">

            <FaClock className="card-icon" />

            <span>Active Requests</span>

            <h2>

              {dashboard.activeRequests || "--"}

            </h2>

          </div>

          <div className="dashboard-card">

            <FaCheckCircle className="card-icon" />

            <span>Accepted Today</span>

            <h2>

              {dashboard.acceptedToday || "--"}

            </h2>

          </div>

        </section>

        {/* Live Requests */}

        <section className="live-request-section">

          <div className="section-title">

            <h2>Live Ticket Requests</h2>

            <span>
              Accept within 5 minutes
            </span>

          </div>

          {
            requests.length === 0 ? (

              <div className="empty-request">

                <FaTicketAlt className="empty-icon" />

                <h3>No Live Requests</h3>

                <p>

                  New customer requests
                  will appear here automatically.

                </p>

              </div>

            ) : (

              <div className="request-grid">

                {
                  requests.map((request) => (

                    <div
                      className="request-card"
                      key={request.id}
                    >

                      <div className="request-header">

                        <h3>

                          {request.from}

                          →

                          {request.to}

                        </h3>

                        <span className="timer">

                          {request.remainingTime}

                        </span>

                      </div>

                      <div className="request-body">

                        <p>

                          <strong>Journey :</strong>

                          {request.date}

                        </p>

                        <p>

                          <strong>Passengers :</strong>

                          {request.passengers}

                        </p>

                        <p>

                          <strong>Bus :</strong>

                          {request.busType}

                        </p>

                        <p>

                          <strong>Budget :</strong>

                          ₹ {request.budget}

                        </p>

                      </div>

                      <div className="request-footer">

                        <button className="accept-btn">

                          Accept

                        </button>

                        <button className="reject-btn">

                          Reject

                        </button>

                      </div>

                    </div>

                  ))
                }

              </div>

            )
          }

        </section>

      </main>

    </div>
  );

};

export default OperatorDashboard;