import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
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

      if (access) {
        localStorage.setItem("accessToken", access);
        localStorage.setItem("access", access);
        localStorage.setItem("token", access);
      }

      if (refresh) {
        localStorage.setItem("refreshToken", refresh);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      if (role === "admin") {
        localStorage.setItem("userRole", "admin");
        navigate("/admin/dashboard");
        return;
      }

      localStorage.setItem("userRole", role || "operator");
      navigate("/operator/dashboard");
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
          <svg className="animated-bus" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animated bus illustration"> <path d="M28 136 h184" stroke="rgba(236, 18, 18, 0.35)" strokeWidth="3" strokeLinecap="round" /> <rect x="34" y="50" width="158" height="58" rx="13" fill="rgba(44, 41, 41, 0.93)" /> <polygon points="192,50 208,60 208,100 192,108" fill="rgba(145, 76, 162, 0.91)" /> <rect x="46" y="22" width="24" height="22" rx="6" fill="rgba(231, 23, 23, 0.92)" /> <rect x="78" y="22" width="24" height="22" rx="6" fill="rgba(235, 19, 19, 0.92)" /> <rect x="110" y="22" width="24" height="22" rx="6" fill="rgba(232, 27, 27, 0.92)" /> <rect x="142" y="22" width="24" height="22" rx="6" fill="rgba(237, 19, 19, 0.92)" /> <rect x="44" y="80" width="34" height="28" rx="5" fill="rgba(255,255,255,0.30)" /> <rect x="92" y="80" width="88" height="28" rx="5" fill="rgba(255,255,255,0.30)" /> <circle cx="36" cy="70" r="4.5" fill="#ffd23f" /> <circle className="bus-wheel wheel-left" cx="72" cy="120" r="16" fill="rgba(5, 5, 5, 0.42)" /> <circle className="bus-wheel wheel-left" cx="72" cy="120" r="7" fill="rgba(18, 17, 17, 0.9)" /> <circle className="bus-wheel wheel-right" cx="168" cy="120" r="16" fill="rgba(7, 7, 7, 0.42)" /> <circle className="bus-wheel wheel-right" cx="168" cy="120" r="7" fill="rgba(14, 14, 14, 0.9)" /> </svg>
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

            <button type="button" className="promo-cta" onClick={() => window.location.href = "https://demo.tickmybus.com/"}>Join TickMyBus Today!</button>
          </div>
          <div className="promo-illustration promo-bus"> <div className="tickmybus-text">TICKMYBUS</div> <svg className="animated-bus" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animated bus illustration" > <path d="M28 136 h184" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round" /> <rect x="34" y="50" width="158" height="58" rx="13" fill="rgba(255,255,255,0.18)" /> <polygon points="192,50 208,60 208,100 192,108" fill="rgba(255,255,255,0.45)" /> <rect x="46" y="22" width="24" height="22" rx="6" fill="rgba(255,255,255,0.92)" /> <rect x="78" y="22" width="24" height="22" rx="6" fill="rgba(255,255,255,0.92)" /> <rect x="110" y="22" width="24" height="22" rx="6" fill="rgba(255,255,255,0.92)" /> <rect x="142" y="22" width="24" height="22" rx="6" fill="rgba(255,255,255,0.92)" /> <rect x="44" y="80" width="34" height="28" rx="5" fill="rgba(255,255,255,0.30)" /> <rect x="92" y="80" width="88" height="28" rx="5" fill="rgba(255,255,255,0.30)" /> <circle cx="36" cy="70" r="4.5" fill="#ffd23f" /> <circle className="bus-wheel wheel-left" cx="72" cy="120" r="16" fill="rgba(255,255,255,0.42)" /> <circle className="bus-wheel wheel-left" cx="72" cy="120" r="7" fill="rgba(255,255,255,0.9)" /> <circle className="bus-wheel wheel-right" cx="168" cy="120" r="16" fill="rgba(255,255,255,0.42)" /> <circle className="bus-wheel wheel-right" cx="168" cy="120" r="7" fill="rgba(255,255,255,0.9)" /> </svg> </div>
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
                    {showPassword ? "Hide" : "Show"}
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
           <div className="promo-illustration promo-bus"> <div className="tickmybus-text">TICKMYBUS</div> <svg className="animated-bus" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animated bus illustration" > <path d="M28 136 h184" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round" /> <rect x="34" y="50" width="158" height="58" rx="13" fill="rgba(255,255,255,0.18)" /> <polygon points="192,50 208,60 208,100 192,108" fill="rgba(255,255,255,0.45)" /> <rect x="46" y="22" width="24" height="22" rx="6" fill="rgba(255,255,255,0.92)" /> <rect x="78" y="22" width="24" height="22" rx="6" fill="rgba(255,255,255,0.92)" /> <rect x="110" y="22" width="24" height="22" rx="6" fill="rgba(255,255,255,0.92)" /> <rect x="142" y="22" width="24" height="22" rx="6" fill="rgba(255,255,255,0.92)" /> <rect x="44" y="80" width="34" height="28" rx="5" fill="rgba(255,255,255,0.30)" /> <rect x="92" y="80" width="88" height="28" rx="5" fill="rgba(255,255,255,0.30)" /> <circle cx="36" cy="70" r="4.5" fill="#ffd23f" /> <circle className="bus-wheel wheel-left" cx="72" cy="120" r="16" fill="rgba(255,255,255,0.42)" /> <circle className="bus-wheel wheel-left" cx="72" cy="120" r="7" fill="rgba(255,255,255,0.9)" /> <circle className="bus-wheel wheel-right" cx="168" cy="120" r="16" fill="rgba(255,255,255,0.42)" /> <circle className="bus-wheel wheel-right" cx="168" cy="120" r="7" fill="rgba(255,255,255,0.9)" /> </svg> </div>


          <div className="promo-brand-line">TickMyBus — Your Growth Partner</div>
        </aside>
      </div>
    </div>
  );
};

export default OperatorLogin;
