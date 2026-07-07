import Header from './Header'
import Footer from './Footer'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main" id="home">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="hero-eyebrow">Premium Bus Rental & Ticket Booking</p>
            <h1>Travel in comfort with BusRent.</h1>
            <p>
              Reserve seats, charter buses, and plan seamless group journeys with a
              premium experience built for modern travelers.
            </p>
            <div className="hero-actions">
              <a className="primary-btn" href="#book-now">
                Book Your Trip
              </a>
              <a className="ghost-btn" href="#routes">
                Explore Routes
              </a>
            </div>
          </div>
          <div className="hero-card" aria-label="featured deal">
            <h2>Today’s Featured Deal</h2>
            <p>Save up to 25% on premium intercity routes this week.</p>
            <ul>
              <li>Flexible ticket changes</li>
              <li>Airport transfers</li>
              <li>Corporate travel support</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
