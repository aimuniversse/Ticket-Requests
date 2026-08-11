import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import "../styles/OperatorRegister.css";
import tickMyBusLogo from "../assets/logoc.png";

const OperatorRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    services: [
      {
        from_location: "",
        to_location: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone_number: digits }));
      setErrors((prev) => ({ ...prev, phone_number: "" }));
      setServerError("");
      return;
    }

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

  const handleServiceChange = (e, index, field) => {
    const { value } = e.target;

    setFormData((prev) => {
      const services = [...prev.services];
      services[index] = {
        ...services[index],
        [field]: value,
      };

      return {
        ...prev,
        services,
      };
    });
  };

  const validate = () => {
    const err = {};

    if (!formData.name.trim()) err.name = "Operator name is required";

    if (!formData.phone_number.trim()) {
      err.phone_number = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone_number)) {
      err.phone_number = "Enter valid mobile number";
    }

    if (!formData.email.trim()) {
      err.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      err.email = "Invalid email";
    }

    if (!formData.password) {
      err.password = "Password is required";
    } else if (formData.password.length < 6) {
      err.password = "Minimum 6 characters";
    }

    if (!formData.confirmPassword) {
      err.confirmPassword = "Confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      err.confirmPassword = "Passwords do not match";
    }

    if (!formData.company_name.trim()) {
      err.company_name = "Company name is required";
    }

    if (!formData.services[0]?.from_location?.trim()) {
      err.serviceFrom = "From location is required";
    }

    if (!formData.services[0]?.to_location?.trim()) {
      err.serviceTo = "To location is required";
    }

    return err;
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
      const payload = {
        name: formData.name.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim(),
        password: formData.password,
        company_name: formData.company_name.trim(),
        services: formData.services,
      };

      // Registration is public; do not attach a stale operator/admin token.
      const response = await API.post("auth/register/", payload, { skipAuth: true });

      setSuccessMessage(
        response.data?.message ||
          "Registration successful! Our admin team will contact you shortly. Please wait for approval."
      );
      return;
    } catch (error) {
      const status = error.response?.status;
      const apiError = error.response?.data;
      let message = "Registration failed. Please try again.";

      const isDuplicate =
        status === 500 ||
        (typeof apiError === "string" &&
          /IntegrityError|UNIQUE constraint failed|already (?:exists|registered)/i.test(
            apiError
          )) ||
        (apiError &&
          (apiError.phone_number || apiError.email || apiError.non_field_errors));

      if (isDuplicate) {
        message =
          "This phone number and email address are already registered.";
      } else if (typeof apiError === "string") {
        message = apiError;
      } else if (apiError?.detail) {
        message = apiError.detail;
      } else if (apiError?.message) {
        message = apiError.message;
      }

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="operator-register-page">
      <div className="top-branding">TICKMYBUS</div>

      <div className="top-branding-animation">
        <div className="promo-illustration promo-bus">
          <div className="tickmybus-text">TICKMYBUS</div>
          <svg className="animated-bus" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animated bus illustration"> <path d="M28 136 h184" stroke="rgba(236, 18, 18, 0.35)" strokeWidth="3" strokeLinecap="round" /> <rect x="34" y="50" width="158" height="58" rx="13" fill="rgba(44, 41, 41, 0.93)" /> <polygon points="192,50 208,60 208,100 192,108" fill="rgba(145, 76, 162, 0.91)" /> <rect x="46" y="22" width="24" height="22" rx="6" fill="rgba(231, 23, 23, 0.92)" /> <rect x="78" y="22" width="24" height="22" rx="6" fill="rgba(235, 19, 19, 0.92)" /> <rect x="110" y="22" width="24" height="22" rx="6" fill="rgba(232, 27, 27, 0.92)" /> <rect x="142" y="22" width="24" height="22" rx="6" fill="rgba(237, 19, 19, 0.92)" /> <rect x="44" y="80" width="34" height="28" rx="5" fill="rgba(255,255,255,0.30)" /> <rect x="92" y="80" width="88" height="28" rx="5" fill="rgba(255,255,255,0.30)" /> <circle cx="36" cy="70" r="4.5" fill="#ffd23f" /> <circle className="bus-wheel wheel-left" cx="72" cy="120" r="16" fill="rgba(5, 5, 5, 0.42)" /> <circle className="bus-wheel wheel-left" cx="72" cy="120" r="7" fill="rgba(18, 17, 17, 0.9)" /> <circle className="bus-wheel wheel-right" cx="168" cy="120" r="16" fill="rgba(7, 7, 7, 0.42)" /> <circle className="bus-wheel wheel-right" cx="168" cy="120" r="7" fill="rgba(14, 14, 14, 0.9)" /> </svg>
        </div>
      </div>

      <div className="register-layout">
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

      <div className="register-container">

        <div className="register-left">
          <div className="operator-brand">
            <img src={tickMyBusLogo} alt="TickMyBus" />
            <span>TickMyBus</span>
          </div>

          <h1>Grow with TickMyBus</h1>

          <p>
            Join our transport network and receive
            customer ticket requests directly.
          </p>

          <div className="register-features">

            <div>✔ Receive Daily Ticket Requests</div>

            <div>✔ Quote Ticket Prices</div>

            <div>✔ Manage Wallet & Earnings</div>

            <div>✔ Grow Your Business</div>

          </div>

        </div>

        <div className="register-right">

          <div className="register-card">

            {successMessage ? (
              <div className="register-success">
                <div className="register-success-icon">✓</div>
                <h2>Registration Submitted</h2>
                <p>{successMessage}</p>
                <Link to="/operator-login" className="register-btn register-btn--link">Go to Login</Link>
              </div>
            ) : (
              <>

            <h2>Create Operator Account</h2>

            <p>Fill your company information below.</p>

            <form onSubmit={handleSubmit}>

              <div className="input-group">
                <label>Operator Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Operator Name"
                />

                <span className="error">{errors.name}</span>
              </div>

              <div className="input-group">
                <label>Company Name</label>

                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Company Name"
                />

                <span className="error">{errors.company_name}</span>
              </div>

              <div className="two-column">
                <div className="input-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                  />

                  <span className="error">{errors.email}</span>
                </div>

                <div className="input-group">
                  <label>Phone</label>

                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    inputMode="numeric"
                    maxLength={10}
                  />

                  <span className="error">{errors.phone_number}</span>
                </div>
              </div>

              <div className="input-group">
                <label>Service Route</label>

                <div className="two-column">
                  <input
                    type="text"
                    placeholder="From Location"
                    value={formData.services[0]?.from_location || ""}
                    onChange={(e) => handleServiceChange(e, 0, "from_location")}
                  />

                  <input
                    type="text"
                    placeholder="To Location"
                    value={formData.services[0]?.to_location || ""}
                    onChange={(e) => handleServiceChange(e, 0, "to_location")}
                  />
                </div>

                <span className="error">{errors.serviceFrom}</span>
                <span className="error">{errors.serviceTo}</span>
              </div>

              <div className="two-column">

                <div className="input-group">

                  <label>Password</label>

                  <div className="password-box">

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                    />

                    <button
                      type="button"
                      className="show-btn"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                  <span className="error">
                    {errors.password}
                  </span>

                </div>

                <div className="input-group">

                  <label>Confirm Password</label>

                  <div className="password-box">

                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                    />

                    <button
                      type="button"
                      className="show-btn"
                      onClick={() =>
                        setShowConfirm(!showConfirm)
                      }
                    >
                      {showConfirm ? "Hide" : "Show"}
                    </button>

                  </div>

                  <span className="error">
                    {errors.confirmPassword}
                  </span>

                </div>

              </div>

              {serverError && <span className="error">{serverError}</span>}

              <button type="submit" className="register-btn" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </button>

            </form>

            <div className="login-link">

              Already have an account?

              <Link to="/operator-login">
                Login
              </Link>

            </div>

              </>
            )}

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

export default OperatorRegister;
