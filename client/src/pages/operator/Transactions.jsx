import { useEffect, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaMoneyBillWave, FaSearch, FaSyncAlt } from "react-icons/fa";
import API from "../../api/axios";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { useUrlState } from "../../hooks/useUrlState";
import { useCache } from "../../hooks/useCache";
import { scopedKey } from "../../api/auth";
import "../../styles/Transactions.css";

const Transactions = () => {
  const cache = useCache();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useUrlState("q", "");
  const [type, setType] = useUrlState("type", "ALL");

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const cached = cache.get(scopedKey("transactions"));
      if (cached) setTransactions(cached);
      const response = await API.get("auth/wallet/history/");
      cache.set(scopedKey("transactions"), response.data || [], 30_000);
      setTransactions(response.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(
    () => transactions.filter((item) =>
      (type === "ALL" || item.transaction_type === type) &&
      `${item.description} ${item.transaction_type}`.toLowerCase().includes(search.toLowerCase())
    ),
    [transactions, search, type],
  );

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h1>Transactions</h1>
        <p>All wallet credits from administrators and points used for accepted requests.</p>
      </div>
      {error && <p className="status-error">{error}</p>}
      <div className="transaction-filters">
        <div className="search-box">
          <FaSearch />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" />
        </div>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="ALL">All types</option>
          <option value="CREDIT">Credit</option>
          <option value="DEBIT">Debit</option>
        </select>
        <button type="button" className="refresh-btn" onClick={loadTransactions}><FaSyncAlt /> Refresh</button>
      </div>
      {loading && transactions.length === 0 ? (
        <div className="empty-transaction"><FaMoneyBillWave className="empty-icon" /><h2>Loading transactions</h2></div>
      ) : shown.length === 0 ? (
        <div className="empty-transaction">
          <FaMoneyBillWave className="empty-icon" />
          <h2>No transactions found</h2>
          <p>Your wallet activity will appear here.</p>
        </div>
      ) : (
        <TransactionsTable transactions={shown} />
      )}
    </div>
  );
};

function TransactionsTable({ transactions }) {
  const { page, setPage, totalPages, paginatedData, pageInfo } = usePagination(transactions, 10, { paramKey: "page" });

  return (
    <>
      <div className="transaction-table">
        <table>
          <thead>
            <tr><th>Date</th><th>Type</th><th>Points</th><th>Description</th><th>Balance</th></tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={`${item.created_at}-${index}`}>
                <td>{new Date(item.created_at).toLocaleString("en-IN")}</td>
                <td>
                  <span className={item.transaction_type === "CREDIT" ? "credit" : "debit"}>
                    {item.transaction_type === "CREDIT" ? <FaArrowDown /> : <FaArrowUp />}
                    {item.transaction_type}
                  </span>
                </td>
                <td>{item.credits}</td>
                <td>{item.description}</td>
                <td>{item.balance_after_transaction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageInfo={pageInfo} />
    </>
  );
}

export default Transactions;
