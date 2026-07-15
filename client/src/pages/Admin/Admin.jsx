import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import API from "../../api/axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/Admin.css";

const SECTIONS = ["Dashboard", "Users", "Wallets", "Transcripts", "Approvals", "Support", "Settings"];
const Empty = ({ label }) => <div className="empty-card"><h3>No {label} yet</h3><p>This section is connected to live backend data and will populate when records are created.</p></div>;

function Admin() {
  const navigate = useNavigate();
  const [section, setSection] = useState("Dashboard");
  const [data, setData] = useState({ operators: [], customers: [], approvals: [], requests: [], wallets: [], transcripts: [], support_tickets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("operators");

  const load = async () => {
    setLoading(true);
    try { const response = await API.get("auth/admin/overview/"); setData(response.data); setError(""); }
    catch (err) { setError(err.response?.data?.detail || "Unable to load the admin dashboard."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); const timer = window.setInterval(load, 15000); return () => window.clearInterval(timer); }, []);
  const approve = async (id, action) => {
    try { await API.post(`auth/admin/operators/${id}/${action}/`); await load(); }
    catch (err) { setError(err.response?.data?.detail || `Unable to ${action} this operator.`); }
  };
  const logout = () => { localStorage.clear(); navigate("/operator-login"); };
  const users = userType === "operators" ? data.operators : userType === "customers" ? data.customers : [...data.operators, ...data.customers];
  const shownUsers = useMemo(() => users.filter((item) => `${item.id} ${item.name} ${item.email} ${item.mobile}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const requestCounts = data.requests.reduce((all, item) => ({ ...all, [item.status]: (all[item.status] || 0) + 1 }), {});
  const renderTable = (rows, columns) => rows.length ? <div className="table-wrapper"><table className="admin-table"><thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{columns.map((c) => <td key={c.label}>{c.render ? c.render(row) : row[c.key] || "—"}</td>)}</tr>)}</tbody></table></div> : <Empty label="records" />;

  return <div className="admin-page"><Header /><div className="admin-layout"><aside className="admin-sidebar"><div className="sidebar-brand">Admin Panel</div><nav className="sidebar-nav">{SECTIONS.map((label) => <button key={label} type="button" className={`sidebar-link ${section === label ? "active" : ""}`} onClick={() => setSection(label)}>{label}</button>)}</nav><button type="button" className="sidebar-link logout-btn" onClick={logout}><FaSignOutAlt /> Logout</button></aside><main className="admin-main"><div className="admin-topbar"><div><strong>Live administration</strong><p>{loading ? "Refreshing…" : "Updated from the backend"}</p></div><button type="button" className="action-btn" onClick={load}>Refresh</button></div>{error && <p className="status-error">{error}</p>}
    {section === "Dashboard" && <><section className="dashboard-overview"><article className="overview-card"><p>Operators</p><h3>{data.operators.length}</h3></article><article className="overview-card"><p>Customer requests</p><h3>{data.customers.length}</h3></article><article className="overview-card"><p>Pending approvals</p><h3>{data.approvals.length}</h3></article><article className="overview-card"><p>Active requests</p><h3>{(requestCounts.PENDING || 0) + (requestCounts.ACCEPTED || 0)}</h3></article></section><section className="admin-section"><div className="section-header"><div><span className="section-title">Ticket requests</span><p className="section-subtitle">Live request and assignment status. Admins cannot accept requests.</p></div></div>{renderTable(data.requests, [{ label: "Request", key: "id" }, { label: "Customer", key: "customer" }, { label: "Route", key: "route" }, { label: "Status", render: (r) => <span className="badge badge-active">{r.status}</span> }, { label: "Operator", key: "operator" }])}</section></>}
    {section === "Users" && <section className="admin-section"><div className="section-header"><div><span className="section-title">Users</span><p className="section-subtitle">Live operators and customers derived from submitted requests.</p></div><div className="tab-group">{["operators", "customers", "all"].map((tab) => <button key={tab} className={userType === tab ? "tab active" : "tab"} onClick={() => setUserType(tab)}>{tab}</button>)}</div></div><label>Search users<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, ID, email or phone" /></label>{renderTable(shownUsers, [{ label: "Name", key: "name" }, { label: "ID", key: "id" }, { label: "Email", key: "email" }, { label: "Mobile", key: "mobile" }, { label: "Status", key: "status" }, { label: "Role", key: "role" }])}</section>}
    {section === "Approvals" && <section className="admin-section"><div className="section-header"><div><span className="section-title">Pending operator approvals</span><p className="section-subtitle">Approve or reject registrations in real time.</p></div></div>{data.approvals.length ? <div className="approval-list">{data.approvals.map((item) => <article key={item.id} className="approval-card"><div><p className="approval-name">{item.name}</p><p className="approval-meta">{item.company_name} · {item.email} · {item.mobile}</p></div><div className="approval-actions"><button className="action-btn success" onClick={() => approve(item.id, "approve")}>Approve</button><button className="action-btn secondary" onClick={() => approve(item.id, "reject")}>Reject</button></div></article>)}</div> : <Empty label="pending approvals" />}</section>}
    {section === "Wallets" && <section className="admin-section"><span className="section-title">Wallets & transactions</span><Empty label="wallet records" /></section>}
    {section === "Transcripts" && <section className="admin-section"><span className="section-title">Transcripts</span><Empty label="transcripts" /></section>}
    {section === "Support" && <section className="admin-section"><span className="section-title">Support</span><Empty label="support tickets" /></section>}
    {section === "Settings" && <section className="admin-section"><span className="section-title">Settings</span><p className="section-subtitle">Admin account and notification settings will be stored server-side when those preferences are added.</p></section>}
  </main></div><Footer /></div>;
}
export default Admin;
