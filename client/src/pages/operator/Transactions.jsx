import { useEffect, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaMoneyBillWave, FaSearch } from "react-icons/fa";
import API from "../../api/axios";
import "../../styles/Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]); const [search, setSearch] = useState(""); const [type, setType] = useState("ALL"); const [error, setError] = useState("");
  useEffect(() => { API.get("auth/wallet/history/").then((response) => setTransactions(response.data || [])).catch((err) => setError(err.response?.data?.detail || "Unable to load transactions.")); }, []);
  const shown = useMemo(() => transactions.filter((item) => (type === "ALL" || item.transaction_type === type) && `${item.description} ${item.transaction_type}`.toLowerCase().includes(search.toLowerCase())), [transactions, search, type]);
  return <div className="transactions-page"><div className="transactions-header"><h1>Transactions</h1><p>All wallet credits from administrators and points used for accepted requests.</p></div>{error && <p className="status-error">{error}</p>}<div className="transaction-filters"><div className="search-box"><FaSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" /></div><select value={type} onChange={(event) => setType(event.target.value)}><option value="ALL">All types</option><option value="CREDIT">Credit</option><option value="DEBIT">Debit</option></select></div>{shown.length === 0 ? <div className="empty-transaction"><FaMoneyBillWave className="empty-icon"/><h2>No transactions found</h2><p>Your wallet activity will appear here.</p></div> : <div className="transaction-table"><table><thead><tr><th>Date</th><th>Type</th><th>Points</th><th>Description</th><th>Balance</th></tr></thead><tbody>{shown.map((item, index) => <tr key={`${item.created_at}-${index}`}><td>{new Date(item.created_at).toLocaleString("en-IN")}</td><td><span className={item.transaction_type === "CREDIT" ? "credit" : "debit"}>{item.transaction_type === "CREDIT" ? <FaArrowDown /> : <FaArrowUp />}{item.transaction_type}</span></td><td>{item.credits}</td><td>{item.description}</td><td>{item.balance_after_transaction}</td></tr>)}</tbody></table></div>}</div>;
};
export default Transactions;
