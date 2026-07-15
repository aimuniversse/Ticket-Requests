import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/OperatorLogin.css";

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
      });

      const { access, refresh, user } = response.data || {};
      const role = (user?.role || response.data?.role || "").toString().toLowerCase();

      if (access) {
        localStorage.setItem("accessToken", access);
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
      <div className="login-container">
        {/* Left Section */}
        <div className="login-left">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3448/3448339.png"
            alt="Bus"
          />

          <h1>Operator Portal</h1>

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

        {/* Right Section */}
        <div className="login-right">
          <div className="login-card">
            <h2>Welcome Back</h2>
            <p>Login to your admin or operator account</p>

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

            <div className="divider">OR</div>

            <p className="register-link">
              Don&apos;t have an account?
              <Link to="/operator-register">Register Here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorLogin;