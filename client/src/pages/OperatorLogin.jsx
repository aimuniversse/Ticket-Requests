import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { clearAppCache, getUserRole, isAuthenticated, storeAuth } from "../api/auth";
import "../styles/OperatorLogin.css";
import tickMyBusLogo from "../assets/logoc.png";
import logoImage from "../assets/logo.jpeg";


const OperatorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone_number: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Already signed in? Send the user straight to the right dashboard.
  useEffect(() => {
    if (!isAuthenticated()) return;
    const role = getUserRole();
    navigate(role === "admin" ? "/admin/dashboard" : "/operator/dashboard", { replace: true });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError("");

    try {
      const response = await API.post("auth/login/", {
        phone_number: formData.phone_number.trim(),
        password: formData.password,
      }, { skipAuth: true });

      const { access, refresh, user } = response.data || {};
      const role = (user?.role || response.data?.role || "").toString().toLowerCase();

      // Persist in BOTH storages: sessionStorage isolates this tab, localStorage
      // keeps the session across restarts. Drop any previous account's cache.
      storeAuth({ access, refresh, user, role });
      clearAppCache();

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");

      navigate(next || (role === "admin" ? "/admin/dashboard" : "/operator/dashboard"), { replace: true });
    } catch (error) {
      const apiError = error.response?.data;
      let message = "Login failed. Please try again.";

      if (typeof apiError === "string") {
        message = apiError;
      } else if (apiError?.detail) {
        message = apiError.detail;
      } else if (apiError?.non_field_errors?.[0]) {
        message = apiError.non_field_errors[0];
      } else if (apiError?.message) {
        message = apiError.message;
      }

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="operator-login-page">
      <div className="top-branding">TICKMYBUS</div>

      <div className="top-branding-animation">
        <div className="promo-illustration promo-bus">
          <div className="tickmybus-text">TICKMYBUS</div>
          <img className="animated-bus" src={tickMyBusLogo} alt="TickMyBus" />
        </div>
      </div>

      <div className="login-layout">
        <aside className="promo-panel promo-left">
          <div>
            <span className="promo-eyebrow">For Bus Operators</span>
            <h2 className="promo-heading">Grow Your Bus Business with TickMyBus</h2>

            <ul className="promo-features">
              <li><span className="promo-check">✓</span> More Bookings &amp; More Revenue</li>
              <li><span className="promo-check">✓</span> Secure Wallet Transactions</li>
              <li><span className="promo-check">✓</span> 24/7 Operator Support</li>
              <li><span className="promo-check">✓</span> Smart Reports &amp; Insights</li>
            </ul>

            <button type="button" className="promo-cta" onClick={() => window.open("https://demo.tickmybus.com/", "_blank")}>Join TickMyBus Today!</button>

          </div>
          <div className="promo-illustration promo-bus"> <div className="tickmybus-text">TICKMYBUS</div> <img className="animated-bus" src={tickMyBusLogo} alt="TickMyBus" /> </div>
        </aside>

        <div className="login-container">
          <div className="login-left">
            <div className="operator-brand">
              <img src={tickMyBusLogo} alt="TickMyBus" />
              <span>TickMyBus</span>
            </div>

            <h1>Operator portal</h1>

            <p>
              Manage ticket requests,
              send quotations,
              track wallet balance,
              and grow your bookings.
            </p>

            <div className="features">
              <div>✔ Receive Route Requests</div>
              <div>✔ Submit Ticket Quotes</div>
              <div>✔ Wallet & Earnings</div>
              <div>✔ Real-time Notifications</div>
            </div>
          </div>

          <div className="login-right">
            <div className="login-card">
              <h2>Welcome Back</h2>
              <p>Sign in to manage your bus ticket requests.</p>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Phone Number</label>

                  <input
                    type="tel"
                    name="phone_number"
                    placeholder="Enter your registered phone number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={10}
                  />

                  {errors.phone_number && (
                    <span className="error">{errors.phone_number}</span>
                  )}
                </div>

                <div className="input-group">
                  <label>Password</label>

                  <div className="password-box">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter Password"
                      value={formData.password}
                      onChange={handleChange}
                    />

                    <button
                      type="button"
                      className="show-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{showPassword ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>
                    </button>
                  </div>

                  {errors.password && (
                    <span className="error">{errors.password}</span>
                  )}
                </div>

                {serverError && <span className="error">{serverError}</span>}

                <div className="login-options">
                  <label>
                    <input type="checkbox" />
                    Remember Me
                  </label>

                  <Link to="/forgot-password">Forgot Password?</Link>
                </div>

                <button className="login-btn" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </button>

                <div className="register-text">
                  Don&apos;t have an account?
                  <Link to="/operator-register">Register</Link>
                </div>
              </form>

            </div>
          </div>
        </div>

        <aside className="promo-panel promo-right">
          <div>
            <h2 className="promo-heading">Simplify. Manage. Succeed.</h2>
            <p className="promo-text">
              Everything you need to run your bus business in one powerful platform.
            </p>

            <ul className="promo-features">
              <li><span className="promo-check">✓</span> Easy Ticket Management</li>
              <li><span className="promo-check">✓</span> Instant Notifications</li>
              <li><span className="promo-check">✓</span> Track Earnings in Real-time</li>
              <li><span className="promo-check">✓</span> Trusted by Operators</li>
            </ul>
          </div>
          <div className="promo-illustration promo-bus"> <div className="tickmybus-text">TICKMYBUS</div> <img className="animated-bus" src={tickMyBusLogo} alt="TickMyBus" /> </div>


          <div className="promo-brand-line">TickMyBus — Your Growth Partner</div>
        </aside>
      </div>
    </div>
  );
};

export default OperatorLogin;
