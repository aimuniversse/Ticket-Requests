import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/NotFound.css";

function NotFound() {
  return (
    <div className="notfound-page">
      <Header />
      <main className="notfound-main">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-text">
          The page you are looking for doesn't exist or may have been moved.
          Please check the URL or head back home.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn">Go to Home</Link>
          <Link to="/ticket-request" className="notfound-btn notfound-btn-secondary">Book a Ticket</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFound;
