import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import "../styles/OperatorLogin.css";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [form, setForm] = useState({ new_password: "", confirm_password: "" });
  const [showNew, setShowNew] = useState(false); const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    if (form.new_password.length !== 8) { setError("Password must be exactly 8 characters."); return; }
    if (!/[A-Z]/.test(form.new_password)) { setError("Password must contain at least one uppercase letter."); return; }
    if (!/[a-z]/.test(form.new_password)) { setError("Password must contain at least one lowercase letter."); return; }
    if (!/[0-9]/.test(form.new_password)) { setError("Password must contain at least one number."); return; }
    if (!/[^A-Za-z0-9]/.test(form.new_password)) { setError("Password must contain at least one symbol."); return; }
    if (form.new_password !== form.confirm_password) { setError("Passwords do not match."); return; }
    setLoading(true);
    try { const response = await API.post("auth/password/reset/confirm/", { uid, token, ...form }, { skipAuth: true }); setMessage(response.data?.message || "Password reset successfully."); }
    catch (err) { const data = err.response?.data; setError(data?.token?.[0] || data?.uid?.[0] || data?.confirm_password?.[0] || data?.detail || "This reset link is invalid or has expired."); }
    finally { setLoading(false); }
  };
  return <div className="operator-login-page"><div className="login-container password-flow"><div className="login-left"><h1>Create a new password</h1><p>Choose a strong password to secure your operator account.</p></div><div className="login-right"><div className="login-card"><h2>Set new password</h2><p>Your new password must be exactly 8 characters, including an uppercase letter, a lowercase letter, a number, and a symbol.</p><form onSubmit={submit}><div className="input-group"><label>New password</label><div className="password-box"><input type={showNew ? "text" : "password"} value={form.new_password} onChange={(event) => setForm({ ...form, new_password: event.target.value })} autoComplete="new-password" /><button type="button" className="show-btn" onClick={() => setShowNew(!showNew)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{showNew ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg></button></div></div><div className="input-group"><label>Confirm password</label><div className="password-box"><input type={showConfirm ? "text" : "password"} value={form.confirm_password} onChange={(event) => setForm({ ...form, confirm_password: event.target.value })} autoComplete="new-password" /><button type="button" className="show-btn" onClick={() => setShowConfirm(!showConfirm)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{showConfirm ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg></button></div></div>{error && <span className="error">{error}</span>}{message && <span className="success-message">{message} <Link to="/operator-login">Login now</Link></span>}<button className="login-btn" disabled={loading || Boolean(message)}>{loading ? "Updating..." : "Reset password"}</button></form></div></div></div></div>;
};

export default ResetPassword;
