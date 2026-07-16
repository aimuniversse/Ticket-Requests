import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/OperatorRegister.css";
import tickMyBusLogo from "../assets/logoc.png";

const OperatorRegister = () => {
  const navigate = useNavigate();

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

      const response = await API.post("auth/register/", payload);

      if (response.data?.message) {
        alert(response.data.message);
      } else {
        alert("Registration successful");
      }

      navigate("/operator-login");
    } catch (error) {
      const apiError = error.response?.data;
      let message = "Registration failed. Please try again.";

      if (typeof apiError === "string") {
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
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Phone Number"
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

          </div>

        </div>

      </div>

    </div>
  );
};

export default OperatorRegister;
