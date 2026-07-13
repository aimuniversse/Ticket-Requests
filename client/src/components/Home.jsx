import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from "react-router-dom";

import '../styles/Home.css'

function App() {
  return (
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
    <Link className="primary-btn" to="/ticket-request">
        Book Your Ticket
    </Link>

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
}

export default App
