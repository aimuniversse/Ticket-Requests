import { useEffect, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaHistory, FaWallet } from "react-icons/fa";
import API from "../../api/axios";
import "../../styles/Wallet.css";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const loadWallet = async () => {
    setLoading(true);
    try { const [walletResponse, historyResponse] = await Promise.all([API.get("auth/wallet/"), API.get("auth/wallet/history/")]); setWallet(walletResponse.data); setTransactions(historyResponse.data || []); setError(""); }
    catch (err) { setError(err.response?.data?.detail || "Unable to load wallet details."); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadWallet(); }, []);
  const totals = useMemo(() => transactions.reduce((sum, item) => ({ credit: sum.credit + (item.transaction_type === "CREDIT" ? item.credits : 0), debit: sum.debit + (item.transaction_type === "DEBIT" ? item.credits : 0) }), { credit: 0, debit: 0 }), [transactions]);
  return <div className="wallet-page"><div className="wallet-header"><h1>Operator Wallet</h1><p>Wallet points are added by an administrator. One point is used when you accept a ticket request.</p></div>{error && <p className="status-error">{error}</p>}<section className="wallet-summary"><div className="wallet-card"><FaWallet className="wallet-icon"/><span>Available points</span><h2>{loading ? "--" : wallet?.current_balance ?? 0}</h2></div><div className="wallet-card"><FaArrowDown className="credit"/><span>Total credit</span><h2>{loading ? "--" : totals.credit}</h2></div><div className="wallet-card"><FaArrowUp className="debit"/><span>Points used</span><h2>{loading ? "--" : totals.debit}</h2></div></section><section className="wallet-actions"><button className="history-btn" type="button" onClick={loadWallet}><FaHistory /> Refresh history</button></section><section className="wallet-history"><h2>Recent transactions</h2>{transactions.length === 0 ? <div className="empty-wallet"><FaWallet className="empty-icon"/><h3>No transactions</h3><p>Credits added by an admin and points used to accept requests will appear here.</p></div> : <table><thead><tr><th>Date</th><th>Type</th><th>Points</th><th>Description</th><th>Balance</th></tr></thead><tbody>{transactions.map((item, index) => <tr key={`${item.created_at}-${index}`}><td>{new Date(item.created_at).toLocaleString("en-IN")}</td><td>{item.transaction_type}</td><td>{item.credits}</td><td>{item.description}</td><td>{item.balance_after_transaction}</td></tr>)}</tbody></table>}</section></div>;
};
export default Wallet;
