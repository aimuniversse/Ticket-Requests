import { useState } from 'react'
import {
  FaArrowRight,
  FaBars,
  FaBell,
  FaBus,
  FaChevronDown,
  FaGlobe,
  FaHeart,
  FaTimes,
  FaUserCircle,
} from 'react-icons/fa'
import './Header.css'

const navItems = [
  'Home',
//   'Search Buses',
//   'Bus Rental',
//   'Routes',
//   'Operators',
//   'Offers',
  'About Us',
  'Contact',
]

function Header() {
  const [activeItem, setActiveItem] = useState('Home')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#home" aria-label="BusRent home">
          <span className="brand-icon">
            <FaBus />
          </span>
          <span className="brand-text">
            <strong>ANBU TRANSPORT</strong>
            <small>Premium Travel</small>
            
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primary">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`nav-link ${activeItem === item ? 'active' : ''}`}
                  onClick={() => setActiveItem(item)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button className="icon-button" type="button" aria-label="Notifications">
            <FaBell />
          </button>
          {/* <button className="lang-selector" type="button" aria-label="Change language">
            <FaGlobe />
            <span>EN</span>
            <FaChevronDown />
          </button>
          <button className="icon-button" type="button" aria-label="Wishlist">
            <FaHeart />
          </button> */}

          <div className="user-pill">
            <FaUserCircle />
            <span>customer login</span>
          </div>

          <a className="secondary-btn" href="#login">
            Login
          </a>
          <a className="ghost-btn" href="#register">
            Register
          </a>
          <a className="primary-btn" href="#book-now">
            Book Now
            <FaArrowRight />
          </a>
        </div>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <nav aria-label="Mobile">
          <ul className="mobile-links">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`mobile-link ${activeItem === item ? 'active' : ''}`}
                  onClick={() => {
                    setActiveItem(item)
                    setMobileOpen(false)
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-actions">
          <a className="secondary-btn" href="#login">
            Login
          </a>
          <a className="primary-btn" href="#book-now">
            Register
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
