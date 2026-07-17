import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import "../styles/OperatorLogin.css";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [form, setForm] = useState({ new_password: "", confirm_password: "" });
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    if (form.new_password.length < 8) { setError("Password must contain at least 8 characters."); return; }
    if (form.new_password !== form.confirm_password) { setError("Passwords do not match."); return; }
    setLoading(true);
    try { const response = await API.post("auth/password/reset/confirm/", { uid, token, ...form }, { skipAuth: true }); setMessage(response.data?.message || "Password reset successfully."); }
    catch (err) { const data = err.response?.data; setError(data?.token?.[0] || data?.uid?.[0] || data?.confirm_password?.[0] || data?.detail || "This reset link is invalid or has expired."); }
    finally { setLoading(false); }
  };
  return <div className="operator-login-page"><div className="login-container password-flow"><div className="login-left"><h1>Create a new password</h1><p>Choose a strong password to secure your operator account.</p></div><div className="login-right"><div className="login-card"><h2>Set new password</h2><p>Your new password must have at least 8 characters.</p><form onSubmit={submit}><div className="input-group"><label>New password</label><input type="password" value={form.new_password} onChange={(event) => setForm({ ...form, new_password: event.target.value })} autoComplete="new-password" /></div><div className="input-group"><label>Confirm password</label><input type="password" value={form.confirm_password} onChange={(event) => setForm({ ...form, confirm_password: event.target.value })} autoComplete="new-password" /></div>{error && <span className="error">{error}</span>}{message && <span className="success-message">{message} <Link to="/operator-login">Login now</Link></span>}<button className="login-btn" disabled={loading || Boolean(message)}>{loading ? "Updating..." : "Reset password"}</button></form></div></div></div></div>;
};

export default ResetPassword;
