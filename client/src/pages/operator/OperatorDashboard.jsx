import { useState } from "react";
import "../../styles/OperatorDashboard.css";
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

          <li className="active">
            <FaHome />
            Dashboard
          </li>

          <li>
            <FaTicketAlt />
            Ticket Requests
          </li>

          <li>
            <FaClock />
            Active Requests
          </li>

          <li>
            <FaCheckCircle />
            Accepted Requests
          </li>

          <li>
            <FaWallet />
            Wallet
          </li>

          <li>
            <FaMoneyBillWave />
            Transactions
          </li>

          <li>
            <FaBell />
            Notifications
          </li>

          <li>
            <FaUserCircle />
            Profile
          </li>

          <li>
            <FaCog />
            Settings
          </li>

          <li className="logout">
            <FaSignOutAlt />
            Logout
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