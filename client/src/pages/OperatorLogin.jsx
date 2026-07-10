import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/OperatorLogin.css";

const OperatorLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log("Operator Login");

    console.log(formData);

    // Backend API

    // await axios.post("/api/operator/login", formData)

    navigate("/operator/dashboard");
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

            <p>Login to your operator account</p>

            <form onSubmit={handleSubmit}>

              {/* Email */}

              <div className="input-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                />

                {errors.email && (
                  <span className="error">
                    {errors.email}
                  </span>
                )}

              </div>

              {/* Password */}

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
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                {errors.password && (
                  <span className="error">
                    {errors.password}
                  </span>
                )}

              </div>

              <div className="login-options">

                <label>

                  <input type="checkbox" />

                  Remember Me

                </label>

                <Link to="/forgot-password">
                  Forgot Password?
                </Link>

              </div>

              <button className="login-btn">
                Login
              </button>
              <div className="register-text">
  Don't have an account?
  <Link to="/operator-register">
    Register
  </Link>
</div>

            </form>

            <div className="divider">
              OR
            </div>

            <p className="register-link">

              Don't have an account?

              <Link to="/operator-register">
                Register Here
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OperatorLogin;