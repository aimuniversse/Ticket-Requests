import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa'
import '../styles/Footer.css'

const companyLinks =[]
const serviceLinks = [
  'Bus Ticket Booking',
  'Bus Rental',
  'Corporate Travel',
  'School Trips',
  'Holiday Packages',
]
const supportLinks = [
  'Help Center',
  'FAQs',
  'Contact Us',
  'Cancellation Policy',
  'Refund Policy',
]
const socialLinks = [
  { label: 'Facebook', icon: <FaFacebookF /> },
  { label: 'Instagram', icon: <FaInstagram /> },
  { label: 'LinkedIn', icon: <FaLinkedinIn /> },
  { label: 'X', icon: <FaTwitter /> },
  { label: 'YouTube', icon: <FaYoutube /> },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-newsletter">
        <div>
          <p className="eyebrow">Travel smarter</p>
          <h2>Subscribe for Travel Deals</h2>
          <p>Receive premium offers, route updates, and exclusive rental discounts.</p>
        </div>
        <form className="newsletter-form">
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input id="newsletter-email" type="email" placeholder="Enter your email" />
          <button type="submit">Subscribe</button>
        </form>
      </div>

      <div className="footer-main">
        <div className="footer-column company-column">
          <div className="footer-brand">
            <span className="brand-icon-footer">🚌</span>
            <div>
              <strong>ANBU TRANSPORT</strong>
              <p>Reliable buses, premium comfort, effortless booking.</p>
            </div>
          </div>
          <ul className="footer-links">
            {companyLinks.map((link) => (
              <li key={link}>
                <a href="#">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <h3>Services</h3>
          <ul className="footer-links">
            {serviceLinks.map((link) => (
              <li key={link}>
                <a href="#">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <h3>Support</h3>
          <ul className="footer-links">
            {supportLinks.map((link) => (
              <li key={link}>
                <a href="#">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <h3>Contact</h3>
          <ul className="footer-links contact-links">
            <li>Coimbatore, Tamil Nadu</li>
            <li>+919092748488</li>
            <li>anbutransport@gmail.com</li>
            <li>Mon – Sun • 24/7 Support</li>
          </ul>
          <div className="social-links" aria-label="Social media">
            {socialLinks.map((social) => (
              <a key={social.label} href="#" aria-label={social.label}>
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 ANBU TRANSPORT. All Rights Reserved.</p>
        <div className="bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
