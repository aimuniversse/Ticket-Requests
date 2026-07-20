import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import API from "../../api/axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/Admin.css";
import logoImage from "../../assets/logoc.png";

const SECTIONS = ["Dashboard", "Users", "Requests", "Approvals", "Settings"];
const Empty = ({ label }) => <div className="empty-card"><h3>No {label} yet</h3><p>This section is connected to live backend data and will populate when records are created.</p></div>;

function Admin() {
  const navigate = useNavigate();
  const [section, setSection] = useState("Dashboard");
  const [data, setData] = useState({ operators: [], customers: [], approvals: [], requests: [], wallets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("operators");
  const [walletOperators, setWalletOperators] = useState([]);
  const [creditForm, setCreditForm] = useState({ operator_id: "", credits: "", description: "Admin Request credit" });
  const [crediting, setCrediting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [operatorsResponse, approvalsResponse] = await Promise.all([
        API.get("operators/"),
        API.get("auth/admin/operators/pending/"),
      ]);
      const operators = (operatorsResponse.data || []).map((operator) => ({
        ...operator,
        mobile: operator.phone_number,
        status: operator.approval_status,
        role: "Operator",
      }));
      const approvals = (approvalsResponse.data || []).map((operator) => ({ ...operator, mobile: operator.phone_number }));
      setData({ operators, customers: [], approvals, requests: [], wallets: [] });
      setError("");
    }
    catch (err) { setError(err.response?.data?.detail || "Unable to load the admin dashboard."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); const timer = window.setInterval(load, 15000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { API.get("operators/").then((response) => setWalletOperators(response.data || [])).catch(() => { }); }, []);
  const approve = async (id, action) => {
    try { await API.post(`auth/admin/operators/${id}/${action}/`); await load(); }
    catch (err) { setError(err.response?.data?.detail || `Unable to ${action} this operator.`); }
  };
  const logout = () => { localStorage.clear(); navigate("/operator-login"); };
  const addCredit = async (event) => {
    event.preventDefault();
    if (!creditForm.operator_id || !creditForm.credits) { setError("Select an operator and enter wallet points."); return; }
    setCrediting(true);
    try { await API.post("auth/wallet/add-credit/", { operator_ids: [Number(creditForm.operator_id)], credits: Number(creditForm.credits), description: creditForm.description }); setCreditForm({ operator_id: "", credits: "", description: "Admin wallet credit" }); setError(""); }
    catch (err) { setError(err.response?.data?.detail || err.response?.data?.credits?.[0] || "Unable to add wallet points."); }
    finally { setCrediting(false); }
  };
  const users = userType === "operators" ? data.operators : userType === "customers" ? data.customers : [...data.operators, ...data.customers];
  const shownUsers = useMemo(() => users.filter((item) => `${item.id} ${item.name} ${item.email} ${item.mobile}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const requestCounts = data.requests.reduce((all, item) => ({ ...all, [item.status]: (all[item.status] || 0) + 1 }), {});
  const renderTable = (rows, columns) => rows.length ? <div className="table-wrapper"><table className="admin-table"><thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{columns.map((c) => <td key={c.label}>{c.render ? c.render(row) : row[c.key] || "—"}</td>)}</tr>)}</tbody></table></div> : <Empty label="records" />;

  return <div className="admin-page">{/*<Header />*/}<div className="admin-components-header"><div className="header-left"><img src={logoImage} alt="Tick My Bus" className="header-logo" /><span className="header-brand"></span></div><nav className="header-nav">{SECTIONS.map((label) => <button key={label} type="button" className={`component-chip ${section === label ? "active" : ""}`} onClick={() => setSection(label)}>{label}</button>)}</nav><button type="button" className="logout-btn" onClick={logout}><FaSignOutAlt /> Logout</button></div><div className="admin-layout"><main className="admin-main"><div className="admin-topbar"><div><strong>Live administration</strong><p>{loading ? "Refreshing…" : "Updated from the backend"}</p></div><button type="button" className="action-btn" onClick={load}>Refresh</button></div>{error && <p className="status-error">{error}</p>}
    {section === "Dashboard" && <><section className="dashboard-overview"><article className="overview-card"><p>Operators</p><h3>{data.operators.length}</h3></article><article className="overview-card"><p>Customer requests</p><h3>{data.customers.length}</h3></article><article className="overview-card"><p>Pending approvals</p><h3>{data.approvals.length}</h3></article><article className="overview-card"><p>Active requests</p><h3>{(requestCounts.PENDING || 0) + (requestCounts.ACCEPTED || 0)}</h3></article></section><section className="admin-section"><div className="section-header"><div><span className="section-title">Ticket requests</span><p className="section-subtitle">Live request and assignment status. Admins cannot accept requests.</p></div></div>{renderTable(data.requests, [{ label: "Request", key: "id" }, { label: "Customer", key: "customer" }, { label: "Route", key: "route" }, { label: "Status", render: (r) => <span className="badge badge-active">{r.status}</span> }, { label: "Operator", key: "operator" }])}</section></>}
    {section === "Users" && <section className="admin-section"><div className="section-header"><div><span className="section-title">Users</span><p className="section-subtitle">Live operators and customers derived from submitted requests.</p></div><div className="tab-group">{["operators", "customers", "all"].map((tab) => <button key={tab} className={userType === tab ? "tab active" : "tab"} onClick={() => setUserType(tab)}>{tab}</button>)}</div></div><label>Search users<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, ID, email or phone" /></label>{renderTable(shownUsers, [{ label: "Name", key: "name" }, { label: "ID", key: "id" }, { label: "Email", key: "email" }, { label: "Mobile", key: "mobile" }, { label: "Status", key: "status" }, { label: "Role", key: "role" }])}</section>}
    {section === "Approvals" && <section className="admin-section"><div className="section-header"><div><span className="section-title">Pending operator approvals</span><p className="section-subtitle">Approve or reject registrations in real time.</p></div></div>{data.approvals.length ? <div className="approval-list">{data.approvals.map((item) => <article key={item.id} className="approval-card"><div><p className="approval-name">{item.name}</p><p className="approval-meta">{item.company_name} · {item.email} · {item.mobile}</p></div><div className="approval-actions"><button className="action-btn success" onClick={() => approve(item.id, "approve")}>Approve</button><button className="action-btn secondary" onClick={() => approve(item.id, "reject")}>Reject</button></div></article>)}</div> : <Empty label="pending approvals" />}</section>}
    {section === "Requests" && <section className="admin-section"><div className="section-header"><div><span className="section-title">Operator Request points</span><p className="section-subtitle">Only administrators can add points. Operators spend one point when accepting a request.</p></div></div><form className="wallet-credit-form" onSubmit={addCredit}><label>Operator<select value={creditForm.operator_id} onChange={(event) => setCreditForm({ ...creditForm, operator_id: event.target.value })}><option value="">Select operator</option>{walletOperators.map((operator) => <option key={operator.id} value={operator.id}>{operator.company_name} — {operator.name}</option>)}</select></label><label>Points<input type="number" min="1" value={creditForm.credits} onChange={(event) => setCreditForm({ ...creditForm, credits: event.target.value })} /></label><label>Description<input value={creditForm.description} onChange={(event) => setCreditForm({ ...creditForm, description: event.target.value })} /></label><button className="action-btn success" disabled={crediting}>{crediting ? "Adding..." : "Add points"}</button></form></section>}
    {section === "Settings" && <section className="admin-section"><span className="section-title">Settings</span><p className="section-subtitle">Admin account and notification settings will be stored server-side when those preferences are added.</p></section>}
  </main></div><Footer /></div>;
}
export default Admin;
