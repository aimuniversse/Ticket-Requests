import { Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import OperatorLogin from "./pages/OperatorLogin";
import OperatorRegister from "./pages/OperatorRegister";
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import TicketRequestForm from "./components/TicketRequest/TicketRequestForm";

function App() {
  return (
<<<<<<< HEAD
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/operator-login" element={<OperatorLogin />} />
      <Route path="/operator-register" element={<OperatorRegister />} />
      <Route path="/operator/dashboard" element={<OperatorDashboard />} />
      <Route path="ticket-request" element={<TicketRequestForm />} />
    </Routes>
  );
=======
    <div className="app-shell">
      <Header />
      <main className="app-main" id="home">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="hero-eyebrow">Premium Bus Ticket Booking</p>
            <h1>Travel in comfort with Bus Booking.</h1>
            <p>
              Reserve seats, charter buses, and plan seamless group journeys with a
              premium experience built for modern travelers.
            </p>
            <div className="hero-actions">
              <a className="primary-btn" href="#book-now">
                Book Your Ticket
              </a>
              {/* <a className="ghost-btn" href="#routes">
                Explore Routes
              </a> */}
            </div>
          </div>
          <a
            className="hero-card"
            href="https://demo.tickmybus.com/"
            aria-label="featured deal"
          >
            <h2>Today’s Featured Deal</h2>
            <p>Save up to 25% on premium intercity routes this week.</p>
            <ul>
              <li>Flexible ticket changes</li>
              <li>All Operatores Support</li>
              <li>Corporate travel support</li>
            </ul>
          </a>
        </section>
      </main>
      <Footer />
    </div>
  )
>>>>>>> f256a3c2e0e651e2083e29ec6167f6e3700f041e
}

export default App;