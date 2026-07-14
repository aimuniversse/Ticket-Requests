import { useState } from "react";
import {
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaPlusCircle,
  FaHistory,
} from "react-icons/fa";

import "../../styles/Wallet.css";

const Wallet = () => {

  // Backend will replace these values
  const [wallet] = useState({
    balance: "",
    totalCredit: "",
    totalDebit: "",
  });

  const [transactions] = useState([]);

  return (

    <div className="wallet-page">

      <div className="wallet-header">

        <h1>Operator Wallet</h1>

        <p>

          Manage your wallet balance and unlock customer details.

        </p>

      </div>

      {/* Wallet Summary */}

      <section className="wallet-summary">

        <div className="wallet-card">

          <FaWallet className="wallet-icon"/>

          <span>Available Balance</span>

          <h2>

            {wallet.balance || "--"}

          </h2>

        </div>

        <div className="wallet-card">

          <FaArrowDown className="credit"/>

          <span>Total Credit</span>

          <h2>

            {wallet.totalCredit || "--"}

          </h2>

        </div>

        <div className="wallet-card">

          <FaArrowUp className="debit"/>

          <span>Total Debit</span>

          <h2>

            {wallet.totalDebit || "--"}

          </h2>

        </div>

      </section>

      {/* Action Buttons */}

      <section className="wallet-actions">

        <button className="add-money">

          <FaPlusCircle />

          Add Money

        </button>

        <button className="history-btn">

          <FaHistory />

          Transaction History

        </button>

      </section>

      {/* Recent Transactions */}

      <section className="wallet-history">

        <h2>

          Recent Transactions

        </h2>

        {

          transactions.length === 0 ?

          (

            <div className="empty-wallet">

              <FaWallet className="empty-icon"/>

              <h3>No Transactions</h3>

              <p>

                Wallet transactions will appear here.

              </p>

            </div>

          )

          :

          (

            <table>

              <thead>

                <tr>

                  <th>Date</th>

                  <th>Type</th>

                  <th>Amount</th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {

                  transactions.map((item)=>(

                    <tr key={item.id}>

                      <td>{item.date}</td>

                      <td>{item.type}</td>

                      <td>

                        ₹ {item.amount}

                      </td>

                      <td>{item.status}</td>

                    </tr>

                  ))

                }

              </tbody>

            </table>

          )

        }

      </section>

    </div>

  );

};

export default Wallet;