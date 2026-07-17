import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import "../styles/OperatorLogin.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError(""); setMessage("");
    if (!email.trim()) { setError("Enter your registered email address."); return; }
    setLoading(true);
    try {
      const response = await API.post("auth/password/forgot/", { email: email.trim() }, { skipAuth: true });
      setMessage(response.data?.message || "Password reset email sent successfully.");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.email?.[0] || data?.detail || "Unable to send the reset email. Please try again.");
    } finally { setLoading(false); }
  };

  return <div className="operator-login-page"><div className="login-container password-flow"><div className="login-left"><h1>Reset your password</h1><p>Enter the email attached to your operator account. We’ll send you a secure reset link.</p></div><div className="login-right"><div className="login-card"><h2>Forgot password?</h2><p>We’ll email instructions to reset your password.</p><form onSubmit={submit}><div className="input-group"><label>Email address</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></div>{error && <span className="error">{error}</span>}{message && <span className="success-message">{message}</span>}<button className="login-btn" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button></form><div className="register-text"><Link to="/operator-login">Back to login</Link></div></div></div></div></div>;
};

export default ForgotPassword;
