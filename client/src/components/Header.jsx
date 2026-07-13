import { useState } from "react";
import {
  FaBars,
  FaBus,
  FaTimes,
  FaUserShield,
  FaUserTie,
} from "react-icons/fa";
import "../styles/Header.css";

const navItems = [
  "Home",
  "About Us",
  "Contact",
];

function Header() {
  const [activeItem, setActiveItem] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">

        {/* Logo */}

        <a className="brand" href="/">
          <span className="brand-icon">
            <FaBus />
          </span>

          <span className="brand-text">
            <strong>ANBU TRANSPORT</strong>
            <small>Operator Portal</small>
          </span>
        </a>

        {/* Desktop Navigation */}

        <nav className="desktop-nav">

          <ul className="nav-links">

            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`nav-link ${
                    activeItem === item ? "active" : ""
                  }`}
                  onClick={() => setActiveItem(item)}
                >
                  {item}
                </a>
              </li>
            ))}

          </ul>

        </nav>

        {/* Right Buttons */}

        <div className="header-actions">

          <a href="/operator-login" className="operator-btn">
            <FaUserTie />
            Operator Login
          </a>

          <a href="/admin-login" className="admin-btn">
            <FaUserShield />
            Admin Login
          </a>

        </div>

        {/* Mobile Button */}

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>

      </div>

      {/* Mobile Drawer */}

      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>

        <nav>

          <ul className="mobile-links">

            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => {
                    setActiveItem(item);
                    setMobileOpen(false);
                  }}
                >
                  {item}
                </a>
              </li>
            ))}

          </ul>

        </nav>

        <div className="mobile-actions">

          <a href="/operator-login" className="operator-btn">
            Operator Login
          </a>

          <a href="/admin-login" className="admin-btn">
            Admin Login
          </a>

        </div>

      </div>
    </header>
  );
}

export default Header;