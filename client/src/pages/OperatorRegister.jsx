import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/OperatorRegister.css";

const OperatorRegister = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    operatorName: "",
    email: "",
    phone: "",
    gst: "",
    password: "",
    confirmPassword: "",
    license: null,
    logo: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validate = () => {
    let err = {};

    if (!formData.companyName.trim())
      err.companyName = "Company name is required";

    if (!formData.operatorName.trim())
      err.operatorName = "Operator name is required";

    if (!formData.email.trim())
      err.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      err.email = "Invalid email";

    if (!formData.phone.trim())
      err.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      err.phone = "Enter valid mobile number";

    if (!formData.gst.trim())
      err.gst = "GST number is required";

    if (!formData.password)
      err.password = "Password is required";
    else if (formData.password.length < 6)
      err.password = "Minimum 6 characters";

    if (!formData.confirmPassword)
      err.confirmPassword = "Confirm password";

    if (formData.password !== formData.confirmPassword)
      err.confirmPassword = "Passwords do not match";

    if (!formData.license)
      err.license = "Upload license";

    if (!formData.logo)
      err.logo = "Upload company logo";

    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log(formData);

    // API Call
    // await axios.post("/api/operator/register", formData)

    alert("Registration Successful!");

    navigate("/operator-login");
  };

  return (
    <div className="operator-register-page">

      <div className="register-container">

        {/* Left Section */}

        <div className="register-left">

          <img
            src="https://cdn-icons-png.flaticon.com/512/3448/3448339.png"
            alt="Bus"
          />

          <h1>Become a Verified Operator</h1>

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

        {/* Right Section */}

        <div className="register-right">

          <div className="register-card">

            <h2>Create Operator Account</h2>

            <p>Fill your company information below.</p>

            <form onSubmit={handleSubmit}>

              <div className="input-group">
                <label>Company Name</label>

                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                />

                <span className="error">
                  {errors.companyName}
                </span>
              </div>

              <div className="input-group">
                <label>Operator Name</label>

                <input
                  type="text"
                  name="operatorName"
                  value={formData.operatorName}
                  onChange={handleChange}
                  placeholder="Operator Name"
                />

                <span className="error">
                  {errors.operatorName}
                </span>
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

                  <span className="error">
                    {errors.email}
                  </span>

                </div>

                <div className="input-group">

                  <label>Phone</label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                  />

                  <span className="error">
                    {errors.phone}
                  </span>

                </div>

              </div>

              <div className="input-group">

                <label>GST Number</label>

                <input
                  type="text"
                  name="gst"
                  value={formData.gst}
                  onChange={handleChange}
                  placeholder="GST Number"
                />

                <span className="error">
                  {errors.gst}
                </span>

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

              <div className="input-group">

                <label>Upload License</label>

                <input
                  type="file"
                  name="license"
                  onChange={handleChange}
                />

                <span className="error">
                  {errors.license}
                </span>

              </div>

              <div className="input-group">

                <label>Upload Company Logo</label>

                <input
                  type="file"
                  name="logo"
                  onChange={handleChange}
                />

                <span className="error">
                  {errors.logo}
                </span>

              </div>

              <button
                type="submit"
                className="register-btn"
              >
                Create Account
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